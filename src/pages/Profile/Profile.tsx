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
  HiCloudArrowUp,
  HiPlusCircle,
  HiCalendarDays,
  HiBolt,
  HiAcademicCap,
  HiArrowPath
} from 'react-icons/hi2';
import { dailyProgressTracker } from '../../utils/dailyProgressTracker';

import ActivityStats from '../../components/profile/ActivityStats';
import FollowShareActions from '../../components/profile/FollowShareActions';
import { authService } from '../../services/authService';
import { flashcardService } from '../../services/flashcardService';
import { useToastContext } from '../../contexts/ToastContext';
import { ANIMAL_AVATARS, AVATAR_FRAMES } from '../../constants/avatarConstants';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(user?.avatar);
  const [editAvatarFrame, setEditAvatarFrame] = useState<string>(user?.avatarFrame || 'none');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vietnamese day names helper
  const getDayName = (date: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  // Stats State
  const [stats, setStats] = useState({
    streak: dailyProgressTracker.getStreak(),
    studiedToday: dailyProgressTracker.getProgress(),
    dailyGoal: dailyProgressTracker.getDailyGoal(),
    totalDecks: 0
  });

  // Recent deck for "Continue" feature
  const [recentDeck, setRecentDeck] = useState<{id: string; name: string; dueCount: number; totalCards: number} | null>(null);
  
  // Week history for 7-day strip
  const [weekHistory, setWeekHistory] = useState<{day: string; studied: boolean; count: number; isToday: boolean; date: string}[]>([]);

  // Sync with Daily Progress Tracker
  useEffect(() => {
    // 1. Initial Load
    setStats(prev => ({
      ...prev,
      streak: dailyProgressTracker.getStreak(),
      studiedToday: dailyProgressTracker.getProgress(),
      dailyGoal: dailyProgressTracker.getDailyGoal()
    }));

    // 2. Listen for Updates
    const handleProgressUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { cardsStudied } = customEvent.detail;
      setStats(prev => ({
        ...prev,
        studiedToday: cardsStudied
      }));
    };

    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { currentStreak } = customEvent.detail;
      setStats(prev => ({
        ...prev,
        streak: currentStreak
      }));
    };

    window.addEventListener('dailyProgressUpdate', handleProgressUpdate);
    window.addEventListener('streakUpdated', handleStreakUpdate);
    
    return () => {
      window.removeEventListener('dailyProgressUpdate', handleProgressUpdate);
      window.removeEventListener('streakUpdated', handleStreakUpdate);
    };
  }, []);

  // Load Total Decks, Recent Deck & Refresh User Data
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Decks
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

      // 2. Refresh User Data
      try {
        const response = await authService.getMe();
        if (response.success && response.data.user) {
          updateUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to refresh user data', error);
      }
    };

    fetchData();
  }, []);

  // 6. Generate 7-day week history
  useEffect(() => {
    const generateWeekHistory = () => {
      const history: {day: string; studied: boolean; count: number; isToday: boolean; date: string}[] = [];
      
      // Get today at midnight
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Determine if studied today (using stats state)
      const isStudiedToday = stats.studiedToday >= stats.dailyGoal;
      
      // Get last study date from localStorage if available
      let lastStudyDate: Date | null = null;
      if (isStudiedToday) {
        lastStudyDate = new Date(today);
      } else {
        // Safe check for streakData
        const localStreakData = localStorage.getItem('streakData');
        if (localStreakData) {
          try {
            const parsed = JSON.parse(localStreakData);
            lastStudyDate = new Date(parsed.lastStudiedDate); // Change lastStudyDate to lastStudiedDate per tracker
            // Normalize to midnight
            lastStudyDate = new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate());
          } catch (e) {
            console.error('Error parsing streak data', e);
          }
        }
      }

      // Generate last 7 days (reverse order)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        
        const dayName = getDayName(d);
        const dateStr = d.toISOString().split('T')[0];
        const isToday = i === 0;
        
        // Determine studied status
        let studied = false;
        let count = 0;
        
        // For today: use current progress
        if (isToday) {
          count = stats.studiedToday;
          studied = count >= stats.dailyGoal;
        } else {
          // For past days: check based on streak logic (simplified estimation)
          // Ideally we need a full history log. For now, if we have a streak, we assume past days are studied.
          // This is a limitation without full calendar history.
          if (lastStudyDate) {
             // If this day is within the current streak duration from the last study date
             if (stats.streak > 0 && d <= lastStudyDate) {
                const daysFromLastStudy = Math.floor((lastStudyDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                if (daysFromLastStudy < stats.streak) {
                    studied = true;
                    count = stats.dailyGoal; // Assume goal met
                }
             }
          }
        }
        
        history.push({ day: dayName, studied, count, isToday, date: dateStr });
      }
      
      setWeekHistory(history);
    };

    generateWeekHistory();
  }, [stats.studiedToday, stats.dailyGoal, stats.streak]);
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
    setEditDisplayName(user?.displayName || '');
    setEditAvatar(user?.avatar);
    setEditAvatarFrame(user?.avatarFrame || 'none');
    setEditBio(user?.bio || '');
    setIsEditModalOpen(true);
    setShowAvatarPresets(false);
    setShowFrameSelector(false);
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
        avatarFrame: editAvatarFrame,
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
  const renderAvatar = (avatarUrl?: string, displayName?: string, size: 'sm' | 'lg' = 'lg', frameId: string = 'none') => {
    const sizeClasses = size === 'lg' ? 'w-28 h-28' : 'w-24 h-24';
    const textSize = size === 'lg' ? 'text-6xl' : 'text-5xl';
    const frameConfig = AVATAR_FRAMES.find(f => f.id === frameId) || AVATAR_FRAMES[0];
    
    // Render inner content (image, emoji, or initial)
    const renderContent = () => {
      if (avatarUrl) {
        if (isEmojiAvatar(avatarUrl)) {
          return (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-white/40 to-transparent pointer-events-none" />
              <span className={`${textSize} drop-shadow-sm z-10`}>{avatarUrl}</span>
            </div>
          );
        }
        // Custom uploaded image
        return (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-full h-full rounded-full object-cover"
          />
        );
      }
      // Default initial
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-4xl">
          {displayName?.charAt(0).toUpperCase() || <HiUser className="w-10 h-10" />}
        </div>
      );
    };


    // Special handling for frames that need inner background buffering (gradient borders)
    const complexFrames = ['rainbow', 'cosmic'];
    
    if (complexFrames.includes(frameId)) {
      return (
        <div className={`${sizeClasses} rounded-full ${frameConfig.class} flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900">
            {renderContent()}
          </div>
        </div>
      );
    }

    // Standard frames with border/ring/shadow
    // Container has frame styles but no overflow-hidden (to show shadow/ring)
    // Inner wrapper clips the content
    return (
      <div className={`${sizeClasses} rounded-full ${frameConfig.class} flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
        <div className="w-full h-full rounded-full overflow-hidden">
          {renderContent()}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.15] bg-dot-pattern" />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Profile Header - 2 Column Layout */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 md:p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
            
            {/* Left Column: User Info - Compact */}
            <div className="lg:col-span-6 flex flex-col items-center lg:border-r border-slate-100 dark:border-white/10 lg:pr-8">
              {/* Avatar + Edit Button */}
              <div className="relative mb-3">
                {renderAvatar(user?.avatar, user?.displayName, 'lg', user?.avatarFrame)}
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
              <p className="text-blue-600 dark:text-blue-400 font-bold text-base mb-2 flex items-center gap-1">
                @{user?.username} <HiCheckCircle className="w-4 h-4" />
              </p>

              {user?.bio && (
                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm text-center mb-4 px-4 line-clamp-3">
                  "{user.bio}"
                </p>
              )}

              {/* Follow & Share Actions */}
              <div className="w-full mb-4 px-4">
                <FollowShareActions
                  targetUserId={user?.id || ''}
                  currentUserId={user?.id}
                  isOwnProfile={true}
                />
              </div>

              {/* Big Numbers - Inline compact */}
              <div className="flex items-center justify-center gap-4 mb-3 text-center">
                <div className="group cursor-pointer transition-transform hover:scale-110 duration-200">
                  <div className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user?.totalCardsStudied || 0}</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Thẻ</div>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <div className="group cursor-pointer transition-transform hover:scale-110 duration-200">
                  <div className="text-xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{stats.streak}</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Streak</div>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <div className="group cursor-pointer transition-transform hover:scale-110 duration-200">
                  <div className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{Math.floor((user?.totalStudyTime || 0) / 60)}h</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Giờ</div>
                </div>
              </div>

              {/* Level & Badges - Compact & Optimized with Tooltips */}
              <div className="w-full px-2 mb-3">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="text-blue-700 dark:text-blue-300">Lv.5 Học giả</span>
                  <span>340/500 XP</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[68%]" />
                </div>
                
                {/* Simplified Badges - Informative Tooltips */}
                <div className="flex justify-center gap-2">
                  <div className="group relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center cursor-help shadow-sm hover:scale-105 transition-transform">
                      <HiFire className="w-4 h-4 text-white" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      Streak 3 ngày liên tiếp
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center cursor-help shadow-sm hover:scale-105 transition-transform">
                      <HiBolt className="w-4 h-4 text-white" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      Học 50 thẻ/tuần
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center cursor-help shadow-sm hover:scale-105 transition-transform">
                      <HiAcademicCap className="w-4 h-4 text-white" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      Thuộc trọn bộ 1000 từ
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-[10px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Xem thêm 2 huy hiệu khác">
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
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <HiPencilSquare className="w-5 h-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>

            {/* Right Column: Activity Stats - Improved with Bar Chart */}
            <div className="lg:col-span-6 h-full">
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
          <div className="col-span-2 relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm group hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => recentDeck ? navigate(`/study/${recentDeck.id}`) : navigate('/')}>
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
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800/50">
                    Còn lại
                  </span>
                )}
              </div>
              
              <div className="flex items-end gap-3 mb-4">
                <div className="text-6xl font-black text-amber-500 dark:text-amber-500 leading-none tracking-tight">
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
                className="w-full py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group-hover:-translate-y-0.5 cursor-pointer"
              >
                Bắt đầu ôn ngay <span className="opacity-70">→</span>
              </button>
            </div>
          </div>
          
          {/* SECONDARY CARDS - Bento Grid Style */}
          
          {/* Card 2: Bộ thẻ - Rich Content */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg p-5 group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer">
             {/* Background Decoration - Moved to Top Right to avoid content overlap */}
            <div className="absolute -right-6 -top-6 opacity-5 dark:opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
               <HiBookOpen className="w-32 h-32 text-slate-900 dark:text-blue-400" />
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
                <div onClick={() => navigate(`/study/${recentDeck.id}`)} className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg border border-slate-100 dark:border-slate-600/50 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group/deck">
                  <div className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-1">Học tiếp:</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover/deck:text-blue-600 dark:group-hover/deck:text-blue-300 transition-colors">
                    {recentDeck.name}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/')}
                  className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HiPlusCircle className="w-4 h-4" />
                  Tạo bộ thẻ mới
                </button>
              )}
            </div>
          </div>
          
          {/* Card 3: Tổng thẻ đã thuộc - Visual Progress */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg p-5 group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer">
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
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg p-5 group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer">
            {/* Background Decoration - Moved to Top Right to avoid content overlap */}
            <div className="absolute -right-8 -top-6 opacity-5 dark:opacity-10 transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
               <HiClock className="w-40 h-40 text-blue-600 dark:text-blue-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Thời gian học</span>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">
                {Math.round(user?.totalStudyTime || 0)} <span className="text-lg font-bold text-slate-400 dark:text-slate-500">phút</span>
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
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg p-5 group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer">
            
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
                  ? (stats.streak > 3 ? 'Tuyệt vời! Streak đang tăng' : 'Cố lên! Học đều đặn nhé')
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
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <HiCalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">Lịch sử 7 ngày qua</span>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {stats.studiedToday >= stats.dailyGoal 
                ? 'Hoàn thành!' 
                : weekHistory.filter(d => d.studied).length > 0
                  ? `${weekHistory.filter(d => d.studied).length}/7 ngày`
                  : '0/7 ngày'}
            </span>
          </div>
          
          {/* 7-day history - Sleek Circles */}
          <div className="flex items-center justify-between relative px-2">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-700 -z-10 -translate-y-[10px]"></div>

            {weekHistory.map((day, idx) => (
              <div 
                key={idx} 
                className="group relative flex flex-col items-center gap-3 cursor-pointer"
              >
                {/* Circle Indicator */}
                  {day.studied ? (
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center scale-110">
                       <HiCheckCircle className="w-6 h-6" />
                     </div>
                  ) : day.isToday ? (
                     <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center shadow-md relative text-blue-500">
                       <HiBookOpen className="w-5 h-5 animate-pulse" />
                     </div>
                  ) : (
                     <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600">
                       <HiCalendarDays className="w-5 h-5" />
                     </div>
                  )}

                {/* Day Label */}
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  day.studied || day.isToday
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {day.day}
                </span>

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg translate-y-2 group-hover:translate-y-0">
                  {day.day}, {day.date || ''} - {day.count > 0 ? `${day.count} thẻ` : 'Chưa học'}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-8 border-transparent border-t-slate-900"></div>
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
                  {renderAvatar(editAvatar, editDisplayName, 'lg', editAvatarFrame)}
                  
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
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Tải ảnh lên
                  </button>
                  <span className="text-slate-300">|</span>
                  <button 
                    onClick={() => {
                        setShowAvatarPresets(!showAvatarPresets);
                        setShowFrameSelector(false);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Chọn Emoji
                  </button>
                  <span className="text-slate-300">|</span>
                  <button 
                    onClick={() => {
                        setShowFrameSelector(!showFrameSelector);
                        setShowAvatarPresets(false);
                    }}
                    className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
                  >
                    Khung hình
                  </button>
                </div>

                {/* Avatar Presets */}
                {showAvatarPresets && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg w-full">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Chọn Emoji đại diện:</p>
                    <div className="grid grid-cols-8 gap-2">
                      {ANIMAL_AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => selectPresetAvatar(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white dark:hover:bg-slate-600 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                 {/* Frame Selector */}
                 {showFrameSelector && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg w-full">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Chọn khung hình:</p>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_FRAMES.map((frame) => (
                        <button
                          key={frame.id}
                          onClick={() => {
                            setEditAvatarFrame(frame.id);
                            setShowFrameSelector(false);
                          }}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${editAvatarFrame === frame.id ? 'bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-500' : 'hover:bg-white dark:hover:bg-slate-600'}`}
                        >
                          <div className={`w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 ${frame.class}`}></div>
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate w-full text-center">{frame.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên hiển thị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="Nhập tên hiển thị của bạn"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white min-h-[100px] resize-none"
                    placeholder="Chia sẻ đôi điều về bạn..."
                    maxLength={150}
                  />
                  <div className="text-right text-xs text-slate-400 mt-1">
                    {editBio.length}/150
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 sticky bottom-0 rounded-b-lg">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
              >
                {isSaving ? (
                  <>
                    <HiArrowPath className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <HiCloudArrowUp className="w-4 h-4" />
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
