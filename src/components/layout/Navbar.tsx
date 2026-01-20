import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User, LogOut, Zap, Menu, ChevronDown, Sun, Moon, Plus } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10 h-16 transition-colors duration-300 dark:bg-slate-900/80 bg-white/80 dark:border-white/10 border-slate-200">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full gap-4">
          
          {/* LEFT: Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden">
              <Menu size={24} />
            </button>
            
            <Link to="/" className="flex items-center gap-2 group min-w-fit">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-shadow">
                <Zap className="text-white" size={24} fill="currentColor" />
              </div>
              <span className="hidden sm:block text-2xl font-black tracking-wider font-logo bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-600 dark:from-purple-400 dark:via-indigo-300 dark:to-indigo-400 group-hover:scale-105 transition-all duration-300">
                FlipLab
              </span>
            </Link>
          </div>

          {/* CENTER: Search Bar & Theme Toggle */}
          <div className="flex-1 max-w-2xl px-4 flex items-center gap-6">
            <div className="relative group w-full">
              <input
                type="text"
                className="block w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl leading-5 text-slate-900 dark:text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 active:bg-white dark:active:bg-slate-900 ml-4 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
                placeholder="Tìm kiếm..."
              />
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all focus:outline-none flex-shrink-0 border border-slate-200 dark:border-white/10"
              title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* RIGHT: Actions & User Menu */}
          <div className="flex items-center gap-4 min-w-fit justify-end">
            
            {/* Create New Button */}
            <Link 
              to="/create"
              className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-500 hover:to-indigo-500 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
              title="Tạo bộ thẻ mới"
            >
              <Plus size={20} />
            </Link>

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
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 font-medium group-hover:border-purple-500 transition-colors shadow-sm">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5 z-50">
                  <div className="p-2 border-b border-slate-100 dark:border-white/5 sm:hidden">
                    <p className="text-slate-900 dark:text-white font-medium text-sm px-2">{user?.displayName}</p>
                    <p className="text-slate-500 text-xs px-2">@{user?.username}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 transition-colors mx-1 rounded-lg"
                    >
                      <User size={16} />
                      Hồ sơ của bạn
                    </Link>
                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mx-1 rounded-lg"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
