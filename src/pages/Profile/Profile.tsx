import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HiPencilSquare, 
  HiCalendarDays, 
  HiCamera,
  HiCheckCircle,
  HiArrowPath,
  HiPlusCircle,
  HiXMark,
  HiCloudArrowUp
} from 'react-icons/hi2';
import { HiBookOpen, HiClock } from 'react-icons/hi';
import { dailyProgressTracker } from '../../utils/dailyProgressTracker';

import ActivityStats from '../../components/profile/ActivityStats';
import FollowShareActions from '../../components/profile/FollowShareActions';
import { authService } from '../../services/authService';
import { flashcardService } from '../../services/flashcardService';
import { useToastContext } from '../../contexts/ToastContext';
import { ANIMAL_AVATARS, AVATAR_FRAMES } from '../../constants/avatarConstants';
import Avatar from '../../components/Avatar';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(user?.avatar);
  const [editCoverImage, setEditCoverImage] = useState<string | undefined>(user?.coverImage);
  const [editAvatarFrame, setEditAvatarFrame] = useState<string>(user?.avatarFrame || 'none');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
  const [recentDeck, setRecentDeck] = useState<any>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);
  
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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Allow larger size for cover
        toast.error('Ảnh bìa quá lớn. Vui lòng chọn ảnh dưới 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCoverImage(reader.result as string);
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
    setEditCoverImage(user?.coverImage);
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
          coverImage: editCoverImage,
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



  // Removed renderAvatar function in favor of shared component

  return (
    <MainLayout>
      {/* Cover Image Lightbox Modal */}
      {showCoverModal && user?.coverImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 md:p-12 animate-in fade-in duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)' }}
          onClick={() => setShowCoverModal(false)}
        >
            {/* Close Button - Enhanced */}
            <button 
              className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-white/20 text-white/90 hover:text-white rounded-full backdrop-blur-md transition-all z-[110] group cursor-pointer border border-white/10 shadow-lg hover:scale-110 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                setShowCoverModal(false);
              }}
              title="Đóng (Esc)"
            >
              <HiXMark className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <div className="relative flex items-center justify-center pointer-events-none w-full h-full">
              <img 
                src={user.coverImage} 
                alt="Cover Full"
                className="max-w-full max-h-[85vh] md:max-w-5xl object-contain rounded-xl shadow-2xl pointer-events-auto select-none ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Profile Header - 2 Column Layout */}
        {/* Profile Header - Unified Card Design */}
        <div className="relative mb-10 w-full max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
               
               {/* 1. Cover Image - Full Width Top Section */}
               <div 
                  className="h-56 md:h-80 w-full relative group cursor-pointer bg-slate-100 dark:bg-slate-700"
                  onClick={() => user?.coverImage && setShowCoverModal(true)}
               >
                  {user?.coverImage ? (
                     <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                     <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                     </div>
                  )}
                  
                  {/* Overlay Gradient for better text usage if needed later */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Edit Cover Trigger */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                     <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(); }} 
                        className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-white text-sm font-medium cursor-pointer flex items-center gap-2 px-4 transition-all border border-white/10 hover:scale-105 active:scale-95"
                     >
                        <HiCamera className="w-4 h-4" /> <span className="text-xs font-bold">Thay ảnh bìa</span>
                     </button>
                  </div>
               </div>

               {/* 2. Info Section - Connected directly below */}
               <div className="relative px-6 pb-8 pt-0 flex flex-col items-center">
                  
                  {/* Avatar - Overlapping the Seam */}
                  <div className="relative -mt-16 mb-4 group z-10">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full ring-0 shadow-sm flex items-center justify-center">
                      <div className="transform scale-110 origin-center isolate">
                         <Avatar avatarUrl={user?.avatar} displayName={user?.displayName} size="xl" frameId={user?.avatarFrame} className="shadow-2xl ring-4 ring-white dark:ring-slate-800" />
                      </div>
                    </div>
                    <button 
                      onClick={openEditModal} 
                      className="absolute bottom-1 right-1 p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer z-20"
                      title="Chỉnh sửa ảnh đại diện"
                    >
                      <HiPencilSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Name & Identity */}
                  <div className="text-center mb-6 max-w-2xl w-full">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight leading-tight">
                       {user?.displayName}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-500/20 px-3 py-1 rounded-lg text-xs md:text-sm flex items-center gap-1.5 transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/30 cursor-pointer border border-blue-100 dark:border-blue-500/20">
                         @{user?.username} <HiCheckCircle className="w-4 h-4" />
                      </span>
                    </div>

                    {user?.bio && (
                       <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base font-medium leading-relaxed opacity-100 max-w-lg mx-auto italic">
                         {user.bio}
                       </p>
                    )}
                  </div>
                  
                  {/* Stats Row - Clean, Compact */}
                  <div className="flex items-center justify-center gap-8 md:gap-16 mb-6 w-full">
                     <div className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="text-2xl font-black text-slate-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{(user as any)?.followersCount || 0}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Người theo dõi</span>
                     </div>
                     
                     <div className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="text-2xl font-black text-slate-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{(user as any)?.followingCount || 0}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Đang theo dõi</span>
                     </div>
                  </div>

                  {/* Actions - Compact Pills */}
                  <div className="flex items-center justify-center gap-3 w-full max-w-sm mb-2">
                     <button 
                        onClick={openEditModal} 
                        className="flex-1 py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                     >
                        <HiPencilSquare className="w-4 h-4" /> Chỉnh sửa
                     </button>
                     <div className="flex-1">
                        <FollowShareActions targetUserId={user?.id || ''} currentUserId={user?.id} isOwnProfile={true} variant="secondary" mode="buttons-only" />
                     </div>
                  </div>
                  
                  {/* Join Date - Subtle Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 w-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                     <HiCalendarDays className="w-3.5 h-3.5 mr-1.5" />
                     <span>Thành viên từ {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '2024'}</span>
                  </div>
               </div>
            </div>
        </div>

        {/* Body Content Grid - Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          
          {/* Left Column: Stats (Chart & Badges) - Unified Card */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-4 h-full"> 
             {/* 1. Activity Chart - Fixed Compact Height */}
             <div className="h-60">
               <ActivityStats 
                 viewMode="chart-only"
                 noBackground={true}
                 activityData={user?.totalCardsStudied && user.totalCardsStudied > 0 
                   ? [{ date: new Date().toISOString(), count: user.totalCardsStudied }] 
                   : undefined
                 } 
               />
             </div>

             {/* Divider */}
             <div className="h-px bg-slate-100 dark:bg-slate-700 w-full my-1"></div>

             {/* 2. Badges & Achievements */}{/* Auto Height */}
             <div className="h-auto">
               <ActivityStats viewMode="badges-only" noBackground={true} />
             </div>
          </div>

          {/* Right Column: Actions & Stats */}
          <div className="lg:col-span-4 flex flex-col gap-5 h-full">
             
             {/* 1. PRIMARY ACTION: Daily Due Card - Compact */}
             <div className="relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg shadow-blue-900/5 group hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => recentDeck ? navigate(`/study/${recentDeck.id}`) : navigate('/')}>
               {/* Decorative Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <HiCalendarDays className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800 dark:text-white leading-tight text-sm">Mục tiêu hôm nay</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Giữ vững phong độ nhé!</p>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-end gap-2 mb-4">
                   <div className="text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                     {Math.max(0, stats.dailyGoal - stats.studiedToday)}
                   </div>
                   <div className="pb-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                     thẻ cần ôn
                   </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="mb-4">
                   <div className="flex justify-between text-[10px] mb-1.5 font-bold">
                     <span className="text-slate-500 dark:text-slate-400">Tiến độ</span>
                     <span className={stats.studiedToday >= stats.dailyGoal ? 'text-green-500' : 'text-blue-500'}>
                       {Math.round((stats.studiedToday / stats.dailyGoal) * 100)}%
                     </span>
                   </div>
                   <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                     <div
                       className={`h-full rounded-full transition-all duration-1000 ease-out ${
                         stats.studiedToday >= stats.dailyGoal ? 'bg-green-500' : 'bg-blue-500'
                       }`}
                       style={{ width: `${Math.min(100, (stats.studiedToday / stats.dailyGoal) * 100)}%` }}
                     />
                   </div>
                 </div>
                 
                 <button className="w-full py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group-hover:gap-3 shadow-lg shadow-slate-200 dark:shadow-blue-900/20">
                   Bắt đầu học ngay <HiArrowPath className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                 </button>
               </div>
             </div>

             {/* 2. Library Shortcut - Compact */}
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                   <HiBookOpen className="w-4 h-4 text-purple-500" />
                   Thư viện bộ thẻ
                </h3>
                
                {recentDeck ? (
                   <div className="group/deck cursor-pointer" onClick={() => navigate(`/study/${recentDeck.id}`)}>
                      <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-100 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400 transition-colors">
                         <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-0.5 uppercase tracking-wide">Học gần đây</div>
                         <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mb-1">{recentDeck.name}</div>
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><HiClock className="w-3 h-3" /> {recentDeck.dueCount} cần ôn</span>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="text-center py-4 text-slate-400">
                      <p className="text-xs mb-2">Chưa có bộ thẻ nào</p>
                   </div>
                )}

                <button 
                  onClick={() => navigate('/')}
                  className="w-full mt-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HiPlusCircle className="w-3.5 h-3.5" />
                  Tạo bộ thẻ mới
                </button>
             </div>

             {/* 3. Total Memorized Stats - Compact */}
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden group cursor-pointer" title="Tổng số thẻ đã thuộc">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex items-center justify-between">
                   <div>
                      <div className="text-2xl font-black mb-0.5">{user?.totalCardsStudied || 0}</div>
                      <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Thẻ đã thuộc</div>
                   </div>
                   <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <HiCheckCircle className="w-5 h-5" />
                   </div>
                </div>
             </div>
          </div>

          {/* Bottom Row: Lịch sử chuyên cần (Full Width, Compact) */}
          <div className="col-span-1 lg:col-span-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2.5">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                   <HiCalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Lịch sử chuyên cần</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Theo dõi sự đều đặn của bạn trong 7 ngày qua</p>
                 </div>
               </div>
               <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                 {stats.studiedToday >= stats.dailyGoal 
                   ? 'Đã hoàn thành' 
                   : `${stats.studiedToday}/${stats.dailyGoal} thẻ`}
               </span>
             </div>
             
             {/* 7-day history - Compact Horizontal Layout */}
             <div className="relative px-2 sm:px-6 py-1">
               {/* Connecting Line */}
               <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-100 dark:bg-slate-700 -z-10 -translate-y-[8px] rounded-full"></div>
               
               <div className="flex items-center justify-between">
                 {weekHistory.map((day, idx) => (
                   <div key={idx} className="group relative flex flex-col items-center gap-2 cursor-pointer">
                       {day.studied ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center scale-100 ring-4 ring-white dark:ring-slate-800 transition-transform group-hover:scale-110 z-10">
                            <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                       ) : day.isToday ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 relative text-blue-500 ring-4 ring-white dark:ring-slate-800 z-10">
                            <HiBookOpen className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                          </div>
                       ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-300 dark:text-slate-500 ring-4 ring-white dark:ring-slate-800 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-10">
                            <HiCalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                       )}
                     
                     <span className={`text-[10px] font-bold uppercase tracking-wider ${day.studied || day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>{day.day}</span>
                     
                     {/* Tooltip */}
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-20 shadow-lg translate-y-1 group-hover:translate-y-0">
                       {day.day}: {day.count} thẻ
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-transparent border-t-slate-900"></div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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
              
              {/* Cover Image Upload (New) */}
              <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Ảnh bìa</label>
                 <div className="relative h-32 w-full rounded-lg overflow-hidden group border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/50 cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                    {editCoverImage ? (
                       <img src={editCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <HiCamera className="w-8 h-8 mb-1" />
                          <span className="text-xs">Nhấn để tải ảnh bìa</span>
                       </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <HiPencilSquare className="w-8 h-8 text-white" />
                    </div>
                 </div>
                 <input 
                   ref={coverInputRef}
                   type="file" 
                   accept="image/*" 
                   onChange={handleCoverChange}
                   className="hidden"
                 />
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 w-full text-left">Ảnh đại diện</label>
                <div className="relative group mb-3">
                  <Avatar 
                    avatarUrl={editAvatar} 
                    displayName={editDisplayName} 
                    size="lg" 
                    frameId={editAvatarFrame}
                  />
                  
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
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                  >
                    Tải ảnh lên
                  </button>
                  <span className="text-slate-300">|</span>
                  <button 
                    onClick={() => {
                        setShowAvatarPresets(!showAvatarPresets);
                        setShowFrameSelector(false);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                  >
                    Chọn Emoji
                  </button>
                  <span className="text-slate-300">|</span>
                  <button 
                    onClick={() => {
                        setShowFrameSelector(!showFrameSelector);
                        setShowAvatarPresets(false);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
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
                          className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
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
                      {AVATAR_FRAMES.map((frame) => {
                         // Determine frame type logic matching Avatar.tsx
                         const isSpinning = (frame as any).isSpinning;
                         const isComplex = (frame as any).isComplex || ['rainbow', 'cosmic'].includes(frame.id) || isSpinning;
                         
                         return (
                          <button
                            key={frame.id}
                            onClick={() => {
                              setEditAvatarFrame(frame.id);
                              // setShowFrameSelector(false); // Kept open for preview
                            }}
                            className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${editAvatarFrame === frame.id ? 'bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-500' : 'hover:bg-white dark:hover:bg-slate-600'}`}
                          >
                            <div className={`w-8 h-8 rounded-full relative flex-shrink-0 ${isComplex ? frame.class : `ring-2 ${frame.class} bg-slate-200 dark:bg-slate-700`}`}>
                              {isComplex && (
                                <div className="absolute inset-[3px] bg-slate-200 dark:bg-slate-700 rounded-full" />
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate w-full text-center">{frame.name}</span>
                          </button>
                        );
                      })}
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
                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
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
