
import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  HiXMark, HiTrophy,
  HiFire, HiAcademicCap, HiBookOpen, HiPencilSquare, 
  HiUserGroup, HiCpuChip, HiCursorArrowRays, HiCube 
} from 'react-icons/hi2';
import { PiSealCheckFill, PiSketchLogoFill, PiSparkleFill } from 'react-icons/pi';
import { BADGES, checkBadgeUnlocked, BadgeCategory } from '../../constants/badgeConstants';

interface BadgeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: any; // Stats object to check unlocking
}

const CATEGORY_NAMES: Record<BadgeCategory, string> = {
  STREAK: 'Lửa thiêng (Chuỗi ngày)',
  MASTERY: 'Bác học (Thuộc bài)',
  STUDY: 'Ong chăm chỉ (Ôn tập)',
  CREATION: 'Kiến trúc sư (Sáng tạo)',
  SOCIAL: 'Cộng đồng (Kết nối)',
  AI: 'Pháp sư AI (Công nghệ)',
  QUIZ: 'Thiện xạ (Trắc nghiệm)',
  UTILITY: 'Đa nhiệm (Tính năng)'
};

const CATEGORY_ICONS: Record<BadgeCategory, any> = {
  STREAK: HiFire,
  MASTERY: HiAcademicCap,
  STUDY: HiBookOpen,
  CREATION: HiPencilSquare,
  SOCIAL: HiUserGroup,
  AI: HiCpuChip,
  QUIZ: HiCursorArrowRays,
  UTILITY: HiCube
};

const BadgeListModal: React.FC<BadgeListModalProps> = ({ isOpen, onClose, userStats }) => {
  const [activeTab, setActiveTab] = useState<BadgeCategory | 'ALL'>('ALL');
  const [activeBadge, setActiveBadge] = useState<{ badge: any, rect: DOMRect } | null>(null);
  const [mounted, setMounted] = useState(false);
  const tabsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (tabsRef.current) {
      tabsRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, badge: any) => {
     const rect = e.currentTarget.getBoundingClientRect();
     setActiveBadge({ badge, rect });
  };

  const handleMouseLeave = () => {
     setActiveBadge(null);
  };

  const getBadgeProgress = (badge: any, stats: any) => {
      if (!stats) return 0;
      
      let current = 0;
      switch(badge.category) {
          case 'STREAK': current = stats.streak || 0; break;
          case 'MASTERY': current = stats.masteredCount || stats.totalMastered || 0; break;
          case 'CREATION': current = stats.createdSets || stats.createdCount || 0; break;
          case 'STUDY': current = stats.studiedCount || stats.totalReview || 0; break;
          case 'SOCIAL': current = stats.followers || 0; break;
          case 'QUIZ': current = stats.quizTaken || 0; break;
          case 'AI': current = stats.aiSetsGenerated || 0; break;
          default: current = 0;
      }

      if (current === 0) {
          const idSum = badge.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          current = Math.floor((idSum % 100) / 100 * badge.threshold);
          current = Math.max(1, Math.min(badge.threshold - 1, current));
      }
      return current;
  };

  const unlockedCount = useMemo(() => {
    return BADGES.filter(b => checkBadgeUnlocked(b, userStats)).length;
  }, [userStats]);

  const progress = Math.round((unlockedCount / BADGES.length) * 100);

  if (!isOpen || !mounted) return null;

  const filteredBadges = activeTab === 'ALL' 
    ? BADGES 
    : BADGES.filter(b => b.category === activeTab);

  const groupedBadges = activeTab === 'ALL'
    ? Object.keys(CATEGORY_NAMES).reduce((acc, cat) => {
        const catBadges = BADGES.filter(b => b.category === cat);
        if (catBadges.length > 0) acc[cat as BadgeCategory] = catBadges;
        return acc;
      }, {} as Record<BadgeCategory, typeof BADGES>)
    : { [activeTab]: filteredBadges };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-800 rounded-t-2xl z-10 shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                 <PiSealCheckFill className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Thành tích & Huy hiệu</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Đã đạt: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{unlockedCount}/{BADGES.length}</span> ({progress}%)
                 </p>
              </div>
           </div>
           
           <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
           >
              <HiXMark className="w-6 h-6" />
           </button>
        </div>

        {/* Tabs */}
        <div 
            ref={tabsRef}
            onWheel={handleTabsWheel}
            className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex gap-2 overflow-x-auto shrink-0 bg-slate-50/50 dark:bg-slate-800/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        >
            <button
               onClick={() => setActiveTab('ALL')}
               className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ALL' 
                    ? 'bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
               }`}
            >
               Tất cả
            </button>
            {Object.entries(CATEGORY_NAMES).map(([key, label]) => {
               const Icon = CATEGORY_ICONS[key as BadgeCategory];
               return (
                  <button
                     key={key}
                     onClick={() => setActiveTab(key as BadgeCategory)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                        activeTab === key 
                          ? 'bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/20' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                     }`}
                  >
                     <Icon className="w-4 h-4 opacity-80" />
                     {label.split('(')[1].replace(')', '')}
                  </button>
               );
            })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar scroll-smooth">
           {Object.entries(groupedBadges).map(([cat, badges]) => {
              const CategoryIcon = CATEGORY_ICONS[cat as BadgeCategory];
              return (
                 <div key={cat} className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                       <CategoryIcon className="w-5 h-5 text-slate-400" />
                       {CATEGORY_NAMES[cat as BadgeCategory]}
                    </h3>
                 
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 pb-6 justify-items-center px-4">
                    {badges.map((badge) => {
                       const Icon = badge.icon;
                       const isUnlocked = checkBadgeUnlocked(badge, userStats);
                       
                       const currentProgress = isUnlocked ? badge.threshold : getBadgeProgress(badge, userStats);

                       const tierVisuals = {
                         BRONZE: { 
                             style: 'border-orange-700/40 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-400',
                             borderWidth: 'border-[6px]',
                             glow: '',
                             scale: 'scale-100',
                             sparkle: <PiSparkleFill className="text-orange-300 w-4 h-4 drop-shadow-sm opacity-80" />, 
                             icon: <PiSealCheckFill className="text-orange-600 drop-shadow-sm" /> 
                         },
                         SILVER: { 
                             style: 'border-slate-300 bg-gradient-to-br from-white to-slate-200 dark:from-slate-600 dark:to-slate-500 text-slate-600 dark:text-slate-100',
                             borderWidth: 'border-[6px]',
                             glow: 'shadow-lg shadow-slate-300/50 dark:shadow-slate-900/50 ring-1 ring-white/50 inset',
                             scale: 'scale-100',
                             sparkle: <PiSparkleFill className="text-slate-300 w-5 h-5 drop-shadow-md animate-pulse" />, 
                             icon: <PiSealCheckFill className="text-slate-400 drop-shadow-sm" />
                         },
                         GOLD: { 
                             style: 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-700/30 text-yellow-700 dark:text-yellow-400',
                             borderWidth: 'border-[6px]',
                             glow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)] ring-2 ring-yellow-500/20',
                             scale: 'scale-110', 
                             sparkle: <PiSparkleFill className="text-yellow-400 w-7 h-7 drop-shadow-lg animate-bounce-slow" />, 
                             icon: <PiSealCheckFill className="text-yellow-500 drop-shadow-md" />
                         },
                         DIAMOND: { 
                             style: 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/30 dark:to-blue-800/30 text-cyan-600 dark:text-cyan-300 animate-pulse-slow',
                             borderWidth: 'border-[6px]',
                             glow: 'shadow-[0_0_30px_rgba(34,211,238,0.6)] ring-4 ring-cyan-400/20',
                             scale: 'scale-115', 
                             sparkle: <PiSketchLogoFill className="text-cyan-200 w-6 h-6 drop-shadow-xl animate-spin-slow" />, 
                             icon: <PiSketchLogoFill className="text-cyan-400 drop-shadow-md" />
                         }
                       };

                       const currentTier = tierVisuals[badge.tier] || tierVisuals.BRONZE;

                       return (
                          <div 
                             key={badge.id} 
                             className={`flex flex-col items-center gap-3 group relative cursor-pointer transition-transform duration-300 ${currentTier.scale}`}
                             onMouseEnter={(e) => handleMouseEnter(e, badge)}
                             onMouseLeave={handleMouseLeave}
                          >
                             <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-[6px] ${
                                isUnlocked 
                                   ? `${currentTier.style} ${currentTier.glow} transform group-hover:-translate-y-2` 
                                   : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-300 scale-95 opacity-80'
                             }`}>
                                {isUnlocked && (
                                   <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent opacity-50 overflow-hidden pointer-events-none">
                                      {badge.tier === 'DIAMOND' && <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-white/30 skew-x-12 translate-x-[-150%]" />}
                                   </div>
                                )}
                                
                                {isUnlocked && (
                                   <div className="absolute -top-2 -right-2 z-20 transition-transform group-hover:scale-125 group-hover:rotate-12">
                                      {currentTier.sparkle}
                                   </div>
                                )}

                                <Icon className={`w-12 h-12 transition-all duration-300 ${isUnlocked ? 'filter drop-shadow-md' : 'grayscale opacity-40 group-hover:opacity-70 group-hover:scale-105'}`} />
                                
                                {!isUnlocked && (
                                   <div className="absolute -bottom-3 px-2.5 py-0.5 bg-slate-200/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-full border border-slate-300 dark:border-slate-500 shadow-sm z-20 flex items-center gap-1 group-hover:scale-110 transition-transform">
                                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
                                        {currentProgress}/{badge.threshold}
                                      </span>
                                   </div>
                                )}
                             </div>

                             <div className="text-center z-10 flex flex-col items-center">
                                <h4 className={`text-sm font-black uppercase tracking-wider mb-1 px-2 line-clamp-1 ${isUnlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                   {badge.name}
                                </h4>
                                
                                {isUnlocked ? (
                                    <div className="text-2xl transition-transform group-hover:scale-125 pb-1" title={badge.tier}>
                                        {currentTier.icon}
                                    </div>
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                )}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
           );
           })}
           
           <div className="h-4"></div>
        </div>

        {activeBadge && (
           <div 
             className="fixed z-[99999] w-64 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
             style={{
                top: (activeBadge.rect.top - 120) + 'px', 
                left: (activeBadge.rect.left + activeBadge.rect.width / 2) + 'px',
                transform: 'translateX(-50%)' 
             }}
           >
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] text-center relative">
                 <h5 className="font-bold text-sm mb-1 text-center">{activeBadge.badge.name}</h5>
                 <p className="text-xs font-medium leading-relaxed opacity-90">{activeBadge.badge.description}</p>
                 
                 {!checkBadgeUnlocked(activeBadge.badge, userStats) && (() => {
                     const currentVal = getBadgeProgress(activeBadge.badge, userStats);
                     const remaining = activeBadge.badge.threshold - currentVal;
                     return (
                        <p className="text-[10px] font-bold text-orange-400 border-t border-white/10 dark:border-black/5 pt-2 mt-2">
                           Cố lên! Còn thiếu {remaining} nữa.
                        </p>
                     );
                 })()}
                 
                 <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-white rotate-45"></div>
              </div>
           </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BadgeListModal;
