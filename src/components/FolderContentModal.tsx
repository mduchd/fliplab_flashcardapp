import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiXMark, HiAcademicCap, HiRectangleStack, HiFolder, HiTrash, HiPlus, HiArrowLeft } from 'react-icons/hi2';
import { Folder, folderService } from '../services/folderService';
import { FlashcardSet, flashcardService } from '../services/flashcardService';
import { FOLDER_COLORS, ICON_MAP } from './FolderSection';
import { useToastContext } from '../contexts/ToastContext';

interface FolderContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
}

const FolderContentModal: React.FC<FolderContentModalProps> = ({
  isOpen,
  onClose,
  folder,
}) => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Add Mode State
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [availableSets, setAvailableSets] = useState<FlashcardSet[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && folder) {
      loadFolderSets();
      setIsAddingMode(false); // Reset mode on open
    }
  }, [isOpen, folder]);

  const loadFolderSets = async () => {
    if (!folder) return;
    try {
      setIsLoading(true);
      setError('');
      const response = await folderService.getFolder(folder._id);
      setSets(response.data.flashcardSets || []);
    } catch (err) {
      console.error('Error loading folder sets:', err);
      setError('Không thể tải danh sách thẻ');
      setSets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSets = async () => {
    try {
      setIsLoadingAvailable(true);
      const response = await flashcardService.getAll();
      if (response.success) {
        // Filter out sets already in this folder
        const currentSetIds = sets.map(s => s._id);
        const available = response.data.flashcardSets.filter(s => !currentSetIds.includes(s._id));
        setAvailableSets(available);
      }
    } catch (err) {
      console.error('Error loading available sets:', err);
      toast.error('Không thể tải danh sách bộ thẻ');
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const handleRemoveFromFolder = async (e: React.MouseEvent, setId: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setRemovingId(setId);
      await folderService.removeSetFromFolder(setId);
      toast.success('Đã xóa khỏi thư mục');
      loadFolderSets();
    } catch (err) {
      console.error('Error removing from folder:', err);
      toast.error('Không thể xóa khỏi thư mục');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddSetToFolder = async (setId: string) => {
    if (!folder) return;
    try {
      setAddingId(setId);
      await folderService.moveSetToFolder(folder._id, setId);
      toast.success('Đã thêm vào thư mục');
      // Refresh both lists
      await loadFolderSets();
      // Update available locally to avoid flicker
      setAvailableSets(prev => prev.filter(s => s._id !== setId));
    } catch (err) {
      console.error('Error adding to folder:', err);
      toast.error('Không thể thêm vào thư mục');
    } finally {
      setAddingId(null);
    }
  };

  const toggleAddMode = () => {
    if (!isAddingMode) {
      setIsAddingMode(true);
      loadAvailableSets();
    } else {
      setIsAddingMode(false);
    }
  };

  if (!isOpen || !folder) return null;

  const folderColor = FOLDER_COLORS.find(c => c.id === folder.color) || FOLDER_COLORS[0];
  const IconComp = ICON_MAP[folder.icon || 'folder'] || HiFolder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden transition-all">
        
        {/* Header */}
        <div className={`relative px-6 py-6 transition-colors duration-300 ${folderColor.class}`}>
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px'
            }}></div>
            
            {/* Decorative Folder Icon */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
              <HiFolder className="w-24 h-24 text-white" />
            </div>
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 hover:bg-white text-slate-500 hover:text-slate-700 rounded-full transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <HiXMark className="w-5 h-5" />
            </button>
            
            {/* Folder Info */}
            <div className="relative z-10 flex items-center gap-5">
              {/* Back Button for Add Mode */}
              {isAddingMode ? (
                <button 
                   onClick={() => setIsAddingMode(false)}
                   className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center justify-center transition-colors cursor-pointer"
                >
                   <HiArrowLeft className="w-6 h-6" />
                </button>
              ) : (
                <div className="relative">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                     <IconComp className={`w-8 h-8 ${folderColor.class.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                    {sets.length}
                  </div>
                </div>
              )}
              
              <div className="flex-1 pr-16 bg-blend-overlay"> {/* Added padding right to avoid text hitting icon/close button */}
                <div className="flex flex-col items-start">
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    {isAddingMode ? 'Thêm thẻ vào thư mục' : 'Thư mục'}
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5 truncate w-full" title={folder.name}>{folder.name}</h2>
                  
                  {!isAddingMode && sets.length > 0 && (
                     <button
                       onClick={toggleAddMode}
                       className="mt-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-sm self-start shadow-sm"
                     >
                       <HiPlus className="w-4 h-4" />
                       Thêm thẻ
                     </button>
                  )}
                </div>
              </div>
            </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
           {isAddingMode ? (
             // Adding Mode View
             <div className="space-y-4">
                {isLoadingAvailable ? (
                  <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
                ) : availableSets.length === 0 ? (
                   <div className="text-center py-12 text-slate-500">
                     <p>Bạn không còn bộ thẻ nào để thêm.</p>
                     <button onClick={() => navigate('/create')} className="text-blue-500 hover:underline mt-2">Tạo bộ thẻ mới</button>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSets.map(set => (
                      <div key={set._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                           <div className="flex-1">
                             <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{set.name}</h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400">{set.cardCount} thẻ</p>
                           </div>
                           <HiRectangleStack className="w-5 h-5 text-slate-400" />
                        </div>
                        <button
                          onClick={() => handleAddSetToFolder(set._id)}
                          disabled={addingId === set._id}
                          className="mt-auto w-full py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {addingId === set._id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <HiPlus className="w-4 h-4" />}
                          Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           ) : (
             // Content Mode View
             <>
               {isLoading ? (
                 <div className="flex flex-col items-center justify-center py-16">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                 </div>
               ) : error ? (
                 <div className="text-center py-16">
                   <p className="text-red-500">{error}</p>
                   <button onClick={loadFolderSets} className="mt-2 text-blue-500 hover:underline">Thử lại</button>
                 </div>
               ) : sets.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-4 ring-white dark:ring-slate-700 shadow-sm">
                       <HiFolder className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Thư mục trống</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-sm mx-auto">Chưa có bộ thẻ nào trong thư mục này. Bạn có thể thêm các bộ thẻ có sẵn hoặc tạo mới.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
                      <button 
                        onClick={toggleAddMode}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                         <HiPlus className="w-5 h-5" />
                         Thêm bộ thẻ có sẵn
                      </button>
                      <button 
                        onClick={() => navigate(`/create?folderId=${folder._id}`)}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                         <HiAcademicCap className="w-5 h-5" />
                         Tạo bộ thẻ mới
                      </button>
                    </div>
                 </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {sets.map(set => (
                       <div 
                          key={set._id}
                          onClick={() => navigate(`/study/${set._id}`)}
                          className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col h-full"
                        >
                          {/* Color Top Bar */}
                          <div className="h-1.5 w-full" style={{ backgroundColor: set.color || '#2563eb' }} />

                          {/* Remove Button */}
                          <button
                            onClick={(e) => handleRemoveFromFolder(e, set._id)}
                            disabled={removingId === set._id}
                            className="absolute top-2 right-2 z-20 p-2 bg-slate-100 dark:bg-slate-600 text-red-500 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-md disabled:opacity-50 cursor-pointer"
                            title="Xóa khỏi thư mục"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                          
                          <div className="p-4 flex flex-col h-full">
                             <h3 className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{set.name}</h3>
                             <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 h-[2.5em]">{set.description || 'Không có mô tả'}</p>
                             <div className="mt-auto flex items-center gap-2">
                               <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{set.cardCount ?? 0} thẻ</span>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               )}
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default FolderContentModal;
