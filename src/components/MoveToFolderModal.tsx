import React, { useState } from 'react';
import { HiFolder, HiXMark } from 'react-icons/hi2';
import { Folder } from '../services/folderService';
import { useToastContext } from '../contexts/ToastContext';
import { folderService } from '../services/folderService';

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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
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
          {/* Option to remove from folder */}
          <button
            onClick={() => handleMove('none')}
            disabled={isSubmitting}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
              !currentFolderId 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
              🚫
            </div>
            <div>
              <div className="font-medium">Không có thư mục</div>
              <div className="text-xs opacity-70">Để ở ngoài</div>
            </div>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

          {/* Folder list */}
          <div className="space-y-1">
            {folders.map(folder => (
              <button
                key={folder._id}
                onClick={() => handleMove(folder._id)}
                disabled={isSubmitting}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left cursor-pointer ${
                  currentFolderId === folder._id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                  folder.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  folder.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                  folder.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  // Default
                  'bg-slate-100 text-slate-600'
                }`}>
                  {folder.icon || '📁'}
                </div>
                <div>
                  <div className="font-medium truncate">{folder.name}</div>
                  <div className="text-xs opacity-70">{folder.setCount || 0} bộ thẻ</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
