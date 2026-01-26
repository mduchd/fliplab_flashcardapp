/**
 * File Extractor - Extract text content from TXT, DOCX, PDF files
 * Uses mammoth for DOCX and pdfjs-dist for PDF
 */

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractResult {
  success: boolean;
  text: string;
  error?: string;
  fileInfo: {
    name: string;
    size: number;
    type: string;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_PDF_TEXT_LENGTH = 50; // Minimum chars to consider PDF as text-based

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['.txt', '.docx', '.pdf'].includes(ext);
}

/**
 * Extract text from TXT file
 */
async function extractFromTxt(file: File): Promise<string> {
  return await file.text();
}

/**
 * Extract text from DOCX file using mammoth
 */
async function extractFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract text from PDF file using pdfjs-dist
 */
async function extractFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const textParts: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }
  
  return textParts.join('\n\n');
}

/**
 * Main function to extract text from any supported file
 */
export async function extractTextFromFile(file: File): Promise<ExtractResult> {
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
  };

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      text: '',
      error: `File quá lớn (${formatFileSize(file.size)}). Giới hạn: ${formatFileSize(MAX_FILE_SIZE)}`,
      fileInfo,
    };
  }

  // Check file type
  const ext = getFileExtension(file.name);
  if (!isSupportedFileType(file.name)) {
    return {
      success: false,
      text: '',
      error: `Định dạng file không được hỗ trợ (${ext}). Hãy dùng .txt, .docx hoặc .pdf`,
      fileInfo,
    };
  }

  try {
    let text = '';

    switch (ext) {
      case '.txt':
        text = await extractFromTxt(file);
        break;
      case '.docx':
        text = await extractFromDocx(file);
        break;
      case '.pdf':
        text = await extractFromPdf(file);
        // Check if PDF has enough text (not a scanned PDF)
        if (text.replace(/\s/g, '').length < MIN_PDF_TEXT_LENGTH) {
          return {
            success: false,
            text: '',
            error: 'PDF này có vẻ là file scan (không có text). Hãy dùng PDF có text hoặc chuyển sang TXT/DOCX.',
            fileInfo,
          };
        }
        break;
      default:
        return {
          success: false,
          text: '',
          error: `Định dạng không hỗ trợ: ${ext}`,
          fileInfo,
        };
    }

    if (!text.trim()) {
      return {
        success: false,
        text: '',
        error: 'File không có nội dung text',
        fileInfo,
      };
    }

    return {
      success: true,
      text,
      fileInfo,
    };
  } catch (error: any) {
    return {
      success: false,
      text: '',
      error: `Lỗi khi đọc file: ${error.message || 'Unknown error'}`,
      fileInfo,
    };
  }
}
