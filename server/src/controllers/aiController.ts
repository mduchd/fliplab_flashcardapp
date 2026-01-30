import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- HELPERS ---

const getGenerativeModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

// Fallback logic for Chat
const getMockChatResponse = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('chào') || lower.includes('hello')) return "Chào bạn! Mình là FlipLab AI. Chúc bạn một ngày học tập năng suất! 🚀";
    if (lower.includes('tạo thẻ')) return "Bạn có thể dùng nút 'Magic AI' trong trang 'Tạo bộ thẻ' để mình giúp bạn soạn bài nhanh nhé! ✨";
    if (lower.includes('cảm ơn')) return "Không có chi! Cố gắng lên nhé! 💪";
    if (lower.includes('buồn') || lower.includes('nản')) return "Đừng nản chí! 'Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc'. Nghỉ ngơi chút rồi tiếp tục nào! ☕";
    return "Thú vị đó! Nhưng hiện tại kết nối của mình hơi chập chờn, bạn hỏi lại sau nhé hoặc thử hỏi về cách học xem?";
};

// Fallback logic for Flashcard Generation
const getMockData = (topic: string, count: number) => {
    const mocks = [
        { term: "Artificial Intelligence", definition: "Trí tuệ nhân tạo (AI) - Mô phỏng trí tuệ con người." },
        { term: "Machine Learning", definition: "Học máy - Một nhánh của AI giúp máy tính tự học từ dữ liệu." },
        { term: "Deep Learning", definition: "Học sâu - Mạng nơ-ron nhân tạo nhiều lớp." },
        { term: "Neural Network", definition: "Mạng nơ-ron - Hệ thống mô phỏng não bộ sinh học." },
        { term: "Algorithm", definition: "Thuật toán - Tập hợp các quy tắc tính toán." }
    ];
    return mocks.slice(0, count);
};

// --- CACHE & RATE LIMIT STORE (In-Memory) ---
const responseCache = new Map<string, { data: any, timestamp: number }>();
const userRateLimit = new Map<string, { count: number, resetAt: number }>();
const userDailyUsage = new Map<string, { count: number, date: string }>(); // New: Daily Tracker

const CACHE_TTL = 60 * 60 * 1000; // 1 Hour
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 Minute
const MAX_RPM = 10; // Spam protection (10 req/min)
const MAX_RPD = 20; // Hard Limit (20 req/day - Gemini 2.5 Free Tier)

// Helper: Check Daily Quota
const checkDailyQuota = (userId: string): { allowed: boolean, remaining: number, used: number } => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const record = userDailyUsage.get(userId) || { count: 0, date: today };

    // Reset if new day
    if (record.date !== today) {
        record.date = today;
        record.count = 0;
    }

    if (record.count >= MAX_RPD) {
        return { allowed: false, remaining: 0, used: record.count };
    }

    return { allowed: true, remaining: MAX_RPD - record.count, used: record.count };
};

// Helper: Increment Usage
const incrementUsage = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const record = userDailyUsage.get(userId) || { count: 0, date: today };
    if (record.date !== today) { record.count = 0; record.date = today; } // Double check
    record.count++;
    userDailyUsage.set(userId, record);
    return MAX_RPD - record.count;
};

// Helper: Check Rate Limit (Spam Protection)
const checkRateLimit = (userId: string): boolean => {
    const now = Date.now();
    const userRecord = userRateLimit.get(userId) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

    if (now > userRecord.resetAt) {
        userRecord.count = 1;
        userRecord.resetAt = now + RATE_LIMIT_WINDOW;
    } else {
        userRecord.count++;
    }
    userRateLimit.set(userId, userRecord);
    return userRecord.count <= MAX_RPM;
};


// Helper: Get/Set Cache
const getCachedResponse = (key: string) => {
    const cached = responseCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL) {
        responseCache.delete(key);
        return null; // Expired
    }
    return cached.data;
};

const setCachedResponse = (key: string, data: any) => {
    // Basic memory management: Clear older entries if too big
    if (responseCache.size > 1000) responseCache.clear(); 
    responseCache.set(key, { data, timestamp: Date.now() });
};

// --- CONTROLLERS ---

// 1. Generate Flashcards
export const generateFlashcards = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id || 'anonymous';
    
    // 1. Daily Quota Check
    const quota = checkDailyQuota(userId);
    if (!quota.allowed) {
        return res.status(429).json({ 
            message: 'Đã hết lượt dùng AI hôm nay (20/20). Vui lòng quay lại ngày mai!' 
        });
    }

    // 2. Rate Limit Check (Spam)
    if (!checkRateLimit(userId)) {
        return res.status(429).json({ message: 'Thao tác quá nhanh! Vui lòng đợi giây lát.' });
    }

    const { prompt, count = 10, topic } = req.body;
    if (!prompt && !topic) return res.status(400).json({ message: 'Vui lòng cung cấp chủ đề' });

    // 3. Cache Check
    const cacheKey = `gen_card_${topic || prompt}_${count}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
        console.log('⚡ Using Cached AI Response');
        return res.json({ 
            suggestions: cached,
            usage: { used: quota.used, total: MAX_RPD, remaining: quota.remaining } // Cache doesn't consume quota
        });
    }

    try {
        const model = getGenerativeModel();
        if (!model) throw new Error('No API Key');

        console.log('🤖 Generative AI: Generating cards...');
        
        const userContent = topic 
            ? `Tạo ${count} thuật ngữ flashcard về chủ đề: "${topic}"`
            : `Trích xuất ${count} thuật ngữ quan trọng từ văn bản: "${prompt}"`;

        const finalPrompt = `
            Bạn là trợ lý giáo dục. Nhiệm vụ: Trả về JSON Array thuần túy (không markdown).
            Mỗi object: {"term": "...", "definition": "..."} (Giải thích tiếng Việt ngắn gọn).
            Input: ${userContent}
        `;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

        const flashcards = JSON.parse(text);
        if (Array.isArray(flashcards)) {
            // 4. Save to Cache & Increment Usage
            setCachedResponse(cacheKey, flashcards);
            const remaining = incrementUsage(userId); // Consume Quota
            
            return res.json({ 
                suggestions: flashcards,
                usage: { used: quota.used + 1, total: MAX_RPD, remaining }
            });
        }
        throw new Error('Invalid Format');

    } catch (error: any) {
        console.error('❌ AI Generate Error (Fallback mock):', error.message);
        await new Promise(r => setTimeout(r, 1500));
        return res.json({ 
            suggestions: getMockData(topic || prompt, count),
            isMock: true,
            message: "Hệ thống AI bận, dùng dữ liệu mẫu.",
            usage: { used: quota.used, total: MAX_RPD, remaining: quota.remaining }
        });
    }
};

// 2. Chat Assistant
export const chatWithAI = async (req: Request, res: Response) => {
    const { message, style = 'friendly' } = req.body;
    // @ts-ignore
    const userId = req.user?.id || 'anonymous'; 

    if (!message) return res.status(400).json({ reply: 'Bạn chưa nói gì cả...' });

    // 1. Daily Quota Check
    const quota = checkDailyQuota(userId);
    if (!quota.allowed) {
        return res.json({ 
            reply: '💔 Bạn đã dùng hết 20 lượt AI miễn phí hôm nay. Quay lại vào ngày mai nhé hoặc dùng tính năng Tạo thẻ!',
            isOverQuota: true
        });
    }

    // 2. Rate Limit Check
    if (!checkRateLimit(userId)) {
        return res.json({ reply: '⏳ Bạn hỏi nhanh quá! Cho mình nghỉ tay xíu nhé (Rate limit).' });
    }

    // 3. Cache Check
    const cacheKey = `chat_${style}_${message.toLowerCase().trim()}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
        console.log('⚡ Using Cached Chat Response');
        return res.json({ 
            reply: cached,
            usage: { used: quota.used, total: MAX_RPD, remaining: quota.remaining }
        });
    }

    try {
        const model = getGenerativeModel();
        if (!model) throw new Error('No API Key');
        
        console.log(`🤖 Generative AI: Chatting with user ${userId} [Style: ${style}]...`);

        // Define Personas
        let personaPrompt = '';
        switch (style) {
            case 'professional':
                personaPrompt = 'Persona: Bạn là Giáo sư Ngôn ngữ học uyên bác. Trả lời chính xác, trang trọng, dùng từ vựng nâng cao, không dùng emoji cợt nhả.';
                break;
            case 'concise':
                personaPrompt = 'Persona: Bạn là Trợ lý AI tối giản. Trả lời cực ngắn gọn (dưới 30 từ), đi thẳng vào vấn đề, không rườm rà khách sáo.';
                break;
            case 'socratic':
                personaPrompt = 'Persona: Bạn là Nhà triết học Socratic. KHÔNG trả lời ngay. Hãy đặt câu hỏi gợi mở để người dùng tự tìm ra câu trả lời. Chỉ giải thích khi người dùng thực sự bí.';
                break;
            default: // friendly
                personaPrompt = 'Persona: Bạn là FlipLab AI - trợ lý học tập cực kỳ nhiệt tình, hài hước và thân thiện. Dùng nhiều emoji để cổ vũ tinh thần.';
                break;
        }

        const prompt = `
            Context: Bạn đang chat với User ID: ${userId}.
            ${personaPrompt}
            Nhiệm vụ: Trả lời câu hỏi của User theo đúng Persona trên.
            User Question: "${message}"
            AI Reply:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const reply = response.text();

        // 4. Save to Cache & Increment Usage
        setCachedResponse(cacheKey, reply);
        const remaining = incrementUsage(userId);

        return res.json({ 
            reply, 
            usage: { used: quota.used + 1, total: MAX_RPD, remaining }
        });

    } catch (error: any) {
        console.error('❌ AI Chat Error (Fallback mock):', error.message);
        await new Promise(r => setTimeout(r, 1000));
        return res.json({ reply: getMockChatResponse(message) });
    }
};
