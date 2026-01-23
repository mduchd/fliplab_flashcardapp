import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { 
  HiUser, 
  HiArrowRightOnRectangle, 
  HiBolt, 
  HiBars3, 
  HiChevronDown, 
  HiSun, 
  HiMoon, 
  HiPlus,
  HiXMark,
  HiMagnifyingGlass,
  HiFolderPlus,
  HiSquare2Stack
} from 'react-icons/hi2';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, isMobileOpen, setMobileOpen } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10 h-16 transition-colors duration-300 dark:bg-slate-900/80 bg-white/80 dark:border-white/10 border-slate-200">
      <div className="w-full h-full flex items-center">
        
        {/* LEFT: Menu Toggle - Fixed width to match sidebar */}
        <div className="hidden md:flex items-center justify-center w-[72px] h-full flex-shrink-0">
          <button 
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-900 dark:text-white dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95 group"
          >
            <HiBars3 className="w-6 h-6 stroke-2" style={{ strokeWidth: "2" }} />
          </button>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileOpen(!isMobileOpen)}
          className="p-2 ml-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all md:hidden"
        >
          {isMobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
        </button>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group min-w-fit ml-4 md:ml-0">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
            <HiBolt className="w-6 h-6 text-white" />
          </div>
          <span className="hidden sm:block text-2xl font-black tracking-wider font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 group-hover:scale-105 transition-all duration-300">
            FlipLab
          </span>
        </Link>

        {/* Left Spacer */}
        <div className="flex-1"></div>

        {/* CENTER: Search Bar & Theme Toggle */}
        <div className="max-w-2xl px-4 flex items-center gap-4">
          <div className="relative group w-[480px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="h-5 w-5 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg leading-5 text-slate-900 dark:text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="Tìm kiếm..."
            />
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="group/theme p-2.5 bg-white dark:bg-white/5 text-slate-500 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none flex-shrink-0 border border-slate-200 dark:border-white/10 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <div className="relative w-5 h-5">
              <div className={`absolute inset-0 transform transition-transform duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}>
                <HiSun className="w-5 h-5" />
              </div>
              <div className={`absolute inset-0 transform transition-transform duration-500 ${theme === 'dark' ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                <HiMoon className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>

        {/* Right Spacer */}
        <div className="flex-1"></div>

        {/* RIGHT: Actions & User Menu */}
        <div className="flex items-center gap-4 min-w-fit justify-end pr-4">
          
          {/* Create New Button */}
          {/* Create Menu Dropdown */}
          <div className="relative" ref={createMenuRef}>
            <button 
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className={`p-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center ${isCreateMenuOpen ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''}`}
            >
              <HiPlus className={`w-5 h-5 transition-transform duration-200 ${isCreateMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {isCreateMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-1">
                  <Link
                    to="/create"
                    onClick={() => setIsCreateMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors"
                  >
                    <HiSquare2Stack className="w-5 h-5 text-blue-500" />
                    Tạo bộ thẻ
                  </Link>
                  <button
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      navigate('/?tab=folders&create=true');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors text-left"
                  >
                    <HiFolderPlus className="w-5 h-5 text-blue-500" />
                    Tạo thư mục
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-slate-700 dark:text-white font-medium text-sm">{user?.displayName}</p>
            <p className="text-slate-500 text-xs">@{user?.username}</p>
          </div>

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 group focus:outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 font-medium transition-colors">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5 z-50">
                <div className="p-3 border-b border-slate-100 dark:border-white/10 sm:hidden">
                  <p className="text-slate-900 dark:text-white font-semibold text-base px-2">{user?.displayName}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm px-2">@{user?.username}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg font-medium"
                  >
                    <HiUser className="w-5 h-5" />
                    Hồ sơ của bạn
                  </Link>
                  <div className="h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-lg cursor-pointer font-semibold"
                  >
                    <HiArrowRightOnRectangle className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
