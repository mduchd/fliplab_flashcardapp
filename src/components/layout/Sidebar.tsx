
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
  HiCheckBadge
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

  // Listen for incremental study events
  useEffect(() => {
    const handleCardStudied = () => {
      // Update progress
      const newProgress = todayProgress + 1;
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

    window.addEventListener('cardStudied', handleCardStudied);
    return () => {
      window.removeEventListener('cardStudied', handleCardStudied);
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
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Menu
            </p>
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isCollapsed
                  ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`
                  : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`
              }
            >
              <link.icon className="w-6 h-6 flex-shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Unified Widgets Section - Modern Clean Design */}
        <div className={`mb-6 ${isCollapsed ? 'space-y-3 px-1' : 'space-y-3'}`}>
          
          {/* Streak Card */}
          <div 
            className={`
              relative overflow-hidden transition-all duration-300 group cursor-pointer
              ${isCollapsed 
                ? `w-10 h-10 mx-auto rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md ${studiedToday ? 'border-amber-100 dark:border-amber-900/30 hover:border-amber-300' : 'border-slate-200 dark:border-slate-700'}`
               : `bg-white dark:bg-slate-800 rounded-xl p-3 border shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${studiedToday ? 'border-slate-200 dark:border-slate-700 hover:shadow-amber-500/10 hover:border-amber-200 dark:hover:border-amber-700/50' : 'border-slate-200 dark:border-slate-700'}`}
            `}
          >
            {!isCollapsed && studiedToday && <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-xl -mr-2 -mt-2 pointer-events-none transition-all group-hover:bg-amber-500/20 duration-500"></div>}

            {isCollapsed ? (
              <HiFire className={`w-5 h-5 transition-transform group-hover:scale-110 ${studiedToday ? 'text-amber-500' : 'text-slate-400'}`} />
            ) : (
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-white shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${studiedToday ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <HiFire className={`w-6 h-6 ${studiedToday ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 transition-colors ${studiedToday ? 'text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>Chuỗi ngày</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                    {streak} <span className="text-xs font-semibold text-slate-400">ngày</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Streak Hint */}
            {!isCollapsed && !studiedToday && (
              <div className="mt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600 inline-flex items-center gap-1.5 w-full justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                 <HiFire className="w-3 h-3 text-slate-400" /> Học ngay để giữ chuỗi!
              </div>
            )}
          </div>

          {/* Daily Goal Card */}
          <div 
            className={`
              relative overflow-hidden transition-all duration-300 group cursor-pointer
              ${isCollapsed 
                ? 'w-10 h-10 mx-auto rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50' 
                : 'bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-700/50 hover:-translate-y-0.5'}
            `}
          >
            {!isCollapsed && <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-xl -mr-2 -mt-2 pointer-events-none transition-all group-hover:bg-blue-500/20 duration-500"></div>}

            {isCollapsed ? (
              <HiFlag className={`w-5 h-5 transition-transform group-hover:scale-110 ${goalCompleted ? 'text-green-500' : 'text-blue-500'}`} />
            ) : (
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-white shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${goalCompleted ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {goalCompleted ? <HiCheckBadge className="w-5 h-5" /> : <HiFlag className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Mục tiêu ngày</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                      {todayProgress}<span className="text-slate-300 mx-0.5 text-sm">/</span>{dailyGoal}
                    </div>
                  </div>
                </div>
                
                {/* Modern Thin Progress Bar */}
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden w-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      goalCompleted 
                        ? 'bg-green-500' 
                        : 'bg-blue-500 group-hover:brightness-110'
                    }`}
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
                
                {goalCompleted && (
                  <div className="mt-2 text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center justify-end gap-1 group-hover:scale-105 transition-transform origin-right">
                    <HiCheckBadge className="w-3 h-3" /> Đã hoàn thành!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Library Section */}
        <div className={`flex-1 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
          <button
            onClick={() => { handleLibraryClick('library'); setMobileOpen(false); }}
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all ${
                    location.pathname === '/' && !location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
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
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all ${
                    location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
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
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all ${
                    location.pathname === '/settings'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
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
