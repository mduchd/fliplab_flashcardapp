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
const ICON_MAP: Record<string, React.ElementType> = {
  'folder': HiFolder,
  'academic': HiAcademicCap,
  'work': HiBriefcase,
  'science': HiBeaker,
  'math': HiCalculator,
  'code': HiCodeBracket,
  'music': HiMusicalNote,
  'art': HiPaintBrush,
  'globe': HiGlobeAmericas,
  'health': HiHeart,
  'star': HiStar,
  'idea': HiLightBulb,
  'rocket': HiRocketLaunch,
  'game': HiPuzzlePiece,
  'gift': HiGift,
  'money': HiCurrencyDollar,
  'trophy': HiTrophy,
  'group': HiUserGroup,
  'tag': HiHashtag,
  'bookmark': HiBookmark,
  'camera': HiCamera,
  'chat': HiChatBubbleLeftRight,
  'cloud': HiCloud,
  'terminal': HiCommandLine,
  // Additional Map
  'sun': HiSun,
  'moon': HiMoon,
  'fire': HiFire,
  'cake': HiCake,
  'cart': HiShoppingCart,
  'phone': HiDevicePhoneMobile,
  'computer': HiComputerDesktop,
  'server': HiServer,
  'wifi': HiWifi,
  'archive': HiArchiveBox,
  'clipboard': HiClipboardDocument,
  'calendar': HiCalendarDays,
  'clock': HiClock,
  'map': HiMap,
  'link': HiLink,
  'bell': HiBell,
  'settings': HiCog6Tooth,
  'lock': HiLockClosed,
  'key': HiKey,
  'shield': HiShieldCheck,
  'user': HiUser,
  'home': HiHome,
  'bank': HiBanknotes,
  'library': HiBuildingLibrary,
  'office': HiBuildingOffice,
  'film': HiFilm,
  'fingerprint': HiFingerPrint,
  'like': HiHandThumbUp,
  'mic': HiMicrophone,
  'send': HiPaperAirplane,
  'qr': HiQrCode,
  'ticket': HiTicket,
  'truck': HiTruck,
  'wallet': HiWallet,
  'wrench': HiWrench
};

const ICON_KEYS = Object.keys(ICON_MAP);

// Folder color options
const FOLDER_COLORS = [
  { id: 'blue', class: 'bg-blue-500', ring: 'ring-blue-200' },
  { id: 'indigo', class: 'bg-indigo-500', ring: 'ring-indigo-200' },
  { id: 'purple', class: 'bg-purple-500', ring: 'ring-purple-200' },
  { id: 'pink', class: 'bg-pink-500', ring: 'ring-pink-200' },
  { id: 'red', class: 'bg-red-500', ring: 'ring-red-200' },
  { id: 'orange', class: 'bg-orange-500', ring: 'ring-orange-200' },
  { id: 'amber', class: 'bg-amber-500', ring: 'ring-amber-200' },
  { id: 'emerald', class: 'bg-emerald-500', ring: 'ring-emerald-200' },
  { id: 'teal', class: 'bg-teal-500', ring: 'ring-teal-200' },
  { id: 'cyan', class: 'bg-cyan-500', ring: 'ring-cyan-200' },
];

// Folder icons
// Helper to render icon (supports both new keys and legacy emojis)
const renderFolderIcon = (icon: string, className: string = "w-6 h-6") => {
  if (ICON_MAP[icon]) {
    const IconComponent = ICON_MAP[icon];
    return <IconComponent className={className} />;
  }
  // Fallback for legacy emojis
  return <span className={className === "w-6 h-6" ? "text-xl" : "text-lg"}>{icon}</span>;
};


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

  const getColorClass = (colorId: string) => {
    return FOLDER_COLORS.find(c => c.id === colorId)?.class || 'bg-blue-500';
  };

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
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center border border-dashed border-slate-200 dark:border-slate-700">
            <HiFolderOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chưa có thư mục nào. Tạo thư mục để phân loại bộ thẻ của bạn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <div
                key={folder._id}
                onClick={() => onFolderClick(folder._id)}
                className={`group relative bg-white dark:bg-slate-800 rounded-lg p-3 border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedFolderId === folder._id
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Folder Icon */}
                <div className={`w-10 h-10 rounded-lg ${getColorClass(folder.color || 'blue')} flex-shrink-0 flex items-center justify-center text-xl shadow-sm`}>
                  {renderFolderIcon(folder.icon || 'folder')}
                </div>
                
                {/* Folder Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate ${selectedFolderId === folder._id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                    {folder.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {folder.setCount || 0} bộ thẻ
                  </p>
                </div>

                {/* Selected indicator */}
                {selectedFolderId === folder._id && (
                  <div className="absolute top-2 right-2">
                    <HiCheck className="w-4 h-4 text-blue-500" />
                  </div>
                )}

                {/* Action buttons - show on hover */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-sm rounded-lg p-0.5 border border-slate-100 dark:border-slate-700">
                  <button
                    onClick={(e) => openEditModal(e, folder)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <HiPencilSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, folder)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
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
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-blue-500 scale-110'
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
