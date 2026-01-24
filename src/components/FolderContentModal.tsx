import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiXMark, HiAcademicCap, HiRectangleStack, HiFolder, HiTrash } from 'react-icons/hi2';
import { Folder, folderService } from '../services/folderService';
import { FlashcardSet } from '../services/flashcardService';
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

  useEffect(() => {
    if (isOpen && folder) {
      loadFolderSets();
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

  const handleRemoveFromFolder = async (e: React.MouseEvent, setId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      setRemovingId(setId);
      await folderService.removeSetFromFolder(setId);
      toast.success('Đã xóa khỏi thư mục');
      loadFolderSets(); // Reload to update the list
    } catch (err) {
      console.error('Error removing from folder:', err);
      toast.error('Không thể xóa khỏi thư mục');
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen || !folder) return null;

  const folderColor = FOLDER_COLORS.find(c => c.id === folder.color) || FOLDER_COLORS[0];
  const IconComp = ICON_MAP[folder.icon || 'folder'] || HiFolder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      {/* Main Modal */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className={`relative px-6 py-6 ${folderColor.class}`}>
            {/* Dots Pattern Background */}
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px'
            }}></div>
            
            {/* Decorative Folder Icon */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
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
              {/* Icon Container */}
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                   <IconComp className={`w-8 h-8 ${folderColor.class.replace('bg-', 'text-')}`} />
                </div>
                {/* Badge Count */}
                <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                  {sets.length}
                </div>
              </div>
              
              <div className="flex-1">
                {/* Small Label */}
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Thư mục</span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">{folder.name}</h2>
                {folder.description && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-1 max-w-md">
                    {folder.description}
                  </p>
                )}
              </div>
            </div>
        </div>

        {/* Body - Cards Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-16">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
               <p className="text-gray-500">Đang tải...</p>
             </div>
           ) : error ? (
             <div className="flex flex-col items-center justify-center py-16">
               <div className="text-red-500 mb-4">
                 <HiXMark className="w-12 h-12" />
               </div>
               <p className="text-red-600 font-medium mb-2">Lỗi</p>
               <p className="text-gray-600 mb-4">{error}</p>
               <button
                 onClick={loadFolderSets}
                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
               >
                 Thử lại
               </button>
             </div>
           ) : sets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <HiRectangleStack className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-slate-900 dark:text-white font-bold mb-1">Thư mục trống</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Chưa có bộ thẻ nào trong thư mục này.</p>
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
                      <div 
                        className="h-1.5 w-full"
                        style={{ backgroundColor: set.color || '#2563eb' }}
                      />

                      {/* Remove from Folder Button - Shows on Hover */}
                      <button
                        onClick={(e) => handleRemoveFromFolder(e, set._id)}
                        disabled={removingId === set._id}
                        className="absolute top-2 right-2 z-20 p-2 bg-slate-100 dark:bg-slate-600 text-red-500 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-md disabled:opacity-50 cursor-pointer"
                        title="Xóa khỏi thư mục"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                      
                      
                      {/* Watermark Decoration */}
                      <div 
                        className="absolute -right-4 -top-4 opacity-[0.15] transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 pointer-events-none"
                        style={{ color: set.color || '#2563eb' }}
                      >
                         <HiRectangleStack className="w-24 h-24" />
                      </div>

                      <div className="p-4 flex flex-col h-full relative z-10">
                         <h3 
                           className="text-lg font-bold mb-1.5 transition-colors line-clamp-1 leading-tight group-hover:opacity-90"
                           style={{ color: set.color || '#2563eb' }}
                         >
                           {set.name}
                         </h3>
                         
                         <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 h-[2.5em] leading-relaxed">
                           {set.description || 'Không có mô tả'}
                         </p>
                         
                         <div className="mt-auto space-y-3">
                            {/* Metadata Tags */}
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                <HiRectangleStack className="w-3.5 h-3.5" style={{ color: set.color || '#2563eb' }} /> {set.cardCount ?? 0}
                              </span>
                              <span 
                                className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md"
                                title={set.lastStudied ? "Lần học cuối" : "Ngày tạo"}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${set.lastStudied ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                {new Date(set.lastStudied || set.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>

                            <button 
                              className="w-full py-2 text-white text-sm font-bold rounded-lg hover:saturate-150 transition-all flex items-center justify-center gap-2"
                              style={{ backgroundColor: set.color || '#2563eb' }}
                            >
                               <HiAcademicCap className="w-4 h-4" /> Học ngay
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default FolderContentModal;
