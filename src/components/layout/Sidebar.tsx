
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { 
  HiHome, 
  HiPlusCircle, 
  HiUser, 
  HiCog6Tooth, 
  HiBookOpen, 
  HiFire,
  HiFlag,
  HiCheckBadge,
  HiFolderPlus,
  HiUserGroup,
  HiBell,
  HiPlus,
  HiClipboardDocumentList,
  HiDocumentPlus
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
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = React.useRef<HTMLButtonElement>(null);
  const menuDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        createMenuRef.current && !createMenuRef.current.contains(target) &&
        menuDropdownRef.current && !menuDropdownRef.current.contains(target)
      ) {
        setIsCreateMenuOpen(false);
      }
    };

    if (isCreateMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateMenuOpen]);

  // Streak state
  const [streak, setStreak] = useState(() => {
    // ... code truncated ...
    const streakData = localStorage.getItem('streakData');
    if (streakData) {
      try {
        const { currentStreak, lastStudyDate } = JSON.parse(streakData);
        const lastDate = new Date(lastStudyDate);
        const today = new Date();
        
        if (isSameDay(lastDate, today)) {
          return currentStreak;
        } else if (isYesterday(lastDate, today)) {
          return currentStreak;
        } else {
          return 0;
        }
      } catch (e) {
        return 0;
      }
    }
    return 0;
  });

  const [studiedToday, setStudiedToday] = useState(() => {
    const streakData = localStorage.getItem('streakData');
    if (streakData) {
      try {
        const { lastStudyDate } = JSON.parse(streakData);
        const lastDate = new Date(lastStudyDate);
        const today = new Date();
        return isSameDay(lastDate, today);
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  
  // Daily goal state
  const [dailyGoal] = useState(() => {
    const savedGoal = localStorage.getItem('settings_dailyGoal');
    return savedGoal ? parseInt(savedGoal) : 20;
  });

  const [todayProgress, setTodayProgress] = useState(() => {
    const progressData = localStorage.getItem('dailyProgress');
    if (progressData) {
      try {
        const { date, cardsStudied } = JSON.parse(progressData);
        const savedDate = new Date(date);
        const today = new Date();
        
        if (isSameDay(savedDate, today)) {
          return cardsStudied;
        } else {
          // If different day, we should technically reset, but we can't write to localStorage here easily.
          // Returning 0 is correct for display. The useEffect will handle the persistent reset if needed,
          // but for instant display, 0 is correct.
          return 0;
        }
      } catch (e) {
        return 0;
      }
    }
    return 0;
  });

  // Effect to handle day change resets if component stays mounted across days, 
  // or strictly to sync logic if needed, but primary load is now lazy.
  // We still need to check and reset 'dailyProgress' in localStorage if it's a new day
  // to ensure consistency for other components reading it.
  useEffect(() => {
    // Check daily progress expiry
    const progressData = localStorage.getItem('dailyProgress');
    if (progressData) {
      const { date } = JSON.parse(progressData);
      const savedDate = new Date(date);
      const today = new Date();
      
      if (!isSameDay(savedDate, today)) {
        // Reset progress for new day
        localStorage.setItem('dailyProgress', JSON.stringify({
          date: today.toISOString(),
          cardsStudied: 0
        }));
        // setTodayProgress(0); // Already initialized to 0 by lazy init logic
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
          md:translate-x-0 flex flex-col overflow-y-auto p-3
          scrollbar-hide
        `}
      >
        
        {/* Main Navigation */}
        <div className={`mb-6 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
          <div className={`h-6 flex items-center mb-2 px-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100'}`}>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Menu
            </p>
          </div>

          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiHome className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Trang chủ</span>}
          </NavLink>

          {/* Create Menu Button */}
          <div className="relative">
            <button
              ref={createMenuRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateMenuOpen(!isCreateMenuOpen);
              }}
              className={
                isCollapsed
                  ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${isCreateMenuOpen ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`
                  : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden w-full text-left cursor-pointer ${isCreateMenuOpen ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`
              }
            >
              <HiPlus className="w-6 h-6 flex-shrink-0" />
              {!isCollapsed && <span>Tạo mới</span>}
            </button>
          </div>

          {/* Dropdown Menu - Rendered via Portal to avoid overflow issues */}
          {isCreateMenuOpen && createMenuRef.current && ReactDOM.createPortal(
            <div
              ref={menuDropdownRef} 
              className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-60"
              style={{
                top: `${createMenuRef.current.getBoundingClientRect().top}px`,
                left: `${createMenuRef.current.getBoundingClientRect().right + 8}px`
              }}
            >
              <button
                onClick={() => {
                  navigate('/create');
                  setIsCreateMenuOpen(false);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors cursor-pointer"
              >
                <HiPlusCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Bộ thẻ mới</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tạo bộ flashcard để học</p>
                </div>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2" />
              <button
                onClick={() => {
                  navigate('/create-folder');
                  setIsCreateMenuOpen(false);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors cursor-pointer"
              >
                <HiFolderPlus className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Thư mục mới</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tổ chức các bộ thẻ</p>
                </div>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2" />
              <button
                onClick={() => {
                  navigate('/quiz/create');
                  setIsCreateMenuOpen(false);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors cursor-pointer"
              >
                <HiDocumentPlus className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Quiz mới</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tạo bài kiểm tra tự động chấm</p>
                </div>
              </button>
            </div>,
            document.body
          )}

          <NavLink
            to="/groups"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiUserGroup className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Nhóm học tập</span>}
          </NavLink>

          <NavLink
            to="/notifications"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiBell className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Thông báo</span>}
          </NavLink>

          {/* Quiz Link - matches all quiz routes */}
          <button
            onClick={() => {
              navigate('/quiz');
              setMobileOpen(false);
            }}
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${
                    location.pathname === '/quiz'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden w-full text-left cursor-pointer ${
                    location.pathname === '/quiz'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiClipboardDocumentList className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Quiz của tôi</span>}
          </button>

          {/* Join Quiz Link - for students */}
          <button
            onClick={() => {
              navigate('/quiz/join');
              setMobileOpen(false);
            }}
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${
                    location.pathname === '/quiz/join'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden w-full text-left cursor-pointer ${
                    location.pathname === '/quiz/join'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiPlusCircle className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Tham gia Quiz</span>}
          </button>

          {/* Library Link */}
          <button
            onClick={() => { handleLibraryClick('library'); setMobileOpen(false); }}
            className={
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all ${
                    location.pathname === '/' && !location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
                    location.pathname === '/' && !location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiBookOpen className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Thư viện của tôi</span>}
          </button>
        </div>

        {/* Unified Widgets Section - Modern Clean Design */}
        <div className={`mb-6 ${isCollapsed ? 'space-y-3 px-1' : 'space-y-3'}`}>
          
          {/* Streak Card */}
          <div 
            onClick={() => {
              navigate('/');
              setMobileOpen(false);
            }}
            className={`
              relative overflow-hidden transition-all duration-300 group cursor-pointer
              ${isCollapsed 
                ? `w-10 h-10 mx-auto rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border shadow-sm ${studiedToday ? 'border-amber-100 dark:border-amber-900/30' : 'border-slate-200 dark:border-slate-700'}`
               : `bg-white dark:bg-slate-800 rounded-lg p-3 border shadow-sm hover:bg-slate-50 dark:hover:bg-white/[0.03] ${studiedToday ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}
            `}
          >
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
                ? 'w-10 h-10 mx-auto rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 shadow-sm' 
                : 'bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-white/[0.03]'}
            `}
          >
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

        {/* Bottom Section - Profile & Settings */}
        <div className={`flex-1 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
          {/* Profile Link */}
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiUser className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Hồ sơ</span>}
          </NavLink>

          {/* Settings Link */}
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
