import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiFolderOpen, 
  HiFolderPlus, 
  HiPencilSquare, 
  HiTrash,
  HiXMark,
  HiCheck,
  // New Folder Icons
  HiFolder, HiAcademicCap, HiBriefcase, HiBeaker, HiCalculator,
  HiCodeBracket, HiMusicalNote, HiPaintBrush, HiGlobeAmericas,
  HiHeart, HiStar, HiLightBulb, HiRocketLaunch, HiPuzzlePiece, HiGift,
  HiCurrencyDollar, HiTrophy, HiUserGroup, HiHashtag, HiBookmark,
  HiCamera, HiChatBubbleLeftRight, HiCloud, HiCommandLine,
  // Additional Icons
  HiSun, HiMoon, HiFire, HiCake, HiShoppingCart,
  HiDevicePhoneMobile, HiComputerDesktop, HiServer, HiWifi, HiArchiveBox,
  HiClipboardDocument, HiCalendarDays, HiClock, HiMap, HiLink,
  HiBell, HiCog6Tooth, HiLockClosed, HiKey, HiShieldCheck,
  HiUser, HiHome, HiBanknotes, HiBuildingLibrary, HiBuildingOffice,
  HiFilm, HiFingerPrint, HiHandThumbUp, HiMicrophone, HiPaperAirplane,
  HiQrCode, HiTicket, HiTruck, HiWallet, HiWrench
} from 'react-icons/hi2';
import { Folder, folderService } from '../services/folderService';
import { useToastContext } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';

// Icon Map
export const ICON_MAP: Record<string, React.ElementType> = {
  'folder': HiFolder,
  'academic-cap': HiAcademicCap,
  'briefcase': HiBriefcase,
  'beaker': HiBeaker,
  'calculator': HiCalculator,
  'code-bracket': HiCodeBracket,
  'musical-note': HiMusicalNote,
  'paint-brush': HiPaintBrush,
  'globe-americas': HiGlobeAmericas,
  'heart': HiHeart,
  'star': HiStar,
  'light-bulb': HiLightBulb,
  'rocket-launch': HiRocketLaunch,
  'puzzle-piece': HiPuzzlePiece,
  'gift': HiGift,
  'currency-dollar': HiCurrencyDollar,
  'trophy': HiTrophy,
  'user-group': HiUserGroup,
  'hashtag': HiHashtag,
  'bookmark': HiBookmark,
  'camera': HiCamera,
  'chat-bubble-left-right': HiChatBubbleLeftRight,
  'cloud': HiCloud,
  'command-line': HiCommandLine,
  'sun': HiSun,
  'moon': HiMoon,
  'fire': HiFire,
  'cake': HiCake,
  'shopping-cart': HiShoppingCart,
  'device-phone-mobile': HiDevicePhoneMobile,
  'computer-desktop': HiComputerDesktop,
  'server': HiServer,
  'wifi': HiWifi,
  'archive-box': HiArchiveBox,
  'clipboard-document': HiClipboardDocument,
  'calendar-days': HiCalendarDays,
  'clock': HiClock,
  'map': HiMap,
  'link': HiLink,
  'bell': HiBell,
  'cog-6-tooth': HiCog6Tooth,
  'lock-closed': HiLockClosed,
  'key': HiKey,
  'shield-check': HiShieldCheck,
  'user': HiUser,
  'home': HiHome,
  'banknotes': HiBanknotes,
  'building-library': HiBuildingLibrary,
  'building-office': HiBuildingOffice,
  'film': HiFilm,
  'finger-print': HiFingerPrint,
  'hand-thumb-up': HiHandThumbUp,
  'microphone': HiMicrophone,
  'paper-airplane': HiPaperAirplane,
  'qr-code': HiQrCode,
  'ticket': HiTicket,
  'truck': HiTruck,
  'wallet': HiWallet,
  'wrench': HiWrench
};

export const ICON_KEYS = Object.keys(ICON_MAP);

// Folder color options
// Folder color options
export const FOLDER_COLORS = [
  { id: 'blue', class: 'bg-blue-500', ring: 'ring-blue-200' },
  { id: 'slate', class: 'bg-slate-500', ring: 'ring-slate-200' },
  { id: 'gray', class: 'bg-gray-500', ring: 'ring-gray-200' },
  { id: 'zinc', class: 'bg-zinc-500', ring: 'ring-zinc-200' },
  { id: 'neutral', class: 'bg-neutral-500', ring: 'ring-neutral-200' },
  { id: 'stone', class: 'bg-stone-500', ring: 'ring-stone-200' },
  { id: 'red', class: 'bg-red-500', ring: 'ring-red-200' },
  { id: 'orange', class: 'bg-orange-500', ring: 'ring-orange-200' },
  { id: 'amber', class: 'bg-amber-500', ring: 'ring-amber-200' },
  { id: 'yellow', class: 'bg-yellow-500', ring: 'ring-yellow-200' },
  { id: 'lime', class: 'bg-lime-500', ring: 'ring-lime-200' },
  { id: 'green', class: 'bg-green-500', ring: 'ring-green-200' },
  { id: 'emerald', class: 'bg-emerald-500', ring: 'ring-emerald-200' },
  { id: 'teal', class: 'bg-teal-500', ring: 'ring-teal-200' },
  { id: 'cyan', class: 'bg-cyan-500', ring: 'ring-cyan-200' },
  { id: 'sky', class: 'bg-sky-500', ring: 'ring-sky-200' },
  { id: 'indigo', class: 'bg-indigo-500', ring: 'ring-indigo-200' },
  { id: 'violet', class: 'bg-violet-500', ring: 'ring-violet-200' },
  { id: 'purple', class: 'bg-purple-500', ring: 'ring-purple-200' },
  { id: 'fuchsia', class: 'bg-fuchsia-500', ring: 'ring-fuchsia-200' },
  { id: 'pink', class: 'bg-pink-500', ring: 'ring-pink-200' },
  { id: 'rose', class: 'bg-rose-500', ring: 'ring-rose-200' },
];

// Folder icons


interface FolderSectionProps {
  folders: Folder[];
  onFolderCreated: (folder: Folder) => void;
  onFolderUpdated: (folder: Folder) => void;
  onFolderDeleted: (folderId: string) => void;
  onFolderClick: (folderId: string) => void;
  selectedFolderId?: string | null;
  // New props for external control
  hideHeader?: boolean;
}

const FolderSection: React.FC<FolderSectionProps> = ({
  folders,
  onFolderCreated,
  onFolderUpdated,
  onFolderDeleted,
  onFolderClick,
  selectedFolderId,
  hideHeader = false,
}) => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    folder: Folder | null;
  }>({ isOpen: false, folder: null });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('blue');
  const [formIcon, setFormIcon] = useState('folder');



  const openEditModal = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setFormName(folder.name);
    setFormDescription(folder.description || '');
    setFormColor(folder.color || 'blue');
    setFormIcon(folder.icon || 'folder');
    setIsModalOpen(true); 
  };
  
  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }

    if (!editingFolder) return;

    setIsSubmitting(true);
    try {
      const response = await folderService.updateFolder(editingFolder._id, {
        name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        icon: formIcon,
      });
      onFolderUpdated(response.data.folder);
      toast.success('Đã cập nhật thư mục');
      
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi lưu thư mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    const folderToDelete = deleteModal.folder;
    if (!folderToDelete) return;
    
    const folderId = folderToDelete._id;
    setDeleteModal({ isOpen: false, folder: null }); // Close immediately for better UX
    
    try {
      await folderService.deleteFolder(folderId);
      onFolderDeleted(folderId);
      
      toast.success('Đã xóa thư mục', async () => {
        try {
          // Undo: Re-create the folder
          const response = await folderService.createFolder({
            name: folderToDelete.name,
            description: folderToDelete.description || '',
            color: folderToDelete.color || 'blue',
            icon: folderToDelete.icon || 'folder'
          });
          
          if (response.data && response.data.folder) {
            onFolderCreated(response.data.folder);
            toast.success('Đã khôi phục thư mục');
          }
        } catch (err) {
          console.error(err);
          toast.error('Không thể hoàn tác');
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa thư mục');
    }
  };

  const handleDelete = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, folder });
  };

  return (
    <>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Xóa thư mục"
        message={deleteModal.folder 
          ? `Bạn có chắc muốn xóa thư mục "${deleteModal.folder.name}"? Các bộ thẻ bên trong sẽ KHÔNG bị xóa mà sẽ được chuyển ra ngoài.`
          : 'Bạn có chắc muốn xóa thư mục này?'
        }
        confirmText="Xóa thư mục"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, folder: null })}
        variant="danger"
      />

      {/* Folder Grid */}
      <div className="mb-0">
        {!hideHeader && (
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HiFolderOpen className="w-5 h-5 text-blue-500" />
              Thư mục
            </h2>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
            <button
              onClick={() => navigate('/create-folder')}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <HiFolderPlus className="w-4 h-4" />
              Tạo mới
            </button>
          </div>
        )}

        {folders.length === 0 ? (
          <div 
            onClick={() => navigate('/create-folder')}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[200px]"
          >
            <div className="bg-white dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm ring-4 ring-slate-50 dark:ring-slate-800">
              <HiFolderPlus className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Chưa có thư mục nào
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
              Tạo thư mục để phân loại và quản lý các bộ thẻ của bạn một cách khoa học.
            </p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg group-hover:bg-blue-700 transition-colors shadow-sm">
              <HiFolderPlus className="w-5 h-5" />
              Tạo thư mục ngay
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => {
              const folderColor = FOLDER_COLORS.find(c => c.id === folder.color) || FOLDER_COLORS[0];
              const IconComp = ICON_MAP[folder.icon || 'folder'] || HiFolder;

              return (
              <div
                key={folder._id}
                onClick={() => onFolderClick(folder._id)}
                className="group relative perspective-1000 cursor-pointer"
              >
                <div className={`relative w-full aspect-[4/3] transition-transform duration-300 ${selectedFolderId === folder._id ? 'scale-95' : 'group-hover:scale-105'}`}>
                   
                   {/* 1. Back Folder Layer (Darker Tab) */}
                   <div className={`absolute left-0 top-0 w-[40%] h-8 rounded-t-xl transition-colors duration-300 ${folderColor.class.replace('bg-', 'bg-')} brightness-75 -translate-y-1.5 translate-x-1`}></div>
                   <div className={`absolute inset-0 rounded-xl transition-colors duration-300 ${folderColor.class} brightness-75`}></div>

                   {/* 2. Papers (Simulating Content) */}
                   <div className="absolute inset-x-4 top-2 bottom-0 bg-white opacity-40 rounded-t-md -rotate-1 origin-bottom transition-all duration-500 group-hover:-translate-y-1 group-hover:-rotate-2"></div>
                   <div className="absolute inset-x-4 top-2 bottom-0 bg-white opacity-60 rounded-t-md rotate-0.5 origin-bottom transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1"></div>

                   {/* 3. Main Folder Body (Front) */}
                   <div className={`absolute inset-0 top-3 rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300 overflow-hidden border-t border-white/20 flex flex-col items-center justify-center text-center p-4 ${folderColor.class} ${selectedFolderId === folder._id ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''}`}>
                      
                      {/* Icon Circle */}
                      <div className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 shadow-[0_4px_8px_rgba(0,0,0,0.1)] border border-white/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                         <IconComp className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                      </div>
                      
                      {/* Folder Name */}
                      <div className="relative z-10 w-full px-1">
                         <h3 className="text-sm font-bold text-white drop-shadow-md truncate w-full tracking-tight">
                           {folder.name}
                         </h3>
                         <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-black/10 rounded-full backdrop-blur-sm border border-white/10">
                            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                            <p className="text-white/90 text-[9px] font-bold uppercase tracking-wider">
                              {folder.setCount || 0} bộ
                            </p>
                         </div>
                      </div>
                      
                      {/* Selected indicator */}
                      {selectedFolderId === folder._id && (
                        <div className="absolute top-2 right-2 z-20 bg-white text-blue-500 rounded-full p-0.5 shadow-sm">
                          <HiCheck className="w-4 h-4" />
                        </div>
                      )}

                      {/* Action buttons - show on hover */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                        <button
                          onClick={(e) => openEditModal(e, folder)}
                          className="p-1.5 bg-white/90 hover:bg-white text-slate-500 hover:text-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <HiPencilSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, folder)}
                          className="p-1.5 bg-white/90 hover:bg-white text-slate-500 hover:text-red-500 rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>

                   </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Create/Edit Folder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Chỉnh sửa thư mục
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên thư mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nhập tên thư mục..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả ngắn về thư mục..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Biểu tượng
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                  {ICON_KEYS.map((key) => {
                    const IconComp = ICON_MAP[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormIcon(key)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          formIcon === key
                            ? 'bg-blue-100 dark:bg-blue-500/20 ring-2 ring-blue-500 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400'
                        }`}
                        title={key}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Màu sắc
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setFormColor(color.id)}
                      className={`w-8 h-8 rounded-full ${color.class} transition-all cursor-pointer ${
                        formColor === color.id
                          ? 'ring-4 ring-blue-500 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-110'
                          : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderSection;
