import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  User, 
  Settings, 
  Library, 
  History,
  Flame,
  Target,
  Star,
  TrendingUp
} from 'lucide-react';

// Helper to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

// Helper to check if date1 is yesterday relative to date2
const isYesterday = (date1: Date, date2: Date) => {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  
  // Streak state
  const [streak, setStreak] = useState(0);
  const [studiedToday, setStudiedToday] = useState(false);
  
  // Daily goal state
  const [dailyGoal, setDailyGoal] = useState(20);
  const [todayProgress, setTodayProgress] = useState(0);

  // Load streak and daily goal data from localStorage
  useEffect(() => {
    // Load daily goal setting
    const savedGoal = localStorage.getItem('settings_dailyGoal');
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal));
    }

    // Load streak data
    const streakData = localStorage.getItem('streakData');
    if (streakData) {
      const { currentStreak, lastStudyDate } = JSON.parse(streakData);
      const lastDate = new Date(lastStudyDate);
      const today = new Date();
      
      if (isSameDay(lastDate, today)) {
        // Studied today - keep streak
        setStreak(currentStreak);
        setStudiedToday(true);
      } else if (isYesterday(lastDate, today)) {
        // Studied yesterday - streak continues but needs study today
        setStreak(currentStreak);
        setStudiedToday(false);
      } else {
        // Streak broken
        setStreak(0);
        setStudiedToday(false);
      }
    }

    // Load today's progress
    const progressData = localStorage.getItem('dailyProgress');
    if (progressData) {
      const { date, cardsStudied } = JSON.parse(progressData);
      const savedDate = new Date(date);
      const today = new Date();
      
      if (isSameDay(savedDate, today)) {
        setTodayProgress(cardsStudied);
      } else {
        // Reset progress for new day
        setTodayProgress(0);
        localStorage.setItem('dailyProgress', JSON.stringify({
          date: today.toISOString(),
          cardsStudied: 0
        }));
      }
    }
  }, []);

  // Listen for study events (custom event from Study page)
  useEffect(() => {
    const handleStudyComplete = (event: CustomEvent) => {
      const { cardsStudied } = event.detail;
      
      // Update progress
      const newProgress = todayProgress + cardsStudied;
      setTodayProgress(newProgress);
      localStorage.setItem('dailyProgress', JSON.stringify({
        date: new Date().toISOString(),
        cardsStudied: newProgress
      }));

      // Update streak if not studied today yet
      if (!studiedToday) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setStudiedToday(true);
        localStorage.setItem('streakData', JSON.stringify({
          currentStreak: newStreak,
          lastStudyDate: new Date().toISOString()
        }));
      }
    };

    window.addEventListener('studyComplete', handleStudyComplete as EventListener);
    return () => {
      window.removeEventListener('studyComplete', handleStudyComplete as EventListener);
    };
  }, [streak, studiedToday, todayProgress]);
  
  const links = [
    { to: '/', label: 'Trang chủ', icon: Home },
    { to: '/create', label: 'Tạo bộ thẻ', icon: PlusCircle },
    { to: '/profile', label: 'Hồ sơ', icon: User },
  ];

  const handleLibraryClick = (action: 'library' | 'recent' | 'settings') => {
    switch (action) {
      case 'library':
        navigate('/');
        break;
      case 'recent':
        navigate('/?filter=recent');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const goalPercentage = Math.min((todayProgress / dailyGoal) * 100, 100);
  const goalCompleted = todayProgress >= dailyGoal;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-white/10 p-4 hidden md:flex flex-col z-40 transition-colors duration-300">
      
      {/* Main Navigation - First */}
      <div className="space-y-1 mb-6">
        <p className="px-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Menu</p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-300'
                  : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`
            }
          >
            <link.icon size={20} />
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Streak & Daily Goal Widgets */}
      <div className="space-y-3 mb-6">
        {/* Streak Widget */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-3 border border-orange-100 dark:border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${streak > 0 ? 'bg-orange-500 text-white' : 'bg-orange-200 dark:bg-orange-800 text-orange-600 dark:text-orange-300'}`}>
                <Flame size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chuỗi ngày</p>
                <p className="font-bold text-slate-900 dark:text-white">{streak} ngày</p>
              </div>
            </div>
            {streak >= 7 && (
              <div className="flex items-center gap-1 text-orange-500">
                <Star size={14} fill="currentColor" />
              </div>
            )}
          </div>
          {!studiedToday && streak > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Học hôm nay để giữ streak!
            </p>
          )}
        </div>

        {/* Daily Goal Widget */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-3 border border-purple-100 dark:border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${goalCompleted ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'}`}>
                <Target size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mục tiêu hôm nay</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {todayProgress}/{dailyGoal} thẻ
                </p>
              </div>
            </div>
            {goalCompleted && (
              <div className="text-green-500">
                <TrendingUp size={18} />
              </div>
            )}
          </div>
          {/* Progress Bar */}
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                goalCompleted 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
          {goalCompleted && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
              🎉 Hoàn thành mục tiêu!
            </p>
          )}
        </div>
      </div>

      {/* Library Section */}
      <div className="space-y-1 flex-1">
        <p className="px-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Thư viện</p>
        <button
          onClick={() => handleLibraryClick('library')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all font-medium text-left"
        >
          <Library size={20} />
          Thư viện của tôi
        </button>
        <button
          onClick={() => handleLibraryClick('recent')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all font-medium text-left"
        >
          <History size={20} />
          Đã học gần đây
        </button>
        <button
          onClick={() => handleLibraryClick('settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all font-medium text-left"
        >
          <Settings size={20} />
          Cài đặt
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
