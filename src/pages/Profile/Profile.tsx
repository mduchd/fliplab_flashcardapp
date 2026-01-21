import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HiUser, 
  HiPencilSquare, 
  HiRectangleStack, 
  HiCheckCircle, 
  HiFire, 
  HiClock, 
  HiFlag,
  HiXMark,
  HiCamera,
  HiArrowPath,
  HiCloudArrowUp,
  HiFaceSmile
} from 'react-icons/hi2';
import ActivityStats from '../../components/profile/ActivityStats';
import { authService } from '../../services/authService';
import { useToastContext } from '../../contexts/ToastContext';

// Preset Animal Avatars
const ANIMAL_AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄',
  '🦆', '🐧', '🦉', '🦅', '🐺', '🦇', '🦋', '🐝'
];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToastContext();
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(user?.avatar);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats State
  const [stats, setStats] = useState({
    streak: 0,
    studiedToday: 0,
    dailyGoal: 20
  });

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
      dailyGoal: goal
    });
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
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* Left Column: User Info */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center lg:border-r border-slate-100 dark:border-white/10 lg:pr-8">
              <div className="mb-5">
                {renderAvatar(user?.avatar, user?.displayName)}
              </div>

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 text-center">
                {user?.displayName}
              </h1>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
                @{user?.username} <HiCheckCircle className="w-3.5 h-3.5" />
              </p>

              {user?.bio && (
                <p className="text-slate-600 dark:text-slate-400 text-base text-center mb-6 px-4 font-medium">
                  "{user.bio}"
                </p>
              )}

              <div className="w-full space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm bg-slate-100 dark:bg-white/10 p-3 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-white/20">
                  <HiUser className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                  <span className="truncate font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm bg-slate-100 dark:bg-white/10 p-3 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-white/20">
                  <HiClock className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium">Tham gia: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>

              <button 
                onClick={openEditModal}
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <HiPencilSquare className="w-4 h-4" />
                Chỉnh sửa hồ sơ
              </button>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 text-center flex flex-col items-center shadow-sm">
            <HiRectangleStack className="w-6 h-6 text-blue-500 dark:text-blue-400 mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">0</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Bộ thẻ</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 text-center flex flex-col items-center shadow-sm">
            <HiCheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {user?.totalCardsStudied || 0}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Thẻ đã học</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 text-center flex flex-col items-center shadow-sm">
            <HiFire className="w-6 h-6 text-amber-500 dark:text-amber-400 mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.streak}</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Ngày streak</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-6 text-center flex flex-col items-center shadow-sm">
            <HiClock className="w-6 h-6 text-blue-500 dark:text-blue-400 mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {Math.floor((user?.totalStudyTime || 0) / 60)}h
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Giờ học</div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <HiFire className="w-5 h-5 text-amber-500" />
            Streak của bạn
          </h2>
          <div className="text-center py-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-100 dark:bg-amber-500/20">
              <HiFire className="w-14 h-14 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-500 dark:text-amber-400 mb-2">{stats.streak} ngày</div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">Bắt đầu streak bằng cách học mỗi ngày!</p>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <HiFlag className="w-5 h-5 text-red-500" />
            Mục tiêu hàng ngày
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Tiến độ</span>
                <span className="text-slate-900 dark:text-white font-medium">{stats.studiedToday} / {stats.dailyGoal} thẻ</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  style={{ width: `${Math.min(100, (stats.studiedToday / stats.dailyGoal) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Học 20 thẻ mỗi ngày để duy trì streak và cải thiện trí nhớ!
          </p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chỉnh sửa hồ sơ</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-blue-700 rounded-lg transition-colors"
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
                          className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-all ${
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
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
