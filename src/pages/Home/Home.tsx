import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { flashcardService, FlashcardSet } from '../../services/flashcardService';
import { folderService, Folder } from '../../services/folderService';
import MainLayout from '../../components/layout/MainLayout';
import ConfirmModal from '../../components/ConfirmModal';
import FolderSection from '../../components/FolderSection';
import MoveToFolderModal from '../../components/MoveToFolderModal';
import FolderContentModal from '../../components/FolderContentModal';
import ShareModal from '../../components/ShareModal';
import ImportModal from '../../components/ImportModal';
import { 
  HiPlus, 
  HiBookOpen, 
  HiSquares2X2, 
  HiPencilSquare, 
  HiTrash, 
  HiRectangleStack, 
  HiClock, 
  HiAcademicCap,
  HiArrowPath,
  HiArrowUpTray,
  HiMagnifyingGlass,
  HiFolder,
  HiShare
} from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';

type FilterType = 'all' | 'recent' | 'alphabetical' | 'mostCards';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sets' | 'folders'>('sets');

  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(() => {
    const saved = localStorage.getItem('flashcard_filter');
    const urlParam = searchParams.get('filter');
    if (urlParam && ['all', 'recent', 'alphabetical', 'mostCards'].includes(urlParam)) {
      return urlParam as FilterType;
    }
    if (saved && ['all', 'recent', 'alphabetical', 'mostCards'].includes(saved)) {
      return saved as FilterType;
    }
    return 'all';
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToastContext();

  // Move to Folder Modal state
  const [moveModal, setMoveModal] = useState<{
    isOpen: boolean;
    setId: string | null;
    currentFolderId?: string | null;
  }>({ isOpen: false, setId: null });

  // Folder Content Viewer State
  const [viewingFolder, setViewingFolder] = useState<Folder | null>(null);

  // Share Modal State
  const [sharingSet, setSharingSet] = useState<FlashcardSet | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleShareClick = (e: React.MouseEvent, set: FlashcardSet) => {
    e.stopPropagation();
    e.preventDefault();
    setSharingSet(set);
  };

  const handleMoveToFolder = (e: React.MouseEvent, set: FlashcardSet) => {
    e.stopPropagation();
    e.preventDefault();
    setMoveModal({ 
      isOpen: true, 
      setId: set._id,
      currentFolderId: set.folderId 
    });
  };

  const handleMoveSuccess = () => {
    loadData(); // Reload data to reflect changes
  };

  // Confirm modal state - includes deck info for display
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    set: FlashcardSet | null;
  }>({ isOpen: false, set: null });

  // Save filter to localStorage when changed
  useEffect(() => {
    localStorage.setItem('flashcard_filter', activeFilter);
    const newParams = new URLSearchParams(searchParams);
    if (activeFilter === 'all') {
      newParams.delete('filter');
    } else {
      newParams.set('filter', activeFilter);
    }
    setSearchParams(newParams, { replace: true });
  }, [activeFilter]);

  useEffect(() => {
    loadData();
  }, []);

  // Listen for URL params to switch tabs
  useEffect(() => {
    const tab = searchParams.get('tab');

    if (tab === 'folders') {
      setActiveTab('folders');
    } else if (tab === 'sets') {
      setActiveTab('sets');
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [setsResponse, foldersResponse] = await Promise.all([
        flashcardService.getAll(),
        folderService.getFolders()
      ]);
      setFlashcardSets(setsResponse.data.flashcardSets);
      setFolders(foldersResponse.data.folders);
    } catch (err: any) {
      setError('Không thể tải dữ liệu');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Folder handlers
  const handleFolderCreated = (folder: Folder) => {
    setFolders(prev => [folder, ...prev]);
  };

  const handleFolderUpdated = (folder: Folder) => {
    setFolders(prev => prev.map(f => f._id === folder._id ? folder : f));
  };

  const handleFolderDeleted = (folderId: string) => {
    setFolders(prev => prev.filter(f => f._id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  const handleFolderClick = (folderId: string) => {
    const folder = folders.find(f => f._id === folderId);
    if (folder) {
      setViewingFolder(folder);
    }
  };

  const openDeleteConfirm = (e: React.MouseEvent, set: FlashcardSet) => {
    e.stopPropagation(); // Prevent card click navigation
    e.preventDefault();
    setConfirmModal({ isOpen: true, set });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmModal.set) return;
    
    const setToDelete = confirmModal.set;
    setDeletingId(setToDelete._id);
    setConfirmModal({ isOpen: false, set: null });
    
    try {
      await flashcardService.delete(setToDelete._id);
      setFlashcardSets(prev => prev.filter(set => set._id !== setToDelete._id));
      
      // Toast with undo option
      toast.success(
        `Đã xóa "${setToDelete.name}"`,
        async () => {
          // Undo action - restore the set
          try {
            // In a real app, you'd call an API to restore
            // For now, we add it back to the list
            setFlashcardSets(prev => [setToDelete, ...prev]);
            toast.success('Đã hoàn tác xóa bộ thẻ');
          } catch (err) {
            toast.error('Không thể hoàn tác');
          }
        }
      );
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Không thể xóa bộ thẻ. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, set: null });
  };

  const handleCardClick = (setId: string) => {
    navigate(`/study/${setId}`);
  };

  const handleEditClick = (e: React.MouseEvent, setId: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/create/${setId}`);
  };

  // Apply filter, search and sort logic
  const filteredSets = React.useMemo(() => {
    let result = [...flashcardSets];
    
    // Filter by selected folder
    if (selectedFolderId) {
      result = result.filter(set => set.folderId === selectedFolderId);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(set => 
        set.name.toLowerCase().includes(query) ||
        set.description?.toLowerCase().includes(query) ||
        set.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sort
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
      case 'mostCards':
        result = result.sort((a, b) => b.cards.length - a.cards.length);
        break;
      case 'all':
      default:
        result = result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }
    
    return result;
  }, [flashcardSets, activeFilter, searchQuery, selectedFolderId]);

  const filterButtons = [
    { key: 'all' as FilterType, label: 'Tất cả' },
    { key: 'recent' as FilterType, label: 'Gần đây' },
    { key: 'alphabetical' as FilterType, label: 'Theo tên (A-Z)' },
    { key: 'mostCards' as FilterType, label: 'Nhiều thẻ nhất' },
  ];

  // Determine empty state type
  const isSearching = searchQuery.trim().length > 0;
  const hasNoDecks = flashcardSets.length === 0;
  const hasNoSearchResults = !hasNoDecks && filteredSets.length === 0 && isSearching;

  return (
    <MainLayout>
      {/* Confirm Delete Modal - Enhanced with deck info */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xóa bộ thẻ"
        message={confirmModal.set 
          ? `Bạn có chắc muốn xóa "${confirmModal.set.name}" (${confirmModal.set.cards.length} thẻ)? Hành động này không thể hoàn tác.`
          : 'Bạn có chắc muốn xóa bộ thẻ này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />

      {/* Move To Folder Modal */}
      {moveModal.setId && (
        <MoveToFolderModal
          isOpen={moveModal.isOpen}
          onClose={() => setMoveModal({ ...moveModal, isOpen: false })}
          folders={folders}
          setId={moveModal.setId}
          currentFolderId={moveModal.currentFolderId}
          onMoveSuccess={handleMoveSuccess}
        />
      )}

      {/* Header & Toolbar Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3 leading-tight">
            <HiBookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            Thư viện của bạn
          </h1>
          
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('sets')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'sets'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Bộ thẻ
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'folders'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Thư mục
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex gap-2">
          {activeTab === 'sets' && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all cursor-pointer"
            >
              <HiArrowUpTray className="w-5 h-5" />
              <span className="hidden sm:inline">Import</span>
            </button>
          )}
          {activeTab === 'sets' ? (
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-lg font-medium hover:-translate-y-0.5 transition-all"
            >
              <HiPlus className="w-5 h-5" />
              <span>Tạo bộ thẻ mới</span>
            </Link>
          ) : (
            <button
              onClick={() => navigate('/create-folder')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-lg font-medium hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <HiFolder className="w-5 h-5" />
              <span>Tạo thư mục mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'folders' ? (
        <FolderSection
          folders={folders}
          onFolderCreated={handleFolderCreated}
          onFolderUpdated={handleFolderUpdated}
          onFolderDeleted={handleFolderDeleted}
          onFolderClick={handleFolderClick}
          selectedFolderId={selectedFolderId}
          hideHeader={true}

        />
      ) : (
        <>
          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Folder Filter Dropdown (Optional improvement for later) */}
            
            {/* Filter Chips */}
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setActiveFilter(btn.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeFilter === btn.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
            
            {/* Search (if needed to add) */}
          </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-blue-500/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Loading State - Skeleton Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-5 animate-pulse"
            >
              <div className="h-5 bg-slate-200 dark:bg-white/10 rounded mb-3 w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded mb-2 w-full"></div>
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                <div className="flex-1 h-10 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : hasNoDecks ? (
        /* Empty State - No Decks */
        <div className="text-center py-16">
          <div className="bg-slate-100 dark:bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiSquares2X2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
            Chưa có bộ thẻ nào
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm max-w-md mx-auto">
            Tạo bộ thẻ đầu tiên của bạn để bắt đầu hành trình học tập hiệu quả
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all text-sm"
            >
              <HiPlus className="w-[18px] h-[18px]" />
              <span>Tạo bộ thẻ mới</span>
            </Link>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-sm cursor-pointer"
            >
              <HiArrowUpTray className="w-[18px] h-[18px]" />
              <span>Import từ file</span>
            </button>
          </div>
        </div>
      ) : hasNoSearchResults ? (
        /* Empty State - No Search Results */
        <div className="text-center py-16">
          <div className="bg-slate-100 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiMagnifyingGlass className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
            Không tìm thấy kết quả
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Không có bộ thẻ nào khớp với "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline"
          >
            Xóa tìm kiếm
          </button>
        </div>
      ) : (
        /* Deck Grid - Clickable cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleCardClick(set._id)}
              className="h-full pt-2 cursor-pointer"
            >
              {/* Main Card */}
              <div 
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative z-0"
              >
                {/* Color Top Bar */}
                <div 
                  className="h-1.5 w-full"
                  style={{ backgroundColor: set.color || '#2563eb' }}
                />
                
                
                {/* Background Watermark Icon - Enhanced Visibility */}
                <div 
                  className="absolute -right-6 -top-6 opacity-[0.15] transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 pointer-events-none z-0"
                  style={{ color: set.color || '#2563eb' }}
                >
                   <HiRectangleStack className="w-32 h-32" />
                </div>

                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex-1">
                    {/* Title */}
                    <h3 
                      className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight transition-colors line-clamp-2 group-hover:opacity-90"
                      style={{ color: set.color || '#2563eb' }}
                    >
                      {set.name}
                    </h3>
                    
                    {/* Description */}
                    {set.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed h-[2.5em]">
                        {set.description}
                      </p>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex items-center flex-wrap gap-2 text-xs font-semibold mb-4">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-md">
                        <HiRectangleStack className="w-3.5 h-3.5" style={{ color: set.color || '#2563eb' }} />
                        {set.cards.length} thẻ
                      </span>
                      <span 
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-md"
                        title={set.lastStudied ? "Lần học cuối" : "Ngày tạo"}
                      >
                        <HiClock className="w-3.5 h-3.5" style={{ color: set.color || '#2563eb' }} />
                        {new Date(set.lastStudied || set.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {/* Tags */}
                    {set.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {set.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] rounded-md font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-500/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Floating Style */}
                  <div className="flex gap-2 pt-4 mt-auto">
                    <Link
                      to={`/study/${set._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2.5 text-white text-center rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:saturate-150 hover:-translate-y-0.5 active:translate-y-0 transition-all z-20"
                      style={{ backgroundColor: set.color || '#2563eb' }}
                    >
                      <HiAcademicCap className="w-4 h-4" />
                      Học ngay
                    </Link>
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                      <button
                        onClick={(e) => handleShareClick(e, set)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:text-green-600 dark:hover:text-green-400 rounded-md transition-all shadow-sm hover:shadow cursor-pointer"
                        title="Chia sẻ"
                      >
                        <HiShare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleMoveToFolder(e, set)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-all shadow-sm hover:shadow cursor-pointer"
                        title="Di chuyển vào thư mục"
                      >
                        <HiFolder className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleEditClick(e, set._id)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-all shadow-sm hover:shadow cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <HiPencilSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => openDeleteConfirm(e, set)}
                        disabled={deletingId === set._id}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
                        title="Xóa"
                      >
                        {deletingId === set._id ? (
                          <HiArrowPath className="w-4 h-4 animate-spin" />
                        ) : (
                          <HiTrash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )}
  
  {/* Confirm Delete Modal */}
  <ConfirmModal
    isOpen={confirmModal.isOpen}
    title="Xóa bộ thẻ"
    message={confirmModal.set 
      ? `Bạn có chắc muốn xóa bộ thẻ "${confirmModal.set.name}"? Hành động này không thể hoàn tác.`
      : 'Bạn có chắc muốn xóa bộ thẻ này?'
    }
    confirmText="Xóa bộ thẻ"
    cancelText="Hủy"
    onConfirm={handleDeleteConfirm}
    onCancel={handleDeleteCancel}
    variant="danger"
  />

  {/* Move to Folder Modal */}
  <MoveToFolderModal 
    isOpen={moveModal.isOpen}
    onClose={() => setMoveModal({ isOpen: false, setId: null })}
    folders={folders}
    setId={moveModal.setId || ''}
    currentFolderId={moveModal.currentFolderId}
    onMoveSuccess={handleMoveSuccess}
  />
  
  <FolderContentModal 
    isOpen={!!viewingFolder}
    onClose={() => setViewingFolder(null)}
    folder={viewingFolder}
  />

  {/* Share Modal */}
  {sharingSet && (
    <ShareModal 
      isOpen={!!sharingSet}
      onClose={() => setSharingSet(null)}
      flashcardSet={sharingSet}
    />
  )}

  {/* Import Modal */}
  <ImportModal
    isOpen={isImportModalOpen}
    onClose={() => setIsImportModalOpen(false)}
    onSuccess={() => loadData()}
  />
</MainLayout>
  );
};

export default Home;
