import React, { useState } from 'react';
import { HiFolder, HiXMark, HiCheck } from 'react-icons/hi2';
import { Folder } from '../services/folderService';
import { useToastContext } from '../contexts/ToastContext';
import { folderService } from '../services/folderService';
import { FOLDER_COLORS, ICON_MAP } from './FolderSection';

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  setId: string;
  currentFolderId?: string | null;
  onMoveSuccess: () => void;
}

const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  isOpen,
  onClose,
  folders,
  setId,
  currentFolderId,
  onMoveSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToastContext();

  if (!isOpen) return null;

  const handleMove = async (folderId: string) => {
    setIsSubmitting(true);
    try {
      if (folderId === 'none') {
        await folderService.removeSetFromFolder(setId);
        toast.success('Đã xóa khỏi thư mục');
      } else {
        await folderService.moveSetToFolder(folderId, setId);
        toast.success('Đã chuyển vào thư mục');
      }
      onMoveSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Không thể di chuyển bộ thẻ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HiFolder className="text-blue-500" />
            Di chuyển đến...
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Option to remove from folder - Styled as a dashed placeholder */}
            <div
              onClick={() => handleMove('none')}
              className={`group relative aspect-[4/3] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                !currentFolderId 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${!currentFolderId ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                 <HiXMark className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${!currentFolderId ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>Không có thư mục</span>
              {/* Selected Indicator */}
              {!currentFolderId && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5">
                  <HiCheck className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Folder list - 3D Cards */}
            {folders.map(folder => {
               const folderColor = FOLDER_COLORS.find(c => c.id === folder.color) || FOLDER_COLORS[0];
               const IconComp = ICON_MAP[folder.icon || 'folder'] || HiFolder;
               const isSelected = currentFolderId === folder._id;

               return (
                <div
                  key={folder._id}
                  onClick={() => handleMove(folder._id)}
                  className="group relative perspective-1000 cursor-pointer"
                >
                  <div className={`relative w-full aspect-[4/3] transition-transform duration-300 ${isSelected ? 'scale-95' : 'group-hover:scale-105'}`}>
                     
                     {/* 1. Back Folder Layer */}
                     <div className={`absolute left-0 top-0 w-[40%] h-6 rounded-t-lg transition-colors duration-300 ${folderColor.class.replace('bg-', 'bg-')} brightness-75 -translate-y-1 translate-x-1`}></div>
                     <div className={`absolute inset-0 rounded-xl transition-colors duration-300 ${folderColor.class} brightness-75`}></div>

                     {/* 2. Papers */}
                     <div className="absolute inset-x-3 top-2 bottom-0 bg-white opacity-40 rounded-t-sm -rotate-1 origin-bottom transition-all duration-500 group-hover:-translate-y-1 group-hover:-rotate-2"></div>

                     {/* 3. Main Body */}
                     <div className={`absolute inset-0 top-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden border-t border-white/20 flex flex-col items-center justify-center text-center p-2 ${folderColor.class} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800' : ''}`}>
                        
                        <div className="relative z-10 w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 shadow-sm border border-white/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                           <IconComp className="w-4 h-4 text-white drop-shadow-md relative z-10" />
                        </div>
                        
                        <div className="relative z-10 w-full px-1">
                           <h3 className="text-xs font-bold text-white drop-shadow-md truncate w-full">
                             {folder.name}
                           </h3>
                           <p className="text-[9px] text-white/80 font-medium mt-0.5">
                             {folder.setCount || 0} bộ
                           </p>
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 z-20 bg-white text-blue-500 rounded-full p-0.5 shadow-sm">
                            <HiCheck className="w-3 h-3" />
                          </div>
                        )}
                     </div>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
