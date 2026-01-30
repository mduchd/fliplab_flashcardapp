
import React, { useMemo } from 'react';
import { HiBookOpen, HiChartBar, HiTrophy, HiFire, HiAcademicCap } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

interface ActivityStatsProps {
  activityData?: {
    date: string;
    count: number;
    label?: string;
    isToday?: boolean; // Accept explicit isToday flag
  }[];
  viewMode?: 'full' | 'chart-only' | 'badges-only';
  noBackground?: boolean;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ activityData, viewMode = 'full', noBackground = false }) => {
  const hasRealData = activityData && activityData.length > 0;

  const { weeklyData } = useMemo(() => {
    if (!activityData || activityData.length === 0) {
        return { weeklyData: [], avgPerDay: 0 };
    }

    const weekly: { day: string; count: number; height: number; isToday: boolean }[] = [];
    let weekTotal = 0;
    
    // Find max value for scaling (at least 20 to avoid huge bars for small numbers)
    const maxVal = Math.max(20, ...activityData.map(d => d.count || 0));
    const daysMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    activityData.forEach((item) => {
        const count = item.count || 0;
        weekTotal += count;
        
        // Label logic
        let dayLabel = '';
        if (item.label) {
            dayLabel = item.label;
        } else {
            const date = new Date(item.date);
            dayLabel = daysMap[date.getDay()];
        }
        
        // isToday logic: Use prop if available, otherwise fallback to date check
        let isToday = false;
        if (item.isToday !== undefined) {
             isToday = item.isToday;
        } else {
             const todayStr = new Date().toISOString().split('T')[0];
             isToday = item.date.startsWith(todayStr);
        }

        weekly.push({
            day: dayLabel,
            count: count,
            height: Math.max(4, (count / maxVal) * 100), // Scale relative to max
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
    ? "h-full flex flex-col justify-between" 
    : "bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm h-full flex flex-col justify-between";

  const ChartSection = (
      <div className={containerClasses}>
        <div className={`flex items-center justify-between ${noBackground ? 'mb-2' : 'mb-3'}`}>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <HiChartBar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Hoạt động tuần qua
          </h3>
          {hasRealData && (
            <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              Tổng {weeklyData.reduce((acc, cur) => acc + cur.count, 0)} thẻ
            </span>
          )}
        </div>

        {!hasRealData ? <div className="py-8"><EmptyState /></div> : (
          <div className="relative h-48 mt-2 select-none w-full">
            {/* Background Grid Lines - Scale References */}
            <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-400 dark:text-slate-600 font-bold z-0 pointer-events-none pb-6 pl-1 pr-1">
               <div className="border-b border-dashed border-slate-100 dark:border-slate-700/50 w-full h-px relative flex items-end justify-end"><span className="-mb-3 bg-white dark:bg-slate-800 px-1 z-10">Max</span></div>
               <div className="border-b border-dashed border-slate-100 dark:border-slate-700/50 w-full h-px relative flex items-end justify-end"><span className="-mb-3 bg-white dark:bg-slate-800 px-1 z-10">Avg</span></div>
               <div className="border-b border-slate-100 dark:border-slate-700 w-full h-px box-border"></div>
            </div>

            {/* Bars Container */}
            <div className="absolute inset-0 flex items-end justify-between px-2 pt-6 pb-0 z-10 gap-2 sm:gap-3">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative">
                  
                  {/* Floating Tooltip/Value - Always visible for Today, Hover for others */}
                  <div className={`mb-1.5 text-[10px] font-bold transition-all duration-300 transform ${
                    d.isToday 
                      ? '-translate-y-0 opacity-100 text-blue-600 dark:text-blue-400' 
                      : 'translate-y-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-0 text-slate-500 dark:text-slate-300'
                  }`}>
                    {d.count}
                  </div>

                  {/* The Bar - Pure Flat Colors */}
                  <div 
                    className={`w-full max-w-[20px] sm:max-w-[28px] rounded-t-md transition-all duration-300 ease-out relative overflow-hidden ${
                      d.isToday 
                        ? 'bg-blue-600' 
                        : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-400 dark:group-hover:bg-blue-600'
                    }`}
                    style={{ height: `max(4px, ${d.height}%)` }}
                  ></div>

                  {/* Day Label */}
                  <span className={`text-[9px] sm:text-[10px] font-bold mt-2 uppercase tracking-wide transition-colors ${
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

  const BadgesSection = (
      <div className={noBackground ? "flex flex-col h-full" : "bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col h-full"}>
        <div className={`flex items-center justify-between ${noBackground ? 'mb-2' : 'mb-4'}`}>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <div className={`p-1.5 rounded-md text-yellow-600 dark:text-yellow-400 ${noBackground ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-yellow-50 dark:bg-yellow-500/10'}`}>
              <HiTrophy className="w-3.5 h-3.5" />
            </div>
            Huy hiệu & Thành tích
          </h3>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Xem tất cả</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Badge 1: Newbie - Unlocked 3D */}
          <div className="relative bg-white dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform text-white ring-2 ring-white dark:ring-slate-700">
               <HiBookOpen className="w-5 h-5 drop-shadow-md" />
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white mb-0.5">Tân binh</div>
            <div className="text-[8px] font-medium text-slate-500 dark:text-slate-400">19/01</div>
          </div>

          {/* Badge 2: Streak - Unlocked Metallic */}
          <div className="relative bg-white dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform text-white ring-2 ring-white dark:ring-slate-700">
               <HiFire className="w-5 h-5 drop-shadow-md" />
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white mb-0.5">Lửa thiêng</div>
            <div className="text-[8px] font-medium text-slate-500 dark:text-slate-400">21/01</div>
          </div>

          {/* Badge 3: Locked */}
          <div className="relative bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center opacity-70 contrast-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-1.5 shadow-inner">
               <HiAcademicCap className="w-5 h-5 text-slate-400" />
             </div>
             <div className="text-[10px] sm:text-[11px] font-bold text-slate-500">Bác học</div>
             <div className="text-[8px] text-slate-400 mt-0.5">1000 thẻ</div>
          </div>

           {/* Badge 4: Locked */}
           <div className="relative bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center opacity-70 contrast-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-1.5 shadow-inner">
               <HiTrophy className="w-5 h-5 text-slate-400" />
             </div>
             <div className="text-[10px] sm:text-[11px] font-bold text-slate-500">Vô địch</div>
             <div className="text-[8px] text-slate-400 mt-0.5">Top 1</div>
          </div>
        </div>

        {/* Level Stats Info - Enhanced */}
        <div className="mt-8 pt-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-900 dark:to-slate-900 rounded-xl p-6 text-white shadow-lg shadow-slate-900/20 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer border border-slate-200 dark:border-slate-700/50">
                {/* Decorative & Glossy Effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
                    <HiAcademicCap className="w-20 h-20" />
                </div>
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cấp độ hiện tại</div>
                        <div className="text-2xl font-black text-white flex items-center gap-2">
                           <span className="bg-blue-600 px-2 py-0.5 rounded text-sm align-middle shadow-lg shadow-blue-500/50">Lv.5</span>
                           Học giả
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">XP</div>
                        <div className="text-sm font-bold">1,240 <span className="text-slate-500 text-[10px]">/ 1,500</span></div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 bg-black/30 rounded-full overflow-hidden relative z-10 mb-3 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[82%] shadow-[0_0_15px_rgba(59,130,246,0.6)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 relative z-10">
                    <span>Tiếp theo: <b>Chuyên gia</b></span>
                    <span className="text-blue-400">Còn 260 XP</span>
                </div>
            </div>
        </div>
      </div>
  );

  if (viewMode === 'chart-only') return ChartSection;
  if (viewMode === 'badges-only') return BadgesSection;

  return (
    <div className="flex flex-col gap-6 h-full">
      {ChartSection}
      {BadgesSection}
    </div>
  );
};

export default ActivityStats;
