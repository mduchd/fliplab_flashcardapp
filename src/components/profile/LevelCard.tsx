import React, { useMemo } from 'react';
import { 
  HiArrowTrendingUp, 
  HiBookOpen, 
  HiAcademicCap, 
  HiStar, 
  HiTrophy, 
  HiBolt, 
  HiFire, 
  HiChartBar, 
  HiSparkles 
} from 'react-icons/hi2';

interface LevelCardProps {
  currentLevel?: number;
  currentXP?: number;
  maxXP?: number;
  levelTitle?: string;
  nextLevelTitle?: string;
  nextLevelRewards?: string[];
  isCompact?: boolean;
}

// Level Tier Configuration
const LEVEL_TIERS = {
  bronze: {
    range: [1, 5],
    gradient: 'from-orange-900 via-amber-900 to-orange-950',
    accent: 'orange-500',
    glow: 'shadow-orange-500/20',
    border: 'border-orange-700/30',
    icon: HiBookOpen,
    label: 'Tân binh'
  },
  silver: {
    range: [6, 10],
    gradient: 'from-slate-800 via-slate-700 to-slate-900',
    accent: 'slate-400',
    glow: 'shadow-slate-400/20',
    border: 'border-slate-500/30',
    icon: HiAcademicCap,
    label: 'Học viên'
  },
  gold: {
    range: [11, 20],
    gradient: 'from-yellow-900 via-amber-800 to-yellow-950',
    accent: 'yellow-500',
    glow: 'shadow-yellow-500/30',
    border: 'border-yellow-600/40',
    icon: HiStar,
    label: 'Tinh anh'
  },
  diamond: {
    range: [21, 999],
    gradient: 'from-cyan-900 via-blue-900 to-indigo-950',
    accent: 'cyan-400',
    glow: 'shadow-cyan-400/40',
    border: 'border-cyan-500/50',
    icon: HiTrophy,
    label: 'Huyền thoại'
  }
};

const getLevelTier = (level: number) => {
  if (level <= 5) return LEVEL_TIERS.bronze;
  if (level <= 10) return LEVEL_TIERS.silver;
  if (level <= 20) return LEVEL_TIERS.gold;
  return LEVEL_TIERS.diamond;
};

const getProgressMicrocopy = (percent: number, xpLeft: number): { text: string; Icon: React.ElementType } => {
  if (percent >= 96) return { text: `Chỉ còn ${xpLeft} XP nữa thôi!`, Icon: HiFire };
  if (percent >= 81) return { text: `Sắp chạm đích! Còn ${xpLeft} XP`, Icon: HiBolt };
  if (percent >= 51) return { text: 'Quá nửa đường rồi! Cố lên!', Icon: HiChartBar };
  if (percent >= 21) return { text: 'Đang tiến bộ đều đặn', Icon: HiArrowTrendingUp };
  return { text: 'Hành trình mới bắt đầu!', Icon: HiSparkles };
};

const LevelCard: React.FC<LevelCardProps> = ({
  currentLevel = 5,
  currentXP = 1240,
  maxXP = 1500,
  levelTitle = 'Học giả',
  nextLevelTitle = 'Chuyên gia',
  nextLevelRewards = ['🎨 Custom Theme', '🏅 Huy hiệu vàng'],
  isCompact = false
}) => {
  const progressPercent = Math.round((currentXP / maxXP) * 100);
  const xpLeft = maxXP - currentXP;
  const tier = useMemo(() => getLevelTier(currentLevel), [currentLevel]);
  const TierIcon = tier.icon;
  const microcopy = useMemo(() => getProgressMicrocopy(progressPercent, xpLeft), [progressPercent, xpLeft]);
  const MicrocopyIcon = microcopy.Icon;
  
  const isNearLevelUp = progressPercent >= 80;

  if (isCompact) {
    // Compact version for sidebar
    return (
      <div className={`bg-gradient-to-br ${tier.gradient} rounded-xl p-4 text-white relative overflow-hidden ${tier.border} border`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center`}>
            <TierIcon className={`w-5 h-5 text-${tier.accent}`} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">Lv.{currentLevel} {levelTitle}</div>
            <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 dark:border-slate-700 shadow-xl shadow-blue-100/50 dark:shadow-none bg-white dark:bg-slate-800">
      {/* Gradient Overlay - More vibrant for light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-800 dark:via-slate-900 dark:to-blue-950" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        {isNearLevelUp && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 dark:via-blue-500/10 to-transparent animate-[shimmer_3s_infinite]" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          {/* Left: Level Info */}
          <div className="flex items-center gap-3">
            {/* Level Badge with pulsing glow when near level up */}
            <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ${isNearLevelUp ? 'shadow-blue-400/50 animate-pulse' : 'shadow-blue-500/30'}`}>
              <TierIcon className="w-7 h-7 text-white" />
            </div>
            
            {/* Level Text */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                {isNearLevelUp ? 'SẮP THĂNG CẤP!' : 'CẤP ĐỘ HIỆN TẠI'}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-black bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-lg shadow-lg shadow-blue-500/30">
                  Lv.{currentLevel}
                </span>
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {levelTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Right: XP Counter */}
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">Kinh nghiệm</div>
            <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums">
              {currentXP.toLocaleString()}
              <span className="text-slate-400 dark:text-slate-500 text-xs font-medium ml-1">/ {maxXP.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-3">
          <div className="h-2.5 md:h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600/50 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative overflow-hidden transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              {/* Glow */}
              <div className="absolute inset-0 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
            </div>
          </div>
        </div>

        {/* Footer: Microcopy & Next Level */}
        <div className="flex items-center justify-between text-xs">
          {/* Left: Motivational Copy */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <MicrocopyIcon className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{microcopy.text}</span>
          </div>

          {/* Right: Next Level Preview */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <HiArrowTrendingUp className="w-4 h-4" />
            <span>Tiếp theo:</span>
            <span className="font-bold text-slate-900 dark:text-white">{nextLevelTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelCard;
