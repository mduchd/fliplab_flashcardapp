import React, { useMemo } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const ActivityStats: React.FC = () => {
  // Generate mock data: 16 weeks * 7 days = 112 days for heatmap
  const heatmapData = useMemo(() => {
    const today = new Date();
    const weeks = 16;
    const totalDays = weeks * 7;
    const data = [];

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

      data.push({ date, count, level });
    }
    return data;
  }, []);

  // Last 7 days bar chart data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      const count = Math.floor(Math.random() * 35) + 5;
      return {
        day: days[date.getDay()],
        count,
        height: Math.max(15, Math.min(100, (count / 40) * 100)),
      };
    });
  }, []);

  const getColor = (level: number) => {
    const colors = [
      'bg-slate-100 dark:bg-white/5',
      'bg-green-200 dark:bg-green-900/50',
      'bg-green-300 dark:bg-green-700/70',
      'bg-green-400 dark:bg-green-600',
      'bg-green-500 dark:bg-green-500',
    ];
    return colors[level];
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Weekly Bar Chart */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-purple-500" />
            Hoạt động 7 ngày qua
          </h3>
          <span className="text-xs text-slate-400">~20 thẻ/ngày</span>
        </div>

        <div className="flex items-end justify-between h-20 gap-2">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex flex-col items-center flex-1 group cursor-default">
              <div className="relative w-full flex flex-col items-center h-full justify-end">
                <div
                  className="w-full max-w-[20px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-md transition-all duration-300 group-hover:scale-110"
                  style={{ height: `${d.height}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-20 font-bold">
                    {d.count} thẻ
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Heatmap */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-green-500" />
            Lịch sử hoạt động
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            Ít
            {[0, 1, 2, 3, 4].map((l) => (
              <div key={l} className={`w-2.5 h-2.5 rounded-sm ${getColor(l)}`}></div>
            ))}
            Nhiều
          </div>
        </div>

        <div className="grid grid-rows-7 grid-flow-col gap-[3px] w-full overflow-x-auto">
          {heatmapData.map((d, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${getColor(d.level)} relative group transition-transform hover:scale-150 hover:z-10 cursor-pointer`}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity whitespace-nowrap z-20">
                {d.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}: {d.count} thẻ
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
