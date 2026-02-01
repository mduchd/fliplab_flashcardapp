import React, { useMemo, useState, useEffect } from 'react';
import { HiChartBar, HiAcademicCap, HiTrophy, HiBookOpen } from 'react-icons/hi2';
import { PiSealCheckFill } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { BADGES, checkBadgeUnlocked } from '../../constants/badgeConstants';
import BadgeListModal from './BadgeListModal';
import BadgeCustomizationModal from './BadgeCustomizationModal';

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
  userStats?: any; // Add userStats prop
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ activityData, masteryData, viewMode = 'full', noBackground = false, userStats }) => {
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [pinnedBadgeIds, setPinnedBadgeIds] = useState<string[]>([]);
  
  const hasRealData = activityData && activityData.length > 0;

  // Load pinned badges from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pinnedBadges');
    if (saved) {
      try {
        setPinnedBadgeIds(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading pinned badges:', e);
      }
    }
  }, []);

  // Save pinned badges to localStorage
  const handleSavePinnedBadges = (badgeIds: string[]) => {
    setPinnedBadgeIds(badgeIds);
    localStorage.setItem('pinnedBadges', JSON.stringify(badgeIds));
  };

  // Mock User Stats for Badge Calculation (Demo purpose) if userStats not provided
  const currentUserStats = userStats || {
      // STREAK - Unlock ALL including Diamond (30 days) + new Bất Tử badge locked
      streak: 35,
      
      // MASTERY - Unlock ALL including Diamond (500 cards) + new Toàn Tri badge unlocked!
      masteredCards: 600,
      
      // CREATION - Unlock most creation badges
      totalFolders: 3,
      createdDecks: 12,
      hasImported: true,
      
      // STUDY - Unlock Bronze, Silver, and Gold review badges
      totalReviews: 550,
      hasStudiedLate: true,  // Night Owl
      hasStudiedEarly: true, // Early Bird
      
      // SOCIAL - Unlock more social badges
      followingCount: 15,
      followersCount: 12,  // Unlock Influencer (needs 10)
      hasShared: true,
      createdGroups: 2,  // Unlock Community Leader
      
      // AI - Unlock more AI badges
      aiGeneratedDecks: 12,
      aiChatCount: 8,  // Unlock AI Friend (needs 5)
      
      // QUIZ - Unlock Quiz badges + new ones
      quizzesTaken: 25, // Unlock Cao Thủ (needs 20)
      perfectQuizzes: 2,  // Unlock Quiz Sniper
      
      // UTILITY - Unlock most utility badges + new Chuyên Gia
      translationCount: 25,
      hasAvatar: true,
      searchCount: 50,
      hasExportedData: true,  // Unlock Data Hoarder
      hasCustomizedSettings: true,
      featuresUsed: 12  // Unlock Chuyên Gia (needs 10)
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
        <div className={`flex items-center justify-between ${noBackground ? 'mb-3' : 'mb-3'}`}>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <div className={`p-1.5 rounded-md text-yellow-600 dark:text-yellow-400 ${noBackground ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-yellow-50 dark:bg-yellow-500/10'}`}>
              <HiTrophy className="w-3.5 h-3.5" />
            </div>
            Huy hiệu & Thành tích
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomizationModal(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer transition-colors"
            >
              Tùy chỉnh
            </button>
            <span 
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              onClick={() => setShowBadgesModal(true)}
            >
              Xem tất cả
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 py-1">
          {(() => {
            // Get all unlocked badges
            const unlockedBadges = BADGES.filter(badge => checkBadgeUnlocked(badge, currentUserStats));
            
            // Determine which badges to display
            let badgesToShow: typeof BADGES;
            if (pinnedBadgeIds.length > 0) {
              // Show pinned badges (filter to only show unlocked ones)
              badgesToShow = pinnedBadgeIds
                .map(id => BADGES.find(b => b.id === id))
                .filter((badge): badge is typeof BADGES[0] => 
                  badge !== undefined && checkBadgeUnlocked(badge, currentUserStats)
                );
            } else {
              // Default: show first 5 unlocked badges
              badgesToShow = unlockedBadges.slice(0, 5);
            }

            return badgesToShow.map((badge) => {
              const Icon = badge.icon;
              const isUnlocked = checkBadgeUnlocked(badge, currentUserStats);

              // Full Tier Styling matching BadgeListModal - Enhanced for compact view
              const tierStyles = {
                BRONZE: {
                  border: 'border-[6px] border-orange-700/50',
                  bg: isUnlocked 
                    ? 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40' 
                    : 'bg-slate-100 dark:bg-slate-800/50',
                  icon: isUnlocked ? 'text-orange-700 dark:text-orange-400' : 'text-slate-300',
                  shadow: isUnlocked ? 'shadow-md shadow-orange-500/30' : '',
                  hover: isUnlocked ? 'group-hover:shadow-xl group-hover:shadow-orange-500/40 group-hover:-translate-y-1' : ''
                },
                SILVER: {
                  border: 'border-[6px] border-slate-400/70',
                  bg: isUnlocked 
                    ? 'bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-600 dark:to-slate-500' 
                    : 'bg-slate-100 dark:bg-slate-800/50',
                  icon: isUnlocked ? 'text-slate-600 dark:text-slate-100' : 'text-slate-300',
                  shadow: isUnlocked ? 'shadow-lg shadow-slate-400/40 dark:shadow-slate-900/60' : '',
                  hover: isUnlocked ? 'group-hover:shadow-xl group-hover:shadow-slate-400/60 group-hover:-translate-y-1' : ''
                },
                GOLD: {
                  border: 'border-[6px] border-yellow-500/80',
                  bg: isUnlocked 
                    ? 'bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-900/40 dark:to-yellow-700/40' 
                    : 'bg-slate-100 dark:bg-slate-800/50',
                  icon: isUnlocked ? 'text-yellow-700 dark:text-yellow-400' : 'text-slate-300',
                  shadow: isUnlocked ? 'shadow-[0_4px_20px_rgba(234,179,8,0.5)]' : '',
                  hover: isUnlocked ? 'group-hover:shadow-[0_6px_30px_rgba(234,179,8,0.7)] group-hover:-translate-y-1 group-hover:scale-105' : ''
                },
                DIAMOND: {
                  border: 'border-[6px] border-cyan-400/80',
                  bg: isUnlocked 
                    ? 'bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/40 dark:to-blue-800/40' 
                    : 'bg-slate-100 dark:bg-slate-800/50',
                  icon: isUnlocked ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-300',
                  shadow: isUnlocked ? 'shadow-[0_4px_25px_rgba(34,211,238,0.6)]' : '',
                  hover: isUnlocked ? 'group-hover:shadow-[0_6px_35px_rgba(34,211,238,0.8)] group-hover:-translate-y-1 group-hover:scale-105' : ''
                }
              };
              
              const style = tierStyles[badge.tier] || tierStyles.BRONZE;

              return (
                <div 
                  key={badge.id} 
                  onClick={() => setShowBadgesModal(true)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  title={badge.name}
                >
                  <div className="relative">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center 
                      transition-all duration-300
                      ${style.border} 
                      ${style.bg} 
                      ${style.shadow}
                      ${style.hover}
                      ${!isUnlocked ? 'grayscale opacity-60' : ''}
                    `}>
                       <Icon className={`w-8 h-8 ${style.icon}`} />
                    </div>
                    
                    {/* Progress Badge for Locked */}
                    {!isUnlocked && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-200/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-full border border-slate-300 dark:border-slate-600 shadow-sm z-10">
                        <span className="text-[8px] font-extrabold text-slate-500 dark:text-slate-400">
                          0/{badge.threshold}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-[10px] font-bold uppercase truncate max-w-full transition-colors ${isUnlocked ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`}>
                    {badge.name}
                  </span>
                  
                  {/* Tier Badge Icon below name */}
                  {isUnlocked ? (
                    <div className="transition-transform group-hover:scale-125">
                      <PiSealCheckFill className={`w-4 h-4 ${
                        badge.tier === 'BRONZE' ? 'text-orange-600 dark:text-orange-500' :
                        badge.tier === 'SILVER' ? 'text-slate-400 dark:text-slate-300' :
                        badge.tier === 'GOLD' ? 'text-yellow-500 dark:text-yellow-400' :
                        'text-cyan-400 dark:text-cyan-300'
                      } drop-shadow-sm`} />
                    </div>
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>
                )
            });
          })()}
        </div>
        
        {/* Render Modals */}
        <BadgeListModal 
            isOpen={showBadgesModal} 
            onClose={() => setShowBadgesModal(false)} 
            userStats={currentUserStats}
        />
        <BadgeCustomizationModal
            isOpen={showCustomizationModal}
            onClose={() => setShowCustomizationModal(false)}
            userStats={currentUserStats}
            pinnedBadgeIds={pinnedBadgeIds}
            onSave={handleSavePinnedBadges}
        />
      </div>
  );

  if (viewMode === 'chart-only') return ChartSection;
  if (viewMode === 'mastery-only') return MasterySection;
  if (viewMode === 'badges-only') return BadgesSection;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 h-full">
      {/* Activity Chart */}
      <div className="w-full h-72 md:h-auto">
        {ChartSection}
      </div>
      
      {/* Mastery Ring */}
      <div className="w-full h-72 md:h-auto">
         {MasterySection}
      </div>

       {/* Badges Section - Full Width */}
       <div className="col-span-1 md:col-span-2 mt-2">
         {BadgesSection}
       </div>
    </div>
  );
};

export default ActivityStats;
