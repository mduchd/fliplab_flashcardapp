import React, { useMemo, useState } from 'react';
import { HiChartBar, HiAcademicCap, HiTrophy, HiBookOpen } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { BADGES } from '../../constants/badgeConstants';
import BadgeListModal from './BadgeListModal';

interface ActivityStatsProps {
  activityData?: {
    date: string;
    count: number;
    label?: string;
    isToday?: boolean;
  }[];
  masteryData?: {
     new: number;
     learning: number;
     mastered: number;
  };
  viewMode?: 'full' | 'chart-only' | 'badges-only' | 'mastery-only';
  noBackground?: boolean;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ activityData, masteryData, viewMode = 'full', noBackground = false }) => {
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const hasRealData = activityData && activityData.length > 0;

  // Mock User Stats for Badge Calculation (Demo purpose)
  // In real implementation, this should come from props
  const mockUserStats = {
      streak: 5,
      masteredCards: masteryData?.mastered ? Math.round((masteryData.mastered / 100) * 50) : 12, // Approx 12 cards if 24% of 50
      totalFolders: 2,
      createdDecks: 3,
      totalReviews: 120,
      followingCount: 5,
      followersCount: 12,
      hasImported: true,
      hasShared: false,
      aiGeneratedDecks: 1,
      quizzesTaken: 1,
      perfectQuizzes: 0,
      translationCount: 15,
      hasAvatar: true
  };

  const { weeklyData } = useMemo(() => {
    if (!activityData || activityData.length === 0) {
        return { weeklyData: [], avgPerDay: 0 };
    }

    const weekly: { day: string; count: number; height: number; isToday: boolean }[] = [];
    let weekTotal = 0;
    // Find max value for scaling (at least 50 to avoid huge bars for small numbers)
    // This makes 20 cards look like ~40% height, and 100 cards look full height.
    const maxVal = Math.max(50, ...activityData.map(d => d.count || 0));
    const daysMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    activityData.forEach((item) => {
        const count = item.count || 0;
        weekTotal += count;
        let dayLabel = item.label || daysMap[new Date(item.date).getDay()];
        let isToday = item.isToday !== undefined ? item.isToday : item.date.startsWith(new Date().toISOString().split('T')[0]);

        weekly.push({
            day: dayLabel,
            count: count,
            height: Math.max(4, (count / maxVal) * 100),
            isToday: isToday
        });
    });

    return { 
        weeklyData: weekly, 
        avgPerDay: Math.round(weekTotal / 7)
    };
  }, [activityData]);


  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
        <HiChartBar className="w-7 h-7 text-blue-500" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Chưa có hoạt động</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-xs font-medium">
        Hãy học 1 bộ thẻ để bắt đầu theo dõi thống kê
      </p>
      <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
        <HiBookOpen className="w-4 h-4" /> Bắt đầu ngay
      </Link>
    </div>
  );

  // Define container styles based on noBackground prop
  const containerClasses = noBackground 
    ? "h-full flex flex-col" 
    : "bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm h-full flex flex-col";

  const ChartSection = (
      <div className={containerClasses}>
        <div className={`flex items-center justify-between ${noBackground ? 'mb-2' : 'mb-4'}`}>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <HiChartBar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Hoạt động tuần qua
          </h3>
          {hasRealData && (
            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-md text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50">
              Tổng {weeklyData.reduce((acc, cur) => acc + cur.count, 0)} thẻ
            </span>
          )}
        </div>

        {!hasRealData ? <div className="py-8"><EmptyState /></div> : (
          <div className="relative flex-1 mt-2 select-none w-full min-h-0">
            {/* Background Grid Lines - Scale References */}
            <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-400 dark:text-slate-600 font-bold z-0 pointer-events-none pb-6 pl-0 pr-0">
               <div className="border-b border-dashed border-slate-100 dark:border-slate-700/30 w-full h-px relative flex items-end justify-start"><span className="-mb-3 bg-white/90 dark:bg-slate-800/90 px-1 ml-1 rounded z-20">Max</span></div>
               <div className="border-b border-dashed border-slate-100 dark:border-slate-700/30 w-full h-px relative flex items-end justify-start"><span className="-mb-3 bg-white/90 dark:bg-slate-800/90 px-1 ml-1 rounded z-20">Avg</span></div>
               <div className="border-b border-slate-100 dark:border-slate-700 w-full h-px box-border"></div>
            </div>

            {/* Bars Container - Added padding-x to prevent edge clipping */}
            <div className="absolute inset-0 flex items-end justify-between px-3 pt-6 pb-0 z-10 gap-2">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative">
                  
                  {/* Floating Tooltip/Value */}
                  <div className={`mb-1.5 text-[10px] font-bold transition-all duration-300 transform ${
                    d.isToday 
                      ? '-translate-y-0 opacity-100 text-blue-600 dark:text-blue-400 scale-110' 
                      : 'translate-y-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-0 text-slate-500 dark:text-slate-300'
                  }`}>
                    {d.count}
                  </div>

                  {/* The Bar */}
                  <div 
                    className={`w-full max-w-[24px] rounded-t-lg transition-all duration-300 ease-out relative overflow-hidden ${
                      d.isToday 
                        ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                        : 'bg-slate-200 dark:bg-slate-700/80 group-hover:bg-blue-400 dark:group-hover:bg-blue-600'
                    }`}
                    style={{ height: `max(6px, ${d.height}%)` }}
                  ></div>

                  {/* Day Label */}
                  <span className={`text-[9px] font-bold mt-2 uppercase tracking-wider transition-colors ${
                    d.isToday 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );

  const MasterySection = (
      <div className={containerClasses}>
         <div className={`flex items-center justify-between ${noBackground ? 'mb-2' : 'mb-4'}`}>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <HiAcademicCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Độ thành thạo
          </h3>
        </div>
        
        <div className="flex items-center justify-center gap-4 flex-1 relative px-2 min-h-0">
           {/* Donut Chart SVG - Increased Size */}
           <div className="relative w-40 h-40 flex-shrink-0">
               <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <path className="text-slate-100 dark:text-slate-700/50"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3" />
                  
                  {/* Segment 1: Mastered (Box 4,5) - Green */}
                   <path className="text-emerald-500 drop-shadow-sm transition-all duration-1000 ease-out"
                        strokeDasharray={`${(masteryData?.mastered || 0)}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

                  {/* Segment 2: Learning (Box 2,3) - Blue */}
                   <path className="text-blue-500 transition-all duration-1000 ease-out"
                        strokeDasharray={`${(masteryData?.learning || 0)}, 100`}
                        strokeDashoffset={`-${masteryData?.mastered || 0}`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

                  {/* Segment 3: New (Box 1) - Yellow */}
                   <path className="text-yellow-400 transition-all duration-1000 ease-out"
                        strokeDasharray={`${(masteryData?.new || 0)}, 100`}
                        strokeDashoffset={`-${(masteryData?.mastered || 0) + (masteryData?.learning || 0)}`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
               </svg>
               {/* Center Text */}
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{Math.round(masteryData?.mastered || 0)}%</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mt-1">Master</span>
               </div>
           </div>

           {/* Legend - Improved Styling */}
           <div className="flex flex-col gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 flex-1 pl-4 border-l border-slate-100 dark:border-slate-700/50 border-dashed">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Thành thạo</span>
                 </div>
                 <span className="text-base font-black text-slate-800 dark:text-white pl-4">{Math.round(masteryData?.mastered || 0)}%</span>
              </div>

              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                     <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Đang học</span>
                 </div>
                 <span className="text-base font-black text-slate-800 dark:text-white pl-4">{Math.round(masteryData?.learning || 0)}%</span>
              </div>

              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-500/50"></div>
                     <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase">Mới</span>
                 </div>
                 <span className="text-base font-black text-slate-800 dark:text-white pl-4">{Math.round(masteryData?.new || 0)}%</span>
              </div>
           </div>
        </div>
      </div>
  );

  const BadgesSection = (
      <div className={noBackground ? "flex flex-col h-full" : "bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col h-full"}>
        <div className={`flex items-center justify-between ${noBackground ? 'mb-3' : 'mb-5'}`}>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <div className={`p-1.5 rounded-md text-yellow-600 dark:text-yellow-400 ${noBackground ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-yellow-50 dark:bg-yellow-500/10'}`}>
              <HiTrophy className="w-3.5 h-3.5" />
            </div>
            Huy hiệu & Thành tích
          </h3>
          <span 
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            onClick={() => setShowBadgesModal(true)}
          >
            Xem tất cả
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {BADGES.filter(b => ['STREAK_3', 'MASTER_10', 'CREATOR_1', 'QUIZ_TAKER'].includes(b.id)).map((badge, index) => {
              const Icon = badge.icon;
              // Mock status: First 2 unlocked for demo
              const isUnlocked = index < 2; 

              // Simplified Tier Colors for Stats Widget with variable border width
              const tierStyles = {
                BRONZE: 'border-[3px] border-orange-600/50 text-orange-600',
                SILVER: 'border-[3px] border-slate-400/60 text-slate-500',
                GOLD: 'border-[4px] border-yellow-500 text-yellow-600 shadow-sm shadow-yellow-500/20',
                DIAMOND: 'border-[4px] border-cyan-400 text-cyan-500 shadow-sm shadow-cyan-400/20'
              };
              const style = isUnlocked ? (tierStyles[badge.tier] || tierStyles.BRONZE) : 'border-[3px] border-slate-200 text-slate-300';

              return (
                <div 
                  key={badge.id} 
                  onClick={() => setShowBadgesModal(true)}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  title={badge.name}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${style} ${isUnlocked ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50 grayscale'}`}>
                     <Icon className="w-8 h-8" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase truncate max-w-full ${isUnlocked ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300'}`}>
                    {badge.name}
                  </span>
                </div>
              );
          })}
        </div>
        
        {/* Render Modal */}
        <BadgeListModal 
            isOpen={showBadgesModal} 
            onClose={() => setShowBadgesModal(false)} 
            userStats={mockUserStats}
        />
      </div>
  );

  if (viewMode === 'chart-only') return ChartSection;
  if (viewMode === 'mastery-only') return MasterySection;
  if (viewMode === 'badges-only') return BadgesSection;

  return (
    <div className="flex flex-col gap-6 h-full">
      {ChartSection}
      {MasterySection}
      {BadgesSection}
    </div>
  );
};

export default ActivityStats;




