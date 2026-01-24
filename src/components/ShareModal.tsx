import React, { useState } from 'react';
import { HiXMark, HiLink, HiClipboardDocument, HiArrowDownTray, HiCheck, HiQrCode } from 'react-icons/hi2';
import { FlashcardSet } from '../services/flashcardService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcardSet: FlashcardSet;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, flashcardSet }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/study/${flashcardSet._id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      name: flashcardSet.name,
      description: flashcardSet.description,
      cards: flashcardSet.cards.map(c => ({
        term: c.term,
        definition: c.definition,
        image: c.image || undefined,
      })),
      tags: flashcardSet.tags,
      color: flashcardSet.color,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flashcardSet.name.replace(/[^a-zA-Z0-9]/g, '_')}_flashcards.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header - Flat Blue */}
        <div className="relative px-6 py-5 bg-blue-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer"
          >
            <HiXMark className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <HiLink className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chia sẻ bộ thẻ</h2>
              <p className="text-white/80 text-sm">{flashcardSet.name}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Copy Link */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Link chia sẻ
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'text-white hover:saturate-150'
                }`}
                style={{ backgroundColor: copied ? undefined : '#2563eb' }}
              >
                {copied ? (
                  <>
                    <HiCheck className="w-4 h-4" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <HiClipboardDocument className="w-4 h-4" />
                    Sao chép
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons - Flat, Larger Icons */}
          <div className="grid grid-cols-2 gap-3">
            {/* QR Code */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <HiQrCode className="w-10 h-10" style={{ color: '#2563eb' }} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mã QR</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <HiArrowDownTray className="w-10 h-10" style={{ color: '#2563eb' }} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Xuất file</span>
            </button>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center">
              <div className="w-48 h-48 bg-white p-4 rounded-lg shadow-inner flex items-center justify-center">
                {/* Simple QR placeholder - using API */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`}
                  alt="QR Code"
                  className="w-40 h-40"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                Quét mã QR để mở bộ thẻ trên thiết bị khác
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                {flashcardSet.cards.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">thẻ</span>
            </div>
            {flashcardSet.tags.length > 0 && (
              <div className="text-center">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                  {flashcardSet.tags.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">tags</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
