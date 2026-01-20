import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { flashcardService, FlashcardSet } from '../../services/flashcardService';
import MainLayout from '../../components/layout/MainLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Plus, 
  Library, 
  LayoutGrid, 
  Edit2, 
  Trash2, 
  Layers, 
  Clock, 
  BookOpen 
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';

type FilterType = 'all' | 'recent' | 'alphabetical';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const toast = useToastContext();

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    setId: string | null;
  }>({ isOpen: false, setId: null });

  // Read filter from URL query params
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'recent' || filterParam === 'alphabetical') {
      setActiveFilter(filterParam);
    } else {
      setActiveFilter('all');
    }
  }, [searchParams]);

  useEffect(() => {
    loadFlashcardSets();
  }, []);

  const loadFlashcardSets = async () => {
    try {
      setIsLoading(true);
      const response = await flashcardService.getAll();
      setFlashcardSets(response.data.flashcardSets);
    } catch (err: any) {
      setError('Không thể tải danh sách bộ thẻ');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setConfirmModal({ isOpen: true, setId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmModal.setId) return;
    
    try {
      await flashcardService.delete(confirmModal.setId);
      setFlashcardSets(flashcardSets.filter(set => set._id !== confirmModal.setId));
      toast.success('Đã xóa bộ thẻ thành công');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Không thể xóa bộ thẻ. Vui lòng thử lại.');
    } finally {
      setConfirmModal({ isOpen: false, setId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, setId: null });
  };

  // Apply filter and sort logic
  const filteredSets = React.useMemo(() => {
    let result = [...flashcardSets];
    
    switch (activeFilter) {
      case 'recent':
        result = result
          .filter(set => set.lastStudied)
          .sort((a, b) => {
            const dateA = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
            const dateB = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
            return dateB - dateA;
          });
        break;
      case 'alphabetical':
        result = result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        break;
      case 'all':
      default:
        break;
    }
    
    return result;
  }, [flashcardSets, activeFilter]);

  const filterButtons = [
    { key: 'all' as FilterType, label: 'Tất cả' },
    { key: 'recent' as FilterType, label: 'Gần đây' },
    { key: 'alphabetical' as FilterType, label: 'Theo tên (A-Z)' },
  ];

  return (
    <MainLayout>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xóa bộ thẻ"
        message="Bạn có chắc muốn xóa bộ thẻ này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Library className="text-purple-500 dark:text-purple-400" size={32} />
          Bộ thẻ của bạn
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Quản lý và học các bộ flashcard của bạn
        </p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveFilter(btn.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === btn.key
                ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-100 dark:bg-white/5 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-200 dark:bg-white/10 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded mb-2 w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-slate-100 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutGrid className="text-slate-400 dark:text-slate-500" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Chưa có bộ thẻ nào
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Tạo bộ thẻ đầu tiên của bạn để bắt đầu học
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <Plus size={20} />
            <span>Tạo bộ thẻ mới</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <div
              key={set._id}
              className="group bg-white dark:bg-white/5 backdrop-blur-sm border-0 dark:border dark:border-white/5 rounded-lg overflow-hidden hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                    {set.name}
                  </h3>
                  
                  {set.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {set.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Layers size={16} />
                      {set.cards.length} thẻ
                    </span>
                    {set.lastStudied && (
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {new Date(set.lastStudied).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {set.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {set.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/10 mt-auto">
                  <Link
                    to={`/study/${set._id}`}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all text-sm flex items-center justify-center gap-2 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-400"
                  >
                    <BookOpen size={16} />
                    Học
                  </Link>
                  <Link
                    to={`/create/${set._id}`}
                    className="p-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-sm border-2 border-transparent hover:border-slate-400 dark:hover:border-slate-500"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => openDeleteConfirm(set._id)}
                    className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-all text-sm border-2 border-transparent hover:border-red-500 dark:hover:border-red-400"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default Home;
