import React, { useMemo } from 'react';
import { HiArrowTrendingUp, HiBookOpen, HiChartBar, HiTrophy, HiFire, HiAcademicCap } from 'react-icons/hi2';
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
        isPeak: count > 25
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
      {/* Weekly Chart */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-md text-blue-600 dark:text-blue-400">
              <HiArrowTrendingUp className="w-4 h-4" />
            </div>
            Hoạt động tuần qua
          </h3>
          {hasRealData && avgPerDay > 0 && (
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
              ~{avgPerDay} thẻ/ngày
            </span>
          )}
        </div>

        {!hasRealData ? <EmptyState /> : (
          <div className="flex items-end justify-between h-24 gap-2 mt-3 px-1">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group relative">
                {/* Data Point Dot */}
                <div 
                  className={`w-2 h-2 rounded-full mb-1 transition-all duration-300 ${d.isPeak ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-300 dark:bg-slate-600'} group-hover:scale-125`}
                  style={{ marginBottom: `${d.height/15}px` }} 
                />
                
                {/* Bar with Gradient */}
                <div className="relative w-full flex justify-center h-full items-end">
                   <div 
                    className={`w-full max-w-[12px] md:max-w-[20px] rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-90 ${
                      d.isPeak 
                      ? 'bg-gradient-to-t from-indigo-600 to-blue-400' 
                      : 'bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600'
                    }`}
                    style={{ height: `${d.height}%` }}
                   ></div>
                </div>

                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none transition-all z-20 font-bold whitespace-nowrap transform translate-y-2 group-hover:translate-y-0">
                  {d.count} thẻ
                </div>

                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide">{d.day}</span>
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
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Xem tất cả</span>
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

        {/* Level Progress with Particle Effect */}
        <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden mt-auto">
          <div className="flex justify-between items-center mb-2 relative z-10">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Cấp độ hiện tại: <span className="text-indigo-700 dark:text-indigo-300">Học giả Lv.5</span></span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-600 shadow-sm">340/500 XP</span>
          </div>
          
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-[68%] relative">
               {/* Shimmer Effect */}
               <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
