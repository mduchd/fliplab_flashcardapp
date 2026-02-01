import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiXMark, HiCheckCircle } from 'react-icons/hi2';
import { PiSealCheckFill } from 'react-icons/pi';
import { BADGES, checkBadgeUnlocked } from '../../constants/badgeConstants';

interface BadgeCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: any;
  pinnedBadgeIds: string[];
  onSave: (badgeIds: string[]) => void;
}

const BadgeCustomizationModal: React.FC<BadgeCustomizationModalProps> = ({
  isOpen,
  onClose,
  userStats,
  pinnedBadgeIds,
  onSave
}) => {
  const [selectedBadges, setSelectedBadges] = useState<string[]>(pinnedBadgeIds);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedBadges(pinnedBadgeIds); // Reset to current when opening
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, pinnedBadgeIds]);

  if (!isOpen || !mounted) return null;

  const unlockedBadges = BADGES.filter(badge => checkBadgeUnlocked(badge, userStats));
  
  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      } else if (prev.length < 5) {
        return [...prev, badgeId];
      }
      return prev; // Already at max
    });
  };

  const handleSave = () => {
    onSave(selectedBadges);
    onClose();
  };

  const handleReset = () => {
    // Reset to first 5 unlocked badges (default behavior)
    const defaultBadges = unlockedBadges.slice(0, 5).map(b => b.id);
    setSelectedBadges(defaultBadges);
  };

  // Tier styling matching ActivityStats EXACTLY
  const getTierStyle = (tier: string, isUnlocked: boolean) => {
    if (!isUnlocked) return {
      border: 'border-[6px] border-slate-200 dark:border-slate-700',
      bg: 'bg-slate-100 dark:bg-slate-800/50',
      icon: 'text-slate-300',
      shadow: ''
    };

    const styles = {
      BRONZE: {
        border: 'border-[6px] border-orange-700/50',
        bg: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40',
        icon: 'text-orange-700 dark:text-orange-400',
        shadow: 'shadow-md shadow-orange-500/30'
      },
      SILVER: {
        border: 'border-[6px] border-slate-400/70',
        bg: 'bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-600 dark:to-slate-500',
        icon: 'text-slate-600 dark:text-slate-100',
        shadow: 'shadow-lg shadow-slate-400/40 dark:shadow-slate-900/60'
      },
      GOLD: {
        border: 'border-[6px] border-yellow-500/80',
        bg: 'bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-900/40 dark:to-yellow-700/40',
        icon: 'text-yellow-700 dark:text-yellow-400',
        shadow: 'shadow-[0_4px_20px_rgba(234,179,8,0.5)]'
      },
      DIAMOND: {
        border: 'border-[6px] border-cyan-400/80',
        bg: 'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/40 dark:to-blue-800/40',
        icon: 'text-cyan-600 dark:text-cyan-300',
        shadow: 'shadow-[0_4px_25px_rgba(34,211,238,0.6)]'
      }
    };
    return styles[tier as keyof typeof styles] || styles.BRONZE;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tùy Chỉnh Huy Hiệu</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Chọn 5 huy hiệu yêu thích để hiển thị trên trang cá nhân ({selectedBadges.length}/5)
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {unlockedBadges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                Bạn chưa mở khóa huy hiệu nào. Hãy tiếp tục học tập để nhận huy hiệu! 🎯
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {unlockedBadges.map(badge => {
                const Icon = badge.icon;
                const isSelected = selectedBadges.includes(badge.id);
                const style = getTierStyle(badge.tier, true);

                return (
                  <div
                    key={badge.id}
                    onClick={() => toggleBadge(badge.id)}
                    className={`
                      relative flex flex-col items-center gap-3 p-4 rounded-xl cursor-pointer
                      transition-all duration-200
                      ${isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500 scale-105' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:scale-102'
                      }
                    `}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <HiCheckCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400 drop-shadow-lg" />
                      </div>
                    )}

                    {/* Badge Icon */}
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${style.border} ${style.bg} ${style.shadow}
                      ${isSelected 
                        ? 'shadow-xl scale-105' 
                        : 'hover:scale-110 hover:shadow-xl hover:-translate-y-1'
                      }
                    `}>
                      <Icon className={`w-10 h-10 ${style.icon}`} />
                    </div>

                    {/* Badge Name */}
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 line-clamp-2">
                        {badge.name}
                      </p>
                      <div className="transition-transform hover:scale-125">
                        <PiSealCheckFill className={`
                          w-4 h-4 mx-auto mt-1
                          ${badge.tier === 'BRONZE' ? 'text-orange-600' :
                            badge.tier === 'SILVER' ? 'text-slate-400' :
                            badge.tier === 'GOLD' ? 'text-yellow-500' :
                            'text-cyan-400'}
                        `} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Đặt lại mặc định
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={selectedBadges.length === 0}
              className="px-6 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/30"
            >
              Lưu ({selectedBadges.length}/5)
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BadgeCustomizationModal;
