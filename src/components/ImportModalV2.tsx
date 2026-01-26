/**
 * Import Modal V2 - Client-side file parsing with V1 format support
 * Features:
 * - Upload TXT/DOCX/PDF
 * - Preview with tabs (Flashcards / MCQ)
 * - Error display with line numbers
 * - Confirm with append/create options
 * - Direct create mode (for Home page)
 */

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiXMark,
  HiArrowUpTray,
  HiDocumentText,
  HiDocument,
  HiCheckCircle,
  HiExclamationTriangle,
  HiArrowPath,
  HiSparkles,
  HiRectangleStack,
  HiQuestionMarkCircle,
  HiArrowLeft,
  HiArrowRight,
  HiExclamationCircle,
  HiPlay,
} from 'react-icons/hi2';
import { extractTextFromFile, formatFileSize, getFileExtension } from '../utils/fileExtractor';
import { parseWithFallback, ParseResult, ParsedCard, ParsedMCQ } from '../utils/fileParser';
import { flashcardService } from '../services/flashcardService';
import { useToastContext } from '../contexts/ToastContext';

// ==================== TYPES ====================

interface ImportModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  /** Callback for append/create mode (Create page) */
  onImport?: (data: ImportData) => void;
  /** If provided, enables 'append' mode option */
  existingDeckName?: string;
  /** If true, creates deck directly via API (Home page mode) */
  directCreate?: boolean;
  /** Callback after direct create success */
  onSuccess?: (flashcardSetId: string) => void;
}

export interface ImportData {
  mode: 'append' | 'create';
  deckTitle: string;
  deckDesc: string;
  cards: ParsedCard[];
  mcqs: ParsedMCQ[];
}

type Step = 'upload' | 'preview' | 'confirm' | 'success';
type PreviewTab = 'cards' | 'mcq';

// ==================== COMPONENT ====================

const ImportModalV2: React.FC<ImportModalV2Props> = ({
  isOpen,
  onClose,
  onImport,
  existingDeckName,
  directCreate = false,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep] = useState<Step>('upload');
  
  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Parse result
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  
  // Preview state
  const [previewTab, setPreviewTab] = useState<PreviewTab>('cards');
  
  // Confirm state
  const [importMode, setImportMode] = useState<'append' | 'create'>('create');
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [deckColor, setDeckColor] = useState('#2563eb');
  const [deckTags, setDeckTags] = useState('');

  // Success state
  const [createdSetId, setCreatedSetId] = useState<string | null>(null);
  const [createdCardsCount, setCreatedCardsCount] = useState(0);

  // ==================== HANDLERS ====================

  const resetModal = useCallback(() => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setUploadError(null);
    setPreviewTab('cards');
    setImportMode(directCreate ? 'create' : 'append');
    setDeckTitle('');
    setDeckDesc('');
    setDeckColor('#2563eb');
    setDeckTags('');
    setCreatedSetId(null);
    setCreatedCardsCount(0);
  }, [directCreate]);

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadError(null);
    setIsLoading(true);

    try {
      // Extract text from file
      const extractResult = await extractTextFromFile(selectedFile);
      
      if (!extractResult.success) {
        setUploadError(extractResult.error || 'Không thể đọc file');
        setIsLoading(false);
        return;
      }

      // Parse content
      const parsed = parseWithFallback(extractResult.text);
      setParseResult(parsed);

      // Auto-fill deck info from meta
      if (parsed.meta.deckTitle) {
        setDeckTitle(parsed.meta.deckTitle);
      } else {
        // Use filename as default
        setDeckTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      if (parsed.meta.deckDesc) {
        setDeckDesc(parsed.meta.deckDesc);
      }

      // Set default tab based on content
      if (parsed.cards.length === 0 && parsed.mcqs.length > 0) {
        setPreviewTab('mcq');
      }

      setStep('preview');
    } catch (error: any) {
      setUploadError(error.message || 'Lỗi khi xử lý file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult) return;
    
    // Direct create mode: call API to create flashcard set
    if (directCreate || importMode === 'create') {
      setIsLoading(true);
      try {
        const response = await flashcardService.create({
          name: deckTitle.trim(),
          description: deckDesc.trim() || undefined,
          cards: parseResult.cards.map(card => ({
            term: card.front,
            definition: card.back,
            starred: false,
            box: 1,
          })),
          tags: deckTags ? deckTags.split(',').map(t => t.trim()).filter(Boolean) : ['imported'],
          color: deckColor,
        });

        if (response.success) {
          setCreatedSetId(response.data.flashcardSet._id);
          setCreatedCardsCount(parseResult.cards.length);
          setStep('success');
          toast.success(`Đã import ${parseResult.cards.length} thẻ thành công!`);
          onSuccess?.(response.data.flashcardSet._id);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi khi tạo bộ thẻ');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Append mode: return data to parent component
    if (onImport) {
      onImport({
        mode: importMode,
        deckTitle,
        deckDesc,
        cards: parseResult.cards,
        mcqs: parseResult.mcqs,
      });
    }
    
    handleClose();
  };

  // ==================== RENDER HELPERS ====================

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    switch (ext) {
      case '.pdf':
        return <HiDocument className="w-6 h-6 text-red-500" />;
      case '.docx':
        return <HiDocumentText className="w-6 h-6 text-blue-500" />;
      default:
        return <HiDocumentText className="w-6 h-6 text-slate-500" />;
    }
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <HiArrowUpTray className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import từ file</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'upload' && 'Bước 1/3 - Tải file lên'}
                {step === 'preview' && 'Bước 2/3 - Xem trước nội dung'}
                {step === 'confirm' && 'Bước 3/3 - Xác nhận import'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* ==================== STEP 1: UPLOAD ==================== */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileSelect}
                />
                
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <HiArrowPath className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium">Đang xử lý file...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                      <HiArrowUpTray className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Kéo thả file vào đây
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                      hoặc click để chọn file từ máy tính
                    </p>
                    <div className="flex justify-center gap-4 text-xs">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">.txt</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">.docx</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">.pdf</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">Tối đa 10MB</p>
                  </>
                )}
              </div>

              {/* Error */}
              {uploadError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                  <HiExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-400 font-medium text-sm">{uploadError}</p>
                </div>
              )}

              {/* Format Guide */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <HiSparkles className="w-4 h-4 text-yellow-500" />
                  Định dạng V1 được hỗ trợ
                </h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-mono">
                  <div className="flex gap-2 flex-wrap">
                    <code className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-xs text-blue-700 dark:text-blue-300">#DECK Title</code>
                    <code className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-xs text-blue-700 dark:text-blue-300">#DESC Description</code>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <code className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 rounded text-xs text-green-700 dark:text-green-300">@CARD</code>
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Q: Term</code>
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">A: Definition</code>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <code className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 rounded text-xs text-purple-700 dark:text-purple-300">@MCQ</code>
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">A-D: Options</code>
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">ANSWER: B</code>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  ⚠️ PDF scan (không có text) không được hỗ trợ - hãy dùng PDF có text hoặc TXT/DOCX
                </p>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: PREVIEW ==================== */}
          {step === 'preview' && parseResult && file && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">{file.name}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setStep('upload'); setFile(null); setParseResult(null); }}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium cursor-pointer"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <HiRectangleStack className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-blue-700 dark:text-blue-400">Flashcards</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{parseResult.cards.length}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-100 dark:border-purple-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <HiQuestionMarkCircle className="w-5 h-5 text-purple-500" />
                    <span className="font-bold text-purple-700 dark:text-purple-400">Trắc nghiệm</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{parseResult.mcqs.length}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-4">
                  <button
                    onClick={() => setPreviewTab('cards')}
                    className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                      previewTab === 'cards'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Flashcards ({parseResult.cards.length})
                  </button>
                  <button
                    onClick={() => setPreviewTab('mcq')}
                    className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                      previewTab === 'mcq'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Trắc nghiệm ({parseResult.mcqs.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {previewTab === 'cards' && (
                  parseResult.cards.length > 0 ? (
                    parseResult.cards.slice(0, 5).map((card, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Mặt trước</p>
                          <p className="text-sm text-slate-900 dark:text-white font-medium line-clamp-2">{card.front}</p>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">Mặt sau</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{card.back}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-8">Không có flashcard nào</p>
                  )
                )}
                
                {previewTab === 'mcq' && (
                  parseResult.mcqs.length > 0 ? (
                    parseResult.mcqs.slice(0, 5).map((mcq, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                        <p className="text-sm text-slate-900 dark:text-white font-medium mb-2">{mcq.question}</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {(['A', 'B', 'C', 'D'] as const).map(opt => (
                            mcq.options[opt] && (
                              <div 
                                key={opt} 
                                className={`px-2 py-1 rounded ${
                                  mcq.answer === opt 
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {opt}: {mcq.options[opt]}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-8">Không có câu hỏi trắc nghiệm nào</p>
                  )
                )}
                
                {parseResult.cards.length > 5 && previewTab === 'cards' && (
                  <p className="text-center text-sm text-slate-500">... và {parseResult.cards.length - 5} thẻ khác</p>
                )}
                {parseResult.mcqs.length > 5 && previewTab === 'mcq' && (
                  <p className="text-center text-sm text-slate-500">... và {parseResult.mcqs.length - 5} câu hỏi khác</p>
                )}
              </div>

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HiExclamationCircle className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-amber-700 dark:text-amber-400">Lỗi trong file ({parseResult.errors.length})</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {parseResult.errors.map((err, idx) => (
                      <div key={idx} className="text-sm text-amber-700 dark:text-amber-300">
                        <span className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
                          Dòng {err.lineStart}{err.lineEnd !== err.lineStart ? `-${err.lineEnd}` : ''}
                        </span>{' '}
                        {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HiArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={parseResult.cards.length === 0 && parseResult.mcqs.length === 0}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Tiếp tục
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 3: CONFIRM ==================== */}
          {step === 'confirm' && parseResult && (
            <div className="space-y-6">
              {/* Import Mode */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Chọn cách import
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setImportMode('append')}
                    disabled={!existingDeckName}
                    className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      importMode === 'append'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">Thêm vào deck đang tạo</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {existingDeckName || 'Không có deck nào đang tạo'}
                    </p>
                  </button>
                  <button
                    onClick={() => setImportMode('create')}
                    className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                      importMode === 'create'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">Tạo deck mới</p>
                    <p className="text-xs text-slate-500 mt-1">Điền thông tin bên dưới</p>
                  </button>
                </div>
              </div>

              {/* Deck Info (shown for create mode or when no existing deck) */}
              {(importMode === 'create' || !existingDeckName) && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Tên bộ thẻ *
                    </label>
                    <input
                      type="text"
                      value={deckTitle}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      placeholder="Nhập tên bộ thẻ..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Mô tả (tùy chọn)
                    </label>
                    <textarea
                      value={deckDesc}
                      onChange={(e) => setDeckDesc(e.target.value)}
                      placeholder="Mô tả ngắn về bộ thẻ..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Tóm tắt</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>• {parseResult.cards.length} flashcard</p>
                  <p>• {parseResult.mcqs.length} câu hỏi trắc nghiệm</p>
                  {parseResult.errors.length > 0 && (
                    <p className="text-amber-600 dark:text-amber-400">• {parseResult.errors.length} lỗi (đã bỏ qua)</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('preview')}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <HiArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isLoading || ((importMode === 'create' || !existingDeckName) && !deckTitle.trim())}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      Đang import...
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-4 h-4" />
                      Import {parseResult.cards.length + parseResult.mcqs.length} mục
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 4: SUCCESS ==================== */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                <HiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Import thành công!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Đã tạo bộ thẻ "{deckTitle}" với {createdCardsCount} thẻ
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClose}
                  className="py-3 px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    if (createdSetId) {
                      navigate(`/study/${createdSetId}`);
                    }
                  }}
                  className="py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <HiPlay className="w-4 h-4" />
                  Học ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModalV2;
