
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { 
  HiHome, 
  HiPlusCircle, 
  HiUser, 
  HiCog6Tooth, 
  HiBookOpen, 
  HiClock,
  HiFire,
  HiFlag,
  HiStar,
  HiArrowTrendingUp
} from 'react-icons/hi2';

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
  const location = useLocation();
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar();
  
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
    { to: '/', label: 'Trang chủ', icon: HiHome },
    { to: '/create', label: 'Tạo bộ thẻ', icon: HiPlusCircle },
    { to: '/profile', label: 'Hồ sơ', icon: HiUser },
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
    <>
      {/* Mobile Overlay - with smooth fade */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ease-out ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar - Fix layout inconsistencies */}
      <aside 
        className={`
          fixed left-0 top-16 bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-white/10 z-40 
          transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          will-change-[width]
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 flex flex-col overflow-hidden p-3
        `}
      >
        
        {/* Main Navigation */}
        <div className={`mb-6 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
          <div className={`h-6 flex items-center mb-2 px-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100'}`}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Menu
            </p>
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              title={link.label}
              className={({ isActive }) =>
                isCollapsed
                  ? `flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`
                  : `flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium whitespace-nowrap overflow-hidden ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`
              }
            >
              <link.icon className="w-6 h-6 flex-shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Unified Widgets Section */}
        <div className={`mb-6 ${isCollapsed ? 'space-y-2' : 'space-y-2'}`}>
          {/* Streak Widget */}
          <div 
            className={`
              rounded-xl transition-all duration-300 overflow-hidden cursor-pointer
              ${isCollapsed 
                ? 'flex items-center justify-center w-10 h-10 mx-auto hover:bg-slate-100 dark:hover:bg-white/5' 
                : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 p-3 border border-orange-100 dark:border-orange-500/20'}
            `}
            title={isCollapsed ? `Chuỗi: ${streak} ngày` : undefined}
          >
            {/* Collapsed: Just icon */}
            {isCollapsed ? (
              <HiFire className={`w-6 h-6 ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${streak > 0 ? 'bg-orange-500 text-white' : 'bg-orange-200 dark:bg-orange-800 text-orange-600 dark:text-orange-300'}`}>
                    <HiFire className="w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Chuỗi ngày</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate">{streak} ngày</p>
                      </div>
                      {streak >= 7 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <HiStar className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!studiedToday && streak > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 whitespace-nowrap">
                    Học hôm nay để giữ streak!
                  </p>
                )}
              </>
            )}
          </div>

          {/* Daily Goal Widget */}
          <div 
            className={`
              rounded-xl transition-all duration-300 overflow-hidden cursor-pointer
              ${isCollapsed 
                ? 'flex items-center justify-center w-10 h-10 mx-auto hover:bg-slate-100 dark:hover:bg-white/5' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-3 border border-blue-100 dark:border-blue-500/20'}
            `}
            title={isCollapsed ? `Mục tiêu: ${todayProgress}/${dailyGoal} thẻ` : undefined}
          >
            {/* Collapsed: Just icon */}
            {isCollapsed ? (
              <HiFlag className={`w-6 h-6 ${goalCompleted ? 'text-green-500' : 'text-blue-500'}`} />
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${goalCompleted ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                    <HiFlag className="w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Mục tiêu hôm nay</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {todayProgress}/{dailyGoal} thẻ
                        </p>
                      </div>
                      {goalCompleted && (
                        <div className="text-green-500">
                          <HiArrowTrendingUp className="w-[18px] h-[18px]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      goalCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
                {goalCompleted && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium whitespace-nowrap">
                    🎉 Hoàn thành mục tiêu!
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Library Section */}
        <div className={`flex-1 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
          <button
            onClick={() => { handleLibraryClick('library'); setMobileOpen(false); }}
            title="Thư viện của tôi"
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all ${
                    location.pathname === '/' && !location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-left ${
                    location.pathname === '/' && !location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiBookOpen className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Thư viện của tôi</span>}
          </button>
          <button
            onClick={() => { handleLibraryClick('recent'); setMobileOpen(false); }}
            title="Đã học gần đây"
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all ${
                    location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-left ${
                    location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiClock className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Đã học gần đây</span>}
          </button>
          <button
            onClick={() => { handleLibraryClick('settings'); setMobileOpen(false); }}
            title="Cài đặt"
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all ${
                    location.pathname === '/settings'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-left ${
                    location.pathname === '/settings'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiCog6Tooth className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Cài đặt</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
