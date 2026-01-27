import React from 'react';
import { HiUser } from 'react-icons/hi2';
import { ANIMAL_AVATARS, AVATAR_FRAMES } from '../constants/avatarConstants';

interface AvatarProps {
  avatarUrl?: string;
  displayName?: string;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
    lg: 'w-28 h-28'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-6xl'
  };

  const isEmojiAvatar = (avatar?: string) => {
    if (!avatar) return false;
    return ANIMAL_AVATARS.includes(avatar);
  };

  const frameConfig = AVATAR_FRAMES.find(f => f.id === frameId) || AVATAR_FRAMES[0];
  const sizeClass = sizeClasses[size];
  const textSize = textSizes[size];

  // Render inner content (image, emoji, or initial)
  const renderContent = () => {
    if (avatarUrl) {
      if (isEmojiAvatar(avatarUrl)) {
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-white/40 to-transparent pointer-events-none" />
            <span className={`${textSize} drop-shadow-sm z-10`}>{avatarUrl}</span>
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
          {displayName?.charAt(0).toUpperCase() || <HiUser className={size === 'xs' ? 'w-4 h-4' : size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-10 h-10'} />}
        </span>
      </div>
    );
  };

  // Special handling for frames that need inner background buffering (gradient borders)
  const complexFrames = ['rainbow', 'cosmic'];
  
  if (complexFrames.includes(frameId)) {
    return (
      <div className={`${sizeClass} rounded-full ${frameConfig.class} flex-shrink-0 ${className}`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Simple frames or no frame
  return (
    <div className={`${sizeClass} rounded-full ${frameConfig.class} overflow-hidden flex-shrink-0 ${className}`}>
      {renderContent()}
    </div>
  );
};

export default Avatar;
