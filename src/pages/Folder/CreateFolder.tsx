import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { folderService } from '../../services/folderService';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HiArrowLeft, HiFolderPlus, HiArrowPath,
  // Folder Icons
  HiFolder, HiAcademicCap, HiBriefcase, HiBeaker, HiCalculator,
  HiCodeBracket, HiMusicalNote, HiPaintBrush, HiGlobeAmericas,
  HiHeart, HiStar, HiLightBulb, HiRocketLaunch, HiPuzzlePiece, HiGift,
  HiCurrencyDollar, HiTrophy, HiUserGroup, HiHashtag, HiBookmark,
  HiCamera, HiChatBubbleLeftRight, HiCloud, HiCommandLine,
  HiSun, HiMoon, HiFire, HiCake, HiShoppingCart,
  HiDevicePhoneMobile, HiComputerDesktop, HiServer, HiWifi, HiArchiveBox,
  HiClipboardDocument, HiCalendarDays, HiClock, HiMap, HiLink,
  HiBell, HiCog6Tooth, HiLockClosed, HiKey, HiShieldCheck,
  HiUser, HiHome, HiBanknotes, HiBuildingLibrary, HiBuildingOffice,
  HiFilm, HiFingerPrint, HiHandThumbUp, HiMicrophone, HiPaperAirplane,
  HiQrCode, HiTicket, HiTruck, HiWallet, HiWrench
} from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';

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

const CreateFolder: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('folder');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      toast.warning('Vui lòng nhập tên thư mục');
      return;
    }

    if (name.length > 50) {
      toast.warning('Tên thư mục không được quá 50 ký tự');
      return;
    }

    if (description.length > 200) {
      toast.warning('Mô tả không được quá 200 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      await folderService.createFolder({
        name: name.trim(),
        description: description.trim(),
        color,
        icon
      });
      
      toast.success('Đã tạo thư mục thành công');
      navigate('/?tab=folders');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo thư mục';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
          >
            <HiArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            <span className="font-medium">Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
             <div className={`p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`}>
               <HiFolderPlus className="w-7 h-7" />
             </div>
             Tạo thư mục mới
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 shadow-sm">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
               {/* Left Column: Form Inputs (Content) - Span 7 */}
               <div className="lg:col-span-7 space-y-6">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2">
                      Tên thư mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                      placeholder="Ví dụ: Toán học, Tiếng Anh..."
                      maxLength={50}
                      autoFocus
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">{name.length}/50</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2">
                      Mô tả (tùy chọn)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none font-medium leading-relaxed"
                      placeholder="Mô tả ngắn về nội dung của thư mục này..."
                      rows={5}
                      maxLength={200}
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">{description.length}/200</p>
                  </div>

                  {/* Move Color Picker Here for better logic flow */}
                  <div className="pt-2">
                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-3">
                      Chọn màu chủ đạo
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {FOLDER_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setColor(c.id)}
                          className={`w-10 h-10 rounded-full ${c.class} transition-all cursor-pointer relative flex items-center justify-center ${
                              color === c.id
                              ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-blue-500/30 scale-110 shadow-lg'
                              : 'hover:scale-110 opacity-80 hover:opacity-100 hover:shadow-md'
                          }`}
                        >
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               {/* Right Column: Visual & Preview - Span 5 */}
               <div className="lg:col-span-5 flex flex-col gap-6">
                  
                  {/* PREVIEW CARD - REDESIGNED */}
                  <div>
                     <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-3 tracking-wider">
                        Xem trước
                     </label>
                     
                     {/* 3D Folder Card Preview */}
                     <div className="relative group perspective-1000 w-full aspect-[4/3] max-h-[220px]">
                        {/* Back Layer of Folder */}
                        <div className={`absolute inset-0 top-2 rounded-2xl opacity-40 transform scale-95 origin-bottom transition-all duration-500 ${FOLDER_COLORS.find(c => c.id === color)?.class || 'bg-blue-500'}`}></div>
                        
                        {/* Main Folder Body */}
                        <div className={`absolute inset-0 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden border border-white/10 flex flex-col items-center justify-center text-center p-6 ${FOLDER_COLORS.find(c => c.id === color)?.class || 'bg-blue-500'}`}>
                           
                           {/* Glass Overlay/Sheen */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none"></div>
                           
                           {/* Icon Circle */}
                           <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/30 transform group-hover:scale-110 transition-transform duration-300">
                              {React.createElement(ICON_MAP[icon] || HiFolder, { className: "w-10 h-10 text-white drop-shadow-md" })}
                           </div>
                           
                           {/* Folder Name */}
                           <div className="relative z-10 w-full px-2">
                              <h3 className="text-xl font-bold text-white drop-shadow-sm truncate w-full">
                                {name || 'Tên thư mục'}
                              </h3>
                              <p className="text-white/80 text-xs font-medium mt-1 uppercase tracking-widest">
                                0 bộ thẻ
                              </p>
                           </div>
                           
                           {/* Decorative Tab Top Left (Simulating Folder Tab) */}
                           <div className="absolute top-0 left-0 w-1/3 h-1 bg-white/30"></div>
                        </div>
                     </div>
                  </div>

                  {/* Icon Picker - Compact List */}
                  <div className="flex-1 flex flex-col min-h-0 pt-2">
                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2">
                      Chọn biểu tượng
                    </label>
                    <div className="flex-1 grid grid-cols-6 sm:grid-cols-5 md:grid-cols-6 gap-2 overflow-y-auto p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 max-h-[200px] min-h-[160px] custom-scrollbar">
                      {ICON_KEYS.map((key) => {
                        const IconComp = ICON_MAP[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setIcon(key)}
                            className={`aspect-square flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                              icon === key
                                ? 'bg-white dark:bg-slate-700 ring-2 ring-blue-500 text-blue-600 dark:text-white shadow-md transform scale-105 z-10'
                                : 'text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 hover:shadow-sm'
                            }`}
                            title={key}
                          >
                            <IconComp className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
               </div>
            </div>
            
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-8 py-3.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <HiArrowPath className="animate-spin w-5 h-5" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <HiFolderPlus className="w-5 h-5" />
                  Tạo thư mục
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateFolder;
