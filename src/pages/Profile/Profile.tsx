import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HiUser, 
  HiPencilSquare, 
  HiBookOpen,
  HiCheckCircle, 
  HiFire, 
  HiClock, 
  HiXMark,
  HiCamera,
  HiArrowPath,
  HiCloudArrowUp,
  HiFaceSmile,
  HiPlusCircle,
  HiCalendarDays,
  HiBolt,
  HiSparkles,
  HiAcademicCap
} from 'react-icons/hi2';
import ActivityStats from '../../components/profile/ActivityStats';
import { authService } from '../../services/authService';
import { flashcardService } from '../../services/flashcardService';
import { useToastContext } from '../../contexts/ToastContext';

// Preset Animal Avatars
const ANIMAL_AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄',
  '🦆', '🐧', '🦉', '🦅', '🐺', '🦇', '🦋', '🐝'
];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(user?.avatar);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vietnamese day names helper
  const getDayName = (date: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  // Stats State
  const [stats, setStats] = useState({
    streak: 0,
    studiedToday: 0,
    dailyGoal: 20,
    totalDecks: 0
  });

  // Recent deck for "Continue" feature
  const [recentDeck, setRecentDeck] = useState<{id: string; name: string; dueCount: number; totalCards: number} | null>(null);
  
  // Week history for 7-day strip
  const [weekHistory, setWeekHistory] = useState<{day: string; studied: boolean; count: number; isToday: boolean}[]>([]);

  // Load stats from localStorage
  useEffect(() => {
    // 1. Load Daily Goal
    const savedGoal = localStorage.getItem('settings_dailyGoal');
    const goal = savedGoal ? parseInt(savedGoal) : 20;

    // 2. Load Streak
    let currentStreak = 0;
    const streakData = localStorage.getItem('streakData');
    if (streakData) {
      const { currentStreak: savedStreak, lastStudyDate } = JSON.parse(streakData);
      const lastDate = new Date(lastStudyDate);
      const today = new Date();
      if (lastDate.toDateString() === today.toDateString() || 
          new Date(today.setDate(today.getDate() - 1)).toDateString() === lastDate.toDateString()) {
        currentStreak = savedStreak;
      }
    }

    // 3. Load Today's Progress
    let progress = 0;
    const progressData = localStorage.getItem('dailyProgress');
    if (progressData) {
      const { date, cardsStudied } = JSON.parse(progressData);
      if (new Date(date).toDateString() === new Date().toDateString()) {
        progress = cardsStudied;
      }
    }

    setStats({
      streak: currentStreak,
      studiedToday: progress,
      dailyGoal: goal,
      totalDecks: 0
    });

    // 4. Load Total Decks & Recent Deck
    const fetchDecks = async () => {
      try {
        const response = await flashcardService.getAll();
        if (response.success && response.data) {
          const decks = response.data.flashcardSets;
          setStats(prev => ({
            ...prev,
            totalDecks: decks.length
          }));
          
          // Find most recently studied deck
          if (decks.length > 0) {
            const sortedByStudy = [...decks].sort((a, b) => {
              if (!a.lastStudied) return 1;
              if (!b.lastStudied) return -1;
              return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime();
            });
            const recent = sortedByStudy[0];
            // Calculate "due" cards (simplified: cards in box 1-2)
            const dueCount = recent.cards?.filter((c: any) => (c.box || 1) <= 2).length || 0;
            setRecentDeck({
              id: recent._id,
              name: recent.name,
              dueCount: dueCount,
              totalCards: recent.cards?.length || 0
            });
          }
        }
      } catch (error) {
        console.error('Failed to load decks', error);
      }
    };
    fetchDecks();

    // 5. Refresh User Data (to detect new study stats)
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.data.user) {
          updateUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to refresh user data', error);
      }
    };
    fetchUser();

    // 6. Generate 7-day week history
    const generateWeekHistory = () => {
      const history: {day: string; studied: boolean; count: number; isToday: boolean}[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = getDayName(date);
        const isToday = i === 0;
        
        // Check if studied on this day (simplified - uses streak data pattern)
        // In a real app, you'd have daily history stored
        let studied = false;
        let count = 0;
        
        if (isToday && progress > 0) {
          studied = true;
          count = progress;
        } else if (streakData) {
          const { lastStudyDate } = JSON.parse(streakData);
          const lastDate = new Date(lastStudyDate);
          if (date.toDateString() === lastDate.toDateString()) {
            studied = true;
            count = progress; // Approximate
          }
        }
        
        history.push({ day: dayName, studied, count, isToday });
      }
      
      setWeekHistory(history);
    };
    generateWeekHistory();
  }, []);
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
        setShowAvatarPresets(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select Preset Avatar
  const selectPresetAvatar = (emoji: string) => {
    setEditAvatar(emoji);
    setShowAvatarPresets(false);
  };

  // Open Modal
  const openEditModal = () => {
    setEditDisplayName(user?.displayName || '');
    setEditAvatar(user?.avatar);
    setEditBio(user?.bio || '');
    setIsEditModalOpen(true);
    setShowAvatarPresets(false);
  };

  // Save Profile
  const handleSaveProfile = async () => {
    if (!editDisplayName.trim()) {
      toast.error('Tên hiển thị không được để trống');
      return;
    }

    if (editBio && editBio.length > 150) {
      toast.error('Mô tả không được quá 150 ký tự');
      return;
    }

    setIsSaving(true);
    try {
      const response = await authService.updateProfile({
        displayName: editDisplayName.trim(),
        avatar: editAvatar,
        bio: editBio.trim(),
      });

      if (response.success) {
        updateUser(response.data.user);
        toast.success('Cập nhật hồ sơ thành công!');
        setIsEditModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if avatar is an emoji
  const isEmojiAvatar = (avatar?: string) => {
    if (!avatar) return false;
    return ANIMAL_AVATARS.includes(avatar);
  };

  // Render Avatar (Image, Emoji or Initial)
  const renderAvatar = (avatarUrl?: string, displayName?: string, size: 'sm' | 'lg' = 'lg') => {
    const sizeClasses = size === 'lg' ? 'w-28 h-28 text-5xl' : 'w-24 h-24 text-4xl';
    
    if (avatarUrl) {
      // Check if emoji
      if (isEmojiAvatar(avatarUrl)) {
        return (
          <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center`}>
            <span className={size === 'lg' ? 'text-6xl' : 'text-5xl'}>{avatarUrl}</span>
          </div>
        );
      }
      // Image upload
      return (
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className={`${sizeClasses} rounded-full object-cover`}
        />
      );
    }
    // Default initial
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white`}>
        {displayName?.charAt(0).toUpperCase() || <HiUser className="w-10 h-10" />}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header - 2 Column Layout */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 md:p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* Left Column: User Info - Compact */}
            <div className="lg:col-span-4 flex flex-col items-center lg:border-r border-slate-100 dark:border-white/10 lg:pr-8">
              {/* Avatar + Edit Button */}
              <div className="relative mb-3">
                {renderAvatar(user?.avatar, user?.displayName)}
                <button 
                  onClick={openEditModal}
                  className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Chỉnh sửa hồ sơ"
                >
                  <HiPencilSquare className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5 text-center">
                {user?.displayName}
              </h1>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-2 flex items-center gap-1">
                @{user?.username} <HiCheckCircle className="w-3.5 h-3.5" />
              </p>

              {user?.bio && (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-3 px-2 line-clamp-2">
                  "{user.bio}"
                </p>
              )}

              {/* Big Numbers - Inline compact */}
              <div className="flex items-center justify-center gap-4 mb-3 text-center">
                <div className="group cursor-pointer">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{user?.totalCardsStudied || 0}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Thẻ</div>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <div className="group cursor-pointer">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{stats.streak}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Streak</div>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <div className="group cursor-pointer">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{Math.floor((user?.totalStudyTime || 0) / 60)}h</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Giờ</div>
                </div>
              </div>

              {/* Level & Badges - Compact */}
              <div className="w-full px-2 mb-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span className="text-indigo-600 dark:text-indigo-400">Lv.5 Học giả</span>
                  <span>340/500 XP</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[68%]" />
                </div>
                <div className="flex justify-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center cursor-help hover:scale-110 transition-transform shadow-sm" title="Streak Master">
                    <HiFire className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center cursor-help hover:scale-110 transition-transform shadow-sm" title="Speed Learner">
                    <HiBolt className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center cursor-help hover:scale-110 transition-transform shadow-sm" title="Scholar">
                    <HiAcademicCap className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center cursor-help hover:scale-110 transition-transform shadow-sm" title="Early Bird">
                    <HiSparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 cursor-pointer hover:bg-slate-300 transition-colors">
                    +2
                  </div>
                </div>
              </div>

              {/* Email & Join date - Single line */}
              <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                Tham gia {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </div>

              {/* Edit Profile Button - Restored to fill space */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 w-full">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <HiPencilSquare className="w-5 h-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>

            {/* Right Column: Activity Stats */}
            <div className="lg:col-span-8">
              {/* Pass activityData when user has studied cards */}
              <ActivityStats 
                activityData={user?.totalCardsStudied && user.totalCardsStudied > 0 
                  ? [{ date: new Date().toISOString(), count: user.totalCardsStudied }] 
                  : undefined
                } 
              />
            </div>

          </div>
        </div>

        {/* Action Cards Grid - Asymmetric Layout with Visual Hierarchy */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* PRIMARY CARD: Thẻ cần học hôm nay - Modern Clean Design */}
          <div className="col-span-2 relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm group hover:shadow-md transition-all">
            {/* Subtle Gradient Glow Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-500">
                    <HiCalendarDays className="w-5 h-5" />
                  </div>
                  Thẻ cần học hôm nay
                </span>
                {stats.studiedToday >= stats.dailyGoal ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                    Đã xong
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-100 dark:border-amber-800/50">
                    Còn lại
                  </span>
                )}
              </div>
              
              <div className="flex items-end gap-3 mb-4">
                <div className="text-6xl font-black text-amber-600 dark:text-amber-500 leading-none tracking-tight">
                  {Math.max(0, stats.dailyGoal - stats.studiedToday)}
                </div>
                <div className="pb-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  thẻ cần ôn
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 mb-4 border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Tiến độ ngày</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stats.studiedToday} / {stats.dailyGoal}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      stats.studiedToday >= stats.dailyGoal 
                        ? 'bg-green-500' 
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (stats.studiedToday / stats.dailyGoal) * 100)}%` }}
                  />
                </div>
              </div>
              
              <button 
                onClick={() => recentDeck ? navigate(`/study/${recentDeck.id}`) : navigate('/')}
                className="w-full py-2.5 bg-indigo-600 dark:bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group-hover:-translate-y-0.5"
              >
                Bắt đầu ôn ngay <span className="opacity-70">→</span>
              </button>
            </div>
          </div>
          
          {/* SECONDARY CARDS - Bento Grid Style */}
          
          {/* Card 2: Bộ thẻ - Rich Content */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 group hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
             {/* Background Decoration - Moved to Top Right to avoid content overlap */}
            <div className="absolute -right-6 -top-6 opacity-5 dark:opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
               <HiBookOpen className="w-32 h-32 text-slate-900 dark:text-indigo-400" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Bộ thẻ của bạn</span>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">{stats.totalDecks}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">bộ thẻ trong thư viện</div>
            </div>

            {/* Quick Action Preview */}
            <div className="relative z-10 mt-2">
              {recentDeck ? (
                <div onClick={() => navigate(`/study/${recentDeck.id}`)} className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg border border-slate-100 dark:border-slate-600/50 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors group/deck">
                  <div className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-1">Học tiếp:</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover/deck:text-indigo-600 dark:group-hover/deck:text-indigo-300 transition-colors">
                    {recentDeck.name}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/')}
                  className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <HiPlusCircle className="w-4 h-4" />
                  Tạo bộ thẻ mới
                </button>
              )}
            </div>
          </div>
          
          {/* Card 3: Tổng thẻ đã thuộc - Visual Progress */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 group hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
             {/* Background Decoration - Moved to Top Right to avoid content overlap */}
             <div className="absolute -right-8 -top-8 opacity-5 dark:opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
               <HiCheckCircle className="w-40 h-40 text-green-600 dark:text-green-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Đã thuộc</span>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">{user?.totalCardsStudied || 0}</div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-4 flex items-center gap-1">
                <span className="bg-green-100 dark:bg-green-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">+{stats.studiedToday}</span>
                <span className="text-slate-500 dark:text-slate-400">hôm nay</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="relative z-10 mt-auto">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
                <span>Mức độ thông thạo</span>
                <span>Lv. {Math.floor((user?.totalCardsStudied || 0) / 100) + 1}</span>
              </div>
              <div className="flex gap-1 h-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`flex-1 rounded-full ${
                      level <= ((user?.totalCardsStudied || 0) % 100) / 20 + 1 
                        ? 'bg-green-500 dark:bg-green-500' 
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Row: Giờ học + Streak - Better typography */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Card 4: Giờ học - Mini Graph */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 group hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            {/* Background Decoration - Moved to Top Right to avoid content overlap */}
            <div className="absolute -right-8 -top-6 opacity-5 dark:opacity-10 transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
               <HiClock className="w-40 h-40 text-blue-600 dark:text-blue-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Thời gian học</span>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">
                {Math.floor((user?.totalStudyTime || 0) / 60)} <span className="text-lg font-bold text-slate-400 dark:text-slate-500">phút</span>
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                Tổng cộng toàn thời gian
              </div>
            </div>

            {/* Visual Bars - Simulated Graph */}
            <div className="flex items-end gap-1 h-10 mt-auto opacity-70 group-hover:opacity-100 transition-opacity relative z-10">
              <div className="w-1/5 bg-blue-100 dark:bg-blue-500/10 h-[40%] rounded-sm"></div>
              <div className="w-1/5 bg-blue-100 dark:bg-blue-500/10 h-[60%] rounded-sm"></div>
              <div className="w-1/5 bg-blue-200 dark:bg-blue-500/20 h-[30%] rounded-sm"></div>
              <div className="w-1/5 bg-blue-300 dark:bg-blue-500/30 h-[80%] rounded-sm"></div>
              <div className="w-1/5 bg-blue-500 dark:bg-blue-500 h-[100%] rounded-sm"></div>
            </div>
          </div>
          
          {/* Card 5: Streak - Visual Dots */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 group hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            
            {/* Prominent Burning Fire Icon - Moved to empty space */}
            <div className="absolute right-2 top-8 md:right-6 md:top-1/2 md:-translate-y-1/2 group-hover:scale-110 transition-transform duration-500 z-0">
               {/* Glow Effect - Conditional based on studiedToday */}
               {stats.studiedToday > 0 && (
                 <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 dark:opacity-30 rounded-full animate-pulse"></div>
               )}
               <HiFire 
                 className={`relative w-24 h-24 ${
                   stats.studiedToday > 0 
                     ? 'text-gradient-to-br from-orange-400 to-red-600 text-orange-500 drop-shadow-orange' 
                     : 'text-slate-300 dark:text-slate-600'
                 }`} 
                 style={stats.studiedToday > 0 ? { filter: 'drop-shadow(0 4px 6px rgba(249, 115, 22, 0.4))' } : {}} 
               />
            </div>

            <div className="relative z-10 max-w-[65%]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Chuỗi ngày</span>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">
                {stats.streak} <span className="text-lg font-bold text-slate-400 dark:text-slate-500">ngày</span>
              </div>
              <div className={`text-xs font-medium mb-4 ${stats.studiedToday > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {stats.studiedToday > 0 
                  ? (stats.streak > 3 ? '🔥 Tuyệt vời! Streak đang tăng' : 'Cố lên! Học đều đặn nhé')
                  : 'Học ngay hôm nay để giữ chuỗi!'}
              </div>
            </div>

            {/* Visual Dots */}
            <div className="flex gap-1.5 relative z-10 mt-auto">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 flex-1 rounded-full ${
                    i < (stats.streak % 7 || (stats.streak > 0 ? 7 : 0))
                      ? (stats.studiedToday > 0 ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600')
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lịch sử 7 ngày - Check-in tracker */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-base font-bold text-slate-900 dark:text-white">Lịch sử 7 ngày qua</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {stats.studiedToday >= stats.dailyGoal 
                ? '✓ Hoàn thành hôm nay!' 
                : weekHistory.filter(d => d.studied).length > 0
                  ? `${weekHistory.filter(d => d.studied).length}/7 ngày đã học`
                  : 'Chưa học ngày nào'}
            </span>
          </div>
          
          {/* 7-day history - Check-in chips only */}
          <div className="flex items-center justify-center gap-2.5">
            {weekHistory.map((day, idx) => (
              <div 
                key={idx} 
                className="group relative"
              >
                <div className={`
                  px-3 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105
                  min-h-[52px] flex items-center justify-center
                  ${day.studied 
                    ? 'bg-indigo-500 text-white shadow-md' 
                    : day.isToday 
                      ? 'border-2 border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                  }
                `}>
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${
                      day.studied 
                        ? 'text-white' 
                        : day.isToday
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {day.day}
                    </span>
                    {day.studied && (
                      <span className="text-sm">✓</span>
                    )}
                    {day.isToday && !day.studied && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                    )}
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {day.day}{day.count > 0 ? `: ${day.count} thẻ` : ': Chưa học'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chỉnh sửa hồ sơ</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group mb-3">
                  {renderAvatar(editAvatar, editDisplayName, 'lg')}
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <HiCamera className="w-8 h-8 text-white" />
                  </button>
                </div>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <HiCamera className="w-3.5 h-3.5" />
                    Tải ảnh lên
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <button 
                    onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <HiFaceSmile className="w-3.5 h-3.5" />
                    Chọn động vật
                  </button>
                </div>

                {editAvatar && (
                  <button 
                    onClick={() => setEditAvatar(undefined)}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    Xóa ảnh
                  </button>
                )}

                {/* Animal Presets Grid */}
                {showAvatarPresets && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg w-full">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1">
                      <HiFaceSmile className="w-3 h-3" />
                      Chọn avatar động vật ngộ nghĩnh:
                    </p>
                    <div className="grid grid-cols-8 gap-2 justify-items-center">
                      {ANIMAL_AVATARS.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectPresetAvatar(emoji)}
                          className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                            editAvatar === emoji 
                              ? 'bg-blue-500 scale-110 shadow-lg' 
                              : 'bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500 hover:scale-105'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Display Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tên hiển thị
                </label>
                <input 
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Nhập tên hiển thị"
                />
              </div>

              {/* Bio Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mô tả ngắn
                  <span className="text-xs text-slate-400 ml-2">
                    ({editBio.length}/150)
                  </span>
                </label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={150}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white resize-none"
                  placeholder="Viết vài dòng về bản thân bạn..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {isSaving ? (
                  <>
                    <HiArrowPath className="w-[18px] h-[18px] animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <HiCloudArrowUp className="w-[18px] h-[18px]" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Profile;
