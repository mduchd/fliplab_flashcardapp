import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import Avatar from '../Avatar';
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
  HiSquare2Stack,
  HiArrowPath,
  HiClock
} from 'react-icons/hi2';
import { FlashcardSet, flashcardService } from '../../services/flashcardService';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, isMobileOpen, setMobileOpen } = useSidebar();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FlashcardSet[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [defaultSuggestions, setDefaultSuggestions] = useState<FlashcardSet[]>([]);
  const searchTimeout = useRef<any>();

  // Load default suggestions (unlearned or recently created cards)
  const loadDefaultSuggestions = async () => {
    try {
      const res = await flashcardService.getAll();
      if (res.success) {
        // Sort by: never studied first, then by newest
        const sorted = res.data.flashcardSets
          .sort((a, b) => {
            const aStudied = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
            const bStudied = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
            
            // Priority: Never studied (0) comes first
            if (aStudied === 0 && bStudied !== 0) return -1;
            if (aStudied !== 0 && bStudied === 0) return 1;
            
            // If both studied or both not studied, sort by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, 5);
        setDefaultSuggestions(sorted);
      }
    } catch (error) {
      console.error('Failed to load default suggestions', error);
    }
  };

  // Save search to history
  const addToSearchHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...searchHistory.filter(q => q !== trimmed)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length >= 1) {
      setIsSearching(true);
      setShowSuggestions(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await flashcardService.getAll(value);
          if (res.success) {
            // Smart sorting by relevance
            const sorted = res.data.flashcardSets.slice(0, 10).sort((a, b) => {
              const query = value.toLowerCase();
              const aName = a.name.toLowerCase();
              const bName = b.name.toLowerCase();
              
              // Priority 1: Starts with query
              const aStarts = aName.startsWith(query);
              const bStarts = bName.startsWith(query);
              if (aStarts && !bStarts) return -1;
              if (!aStarts && bStarts) return 1;
              
              // Priority 2: Query position (earlier = better)
              const aIndex = aName.indexOf(query);
              const bIndex = bName.indexOf(query);
              if (aIndex !== bIndex) return aIndex - bIndex;
              
              // Priority 3: Name length (shorter = more relevant)
              return aName.length - bName.length;
            });
            
            setSuggestions(sorted.slice(0, 5));
          }
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      }, 100);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

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

  // Load default suggestions on mount
  useEffect(() => {
    loadDefaultSuggestions();
  }, []);

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 h-16 transition-colors duration-300">
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
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <HiBolt className="w-6 h-6 text-white" />
          </div>
          <span className="hidden sm:block text-2xl font-black tracking-wider font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400 group-hover:scale-105 transition-all duration-300">
            FlipLab
          </span>
        </Link>

        {/* Left Spacer */}
        <div className="flex-1"></div>

        {/* CENTER: Search Bar & Theme Toggle */}
        <div className="max-w-2xl px-4 flex items-center gap-4">
          <div className="relative group w-[480px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <HiArrowPath className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <HiMagnifyingGlass className="h-5 w-5 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                setShowSuggestions(true);
              }}
              // Delay hiding suggestions to allow clicking on them
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                  setShowSuggestions(false);
                }
              }}
              className="block w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg leading-5 text-slate-900 dark:text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="Tìm kiếm bộ thẻ..."
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 max-h-96 overflow-y-auto">
                {searchQuery.length >= 1 ? (
                  // Show search results when typing
                  suggestions.length > 0 ? (
                    <div className="p-2">
                      <p className="px-3 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Gợi ý tìm kiếm
                      </p>
                      {suggestions.map((set) => (
                        <button
                          key={set._id}
                          onClick={() => {
                            navigate(`/flashcards/${set._id}`);
                            setSearchQuery('');
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left group/item"
                        >
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                            <HiSquare2Stack className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover/item:text-blue-600 dark:group-hover/item:text-blue-300 transition-colors">
                              {set.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {set.cardCount || set.cards?.length || 0} thẻ • {set.isPublic ? 'Công khai' : 'Riêng tư'}
                            </p>
                          </div>
                        </button>
                      ))}
                      <div className="h-px bg-slate-100 dark:bg-white/5 my-2"></div>
                      <button
                        onClick={(e) => {
                          handleSearchSubmit(e as any);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-center py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                      >
                        Xem tất cả kết quả cho "{searchQuery}"
                      </button>
                    </div>
                  ) : isSearching ? (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Đang tìm kiếm...
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Không tìm thấy kết quả nào cho "{searchQuery}"
                    </div>
                  )
                ) : (
                  // Show history and default suggestions when not typing
                  <div className="p-2">
                    {/* Search History */}
                    {searchHistory.length > 0 && (
                      <>
                        <p className="px-3 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Tìm kiếm gần đây
                        </p>
                        {searchHistory.slice(0, 5).map((query, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(query);
                              addToSearchHistory(query);
                              navigate(`/?search=${encodeURIComponent(query)}`);
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left group/item"
                          >
                            <HiClock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-300 transition-colors">
                              {query}
                            </p>
                          </button>
                        ))}
                        <div className="h-px bg-slate-100 dark:bg-white/5 my-2"></div>
                      </>
                    )}
                    
                    {/* Default Suggestions (Unlearned Cards) */}
                    {defaultSuggestions.length > 0 && (
                      <>
                        <p className="px-3 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {searchHistory.length > 0 ? 'Gợi ý cho bạn' : 'Bộ thẻ chưa học'}
                        </p>
                        {defaultSuggestions.map((set) => (
                          <button
                            key={set._id}
                            onClick={() => {
                              navigate(`/flashcards/${set._id}`);
                              setSearchQuery('');
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left group/item"
                          >
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                              <HiSquare2Stack className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover/item:text-blue-600 dark:group-hover/item:text-blue-300 transition-colors">
                                {set.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {set.cardCount || set.cards?.length || 0} thẻ • {set.lastStudied ? 'Đã học' : 'Chưa học'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="group/theme p-2.5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-300 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 border border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer"
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
              className={`p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all flex items-center justify-center cursor-pointer ${isCreateMenuOpen ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''}`}
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
              <Avatar 
                avatarUrl={user?.avatar}
                displayName={user?.displayName}
                frameId={user?.avatarFrame}
                size="xs"
                className="transition-transform group-hover:scale-105"
              />
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
