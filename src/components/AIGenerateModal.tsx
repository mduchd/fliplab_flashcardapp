import React, { useState } from 'react';
import { HiSparkles, HiXMark, HiInformationCircle } from 'react-icons/hi2';
import { aiService } from '../services/aiService';
import { useToastContext } from '../contexts/ToastContext';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cards: { term: string; definition: string }[]) => void;
}

const QUICK_TOPICS = [
  '3000 từ vựng Oxford',
  'Thành ngữ tiếng Anh',
  'Sự kiện Lịch sử VN',
  'Nguyên tố Hóa học',
  'Công thức Vật lý'
];

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastContext();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.warning('Vui lòng nhập chủ đề hoặc văn bản');
      return;
    }

    setIsLoading(true);

    try {
      const result = await aiService.generateFlashcards(prompt, count);
      
      if (result.isMock) {
        toast.info('Đang dùng dữ liệu mẫu (Server chưa có API Key)');
      } else {
        toast.success(`Đã tạo thành công ${result.suggestions.length} thẻ!`);
      }

      onSuccess(result.suggestions);
      onClose();
    } catch (error: any) {
      console.error('AI Generate Error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thẻ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 relative transition-colors">
        
        {/* Header */}
        <div className="relative p-6 pb-2 flex items-center justify-between z-10">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600 rounded-xl">
                <HiSparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Magic Create</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Power by Gemini AI</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer">
              <HiXMark className="w-6 h-6" />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 pt-4 space-y-6 z-10 relative">
           
           {/* Main Input */}
           <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5 ml-1">
                Chủ đề hoặc nội dung muốn học
              </label>
              <div className="relative group">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Nhập bất kỳ chủ đề nào (ví dụ: 'Từ vựng về vũ trụ') hoặc dán một đoạn văn bản dài vào đây để AI trích xuất..."
                    className="w-full h-36 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-base leading-relaxed transition-all"
                    autoFocus
                />
              </div>

              {/* Quick Suggestions (Chips) */}
              <div className="flex flex-wrap gap-2 mt-3">
                 {QUICK_TOPICS.map((topic) => (
                    <button
                        key={topic}
                        onClick={() => setPrompt(topic)}
                        className="text-[11px] px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors cursor-pointer font-medium"
                    >
                        {topic}
                    </button>
                 ))}
              </div>
           </div>

           {/* Controls Row */}
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-1 w-full">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số lượng flashcard</label>
                        <span className="text-sm font-bold text-white bg-purple-600 px-2 py-0.5 rounded text-xs">
                           {count} 
                        </span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                        <span>MIN: 5</span>
                        <span>MAX: 30</span>
                    </div>
                </div>
                
                <div className="h-px sm:h-12 w-full sm:w-px bg-slate-200 dark:bg-slate-700"></div>

                <div className="flex items-center gap-3 w-full sm:w-auto text-slate-500 dark:text-slate-400">
                    <HiInformationCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs max-w-[150px] leading-tight">
                        AI sẽ tự động tìm định nghĩa và ví dụ chuẩn xác.
                    </span>
                </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3 z-10 relative bg-slate-50 dark:bg-slate-800/30">
           <button
             onClick={onClose}
             className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold transition-all cursor-pointer"
           >
             Đóng
           </button>
           <button
             onClick={handleGenerate}
             disabled={isLoading || !prompt.trim()}
             className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer border border-transparent group"
           >
             {isLoading ? (
               <>
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span className="animate-pulse">AI đang suy nghĩ...</span>
               </>
             ) : (
               <>
                 <HiSparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                 Tạo {count} thẻ ngay
               </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
};

export default AIGenerateModal;
