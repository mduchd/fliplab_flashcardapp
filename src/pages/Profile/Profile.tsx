import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { 
  User as UserIcon, 
  Edit2, 
  Layers, 
  CheckCircle, 
  Flame, 
  Clock, 
  Target,
  X,
  Camera,
  Loader2,
  Save
} from 'lucide-react';
import ActivityStats from '../../components/profile/ActivityStats';
import { authService } from '../../services/authService';
import { useToastContext } from '../../contexts/ToastContext';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToastContext();
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(user?.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Avatar Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Modal
  const openEditModal = () => {
    setEditDisplayName(user?.displayName || '');
    setEditAvatar(user?.avatar);
    setIsEditModalOpen(true);
  };

  // Save Profile
  const handleSaveProfile = async () => {
    if (!editDisplayName.trim()) {
      toast.error('Tên hiển thị không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      const response = await authService.updateProfile({
        displayName: editDisplayName.trim(),
        avatar: editAvatar,
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

  // Render Avatar (Image or Initial)
  const renderAvatar = (avatarUrl?: string, displayName?: string, size: 'sm' | 'lg' = 'lg') => {
    const sizeClasses = size === 'lg' ? 'w-28 h-28 text-5xl' : 'w-24 h-24 text-4xl';
    
    if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className={`${sizeClasses} rounded-full object-cover shadow-xl shadow-purple-500/30`}
        />
      );
    }
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-xl shadow-purple-500/30`}>
        {displayName?.charAt(0).toUpperCase() || <UserIcon size={size === 'lg' ? 44 : 36} />}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header - 2 Column Layout */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* Left Column: User Info */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center lg:border-r border-slate-100 dark:border-white/10 lg:pr-8">
              <div className="mb-5">
                {renderAvatar(user?.avatar, user?.displayName)}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 text-center lg:text-left">
                {user?.displayName}
              </h1>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-4 flex items-center gap-1">
                @{user?.username} <CheckCircle size={14} />
              </p>

              <div className="w-full space-y-2 mb-5">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg">
                  <UserIcon size={14} />
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg">
                  <Clock size={14} />
                  <span className="text-xs">Tham gia: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>

              <button 
                onClick={openEditModal}
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Edit2 size={16} />
                Chỉnh sửa hồ sơ
              </button>
            </div>

            {/* Right Column: Activity Stats */}
            <div className="lg:col-span-8">
              <ActivityStats />
            </div>

          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center flex flex-col items-center shadow-sm">
            <Layers className="text-purple-500 dark:text-purple-400 mb-3" size={24} />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">0</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">Bộ thẻ</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center flex flex-col items-center shadow-sm">
            <CheckCircle className="text-green-500 dark:text-green-400 mb-3" size={24} />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {user?.totalCardsStudied || 0}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">Thẻ đã học</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center flex flex-col items-center shadow-sm">
            <Flame className="text-amber-500 dark:text-amber-400 mb-3" size={24} />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">0</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">Ngày streak</div>
          </div>
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center flex flex-col items-center shadow-sm">
            <Clock className="text-blue-500 dark:text-blue-400 mb-3" size={24} />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {Math.floor((user?.totalStudyTime || 0) / 60)}h
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">Giờ học</div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Flame className="text-amber-500" size={20} />
            Streak của bạn
          </h2>
          <div className="text-center py-8">
            <div className="bg-amber-100 dark:bg-amber-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="text-amber-500" size={48} />
            </div>
            <div className="text-3xl font-bold text-amber-500 dark:text-amber-400 mb-2">0 ngày</div>
            <p className="text-slate-600 dark:text-slate-400">Bắt đầu streak bằng cách học mỗi ngày!</p>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="text-red-500" size={20} />
            Mục tiêu hàng ngày
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">Tiến độ</span>
                <span className="text-slate-900 dark:text-white font-medium">0 / 20 thẻ</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            Học 20 thẻ mỗi ngày để duy trì streak và cải thiện trí nhớ!
          </p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chỉnh sửa hồ sơ</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {editAvatar ? (
                    <img 
                      src={editAvatar} 
                      alt="Avatar Preview" 
                      className="w-32 h-32 rounded-full object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-5xl font-bold text-white shadow-lg">
                      {editDisplayName?.charAt(0).toUpperCase() || <UserIcon size={48} />}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={32} className="text-white" />
                  </button>
                </div>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Thay đổi ảnh đại diện
                </button>

                {editAvatar && (
                  <button 
                    onClick={() => setEditAvatar(undefined)}
                    className="mt-1 text-xs text-red-500 hover:underline"
                  >
                    Xóa ảnh
                  </button>
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
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Nhập tên hiển thị"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
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
