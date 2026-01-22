import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  HiCog6Tooth as SettingsIcon,
  HiMoon as Moon,
  HiSun as Sun,
  HiBell as Bell,
  HiShieldCheck as Shield,
  HiGlobeAlt as Globe,
  HiTrash as Trash2,
  HiArrowRightOnRectangle as LogOut,
  HiChevronRight as ChevronRight,
  HiAdjustmentsVertical as Target,
  HiSpeakerWave as Volume2,
  HiSpeakerXMark as VolumeX,
  HiArrowDownTray as Download,
  HiClock as Clock,
  HiSwatch as Palette,
  HiBolt as Zap,
  HiQuestionMarkCircle as HelpCircle,
  HiEnvelope as Mail,
  HiArrowPath as RefreshCw,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  action,
  onClick,
  danger,
}) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
      onClick ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5' : ''
    } ${danger ? 'hover:bg-red-50 dark:hover:bg-red-500/10' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-2 rounded-lg ${
          danger
            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
        }`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`font-medium ${
            danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
          }`}
        >
          {title}
        </p>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
    {onClick && !action && (
      <ChevronRight size={20} className="text-slate-400" />
    )}
  </div>
);

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onToggle: () => void;
}> = ({ enabled, onToggle }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    type="button"
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();

  // Confirm modal states
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('settings_notifications') !== 'false';
  });
  const [soundEffects, setSoundEffects] = useState(() => {
    return localStorage.getItem('settings_sound') !== 'false';
  });
  const [dailyGoal, setDailyGoal] = useState(() => {
    return parseInt(localStorage.getItem('settings_dailyGoal') || '20');
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem('settings_reminderTime') || '20:00';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('settings_language') || 'vi';
  });
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => {
    return localStorage.getItem('settings_autoPlayAudio') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('settings_notifications', String(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('settings_sound', String(soundEffects));
  }, [soundEffects]);

  useEffect(() => {
    localStorage.setItem('settings_dailyGoal', String(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('settings_reminderTime', reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    localStorage.setItem('settings_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('settings_autoPlayAudio', String(autoPlayAudio));
  }, [autoPlayAudio]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Đã đăng xuất thành công');
  };

  const handleDeleteAccountConfirm = () => {
    // TODO: Implement delete account API call
    toast.info('Tính năng đang được phát triển');
    setShowDeleteAccountConfirm(false);
  };

  const handleClearHistoryConfirm = () => {
    localStorage.removeItem('studyHistory');
    localStorage.removeItem('streakData');
    toast.success('Đã xóa lịch sử học tập thành công!');
    setShowClearHistoryConfirm(false);
  };

  const handleExportData = () => {
    try {
      const exportData = {
        user: { username: user?.username, displayName: user?.displayName },
        settings: {
          notifications,
          soundEffects,
          dailyGoal,
          reminderTime,
          language,
          autoPlayAudio,
          theme,
        },
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fliplab-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xuất dữ liệu');
    }
  };

  const dailyGoalOptions = [10, 15, 20, 30, 50, 100];

  return (
    <MainLayout>
      {/* Delete Account Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteAccountConfirm}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và tất cả dữ liệu sẽ bị mất vĩnh viễn."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        onConfirm={handleDeleteAccountConfirm}
        onCancel={() => setShowDeleteAccountConfirm(false)}
        variant="danger"
      />

      {/* Clear History Confirm Modal */}
      <ConfirmModal
        isOpen={showClearHistoryConfirm}
        title="Xóa lịch sử học tập"
        message="Bạn có chắc chắn muốn xóa lịch sử học tập? Dữ liệu streak và tiến độ học sẽ bị xóa."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleClearHistoryConfirm}
        onCancel={() => setShowClearHistoryConfirm(false)}
        variant="warning"
      />

      {/* Header */}
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <SettingsIcon className="text-blue-500 dark:text-blue-400" size={32} />
          Cài đặt
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Tùy chỉnh trải nghiệm học tập của bạn
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Learning Goals */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Target size={18} className="text-blue-500" />
              Mục tiêu học tập
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Mục tiêu hàng ngày</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Số thẻ cần học mỗi ngày</p>
                </div>
                <select
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {dailyGoalOptions.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal} thẻ/ngày
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                {dailyGoalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setDailyGoal(goal)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      dailyGoal === goal
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
            <SettingItem
              icon={<Clock size={20} />}
              title="Thời gian nhắc nhở"
              description={`Nhắc học lúc ${reminderTime} mỗi ngày`}
              action={
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500"
                />
              }
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette size={18} className="text-blue-500" />
              Giao diện
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <SettingItem
              icon={theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              title="Chế độ tối"
              description={theme === 'dark' ? 'Đang bật - Dễ nhìn hơn vào ban đêm' : 'Đang tắt - Sáng và thoáng'}
              action={<ToggleSwitch enabled={theme === 'dark'} onToggle={toggleTheme} />}
            />
            <SettingItem
              icon={<Globe size={20} />}
              title="Ngôn ngữ"
              description={language === 'vi' ? 'Tiếng Việt' : 'English'}
              action={
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              }
            />
          </div>
        </div>

        {/* Sound & Notifications */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell size={18} className="text-blue-500" />
              Âm thanh & Thông báo
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <SettingItem
              icon={<Bell size={20} />}
              title="Thông báo nhắc học"
              description="Nhận thông báo nhắc nhở học tập hàng ngày"
              action={<ToggleSwitch enabled={notifications} onToggle={() => setNotifications(!notifications)} />}
            />
            <SettingItem
              icon={soundEffects ? <Volume2 size={20} /> : <VolumeX size={20} />}
              title="Hiệu ứng âm thanh"
              description="Phát âm thanh khi trả lời đúng/sai"
              action={<ToggleSwitch enabled={soundEffects} onToggle={() => setSoundEffects(!soundEffects)} />}
            />
            <SettingItem
              icon={<Zap size={20} />}
              title="Tự động phát âm thanh"
              description="Tự động phát âm thanh cho từ vựng (nếu có)"
              action={<ToggleSwitch enabled={autoPlayAudio} onToggle={() => setAutoPlayAudio(!autoPlayAudio)} />}
            />
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Download size={18} className="text-blue-500" />
              Quản lý dữ liệu
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <SettingItem
              icon={<Download size={20} />}
              title="Xuất dữ liệu"
              description="Tải về bản sao cài đặt và dữ liệu học tập"
              onClick={handleExportData}
            />
            <SettingItem
              icon={<RefreshCw size={20} />}
              title="Xóa lịch sử học tập"
              description="Đặt lại tiến độ học và streak"
              onClick={() => setShowClearHistoryConfirm(true)}
            />
          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-blue-500" />
              Tài khoản
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <SettingItem
              icon={<Shield size={20} />}
              title="Bảo mật"
              description="Đổi mật khẩu, xác thực 2 bước"
              onClick={() => toast.info('Tính năng đang được phát triển')}
            />
            <SettingItem
              icon={<Mail size={20} />}
              title="Email & Liên kết"
              description={user?.email || 'Chưa liên kết email'}
              onClick={() => toast.info('Tính năng đang được phát triển')}
            />
            <SettingItem
              icon={<LogOut size={20} />}
              title="Đăng xuất"
              description={`Đang đăng nhập với @${user?.username}`}
              onClick={handleLogout}
            />
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle size={18} className="text-blue-500" />
              Trợ giúp
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <SettingItem
              icon={<HelpCircle size={20} />}
              title="Hướng dẫn sử dụng"
              description="Tìm hiểu cách sử dụng FlipLab hiệu quả"
              onClick={() => toast.info('Tính năng đang được phát triển')}
            />
            <SettingItem
              icon={<Mail size={20} />}
              title="Liên hệ hỗ trợ"
              description="Gửi phản hồi hoặc báo lỗi"
              onClick={() => window.open('mailto:support@fliplab.app', '_blank')}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-red-200 dark:border-red-500/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 dark:border-red-500/20">
            <h2 className="font-semibold text-red-600 dark:text-red-400">Vùng nguy hiểm</h2>
          </div>
          <div>
            <SettingItem
              icon={<Trash2 size={20} />}
              title="Xóa tài khoản"
              description="Xóa vĩnh viễn tài khoản và tất cả dữ liệu"
              onClick={() => setShowDeleteAccountConfirm(true)}
              danger
            />
          </div>
        </div>
      </div>

      {/* Version Info */}

    </MainLayout>
  );
};

export default Settings;
