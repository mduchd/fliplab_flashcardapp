import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiXMark, HiAcademicCap, HiRectangleStack } from 'react-icons/hi2';
import { Folder } from '../services/folderService';
import { FlashcardSet } from '../services/flashcardService';
import { FOLDER_COLORS, ICON_MAP } from './FolderSection';
import { HiFolder } from 'react-icons/hi2';

interface FolderContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
  sets: FlashcardSet[];
}

const FolderContentModal: React.FC<FolderContentModalProps> = ({
  isOpen,
  onClose,
  folder,
  sets,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !folder) return null;

  const folderColor = FOLDER_COLORS.find(c => c.id === folder.color) || FOLDER_COLORS[0];
  const IconComp = ICON_MAP[folder.icon || 'folder'] || HiFolder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header - Styled like the Folder Card */}
        <div className={`relative px-6 py-6 pb-12 flex items-start justify-between ${folderColor.class}`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
            
            {/* Folder Info */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                 <IconComp className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">{folder.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="px-2 py-0.5 bg-black/20 text-white/90 text-xs font-bold rounded-full backdrop-blur-sm border border-white/10">
                     {sets.length} bộ thẻ
                   </span>
                   {folder.description && (
                     <p className="text-white/80 text-sm font-medium line-clamp-1 max-w-md">
                       {folder.description}
                     </p>
                   )}
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="relative z-10 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
            >
              <HiXMark className="w-6 h-6" />
            </button>
        </div>

        {/* Body - List of Sets */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50 -mt-6 rounded-t-3xl relative z-20">
             {sets.length === 0 ? (
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
                        {/* Watermark Decoration */}
                        <div className="absolute -right-4 -top-4 opacity-[0.1] dark:opacity-[0.15] text-slate-400 dark:text-slate-500 transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 pointer-events-none">
                           <HiRectangleStack className="w-24 h-24" />
                        </div>

                        <div className="p-4 flex flex-col h-full relative z-10">
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 leading-tight">
                             {set.name}
                           </h3>
                           
                           <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 h-[2.5em] leading-relaxed">
                             {set.description || 'Không có mô tả'}
                           </p>
                           
                           <div className="mt-auto space-y-3">
                              {/* Metadata Tags */}
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                  <HiRectangleStack className="w-3.5 h-3.5 text-blue-500" /> {set.cards.length}
                                </span>
                                <span 
                                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md"
                                  title={set.lastStudied ? "Lần học cuối" : "Ngày tạo"}
                                >
                                  {/* Use HiClock logic matching Home page */}
                                  {/* Actually we need to import HiClock first. I will add it to imports later if missing. Assuming it's available or use a generic one. Wait, I removed HiClock in previous turn. I need to re-add it. Use a placeholder icon or re-add import in separate step if needed. I'll stick to simple text if icon missing, but better re-add import. */}
                                  <span className={`w-1.5 h-1.5 rounded-full ${set.lastStudied ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                  {new Date(set.lastStudied || set.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>

                              <button className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-sm">
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
