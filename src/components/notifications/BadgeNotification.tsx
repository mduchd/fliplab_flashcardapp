import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiXMark, HiSparkles } from 'react-icons/hi2';
import { PiSealCheckFill } from 'react-icons/pi';
import type { Badge } from '../../constants/badgeConstants';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
  duration?: number;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ 
  badge, 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const Icon = badge.icon;

  // Tier-specific styling
  const tierStyles = {
    BRONZE: {
      border: 'border-orange-700/50',
      bg: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40',
      icon: 'text-orange-700 dark:text-orange-400',
      glow: 'shadow-lg shadow-orange-500/50',
      accent: 'bg-orange-600',
      text: 'text-orange-700 dark:text-orange-300'
    },
    SILVER: {
      border: 'border-slate-400/70',
      bg: 'bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-600 dark:to-slate-500',
      icon: 'text-slate-600 dark:text-slate-100',
      glow: 'shadow-lg shadow-slate-400/50',
      accent: 'bg-slate-500',
      text: 'text-slate-700 dark:text-slate-200'
    },
    GOLD: {
      border: 'border-yellow-500/80',
      bg: 'bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-900/40 dark:to-yellow-700/40',
      icon: 'text-yellow-700 dark:text-yellow-400',
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)]',
      accent: 'bg-yellow-600',
      text: 'text-yellow-700 dark:text-yellow-300'
    },
    DIAMOND: {
      border: 'border-cyan-400/80',
      bg: 'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/40 dark:to-blue-800/40',
      icon: 'text-cyan-600 dark:text-cyan-300',
      glow: 'shadow-[0_0_35px_rgba(34,211,238,0.7)]',
      accent: 'bg-cyan-600',
      text: 'text-cyan-700 dark:text-cyan-300'
    }
  };

  const style = tierStyles[badge.tier];

  const notification = (
    <div 
      className={`
        fixed top-20 right-6 z-[9999] 
        transition-all duration-300 ease-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className="relative w-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${style.accent}`} />
        
        {/* Background sparkles */}
        <div className="absolute inset-0 opacity-10">
          <HiSparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-400 animate-pulse" />
          <HiSparkles className="absolute bottom-6 left-6 w-6 h-6 text-yellow-400 animate-pulse delay-150" />
          <HiSparkles className="absolute top-1/2 right-8 w-4 h-4 text-yellow-400 animate-pulse delay-300" />
        </div>

        {/* Content */}
        <div className="relative p-5 flex items-center gap-4">
          {/* Badge Icon */}
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center shrink-0
            border-[6px] ${style.border} ${style.bg} ${style.glow}
            animate-bounce-slow
          `}>
            <Icon className={`w-10 h-10 ${style.icon}`} />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <HiSparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Huy Hiệu Mới!
              </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <p className={`text-lg font-extrabold ${style.text}`}>
                {badge.name}
              </p>
              <PiSealCheckFill className={`w-5 h-5 ${style.icon}`} />
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {badge.description}
            </p>

            {/* Tier Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                {badge.tier === 'BRONZE' ? 'Đồng' :
                 badge.tier === 'SILVER' ? 'Bạc' :
                 badge.tier === 'GOLD' ? 'Vàng' :
                 'Kim Cương'}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(notification, document.body);
};

export default BadgeNotification;
