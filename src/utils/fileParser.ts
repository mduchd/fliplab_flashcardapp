/**
 * File Parser V1 - Parse flashcards and MCQ from formatted text
 * 
 * Format V1:
 * #DECK Tên bộ thẻ
 * #DESC Mô tả (có thể nhiều dòng)
 * 
 * @CARD
 * Q: Thuật ngữ/câu hỏi (nhiều dòng)
 * A: Đáp án/định nghĩa (nhiều dòng)
 * 
 * @MCQ
 * Q: Câu hỏi trắc nghiệm?
 * A: Đáp án A
 * B: Đáp án B
 * C: Đáp án C
 * D: Đáp án D
 * ANSWER: B
 * EXPLAIN: Giải thích (tùy chọn, nhiều dòng)
 */

// ==================== TYPES ====================

export interface ParsedCard {
  front: string;
  back: string;
}

export interface MCQOption {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
}

export interface ParsedMCQ {
  question: string;
  options: MCQOption;
  answer: 'A' | 'B' | 'C' | 'D';
  explain?: string;
}

export interface ParseError {
  lineStart: number;
  lineEnd: number;
  code: string;
  message: string;
}

export interface ParseResult {
  meta: {
    deckTitle?: string;
    deckDesc?: string;
  };
  cards: ParsedCard[];
  mcqs: ParsedMCQ[];
  errors: ParseError[];
}

// ==================== NORMALIZATION ====================

/**
 * Normalize text: unify newlines, trim lines, collapse multiple blank lines
 */
export function normalizeText(text: string): string {
  return text
    // Unify newlines (CRLF, CR -> LF)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Collapse multiple blank lines to single blank line
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ==================== STATE MACHINE ====================

type ParserState = 'IDLE' | 'META_DESC' | 'CARD_Q' | 'CARD_A' | 'MCQ_Q' | 'MCQ_OPTIONS' | 'MCQ_EXPLAIN';

interface ParserContext {
  state: ParserState;
  lineNumber: number;
  blockStartLine: number;
  
  // Current block data
  currentQ: string[];
  currentA: string[];
  currentOptions: MCQOption;
  currentAnswer: string;
  currentExplain: string[];
  
  // Results
  meta: { deckTitle?: string; deckDesc?: string };
  cards: ParsedCard[];
  mcqs: ParsedMCQ[];
  errors: ParseError[];
  
  // Temp
  descLines: string[];
}

function createContext(): ParserContext {
  return {
    state: 'IDLE',
    lineNumber: 0,
    blockStartLine: 0,
    currentQ: [],
    currentA: [],
    currentOptions: {},
    currentAnswer: '',
    currentExplain: [],
    meta: {},
    cards: [],
    mcqs: [],
    errors: [],
    descLines: [],
  };
}

function flushCard(ctx: ParserContext): void {
  const front = ctx.currentQ.join('\n').trim();
  const back = ctx.currentA.join('\n').trim();
  
  if (front && back) {
    ctx.cards.push({ front, back });
  } else if (front || back) {
    ctx.errors.push({
      lineStart: ctx.blockStartLine,
      lineEnd: ctx.lineNumber,
      code: 'INCOMPLETE_CARD',
      message: `Thẻ không đầy đủ: thiếu ${!front ? 'câu hỏi (Q)' : 'đáp án (A)'}`,
    });
  }
  
  ctx.currentQ = [];
  ctx.currentA = [];
}

function flushMCQ(ctx: ParserContext): void {
  const question = ctx.currentQ.join('\n').trim();
  const answer = ctx.currentAnswer.toUpperCase() as 'A' | 'B' | 'C' | 'D';
  const explain = ctx.currentExplain.join('\n').trim();
  
  // Validate MCQ
  const validAnswers = ['A', 'B', 'C', 'D'];
  
  if (!question) {
    ctx.errors.push({
      lineStart: ctx.blockStartLine,
      lineEnd: ctx.lineNumber,
      code: 'MCQ_MISSING_QUESTION',
      message: 'MCQ thiếu câu hỏi (Q)',
    });
  } else if (!ctx.currentAnswer) {
    ctx.errors.push({
      lineStart: ctx.blockStartLine,
      lineEnd: ctx.lineNumber,
      code: 'MCQ_MISSING_ANSWER',
      message: 'MCQ thiếu đáp án đúng (ANSWER)',
    });
  } else if (!validAnswers.includes(answer)) {
    ctx.errors.push({
      lineStart: ctx.blockStartLine,
      lineEnd: ctx.lineNumber,
      code: 'MCQ_INVALID_ANSWER',
      message: `Đáp án không hợp lệ: "${ctx.currentAnswer}". Chỉ chấp nhận A, B, C, D`,
    });
  } else if (!ctx.currentOptions[answer]) {
    ctx.errors.push({
      lineStart: ctx.blockStartLine,
      lineEnd: ctx.lineNumber,
      code: 'MCQ_ANSWER_NOT_FOUND',
      message: `Đáp án ${answer} được chọn nhưng không có trong danh sách options`,
    });
  } else {
    ctx.mcqs.push({
      question,
      options: { ...ctx.currentOptions },
      answer,
      explain: explain || undefined,
    });
  }
  
  // Reset
  ctx.currentQ = [];
  ctx.currentOptions = {};
  ctx.currentAnswer = '';
  ctx.currentExplain = [];
}

function flushDesc(ctx: ParserContext): void {
  if (ctx.descLines.length > 0) {
    ctx.meta.deckDesc = ctx.descLines.join('\n').trim();
    ctx.descLines = [];
  }
}

function processLine(ctx: ParserContext, line: string): void {
  ctx.lineNumber++;
  
  const trimmedLine = line.trim();
  const upperLine = trimmedLine.toUpperCase();
  
  // Check for block markers
  const isDeckMarker = trimmedLine.startsWith('#DECK');
  const isDescMarker = trimmedLine.startsWith('#DESC');
  const isCardMarker = upperLine === '@CARD';
  const isMCQMarker = upperLine === '@MCQ';
  
  // Handle new block markers - flush current block first
  if (isCardMarker || isMCQMarker) {
    // Flush any pending block
    if (ctx.state === 'CARD_Q' || ctx.state === 'CARD_A') {
      flushCard(ctx);
    } else if (ctx.state.startsWith('MCQ')) {
      flushMCQ(ctx);
    } else if (ctx.state === 'META_DESC') {
      flushDesc(ctx);
    }
    
    ctx.blockStartLine = ctx.lineNumber;
    ctx.state = isCardMarker ? 'CARD_Q' : 'MCQ_Q';
    return;
  }
  
  // Handle meta markers
  if (isDeckMarker) {
    if (ctx.state === 'META_DESC') flushDesc(ctx);
    ctx.meta.deckTitle = trimmedLine.slice(5).trim();
    ctx.state = 'IDLE';
    return;
  }
  
  if (isDescMarker) {
    ctx.descLines = [trimmedLine.slice(5).trim()];
    ctx.state = 'META_DESC';
    return;
  }
  
  // Process based on current state
  switch (ctx.state) {
    case 'IDLE':
      // Ignore lines when idle (between blocks)
      break;
      
    case 'META_DESC':
      if (trimmedLine) {
        ctx.descLines.push(trimmedLine);
      }
      break;
      
    case 'CARD_Q':
      if (trimmedLine.startsWith('Q:')) {
        ctx.currentQ.push(trimmedLine.slice(2).trim());
      } else if (trimmedLine.startsWith('A:')) {
        ctx.currentA.push(trimmedLine.slice(2).trim());
        ctx.state = 'CARD_A';
      } else if (trimmedLine) {
        // Continue Q if no prefix
        ctx.currentQ.push(trimmedLine);
      }
      break;
      
    case 'CARD_A':
      if (trimmedLine.startsWith('A:')) {
        ctx.currentA.push(trimmedLine.slice(2).trim());
      } else if (trimmedLine) {
        ctx.currentA.push(trimmedLine);
      }
      break;
      
    case 'MCQ_Q':
      if (trimmedLine.startsWith('Q:')) {
        ctx.currentQ.push(trimmedLine.slice(2).trim());
      } else if (/^[A-D]:/.test(trimmedLine)) {
        const optKey = trimmedLine[0] as 'A' | 'B' | 'C' | 'D';
        ctx.currentOptions[optKey] = trimmedLine.slice(2).trim();
        ctx.state = 'MCQ_OPTIONS';
      } else if (trimmedLine) {
        ctx.currentQ.push(trimmedLine);
      }
      break;
      
    case 'MCQ_OPTIONS':
      if (/^[A-D]:/.test(trimmedLine)) {
        const optKey = trimmedLine[0] as 'A' | 'B' | 'C' | 'D';
        ctx.currentOptions[optKey] = trimmedLine.slice(2).trim();
      } else if (upperLine.startsWith('ANSWER:')) {
        ctx.currentAnswer = trimmedLine.slice(7).trim();
      } else if (upperLine.startsWith('EXPLAIN:')) {
        ctx.currentExplain.push(trimmedLine.slice(8).trim());
        ctx.state = 'MCQ_EXPLAIN';
      }
      break;
      
    case 'MCQ_EXPLAIN':
      if (trimmedLine) {
        ctx.currentExplain.push(trimmedLine);
      }
      break;
  }
}

// ==================== MAIN PARSER ====================

/**
 * Parse text content into flashcards and MCQs
 */
export function parseContent(rawText: string): ParseResult {
  const text = normalizeText(rawText);
  const lines = text.split('\n');
  const ctx = createContext();
  
  for (const line of lines) {
    processLine(ctx, line);
  }
  
  // Flush any remaining block
  if (ctx.state === 'CARD_Q' || ctx.state === 'CARD_A') {
    flushCard(ctx);
  } else if (ctx.state.startsWith('MCQ')) {
    flushMCQ(ctx);
  } else if (ctx.state === 'META_DESC') {
    flushDesc(ctx);
  }
  
  return {
    meta: ctx.meta,
    cards: ctx.cards,
    mcqs: ctx.mcqs,
    errors: ctx.errors,
  };
}

/**
 * Parse with fallback: if no @CARD/@MCQ markers found, try legacy format
 * Legacy format: "Term - Definition" or "Term: Definition" per line
 */
export function parseWithFallback(rawText: string): ParseResult {
  const result = parseContent(rawText);
  
  // If we got results, return them
  if (result.cards.length > 0 || result.mcqs.length > 0) {
    return result;
  }
  
  // Fallback: try legacy line-by-line format
  const text = normalizeText(rawText);
  const lines = text.split('\n').filter(l => l.trim());
  const cards: ParsedCard[] = [];
  
  for (const line of lines) {
    // Skip meta markers in fallback mode
    if (line.startsWith('#') || line.startsWith('@')) continue;
    
    // Try different separators
    let match = line.match(/^(.+?)\s*[-–—]\s*(.+)$/); // dash variants
    if (!match) {
      match = line.match(/^(.+?):\s*(.+)$/); // colon
    }
    if (!match) {
      match = line.match(/^Q:\s*(.+?)\s*A:\s*(.+)$/i); // Q: A: inline
    }
    
    if (match) {
      const front = match[1].trim();
      const back = match[2].trim();
      if (front && back) {
        cards.push({ front, back });
      }
    }
  }
  
  return {
    meta: result.meta,
    cards,
    mcqs: [],
    errors: cards.length === 0 ? [{
      lineStart: 1,
      lineEnd: lines.length,
      code: 'NO_CONTENT_FOUND',
      message: 'Không tìm thấy nội dung hợp lệ. Hãy kiểm tra định dạng file.',
    }] : [],
  };
}
