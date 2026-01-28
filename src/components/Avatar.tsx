import React from 'react';
import { HiUser } from 'react-icons/hi2';
import { ANIMAL_AVATARS, AVATAR_FRAMES } from '../constants/avatarConstants';

interface AvatarProps {
  avatarUrl?: string;
  displayName?: string;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  avatarUrl, 
  displayName, 
  frameId = 'none', 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-9 h-9',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-32 h-32'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-6xl',
    xl: 'text-7xl'
  };

  // Define thickness constants for each size - LARGER for Profile (lg/xl) as requested
  const thicknessMap = {
    xs: { p: 'p-[2px]', ring: 'ring-2', inset: 'inset-[2px]', glow: '-inset-1' },
    sm: { p: 'p-[3px]', ring: 'ring-[3px]', inset: 'inset-[3px]', glow: '-inset-1.5' },
    md: { p: 'p-[4px]', ring: 'ring-[4px]', inset: 'inset-[4px]', glow: '-inset-1.5' },
    lg: { p: 'p-[6px]', ring: 'ring-[6px]', inset: 'inset-[6px]', glow: '-inset-2.5' }, // 6px for Profile
    xl: { p: 'p-[8px]', ring: 'ring-[8px]', inset: 'inset-[8px]', glow: '-inset-3' }  // 8px for Extra Large
  };

  const frameConfig = AVATAR_FRAMES.find(f => f.id === frameId) || AVATAR_FRAMES[0];
  const sizeClass = sizeClasses[size];
  const textSize = textSizes[size];
  const t = thicknessMap[size]; 

  // Render inner content (image, emoji, or initial)
  const renderContent = () => {
    if (avatarUrl) {
      if (ANIMAL_AVATARS.includes(avatarUrl)) { 
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-white/40 to-transparent pointer-events-none" />
            <span className={`${size === 'lg' ? 'text-6xl' : size === 'xl' ? 'text-7xl' : size === 'md' ? 'text-4xl' : size === 'sm' ? 'text-2xl' : 'text-lg'} drop-shadow-sm z-10`}>{avatarUrl}</span>
          </div>
        );
      }
      // Custom uploaded image
      return (
        <img 
          src={avatarUrl} 
          alt={displayName || 'Avatar'} 
          className="w-full h-full rounded-full object-cover"
        />
      );
    }
    // Default initial
    return (
      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white">
        <span className={textSize}>
          {displayName?.charAt(0).toUpperCase() || <HiUser className="w-1/2 h-1/2" />}
        </span>
      </div>
    );
  };

  // Special handling for frames that need inner background buffering (gradient borders)
  const isComplexFrame = (frameConfig as any).isComplex || ['rainbow', 'cosmic'].includes(frameId);
  const isSpinning = (frameConfig as any).isSpinning;
  
  // Base offset for standard rings to separate from bg
  const ringOffsetClass = !isComplexFrame && !isSpinning ? 'ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : '';

  if (isSpinning) {
    return (
      <div className={`${sizeClass} relative flex-shrink-0 ${className}`}>
        {/* Glow Layer (Blurry behind) - Pulsing Opacity */}
        <div className={`absolute ${t.glow} rounded-full ${frameConfig.class} animate-[spin_3s_linear_infinite] opacity-70 blur-md`} />
        
        {/* Sharp Border Layer */}
        <div className={`absolute inset-0 rounded-full ${frameConfig.class} animate-[spin_3s_linear_infinite]`} />
        
        {/* Stationary Content */}
        <div className={`absolute ${t.inset} rounded-full overflow-hidden bg-white dark:bg-slate-900 z-10 border border-white/10`}>
          {renderContent()}
        </div>
      </div>
    );
  }
  
  if (isComplexFrame) {
    return (
      <div className={`${sizeClass} rounded-full ${frameConfig.class} ${t.p} flex-shrink-0 ${className} shadow-sm`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 border border-white/10">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Simple frames or no frame
  return (
    <div className={`${sizeClass} rounded-full ${frameConfig.class} ${t.ring} ${ringOffsetClass} overflow-hidden flex-shrink-0 ${className}`}>
      <div className="w-full h-full rounded-full overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default Avatar;
