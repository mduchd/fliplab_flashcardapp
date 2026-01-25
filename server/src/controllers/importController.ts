import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { FlashcardSet } from '../models/FlashcardSet.js';
import mammoth from 'mammoth';
import * as pdfParseModule from 'pdf-parse';

// Parse PDF using pdf-parse v2
const parsePdf = async (buffer: Buffer): Promise<string> => {
  try {
    // pdf-parse v2 exports parsePdf as a named export
    const { parsePdf: parse } = pdfParseModule;
    if (typeof parse === 'function') {
      const result = await parse(buffer);
      return result.text || '';
    }
    // Fallback: try default export
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    if (typeof pdfParse === 'function') {
      const result = await pdfParse(buffer);
      return result.text || '';
    }
    throw new Error('pdf-parse module not properly loaded');
  } catch (error) {
    console.error('PDF parse error:', error);
    throw new Error('Không thể đọc file PDF');
  }
};

// Fix UTF-8 encoding issues (common with Vietnamese text)
const fixEncoding = (text: string): string => {
  try {
    // Try to detect and fix mojibake (UTF-8 interpreted as Latin-1)
    // Check if text contains common mojibake patterns
    if (/Ã|â|Æ|Â|á»|áº/.test(text)) {
      // Text appears to be double-encoded, try to fix
      const buffer = Buffer.from(text, 'latin1');
      const fixed = buffer.toString('utf-8');
      // Only use fixed version if it looks more valid (fewer replacement chars)
      if (fixed.includes('�') === false || fixed.includes('�') < text.includes('�')) {
        return fixed;
      }
    }
    return text;
  } catch {
    return text;
  }
};

// Decode filename properly (handle URL encoding and UTF-8)
const decodeFileName = (filename: string): string => {
  try {
    // First try URL decoding
    let decoded = decodeURIComponent(filename);
    // Then fix any encoding issues
    decoded = fixEncoding(decoded);
    return decoded;
  } catch {
    return fixEncoding(filename);
  }
};

interface ParsedCard {
  term: string;
  definition: string;
}

// Parse text content into flashcards
const parseTextToCards = (text: string): ParsedCard[] => {
  const cards: ParsedCard[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  // Try different parsing strategies

  // Strategy 1: Question/Answer format (Q: ... A: ...)
  const qaPattern = /(?:Q:|Câu hỏi:|Question:)\s*(.+?)[\n\r]+(?:A:|Đáp án:|Answer:|Trả lời:)\s*(.+?)(?=(?:Q:|Câu hỏi:|Question:)|$)/gis;
  let match;
  while ((match = qaPattern.exec(text)) !== null) {
    if (match[1]?.trim() && match[2]?.trim()) {
      cards.push({
        term: match[1].trim(),
        definition: match[2].trim()
      });
    }
  }

  if (cards.length > 0) return cards;

  // Strategy 2: Numbered questions with answers
  // Format: 1. Question\n   a) option1\n   b) option2*\n (asterisk marks correct)
  const numberedPattern = /(\d+)[.)]\s*(.+?)(?:\n|\r\n?)((?:[a-d][.)].+?(?:\n|\r\n?))+)/gi;
  while ((match = numberedPattern.exec(text)) !== null) {
    const question = match[2]?.trim();
    const optionsText = match[3];
    
    // Find correct answer (marked with *, đúng, correct, or bold)
    const correctMatch = optionsText.match(/([a-d])[.)]\s*(.+?)(?:\*|đúng|correct|\(đ\))/i);
    if (question && correctMatch) {
      cards.push({
        term: question,
        definition: correctMatch[2].trim().replace(/\*|đúng|correct|\(đ\)/gi, '').trim()
      });
    }
  }

  if (cards.length > 0) return cards;

  // Strategy 3: Tab or dash separated (Term - Definition or Term\tDefinition)
  for (const line of lines) {
    // Tab separated
    if (line.includes('\t')) {
      const [term, definition] = line.split('\t').map(s => s.trim());
      if (term && definition) {
        cards.push({ term, definition });
      }
    }
    // Dash separated (but not at start of line)
    else if (line.match(/^(.+?)\s+-\s+(.+)$/)) {
      const dashMatch = line.match(/^(.+?)\s+-\s+(.+)$/);
      if (dashMatch) {
        cards.push({
          term: dashMatch[1].trim(),
          definition: dashMatch[2].trim()
        });
      }
    }
    // Colon separated
    else if (line.includes(':') && !line.startsWith('http')) {
      const colonIndex = line.indexOf(':');
      const term = line.substring(0, colonIndex).trim();
      const definition = line.substring(colonIndex + 1).trim();
      if (term && definition && term.length < 200) {
        cards.push({ term, definition });
      }
    }
  }

  if (cards.length > 0) return cards;

  // Strategy 4: Alternating lines (odd = term, even = definition)
  for (let i = 0; i < lines.length - 1; i += 2) {
    const term = lines[i]?.trim();
    const definition = lines[i + 1]?.trim();
    if (term && definition) {
      cards.push({ term, definition });
    }
  }

  return cards;
};

// @desc    Import file and create flashcard set
// @route   POST /api/import/file
// @access  Private
export const importFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để import'
      });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;
    const { name, description, tags, color } = req.body;
    
    // Decode filename properly for Vietnamese
    const decodedFileName = decodeFileName(originalname);

    let textContent = '';
    let cards: ParsedCard[] = [];

    // Process based on file type
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      // Parse PDF
      try {
        textContent = await parsePdf(buffer);
      } catch (pdfError) {
        res.status(400).json({
          success: false,
          message: 'Không thể đọc file PDF. Vui lòng kiểm tra file không bị khóa hoặc hỏng.'
        });
        return;
      }
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      // Parse Word document
      try {
        const result = await mammoth.extractRawText({ buffer });
        textContent = result.value;
      } catch (docxError) {
        res.status(400).json({
          success: false,
          message: 'Không thể đọc file Word. Vui lòng kiểm tra file.'
        });
        return;
      }
    } else if (
      mimetype === 'text/plain' ||
      originalname.endsWith('.txt') ||
      originalname.endsWith('.csv')
    ) {
      // Plain text - try UTF-8 first, then with BOM handling
      textContent = buffer.toString('utf-8');
      // Remove BOM if present
      if (textContent.charCodeAt(0) === 0xFEFF) {
        textContent = textContent.slice(1);
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Định dạng file không được hỗ trợ. Vui lòng sử dụng PDF, Word (.docx), hoặc Text (.txt)'
      });
      return;
    }

    // Fix encoding issues (Vietnamese text)
    textContent = fixEncoding(textContent);

    // Parse text content into cards
    cards = parseTextToCards(textContent);

    if (cards.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Không thể trích xuất thẻ từ file. Vui lòng kiểm tra định dạng nội dung.',
        hint: 'Định dạng được hỗ trợ:\n- Q: Câu hỏi\\nA: Đáp án\n- Thuật ngữ - Định nghĩa\n- Thuật ngữ\\tĐịnh nghĩa (tab)\n- Thuật ngữ: Định nghĩa'
      });
      return;
    }

    // Create flashcard set
    const flashcardSet = await FlashcardSet.create({
      userId: req.userId,
      name: name || decodedFileName.replace(/\.[^/.]+$/, ''), // Remove extension
      description: description || `Imported from ${decodedFileName}`,
      cards: cards.map(card => ({
        term: card.term,
        definition: card.definition,
        box: 1,
        starred: false
      })),
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags) : ['imported'],
      color: color || '#2563eb',
      isPublic: false
    });

    res.status(201).json({
      success: true,
      message: `Đã import thành công ${cards.length} thẻ từ file`,
      data: {
        flashcardSet,
        cardsCount: cards.length,
        preview: cards.slice(0, 3) // Preview first 3 cards
      }
    });
  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi import file'
    });
  }
};

// @desc    Preview file content before importing
// @route   POST /api/import/preview
// @access  Private
export const previewFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để preview'
      });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;
    let textContent = '';
    let cards: ParsedCard[] = [];

    // Process based on file type
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      textContent = await parsePdf(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      textContent = result.value;
    } else if (
      mimetype === 'text/plain' ||
      originalname.endsWith('.txt') ||
      originalname.endsWith('.csv')
    ) {
      textContent = buffer.toString('utf-8');
      // Remove BOM if present
      if (textContent.charCodeAt(0) === 0xFEFF) {
        textContent = textContent.slice(1);
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Định dạng file không được hỗ trợ'
      });
      return;
    }

    // Fix encoding issues (Vietnamese text)
    textContent = fixEncoding(textContent);
    const decodedFileName = decodeFileName(originalname);

    cards = parseTextToCards(textContent);

    res.json({
      success: true,
      data: {
        fileName: decodedFileName,
        totalCards: cards.length,
        preview: cards.slice(0, 10), // Preview first 10 cards
        rawTextPreview: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '')
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi preview file'
    });
  }
};
