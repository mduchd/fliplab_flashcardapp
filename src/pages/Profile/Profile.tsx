import React from 'react';
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
  ScrollText
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-purple-500/30">
              {user?.displayName?.charAt(0).toUpperCase() || <UserIcon size={40} />}
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {user?.displayName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-2">@{user?.username}</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">{user?.email}</p>
            </div>

            {/* Edit Button */}
            <button className="px-6 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center gap-2">
              <Edit2 size={18} />
              Chỉnh sửa
            </button>
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

        {/* Account Info */}
        <div className="mt-8 bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ScrollText className="text-blue-500 dark:text-blue-400" size={20} />
            Thông tin tài khoản
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="text-slate-900 dark:text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400">Tên đăng nhập</span>
              <span className="text-slate-900 dark:text-white">@{user?.username}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-500 dark:text-slate-400">Tham gia từ</span>
              <span className="text-slate-900 dark:text-white">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
