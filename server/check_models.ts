import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    console.log('🔍 Đang kiểm tra danh sách Models được phép sử dụng...');
    try {
        const response = await fetch(URL);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Danh sách Models khả dụng:');
            const models = data.models || [];
            const generateModels = models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace('models/', ''));
            
            console.log(generateModels.join('\n'));
        } else {
            console.error('❌ Lỗi:', data);
        }
    } catch (error) {
        console.error('❌ Lỗi kết nối:', error);
    }
}

listModels();
