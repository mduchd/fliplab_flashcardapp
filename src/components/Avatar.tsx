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

  // Special Effects Renderer
  const renderSpecialEffects = () => {
    switch (frameId) {
      case 'fire':
        return (
          <>
            {/* Dark Heat Base */}
            <div className="absolute -inset-1 rounded-full bg-red-900/40 blur-md animate-pulse" />
            
            {/* Spinning Heat Wave */}
            <div className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.5),rgba(251,191,36,0.8),transparent)] animate-[spin_1.5s_linear_infinite]" />
            
            {/* Realistic Flames */}
            <div className="absolute inset-x-0 -top-4 h-8 flex justify-center items-end overflow-visible pointer-events-none opacity-90">
                {/* Main Core Flame */}
                <div className="absolute w-2 h-4 bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-full blur-[0.5px] animate-[bounce_0.8s_infinite] shadow-[0_0_10px_theme(colors.orange.500)]" style={{ zIndex: 2 }} />
                
                {/* Side Licks */}
                <div className="absolute left-[35%] -bottom-1 w-1.5 h-3 bg-red-500 rounded-full blur-[0.5px] animate-[pulse_1s_infinite]" />
                <div className="absolute right-[35%] -bottom-1 w-1.5 h-3 bg-orange-600 rounded-full blur-[0.5px] animate-[pulse_1.2s_infinite]" />
                
                {/* Embers/Sparks */}
                <div className="absolute -top-4 left-[40%] w-0.5 h-0.5 bg-yellow-200 animate-[ping_2s_infinite]" />
                <div className="absolute -top-2 right-[40%] w-0.5 h-0.5 bg-orange-200 animate-[ping_1.5s_infinite]" />
            </div>
            
            {/* Inner Glow Ring */}
            <div className="absolute -inset-[1px] rounded-full border border-orange-500/30" />
          </>
        );
      case 'thunder':
        return (
          <>
            {/* High Voltage Glow */}
            <div className="absolute -inset-2 rounded-full bg-blue-600/30 blur-lg animate-pulse" />
            
            {/* Electric Current Ring (Conic Gradient) */}
            <div className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.6),rgba(250,204,21,0.9),transparent)] animate-[spin_1s_linear_infinite]" />
            
            {/* Sharp Lightning Bolts */}
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite_reverse]">
                 {/* Bolt 1: Main Striker */}
                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-8 bg-white shadow-[0_0_10px_theme(colors.yellow.300)] z-20" 
                      style={{ clipPath: 'polygon(55% 0, 10% 100%, 55% 55%, 45% 100%, 90% 30%, 55% 45%)' }} />
                      
                 {/* Bolt 2: Blue Arc */}
                 <div className="absolute bottom-1 -right-3 w-3 h-6 bg-cyan-300 shadow-[0_0_8px_theme(colors.cyan.400)] rotate-45 z-10" 
                      style={{ clipPath: 'polygon(40% 0, 0 100%, 50% 55%, 30% 100%, 100% 20%, 55% 45%)' }} />
                 
                 {/* Bolt 3: Static Discharge */}
                 <div className="absolute top-1/2 -left-3 w-2 h-5 bg-white shadow-[0_0_5px_white] -rotate-45 opacity-80" 
                      style={{ clipPath: 'polygon(60% 0, 0 100%, 50% 60%, 20% 100%, 100% 10%, 60% 40%)' }} />
            </div>

            {/* Inner Arc Container */}
            <div className="absolute -inset-[1px] rounded-full border border-blue-400/50 box-border" />
          </>
        );
      case 'sakura':
        return (
          <>
             {/* Soft Pink Glow */}
            <div className="absolute -inset-2 rounded-full bg-pink-200 opacity-40 blur-md animate-pulse" />
             {/* Spinning Petals Ring */}
            <div className="absolute -inset-3 animate-[spin_8s_linear_infinite]">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-300 rounded-full shadow-[0_0_5px_theme(colors.pink.400)]" />
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-200 rounded-full" />
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-pink-200 rounded-full" />
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-pink-300 rounded-full shadow-[0_0_5px_theme(colors.pink.400)]" />
               
               {/* 45 degree petals */}
               <div className="absolute top-[15%] right-[15%] w-1 h-1 bg-white rounded-full" />
               <div className="absolute bottom-[15%] left-[15%] w-1 h-1 bg-white rounded-full" />
            </div>
            <div className="absolute -inset-[1px] rounded-full border border-pink-200/50" />
          </>
        );
      case 'angel':
        return (
          <>
            {/* Holy Glow */}
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-100 via-white to-blue-100 opacity-50 blur-lg animate-pulse" />
            
            {/* Halo Ring */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full h-[2px] bg-yellow-200 blur-[1px] rounded-full" />
            
            {/* Wings Effect (Spinning Light) */}
            <div className="absolute -inset-2 rounded-full border-t-2 border-white/80 animate-[spin_4s_linear_infinite]" />
            <div className="absolute -inset-2 rounded-full border-b-2 border-white/80 animate-[spin_4s_linear_infinite_reverse]" />
          </>
        );
      case 'neon':
      case 'cyber':
        return (
          <>
            <div className="absolute -inset-1 rounded-full bg-fuchsia-500 blur opacity-40 animate-pulse" />
            <div className="absolute -inset-[2px] rounded-full border-2 border-fuchsia-500/50" />
            <div className="absolute -inset-[2px] rounded-full border-t-2 border-l-2 border-cyan-400 animate-[spin_2s_linear_infinite]" />
            <div className="absolute -inset-[2px] rounded-full border-b-2 border-r-2 border-yellow-400 animate-[spin_2s_linear_infinite_reverse]" />
          </>
        );
      case 'cosmic':
      case 'portal':
        return (
          <>
            <div className="absolute -inset-1 rounded-full bg-indigo-900 blur-md opacity-60 animate-pulse" />
            {/* Stars */}
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
               <div className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-white shadow-[0_0_2px_white]" />
               <div className="absolute bottom-1 right-2 w-1 h-1 bg-blue-200 rounded-full blur-[0.5px] animate-pulse" />
               <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-purple-300" />
            </div>
            {/* Orbit Ring */}
            <div className="absolute -inset-[3px] rounded-full border border-indigo-400/30 skew-x-12 animate-[spin_4s_linear_infinite]" />
          </>
        );
      case 'nature':
        return (
          <>
            <div className="absolute -inset-2 rounded-full bg-emerald-100 opacity-40 blur-md animate-pulse" />
            <div className="absolute -inset-3 animate-[spin_12s_linear_infinite]">
               {/* Leaves */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-400 rounded-tl-full rounded-br-full" />
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-tr-full rounded-bl-full" />
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-300 rounded-full" />
               <div className="absolute right-[10%] bottom-[10%] w-1.5 h-1.5 bg-teal-400 rounded-full" />
            </div>
            <div className="absolute -inset-[1px] rounded-full border border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
          </>
        );
      case 'gold':
      case 'diamond':
      case 'ruby':
      case 'emerald':
      case 'silver':
        // Shiny Metal/Gem Effect
        const color = frameId === 'gold' ? 'bg-yellow-400' : 
                      frameId === 'ruby' ? 'bg-rose-500' :
                      frameId === 'emerald' ? 'bg-emerald-500' :
                      frameId === 'silver' ? 'bg-slate-300' : 'bg-cyan-300';
        return (
           <>
              <div className={`absolute -inset-[2px] rounded-full ${color} opacity-20 blur-sm`} />
              <div className="absolute -inset-[2px] rounded-full border border-white/20" />
              <div className="absolute -inset-[2px] rounded-full overflow-hidden z-20">
                  {/* Rotating Shine/Sheen */}
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/30 to-transparent rotate-45 animate-[spin_4s_linear_infinite_reverse]" />
              </div>
           </>
        );
      case 'rainbow':
      case 'party':
        return (
          <>
             <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-30 blur-md animate-pulse" />
             <div className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#ef4444,#eab308,#22c55e,#3b82f6,#ef4444)] animate-[spin_2s_linear_infinite]" />
          </>
        );
      default:
        // Default spinning logic
        if (isSpinning) {
             return (
              <>
                 <div className={`absolute ${t.glow} rounded-full ${frameConfig.class} animate-[spin_3s_linear_infinite] opacity-70 blur-md`} />
                 <div className={`absolute inset-0 rounded-full ${frameConfig.class} animate-[spin_3s_linear_infinite]`} />
              </>
             )
        }
        return null;
    }
  };

  // 1. Spinning / Special Effect Wrapper
  const specialEffectFrames = ['fire', 'thunder', 'sakura', 'angel', 'neon', 'cyber', 'cosmic', 'portal', 'nature', 'gold', 'diamond', 'ruby', 'emerald', 'silver', 'rainbow', 'party'];
  
  if (isSpinning || specialEffectFrames.includes(frameId)) {
    return (
      <div className={`${sizeClass} relative flex-shrink-0 ${className}`}>
        {/* Render Effects */}
        {renderSpecialEffects()}
        
        {/* Stationary Content - Image */}
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
