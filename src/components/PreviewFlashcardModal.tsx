import React, { useState, useEffect } from 'react';
import { HiXMark, HiArrowLeft, HiArrowRight } from 'react-icons/hi2';

interface CardPreview {
  term: string;
  definition: string;
  image?: string;
}

interface PreviewFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardPreview[];
}

const PreviewFlashcardModal: React.FC<PreviewFlashcardModalProps> = ({
  isOpen,
  onClose,
  cards
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter out empty cards
  const validCards = cards.filter(c => c.term.trim() || c.definition.trim());

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCard = validCards[currentIndex];

  const handleNext = () => {
    if (currentIndex < validCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (validCards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm text-center">
            <h3 className="text-xl font-bold mb-2 dark:text-white">Chưa có thẻ nào</h3>
            <p className="text-slate-500 mb-4">Bạn vui lòng nhập nội dung cho ít nhất 1 thẻ để xem trước.</p>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[600px] flex flex-col">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
        >
            <HiXMark className="w-8 h-8" />
        </button>

        {/* Card Container */}
        <div className="flex-1 perspective-1000 relative group cursor-pointer" onClick={handleFlip}>
            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border border-slate-200 dark:border-slate-700">
                    <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-slate-400">Thuật ngữ</span>
                    {currentCard.image && (
                         <div className="mb-6 w-full max-h-48 flex justify-center">
                             <img src={currentCard.image} alt="Visual" className="rounded-lg object-contain max-h-full" />
                         </div>
                    )}
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                        {currentCard.term || <span className="text-slate-300 italic">Trống</span>}
                    </h2>
                    <p className="absolute bottom-6 text-slate-400 text-sm animate-pulse">Nhấn để lật</p>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border border-slate-200 dark:border-slate-700">
                    <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-blue-500">Định nghĩa</span>
                    <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-200 leading-relaxed max-w-prose">
                        {currentCard.definition || <span className="text-slate-300 italic">Trống</span>}
                    </p>
                </div>

            </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between px-4 text-white">
            <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                disabled={currentIndex === 0}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-95"
            >
                <HiArrowLeft className="w-8 h-8" />
            </button>
            
            <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{currentIndex + 1} / {validCards.length}</span>
                <span className="text-sm text-white/50 uppercase tracking-widest mt-1">Xem trước</span>
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                disabled={currentIndex === validCards.length - 1}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-95"
            >
                <HiArrowRight className="w-8 h-8" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default PreviewFlashcardModal;
