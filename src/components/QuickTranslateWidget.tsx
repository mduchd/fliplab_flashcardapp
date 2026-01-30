import React, { useState, useEffect, useRef } from 'react';
import { HiLanguage, HiClipboardDocument, HiSpeakerWave, HiMagnifyingGlass, HiArrowsRightLeft } from 'react-icons/hi2';
import { translationService } from '../services/translationService';
import { useToastContext } from '../contexts/ToastContext';

const LANGUAGES = [
  { code: 'auto', name: 'Phát hiện ngôn ngữ', voice: '', popular: true },
  { code: 'vi', name: 'Tiếng Việt', voice: 'vi-VN', popular: true },
  { code: 'en', name: 'Tiếng Anh', voice: 'en-US', popular: true },
  { code: 'ja', name: 'Tiếng Nhật', voice: 'ja-JP', popular: true },
  { code: 'ko', name: 'Tiếng Hàn', voice: 'ko-KR', popular: true },
  { code: 'zh-CN', name: 'Trung (Giản thể)', voice: 'zh-CN', popular: true },
  { code: 'fr', name: 'Tiếng Pháp', voice: 'fr-FR', popular: true },
  { code: 'de', name: 'Tiếng Đức', voice: 'de-DE', popular: true },
  { code: 'ru', name: 'Tiếng Nga', voice: 'ru-RU', popular: true },
  { code: 'es', name: 'Tây Ban Nha', voice: 'es-ES', popular: true },
  { code: 'th', name: 'Tiếng Thái', voice: 'th-TH', popular: false },
  { code: 'it', name: 'Tiếng Ý', voice: 'it-IT', popular: false },
  { code: 'id', name: 'Indonesia', voice: 'id-ID', popular: false },
  { code: 'hi', name: 'Tiếng Hindi', voice: 'hi-IN', popular: false },
  { code: 'pt', name: 'Bồ Đào Nha', voice: 'pt-PT', popular: false },
  { code: 'zh-TW', name: 'Trung (Phồn thể)', voice: 'zh-TW', popular: false },
  { code: 'nl', name: 'Hà Lan', voice: 'nl-NL', popular: false },
  { code: 'tr', name: 'Thổ Nhĩ Kỳ', voice: 'tr-TR', popular: false },
  { code: 'pl', name: 'Ba Lan', voice: 'pl-PL', popular: false },
  { code: 'ar', name: 'Ả Rập', voice: 'ar-SA', popular: false },
  { code: 'ms', name: 'Mã Lai', voice: 'ms-MY', popular: false },
  { code: 'fil', name: 'Philippines', voice: 'fil-PH', popular: false },
  { code: 'sv', name: 'Thụy Điển', voice: 'sv-SE', popular: false },
  { code: 'uk', name: 'Ukraina', voice: 'uk-UA', popular: false },
  { code: 'cs', name: 'Séc', voice: 'cs-CZ', popular: false },
  { code: 'el', name: 'Hy Lạp', voice: 'el-GR', popular: false },
  { code: 'hu', name: 'Hungary', voice: 'hu-HU', popular: false },
  { code: 'ro', name: 'Rumani', voice: 'ro-RO', popular: false },
  { code: 'bn', name: 'Bengali', voice: 'bn-IN', popular: false },
  { code: 'km', name: 'Khmer (Campuchia)', voice: 'km-KH', popular: false },
  { code: 'lo', name: 'Lào', voice: 'lo-LA', popular: false },
];

const QuickTranslateWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ translated: string; from: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('vi');

  const toast = useToastContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      // Pass from/to params to service
      const res = await translationService.translate(inputText, targetLang, sourceLang);
      if (res.success && res.data) {
        setResult({
          translated: res.data.translated,
          from: res.data.from
        });
      } else {
        toast.error('Không thể dịch lúc này');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') {
        toast.info('Vui lòng chọn ngôn ngữ nguồn cụ thể để đảo chiều');
        return;
    }
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    // Also swap text if result exists
    if (result?.translated) {
        setInputText(result.translated);
        setResult(null); // Clear result as we need to translate again
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const copyToClipboard = () => {
    if (result?.translated) {
      navigator.clipboard.writeText(result.translated);
      toast.success('Đã sao chép!');
    }
  };

  const speakResult = () => {
    if (!result?.translated) return;
    const utterance = new SpeechSynthesisUtterance(result.translated);
    // Find voice code based on targetLang
    const langConfig = LANGUAGES.find(l => l.code === targetLang);
    utterance.lang = langConfig?.voice || 'vi-VN';
    window.speechSynthesis.speak(utterance);
  };
   const speakSource = () => {
    if (!inputText) return;
    const utterance = new SpeechSynthesisUtterance(inputText);
    // Find voice code based on sourceLang or guess from result
    const langCode = sourceLang === 'auto' ? (result?.from || 'en') : sourceLang; 
    
    // Map iso code to voice code (simple mapping)
    const voiceMap: {[key: string]: string} = {
        'vi': 'vi-VN', 'en': 'en-US', 'ja': 'ja-JP', 'ko': 'ko-KR', 
        'zh': 'zh-CN', 'zh-CN': 'zh-CN', 'fr': 'fr-FR', 'de': 'de-DE', 'ru': 'ru-RU'
    };
    
    utterance.lang = voiceMap[langCode] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showTargetMenu, setShowTargetMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when menu opens
  useEffect(() => {
    if ((showSourceMenu || showTargetMenu) && searchInputRef.current) {
        setSearchQuery(''); // Reset search
        setShowAllLanguages(false); // Reset show all
        setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSourceMenu, showTargetMenu]);

  // Filter languages
  const filteredLanguages = LANGUAGES.filter(l => {
    // If searching, search in ALL languages
    if (searchQuery) {
        return l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               l.code.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // If not searching, check showAll toggle
    return showAllLanguages || l.popular;
  });

  // ... (keep handleTranslate, handleSwap, etc. intact)
  // Need to close menus when clicking outside or selecting
  const selectSource = (code: string) => {
      setSourceLang(code);
      setShowSourceMenu(false);
  };
  const selectTarget = (code: string) => {
      setTargetLang(code);
      setShowTargetMenu(false);
  };
  
  // Click outside to close
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Toggle Button (Navbar Style - Labeled) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 border active:scale-95 cursor-pointer ${
          isOpen 
            ? 'bg-slate-200 text-slate-700 border-transparent hover:bg-slate-300 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-white'
            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:border-blue-500 dark:hover:bg-blue-500' 
        }`}
        title="Dịch nhanh"
      >
        <HiLanguage className="w-5 h-5" />
        <span className="hidden sm:inline font-bold text-sm">Dịch</span>
      </button>

      {/* Popup Panel (Dropdown Style) */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-visible animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right"
        >
          {/* Arrow Pointer */}
          <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-50 dark:bg-slate-900 border-t border-l border-slate-100 dark:border-slate-800 transform rotate-45 z-0"></div>
          
          <div className="relative z-10 bg-inherit rounded-2xl overflow-hidden">
        {/* Header - Language Filters (Custom Dropdown) */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-3 flex items-center justify-between gap-2 relative z-50">
            
            {/* Source Language Selector */}
            <div className="relative flex-1">
                <button 
                    onClick={() => { setShowSourceMenu(!showSourceMenu); setShowTargetMenu(false); }}
                    className="w-full flex items-center justify-between bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                    <span className="truncate">{LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang}</span>
                    <svg className={`w-3 h-3 text-slate-400 transition-transform ${showSourceMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showSourceMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSourceMenu(false)}></div>
                        <div className="absolute top-full left-0 mt-1 w-48 max-h-64 overflow-hidden flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-200">
                            {/* Search Input */}
                            <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                                <div className="relative">
                                    <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Tìm ngôn ngữ..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                            
                            {/* List */}
                            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 p-1">
                                {filteredLanguages.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => selectSource(l.code)}
                                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                                            sourceLang === l.code 
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                    >
                                        {l.name}
                                        {sourceLang === l.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>}
                                    </button>
                                ))}
                                {filteredLanguages.length === 0 && (
                                    <div className="text-center py-4 text-xs text-slate-400">Không tìm thấy</div>
                                )}
                                {!searchQuery && !showAllLanguages && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowAllLanguages(true); }}
                                        className="w-full text-center py-2 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-bold border-t border-slate-100 dark:border-slate-700 mt-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Xem thêm ngôn ngữ khác...
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Swap Button */}
            <button 
                onClick={handleSwap}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 rounded-full transition-all active:rotate-180 flex-shrink-0 cursor-pointer shadow-sm"
                title="Đảo chiều ngôn ngữ"
            >
                <HiArrowsRightLeft className="w-4 h-4" />
            </button>

            {/* Target Language Selector */}
            <div className="relative flex-1">
                <button 
                    onClick={() => { setShowTargetMenu(!showTargetMenu); setShowSourceMenu(false); }}
                    className="w-full flex items-center justify-between bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                    <span className="truncate">{LANGUAGES.find(l => l.code === targetLang)?.name || targetLang}</span>
                    <svg className={`w-3 h-3 text-slate-400 transition-transform ${showTargetMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {showTargetMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowTargetMenu(false)}></div>
                        <div className="absolute top-full right-0 mt-1 w-48 max-h-64 overflow-hidden flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-200">
                             {/* Search Input */}
                            <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                                <div className="relative">
                                    <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Tìm ngôn ngữ..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 p-1">
                                {filteredLanguages.filter(l => l.code !== 'auto').map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => selectTarget(l.code)}
                                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                                            targetLang === l.code 
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                    >
                                        {l.name}
                                        {targetLang === l.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>}
                                    </button>
                                ))}
                                {filteredLanguages.filter(l => l.code !== 'auto').length === 0 && (
                                    <div className="text-center py-4 text-xs text-slate-400">Không tìm thấy</div>
                                )}
                                {!searchQuery && !showAllLanguages && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowAllLanguages(true); }}
                                        className="w-full text-center py-2 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-bold border-t border-slate-100 dark:border-slate-700 mt-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Xem thêm ngôn ngữ khác...
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
            {/* Input */}
            <div className="relative">
                <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập từ cần tra (Enter để dịch)..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 dark:text-slate-200 text-sm font-medium pr-10"
                    rows={3}
                />
                 {inputText && (
                    <button 
                        onClick={speakSource}
                        className="absolute right-2 bottom-2 text-slate-400 hover:text-indigo-500 p-1"
                        title="Phát âm"
                    >
                        <HiSpeakerWave className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Translate Button (Mobile/Manual) */}
            <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText}
                className="w-full py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                ) : 'Dịch ngay'}
            </button>

            {/* Result */}
            {result && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl relative group">
                        <div className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 mb-1">
                            Kết quả ({result.from}):
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 font-semibold text-lg leading-snug">
                            {result.translated}
                        </p>
                        
                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={speakResult}
                                className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-500 hover:text-green-600 transition-colors cursor-pointer"
                                title="Nghe phát âm"
                            >
                                <HiSpeakerWave className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={copyToClipboard}
                                className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Sao chép"
                            >
                                <HiClipboardDocument className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default QuickTranslateWidget;
