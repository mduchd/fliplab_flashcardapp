import React, { useMemo } from 'react';
import { HiArrowTrendingUp, HiBookOpen, HiChartBar, HiTrophy, HiFire, HiAcademicCap } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

interface ActivityStatsProps {
  // In the future, these would come from API
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
  // For now, simulate having no data (set to true to test empty state)
  const hasRealData = activityData && activityData.length > 0;
  
  // Generate mock data for demo purposes only when we have activity
  // In production, this would come from the API
  const { weeklyData, avgPerDay } = useMemo(() => {
    const today = new Date();
    const weeks = 16;
    const totalDays = weeks * 7;
    const heatmap = [];
    const weekly = [];
    
    // If no real data, return empty arrays
    if (!hasRealData) {
      // Generate empty heatmap
      for (let i = 0; i < totalDays; i++) {
        const date = subDays(today, totalDays - 1 - i);
        heatmap.push({ date, count: 0, level: 0 });
      }
      
      // Generate empty weekly data
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      for (let i = 0; i < 7; i++) {
        const date = subDays(today, 6 - i);
        weekly.push({
          day: days[date.getDay()],
          count: 0,
          height: 0,
        });
      }
      
      return { heatmapData: heatmap, weeklyData: weekly, avgPerDay: 0 };
    }

    // Generate demo data (simulating real activity)
    for (let i = 0; i < totalDays; i++) {
      const date = subDays(today, totalDays - 1 - i);
      const r = Math.random();
      let count = 0;
      if (r > 0.4) count = Math.floor(Math.random() * 5) + 1;
      if (r > 0.7) count = Math.floor(Math.random() * 15) + 5;
      if (r > 0.95) count = Math.floor(Math.random() * 30) + 20;
      
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 5) level = 2;
      if (count >= 15) level = 3;
      if (count >= 30) level = 4;

      heatmap.push({ date, count, level });
    }

    // Last 7 days bar chart data
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, 6 - i);
      const count = Math.floor(Math.random() * 35) + 5;
      weekTotal += count;
      weekly.push({
        day: days[date.getDay()],
        count,
        height: Math.max(15, Math.min(100, (count / 40) * 100)),
      });
    }

    return { 
      weeklyData: weekly, 
      avgPerDay: Math.round(weekTotal / 7)
    };
  }, [hasRealData]);

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
        <HiChartBar className="w-7 h-7 text-blue-500" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
        Chưa có hoạt động
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-xs font-medium">
        Hãy học 1 bộ thẻ để bắt đầu theo dõi thống kê của bạn
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
      >
        <HiBookOpen className="w-4 h-4" />
        Bắt đầu học
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Weekly Bar Chart - Taller & Better aligned */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-5 border border-slate-100 dark:border-white/5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-3 text-sm">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
              <HiArrowTrendingUp className="w-5 h-5" />
            </div>
            Hoạt động 7 ngày qua
          </h3>
          {hasRealData && avgPerDay > 0 && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">~{avgPerDay} thẻ/ngày</span>
          )}
        </div>

        {!hasRealData ? (
          <EmptyState />
        ) : (
          <div className="flex items-end justify-between h-28 gap-3 px-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group cursor-default">
                <div className="relative w-full flex flex-col items-center h-full justify-end">
                  <div
                    className="w-full max-w-[24px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-md transition-all duration-300 group-hover:scale-110 shadow-sm"
                    style={{ height: `${d.height}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-20 font-bold">
                      {d.count} thẻ
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-bold">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges & Achievements Showcase - Replaces Heatmap */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-4 border border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-3 text-sm">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
              <HiTrophy className="w-5 h-5" />
            </div>
            Huy hiệu & Thành tích
          </h3>
          <span className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400">Xem tất cả</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Badge 1: Newbie - Unlocked */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center gap-2 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 p-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform">
              <HiBookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Khởi đầu</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Tân binh</div>
            </div>
          </div>

          {/* Badge 2: Streak - Unlocked if streak > 3 */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center gap-2 shadow-sm group hover:-translate-y-1 transition-transform">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 mb-1 group-hover:scale-110 transition-transform">
              <HiFire className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Chuỗi 3+</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Lửa thiêng</div>
            </div>
          </div>

          {/* Badge 3: Master - Locked */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center gap-2 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 mb-1">
              <HiAcademicCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">1000 thẻ</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Bác học</div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded">Chưa đạt</span>
            </div>
          </div>

          {/* Badge 4: Special - Locked */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center gap-2 opacity-60 grayscale">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400 mb-1">
              <HiTrophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Top 1</div>
               <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Nhà vô địch</div>
            </div>
          </div>
        </div>

        {/* Next Milestone Progress */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
          <div className="flex justify-between text-xs font-bold mb-1.5">
             <span className="text-slate-700 dark:text-slate-300">Cấp độ tiếp theo: Lv.6</span>
             <span className="text-indigo-600 dark:text-indigo-400">340/500 XP</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 rounded-full w-[68%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
