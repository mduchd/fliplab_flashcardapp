import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { flashcardService, Flashcard, CreateFlashcardSetData } from '../../services/flashcardService';
import MainLayout from '../../components/layout/MainLayout';
import { HiArrowLeft, HiPlus, HiBookmarkSquare, HiTrash, HiArrowPath, HiPhoto } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';

interface CardInput {
  id: string;
  term: string;
  definition: string;
  image: string;
}

const Create: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const toast = useToastContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<CardInput[]>([
    { id: '1', term: '', definition: '', image: '' },
    { id: '2', term: '', definition: '', image: '' },
  ]);
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('#667eea');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    '#667eea', // purple
    '#f472b6', // pink
    '#34d399', // green
    '#fbbf24', // yellow
    '#60a5fa', // blue
    '#f87171', // red
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
      setColor(set.color || '#667eea');
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
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
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
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Thông tin bộ thẻ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-blue-200 text-sm mb-2">Tên bộ thẻ</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                  placeholder="Ví dụ: Từ vựng IELTS chủ đề Environment..."
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-blue-200 text-sm mb-2">Mô tả (tùy chọn)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="english, vocabulary, beginner"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-blue-200 text-sm mb-2">Màu sắc</label>
                <div className="flex gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        color === c ? 'ring-4 ring-blue-500 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Danh sách thẻ ({cards.length})</h2>
              <button
                type="button"
                onClick={addCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all flex items-center gap-2"
              >
                <HiPlus className="w-[18px] h-[18px]" />
                Thêm thẻ
              </button>
            </div>

            <div className="space-y-4">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start group shadow-sm hover:border-blue-600 dark:hover:border-blue-500/30 transition-all"
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
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        placeholder="Thuật ngữ (Term)..."
                      />
                      <span className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase tracking-wider bg-slate-50 dark:bg-white/5 px-1">Term</span>
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
                     <div className="w-full sm:w-28 h-28 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-white/5 overflow-hidden transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                        {card.image ? (
                          <img src={card.image} alt="Visual" className="w-full h-full object-cover" />
                        ) : (
                          <HiPhoto className="text-slate-300 dark:text-slate-600 w-8 h-8" />
                        )}
                     </div>
                     {card.image && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
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
              className="w-full mt-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold group active:scale-[0.99] cursor-pointer"
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
              className="flex-1 py-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-lg cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <HiArrowPath className="animate-spin w-6 h-6" />
                  Đang lưu bộ thẻ...
                </>
              ) : (
                <>
                  <HiBookmarkSquare className="w-6 h-6" />
                  {isEditing ? 'Lưu thay đổi' : 'Hoàn tất & Tạo bộ thẻ'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Create;
