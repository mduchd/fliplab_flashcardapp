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
  HiPencilSquare
} from 'react-icons/hi2';
import { importService } from '../services/importService';
import { useToastContext } from '../contexts/ToastContext';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (flashcardSetId: string) => void;
}

const SUPPORTED_FORMATS = [
  { ext: '.pdf', name: 'PDF', icon: HiDocument, color: 'text-red-500' },
  { ext: '.docx', name: 'Word', icon: HiDocumentText, color: 'text-blue-500' },
  { ext: '.txt', name: 'Text', icon: HiDocumentText, color: 'text-slate-500' },
];

const COLOR_OPTIONS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626', 
  '#ea580c', '#16a34a', '#0891b2', '#4f46e5'
];

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [step, setStep] = useState<'upload' | 'preview' | 'customize' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview data
  const [previewData, setPreviewData] = useState<{
    fileName: string;
    totalCards: number;
    preview: { term: string; definition: string }[];
    rawTextPreview: string;
  } | null>(null);

  // Customize options
  const [setName, setSetName] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [setColor, setSetColor] = useState('#2563eb');
  const [setTags, setSetTags] = useState('');

  // Success data
  const [createdSetId, setCreatedSetId] = useState<string | null>(null);
  const [cardsCount, setCardsCount] = useState(0);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setIsLoading(true);

    try {
      const response = await importService.previewFile(selectedFile);
      
      if (response.success && response.data) {
        setPreviewData(response.data);
        setSetName(response.data.fileName.replace(/\.[^/.]+$/, ''));
        setStep('preview');
      } else {
        setError(response.message || 'Không thể đọc file');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xử lý file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await importService.importFile(file, {
        name: setName || undefined,
        description: setDescription || undefined,
        tags: setTags ? setTags.split(',').map(t => t.trim()) : undefined,
        color: setColor,
      });

      if (response.success && response.data) {
        setCreatedSetId(response.data.flashcardSet._id);
        setCardsCount(response.data.cardsCount);
        setStep('success');
        toast.success(response.message);
        onSuccess?.(response.data.flashcardSet._id);
      } else {
        setError(response.message || 'Không thể import file');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi import file';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset modal
  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setPreviewData(null);
    setSetName('');
    setSetDescription('');
    setSetColor('#2563eb');
    setSetTags('');
    setError(null);
    setCreatedSetId(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
              <HiArrowUpTray className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import từ file</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chuyển đổi tài liệu thành thẻ học</p>
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
          {/* Step 1: Upload */}
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
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.csv"
                  onChange={handleFileInputChange}
                />
                
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <HiArrowPath className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium">Đang xử lý file...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center">
                      <HiArrowUpTray className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Kéo thả file vào đây
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                      hoặc click để chọn file từ máy tính
                    </p>
                    <div className="flex justify-center gap-4">
                      {SUPPORTED_FORMATS.map(format => (
                        <div key={format.ext} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <format.icon className={`w-4 h-4 ${format.color}`} />
                          {format.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                  <HiExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 dark:text-red-400 font-medium text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Format Guide */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <HiSparkles className="w-4 h-4 text-yellow-500" />
                  Định dạng được hỗ trợ
                </h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex gap-2">
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Q: Câu hỏi</code>
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">A: Đáp án</code>
                  </div>
                  <div className="flex gap-2">
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Thuật ngữ - Định nghĩa</code>
                  </div>
                  <div className="flex gap-2">
                    <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Thuật ngữ: Định nghĩa</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Hệ thống tự động nhận dạng và chuyển đổi nội dung thành thẻ học.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && previewData && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <HiCheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">{previewData.fileName}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">Đã tìm thấy {previewData.totalCards} thẻ</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('upload')}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium cursor-pointer"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Preview Cards */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <HiRectangleStack className="w-4 h-4 text-indigo-500" />
                  Xem trước ({Math.min(previewData.preview.length, 5)} thẻ đầu tiên)
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {previewData.preview.slice(0, 5).map((card, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">Thuật ngữ</p>
                        <p className="text-sm text-slate-900 dark:text-white font-medium line-clamp-2">{card.term}</p>
                      </div>
                      <div className="w-px bg-slate-200 dark:bg-slate-700" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">Định nghĩa</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{card.definition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep('customize')}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HiPencilSquare className="w-4 h-4" />
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {step === 'customize' && (
            <div className="space-y-6">
              {/* Set Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tên bộ thẻ *
                </label>
                <input
                  type="text"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="Nhập tên bộ thẻ..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={setDescription}
                  onChange={(e) => setSetDescription(e.target.value)}
                  placeholder="Mô tả ngắn về bộ thẻ..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={setTags}
                  onChange={(e) => setSetTags(e.target.value)}
                  placeholder="ví dụ: tiếng anh, từ vựng, IELTS"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Màu sắc
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSetColor(color)}
                      className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                        setColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                  <HiExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-400 font-medium text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('preview')}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleImport}
                  disabled={isLoading || !setName.trim()}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      Đang import...
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-4 h-4" />
                      Import {previewData?.totalCards || 0} thẻ
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                <HiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Import thành công!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Đã tạo bộ thẻ "{setName}" với {cardsCount} thẻ
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
                  className="py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors cursor-pointer"
                >
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

export default ImportModal;
