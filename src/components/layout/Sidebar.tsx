
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
  HiFolderPlus,
  HiUserGroup,
  HiBell,
  HiPlus,
  HiClipboardDocumentList,
  HiDocumentPlus,
  HiRocketLaunch
} from 'react-icons/hi2';


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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
                  ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${isCreateMenuOpen ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`
                  : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden w-full text-left cursor-pointer ${isCreateMenuOpen ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`
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
                top: `${createMenuRef.current.getBoundingClientRect().top - 8}px`,
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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden w-full text-left cursor-pointer ${
                    location.pathname === '/quiz'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium whitespace-nowrap overflow-hidden w-full text-left cursor-pointer ${
                    location.pathname === '/quiz/join'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiRocketLaunch className="w-6 h-6 flex-shrink-0" />
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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
                    location.pathname === '/' && !location.search.includes('filter=recent')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
            }
          >
            <HiBookOpen className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && <span>Thư viện của tôi</span>}
          </button>
          {/* Profile Link */}
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isCollapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                : `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-left cursor-pointer ${
                    location.pathname === '/settings'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
