
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { flashcardService, Flashcard, CreateFlashcardSetData } from '../../services/flashcardService';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HiPlus, 
  HiTrash, 
  HiPhoto, 
  HiArrowLeft, 
  HiArrowUpTray, 
  HiSparkles,
  HiEye,
  HiArrowPath,
  HiCheckCircle,
  HiRectangleStack,
  HiClock,
  HiAcademicCap,
  HiShare,
  HiFolder,
  HiPencil,
  HiLanguage
} from 'react-icons/hi2';
import { translationService } from '../../services/translationService';
import { ICON_MAP, ICON_OPTIONS } from '../../utils/icons';
import { useToastContext } from '../../contexts/ToastContext';
import ImportModalV2, { ImportData } from '../../components/ImportModalV2';
import AIGenerateModal from '../../components/AIGenerateModal';
import PreviewFlashcardModal from '../../components/PreviewFlashcardModal';

interface CardInput {
  id: string;
  term: string;
  definition: string;
  image: string;
}

const Create: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation
  const isEditing = !!id;
  const toast = useToastContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<CardInput[]>([
    { id: '1', term: '', definition: '', image: '' },
    { id: '2', term: '', definition: '', image: '' },
  ]);
  
  // ... imports and other state ...

  useEffect(() => {
    if (id) {
      loadFlashcardSet();
    } else {
       // Check for data passed from Magic AI (Chat widget)
       const state = location.state as { generatedCards?: { term: string; definition: string }[], deckTopic?: string };
       if (state?.generatedCards) {
          setName(state.deckTopic || `Bộ thẻ về ${state.generatedCards[0]?.term || 'Mới'}`);
          handleAIGenerated(state.generatedCards);
          // Clear state to prevent reloading on refresh
          window.history.replaceState({}, document.title);
       } else {
          // RESET FORM if simply navigating to /create (Create Mode)
          setName('');
          setDescription('');
          setTags('');
          setColor('#2563eb');
          setIcon('stack');
          setCards([
            { id: '1', term: '', definition: '', image: '' },
            { id: '2', term: '', definition: '', image: '' },
          ]);
       }
    }
  }, [id, location.state]);
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [icon, setIcon] = useState('stack');
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [translatingCardId, setTranslatingCardId] = useState<string | null>(null);

  const handleTranslate = async (cardId: string, text: string) => {
    if (!text.trim()) return toast.info('Vui lòng nhập thuật ngữ trước khi dịch');
    
    setTranslatingCardId(cardId);
    try {
      const res = await translationService.translate(text);
      if (res.success && res.data) {
        updateCard(cardId, 'definition', res.data.translated);
        toast.success('Đã dịch tự động!');
      } else {
        toast.error(res.error || 'Lỗi dịch thuật');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi dịch');
    } finally {
      setTranslatingCardId(null);
    }
  };
  const colors = [
    '#2563eb', // blue (Primary)
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#f43f5e', // rose
  ];

  useEffect(() => {
    if (id) {
      loadFlashcardSet();
    }
  }, [id]);

  const loadFlashcardSet = async () => {
    try {
      setIsFetching(true);
      const response = await flashcardService.getById(id!);
      const set = response.data.flashcardSet;
      setName(set.name);
      setDescription(set.description || '');
      setCards(set.cards.map((c: Flashcard, i: number) => ({
        id: c._id || String(i),
        term: c.term,
        definition: c.definition,
        image: c.image || '',
      })));
      setTags(set.tags.join(', '));
      setColor(set.color || '#2563eb');
      setIcon(set.icon || 'stack');
    } catch (err) {
      setError('Không thể tải bộ thẻ');
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const addCard = () => {
    setCards([
      ...cards,
      { id: String(Date.now()), term: '', definition: '', image: '' },
    ]);
  };

  const removeCard = (cardId: string) => {
    if (cards.length <= 1) {
      toast.warning('Bộ thẻ cần có ít nhất 1 thẻ');
      return;
    }
    
    const cardToRemove = cards.find(c => c.id === cardId);
    const cardIndex = cards.findIndex(c => c.id === cardId);
    
    // If card has content, show undo option
    if (cardToRemove && (cardToRemove.term.trim() || cardToRemove.definition.trim())) {
      setCards(cards.filter((c) => c.id !== cardId));
      
      toast.success(
        `Đã xóa thẻ "${cardToRemove.term.slice(0, 20) || 'không có tiêu đề'}..."`,
        () => {
          // Undo: restore the card at its original position
          setCards(prev => {
            const newCards = [...prev];
            newCards.splice(cardIndex, 0, cardToRemove);
            return newCards;
          });
          toast.success('Đã hoàn tác xóa thẻ');
        }
      );
    } else {
      // Card is empty, just remove without confirmation
      setCards(cards.filter((c) => c.id !== cardId));
    }
  };

  const updateCard = (id: string, field: keyof CardInput, value: string) => {
    setCards(
      cards.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Kích thước ảnh quá lớn (giới hạn 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCard(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: string) => {
    updateCard(id, 'image', '');
  };

  // Handle import from file
  const handleImport = (data: ImportData) => {
    // Convert parsed cards to CardInput format
    const importedCards: CardInput[] = data.cards.map((card, idx) => ({
      id: `imported-${Date.now()}-${idx}`,
      term: card.front,
      definition: card.back,
      image: '',
    }));

    if (data.mode === 'append') {
      // Append to existing cards
      setCards(prev => [...prev, ...importedCards]);
      toast.success(`Đã thêm ${importedCards.length} thẻ từ file`);
    } else {
      // Create new - replace cards and set metadata
      setCards(importedCards.length > 0 ? importedCards : [{ id: '1', term: '', definition: '', image: '' }]);
      if (data.deckTitle) setName(data.deckTitle);
      if (data.deckDesc) setDescription(data.deckDesc);
      toast.success(`Đã import ${importedCards.length} thẻ`);
    }

    // Note: MCQs are currently not stored in flashcard model
    // They can be handled separately if needed
    if (data.mcqs.length > 0) {
      toast.info(`${data.mcqs.length} câu hỏi trắc nghiệm chưa được hỗ trợ trong bộ thẻ này`);
    }
  };

  const handleAIGenerated = (newCards: { term: string; definition: string }[]) => {
    // Convert to CardInput
    const formattedCards: CardInput[] = newCards.map((c, i) => ({
      id: `ai-${Date.now()}-${i}`,
      term: c.term,
      definition: c.definition,
      image: ''
    }));

    // Filter out existing empty cards (no term AND no definition)
    const validExistingCards = cards.filter(c => c.term.trim() || c.definition.trim() || c.image);
    
    // If we have valid existing cards, append new ones. 
    // If not (meaning current list is all empty placeholders), just use the new ones.
    if (validExistingCards.length > 0) {
      setCards([...validExistingCards, ...formattedCards]);
    } else {
      setCards(formattedCards);
    }
    
    toast.success(`Đã tạo ${newCards.length} thẻ từ AI!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      toast.warning('Vui lòng nhập tên bộ thẻ');
      return;
    }

    const validCards = cards.filter((c) => c.term.trim() && c.definition.trim());
    if (validCards.length === 0) {
      toast.warning('Vui lòng thêm ít nhất 1 thẻ với thuật ngữ và định nghĩa');
      return;
    }

    setIsLoading(true);

    try {
      const data: CreateFlashcardSetData = {
        name: name.trim(),
        description: description.trim(),
        cards: validCards.map((c) => ({
          term: c.term.trim(),
          definition: c.definition.trim(),
          image: c.image,
          starred: false,
          box: 1,
        })),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        color,
        icon,
      };

      if (isEditing) {
        await flashcardService.update(id!, data);
        toast.success('Đã cập nhật bộ thẻ thành công');
      } else {
        await flashcardService.create(data);
        toast.success('Đã tạo bộ thẻ mới thành công');
      }

      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <HiArrowPath className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors cursor-pointer"
          >
            <HiArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Chỉnh sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Set Info */}
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Thông tin bộ thẻ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-blue-200 text-sm mb-2">Tên bộ thẻ</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                  placeholder="Ví dụ: Từ vựng IELTS chủ đề Environment..."
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-blue-200 text-sm mb-2">Mô tả (tùy chọn)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Mô tả ngắn về bộ thẻ này..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-blue-200 text-sm mb-2">Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="english, vocabulary, beginner"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-blue-200 text-sm mb-2">Màu sắc</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-full transition-all cursor-pointer ${
                          color === c ? 'ring-4 ring-blue-500 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                  ))}
                </div>

                {/* Icon Selection */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-slate-700 dark:text-blue-200 text-sm">Biểu tượng</label>
                    <button
                      type="button"
                      onClick={() => setShowAllIcons(!showAllIcons)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      {showAllIcons ? 'Thu gọn' : 'Xem thêm'}
                      <svg className={`w-3 h-3 transition-transform ${showAllIcons ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className={`flex flex-wrap gap-3 transition-all duration-300 ease-in-out ${showAllIcons ? 'max-h-[500px] overflow-y-auto pr-1' : 'max-h-[96px] overflow-hidden'}`}>
                    {ICON_OPTIONS.map((opt) => {
                      const Icon = ICON_MAP[opt.key];
                      if (!Icon) return null; // Safety check
                      
                      const isSelected = icon === opt.key;
                      
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setIcon(opt.key)}
                          title={opt.label}
                          className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all cursor-pointer border-2 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-white dark:border-blue-400 shadow-md scale-105' 
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-400 hover:border-blue-300 dark:hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="mt-8">
                   <label className="block text-slate-700 dark:text-blue-200 text-sm mb-3 font-semibold">
                      Xem trước hiển thị:
                   </label>
                   <div className="w-full max-w-[450px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative group transition-all hover:-translate-y-1">
                      {/* Top Color Bar */}
                      <div className="h-1.5 w-full transition-colors duration-300" style={{ backgroundColor: color }}></div>
                      
                      {/* Background Watermark Icon - Dynamic */}
                      <div 
                          className="absolute -right-6 -top-6 opacity-[0.15] transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 pointer-events-none z-0"
                          style={{ color: color }}
                      >
                           {(() => {
                             const BgIcon = ICON_MAP[icon] || HiRectangleStack;
                             return <BgIcon className="w-32 h-32" />;
                           })()}
                      </div>

                      <div className="p-5 relative z-10">
                          {/* Title - Custom Color */}
                          <h3 className="text-xl font-bold mb-1 line-clamp-1 transition-colors" style={{ color: color }}>
                              {name || 'Tiêu đề bộ thẻ...'}
                          </h3>

                          {/* Description - Syncs live with input */}
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[1.25rem]">
                              {description || 'Mô tả bộ thẻ...'}
                          </p>
                          
                          {/* Chips */}
                          <div className="flex flex-wrap gap-2 mb-6">
                             <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                 <HiRectangleStack className="w-4 h-4" style={{ color: color }} />
                                 {cards.length} thẻ
                             </div>
                             <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                 <HiClock className="w-4 h-4" style={{ color: color }} />
                                 {new Date().toLocaleDateString('vi-VN')}
                             </div>
                          </div>

                          {/* Action Row */}
                          <div className="flex items-center gap-3">
                              <button 
                                  type="button" 
                                  className="flex-1 h-12 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-default pointer-events-none"
                                  style={{ backgroundColor: color }}
                              >
                                  <HiAcademicCap className="w-5 h-5" />
                                  Học ngay
                              </button>
                              
                              <div className="flex gap-2">
                                  <div className="w-11 h-11 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-600 opacity-60">
                                      <HiShare className="w-5 h-5" />
                                  </div>
                                  <div className="w-11 h-11 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-600 opacity-60">
                                      <HiFolder className="w-5 h-5" />
                                  </div>
                                  <div className="w-11 h-11 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-600 opacity-60">
                                      <HiPencil className="w-5 h-5" />
                                  </div>
                                   <div className="w-11 h-11 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-600 opacity-60">
                                      <HiTrash className="w-5 h-5" />
                                  </div>
                              </div>
                          </div>
                      </div>
                   </div>
                   <p className="mt-3 text-xs text-slate-400 italic flex items-center gap-1">
                      * Đây là bản xem trước hiển thị ở trang chủ
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Danh sách thẻ 
                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                  {cards.length}
                </span>
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                {/* Utility Group */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 text-sm font-medium cursor-pointer"
                    title="Nhập từ file"
                  >
                    <HiArrowUpTray className="w-4 h-4" />
                    <span className="hidden sm:inline">Import</span>
                  </button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10"></div>
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 text-sm font-medium cursor-pointer"
                    title="Xem trước bộ thẻ"
                  >
                    <HiEye className="w-4 h-4" />
                    <span className="hidden sm:inline">Xem trước</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>

                {/* Smart Actions */}
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer font-bold text-sm active:scale-95"
                >
                  <HiSparkles className="w-4 h-4" />
                  <span>Magic AI</span>
                </button>

                {/* Primary Action */}
                <button
                  type="button"
                  onClick={addCard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer text-sm font-bold shadow-sm hover:shadow-blue-500/30 active:scale-95"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>Thêm thẻ</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start group shadow-sm hover:border-blue-600 dark:hover:border-blue-500/30 transition-all"
                >
                  {/* 1. Index Circle */}
                  <div className="flex-shrink-0 pt-2 hidden sm:block">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  {/* 2. Inputs */}
                  <div className="flex-1 w-full flex flex-col gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={card.term}
                        onChange={(e) => updateCard(card.id, 'term', e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        placeholder="Thuật ngữ (Term)..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleTranslate(card.id, card.term);
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => handleTranslate(card.id, card.term)}
                        disabled={translatingCardId === card.id}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Dịch nhanh sang Tiếng Việt (Ctrl + Enter)"
                      >
                        {translatingCardId === card.id ? (
                          <HiArrowPath className="w-5 h-5 animate-spin text-blue-500" />
                        ) : (
                          <HiLanguage className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={card.definition}
                        onChange={(e) => updateCard(card.id, 'definition', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        placeholder="Định nghĩa (Definition)..."
                      />
                      <span className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase tracking-wider bg-slate-50 dark:bg-white/5 px-1">Def</span>
                    </div>
                  </div>

                  {/* 3. Image Preview */}
                  <div className="flex-shrink-0 relative group/image">
                     <div className="w-full sm:w-28 h-28 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-white/5 overflow-hidden transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                        {card.image ? (
                          <img src={card.image} alt="Visual" className="w-full h-full object-cover" />
                        ) : (
                          <HiPhoto className="text-slate-300 dark:text-slate-600 w-8 h-8" />
                        )}
                     </div>
                     {card.image && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                          <span className="text-white text-xs font-medium pointer-events-auto cursor-pointer p-1 bg-red-500 rounded-lg hover:bg-red-600" onClick={() => removeImage(card.id)}>
                            <HiTrash className="w-4 h-4" />
                          </span>
                        </div>
                     )}
                  </div>

                  {/* 4. Action Buttons */}
                  <div className="flex-shrink-0 flex flex-row sm:flex-col gap-2 sm:self-center">
                     {/* Upload Btn */}
                     <div>
                       <input
                          id={`file-${card.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(card.id, e)}
                       />
                       <label
                          htmlFor={`file-${card.id}`}
                          className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-white/20 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-600 hover:border-blue-300 cursor-pointer transition-all bg-white dark:bg-transparent shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                          title="Thêm/Đổi ảnh"
                       >
                          <HiPhoto className="w-5 h-5" />
                       </label>
                     </div>

                     {/* Delete Btn */}
                     <button
                        type="button"
                        onClick={() => removeCard(card.id)}
                        disabled={cards.length <= 1}
                        className="w-10 h-10 flex items-center justify-center border border-red-200 dark:border-red-500/30 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 transition-all bg-white dark:bg-transparent shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:border-slate-200 cursor-pointer hover:shadow-md hover:scale-105 active:scale-95"
                        title="Xóa thẻ"
                     >
                        <HiTrash className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCard}
              className="w-full mt-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold group active:scale-[0.99] cursor-pointer"
            >
              <div className="p-1 bg-white dark:bg-white/10 rounded-full text-slate-900 dark:text-white group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <HiPlus className="w-5 h-5" />
              </div>
              Thêm thẻ mới
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-lg cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <HiArrowPath className="animate-spin w-6 h-6" />
                  Đang lưu bộ thẻ...
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-6 h-6" />
                  {isEditing ? 'Lưu thay đổi' : 'Hoàn tất & Tạo bộ thẻ'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Import Modal */}
      <ImportModalV2
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        existingDeckName={name || undefined}
      />

      {/* AI Generate Modal */}
      <AIGenerateModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={handleAIGenerated}
      />

      {/* Preview Modal */}
      <PreviewFlashcardModal 
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        cards={cards} // Pass raw card list
      />
    </MainLayout>
  );
};

export default Create;

