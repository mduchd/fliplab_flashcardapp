import React, { useMemo } from 'react';
import { HiArrowTrendingUp, HiBookOpen, HiChartBar, HiTrophy, HiFire, HiAcademicCap, HiSparkles } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

interface ActivityStatsProps {
  activityData?: {
    date: string;
    count: number;
  }[];
}

const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const ActivityStats: React.FC<ActivityStatsProps> = ({ activityData }) => {
  const hasRealData = activityData && activityData.length > 0;
  
  const { weeklyData, avgPerDay } = useMemo(() => {
    const today = new Date();
    const weekly = [];
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    let weekTotal = 0;
    
    // Generate clearer "peaks and valleys" data
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, 6 - i);
      // Weekend dip, Mid-week peak logic simulation
      const dayIndex = date.getDay();
      let baseCount = 5;
      if (dayIndex >= 1 && dayIndex <= 4) baseCount = 20 + Math.random() * 15; // Weekdays high
      if (dayIndex === 0 || dayIndex === 6) baseCount = 5 + Math.random() * 5; // Weekends low
      
      const count = Math.floor(baseCount);
      weekTotal += count;
      
      weekly.push({
        day: days[dayIndex],
        count,
        height: Math.max(10, Math.min(100, (count / 40) * 100)),
        isPeak: count > 25,
        isToday: i === 6
      });
    }

    return { 
      weeklyData: weekly, 
      avgPerDay: Math.round(weekTotal / 7)
    };
  }, [hasRealData]);

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

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Weekly Chart - Simple 7 Columns */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-md text-blue-600 dark:text-blue-400">
              <HiArrowTrendingUp className="w-4 h-4" />
            </div>
            Hoạt động tuần qua
          </h3>
          {hasRealData && avgPerDay > 0 && (
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-600 dark:text-slate-300">
              ~{avgPerDay} thẻ/ngày
            </span>
          )}
        </div>

        {!hasRealData ? <EmptyState /> : (
          <div className="flex items-end justify-between h-32 gap-3 mt-4 px-2 pb-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none transition-all z-20 font-bold whitespace-nowrap mb-1">
                  {d.count} thẻ
                </div>

                {/* Simple Bar */}
                <div 
                  className={`w-full max-w-[16px] rounded-t-sm transition-all duration-300 ${
                    d.isToday 
                      ? 'bg-blue-500 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-blue-300 dark:hover:bg-blue-600/50'
                  }`}
                  style={{ height: `${d.height}%` }}
                ></div>

                {/* Day Label */}
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${d.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <div className="p-1.5 bg-yellow-50 dark:bg-yellow-500/10 rounded-md text-yellow-600 dark:text-yellow-400">
              <HiTrophy className="w-4 h-4" />
            </div>
            Huy hiệu & Thành tích
          </h3>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Xem tất cả</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Badge 1: Newbie - Unlocked 3D */}
          <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group flex flex-col items-center text-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform text-white ring-2 ring-white dark:ring-slate-700">
               <HiBookOpen className="w-5 h-5 drop-shadow-md" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Tân binh</div>
            <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Đạt ngày 19/01/2026</div>
          </div>

          {/* Badge 2: Streak - Unlocked Metallic */}
          <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group flex flex-col items-center text-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform text-white ring-2 ring-white dark:ring-slate-700">
               <HiFire className="w-5 h-5 drop-shadow-md" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Lửa thiêng</div>
            <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Đạt ngày 21/01/2026</div>
          </div>

          {/* Badge 3: Locked */}
          <div className="relative bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center opacity-70 contrast-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-1.5 shadow-inner">
               <HiAcademicCap className="w-5 h-5 text-slate-400" />
             </div>
             <div className="text-[11px] font-bold text-slate-500">Bác học</div>
             <div className="text-[8px] text-slate-400 mt-0.5">Yêu cầu: 1000 thẻ</div>
          </div>

           {/* Badge 4: Locked */}
           <div className="relative bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center opacity-70 contrast-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-1.5 shadow-inner">
               <HiTrophy className="w-5 h-5 text-slate-400" />
             </div>
             <div className="text-[11px] font-bold text-slate-500">Vô địch</div>
             <div className="text-[8px] text-slate-400 mt-0.5">Yêu cầu: Top 1</div>
          </div>
        </div>

        {/* REPLACED: Level Progress -> Informative Text Stats */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 mt-auto">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tiến độ cấp độ</span>
             </div>
             <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Lv.5 Học giả</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <HiSparkles className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-xs text-slate-500 dark:text-slate-400">Gần đạt cấp mới</div>
                   <div className="text-sm font-bold text-slate-800 dark:text-white">Còn <span className="text-blue-600 dark:text-blue-400">160 XP</span></div>
                </div>
             </div>
             
             <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
             
             <div className="flex flex-col">
                <div className="text-[10px] font-bold text-green-600 dark:text-green-400">+45 XP hôm nay</div>
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400">+320 XP tuần này</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
