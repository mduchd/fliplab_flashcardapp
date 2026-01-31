import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Avatar from '../../components/Avatar';
import { notificationService, Notification } from '../../services/notificationService';
import { 
  HiCheckCircle, 
  HiBell, 
  HiFire, 
  HiTrophy, 
  HiFlag, 
  HiShare, 
  HiChatBubbleLeftEllipsis, 
  HiHeart, 
  HiUserPlus, 
  HiUserGroup,
  HiInformationCircle
} from 'react-icons/hi2';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getMyNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error('Error marking all read', error);
    }
  };

  const handleClickNotification = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
        window.dispatchEvent(new Event('notifications-updated'));
      } catch (error) {
        console.error(error);
      }
    }

    switch (notification.type) {
      case 'like_post':
      case 'comment_post':
      case 'reply_comment':
        if (notification.referenceModel === 'Post' && notification.referenceId) {
           navigate(`/groups`); // Tạm thời dẫn về Groups, lý tưởng là /post/:id
        }
        break;
      case 'group_invite':
        navigate('/groups');
        break;
      case 'follow':
        navigate(`/profile/${notification.sender._id}`);
        break;
      case 'streak_warning':
      case 'daily_goal':
        navigate('/'); // Về trang chủ để học
        break;
      case 'level_up':
        navigate('/profile'); // Xem profile để thấy level mới
        break;
      case 'share_deck':
        if (notification.referenceId) {
          navigate(`/study/${notification.referenceId}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'streak_warning': return <HiFire className="w-5 h-5 text-orange-500" />;
      case 'level_up': return <HiTrophy className="w-5 h-5 text-yellow-500" />;
      case 'daily_goal': return <HiFlag className="w-5 h-5 text-green-500" />;
      case 'share_deck': return <HiShare className="w-5 h-5 text-blue-500" />;
      case 'like_post': return <HiHeart className="w-5 h-5 text-red-500" />;
      case 'comment_post': 
      case 'reply_comment': return <HiChatBubbleLeftEllipsis className="w-5 h-5 text-blue-400" />;
      case 'follow': return <HiUserPlus className="w-5 h-5 text-purple-500" />;
      case 'group_invite': return <HiUserGroup className="w-5 h-5 text-indigo-500" />;
      default: return <HiInformationCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto pb-10">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HiBell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              Thông báo
            </h1>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HiCheckCircle className="w-4 h-4" />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <HiBell className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">Chưa có thông báo mới</p>
                <p className="text-sm">Khi có hoạt động mới, thông báo sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => handleClickNotification(notification)}
                  className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors relative group ${
                    !notification.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex-shrink-0 relative">
                    <Avatar
                      avatarUrl={notification.sender?.avatar}
                      displayName={notification.sender?.displayName || 'System'}
                      size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {notification.sender?.displayName || 'Hệ thống'}
                      </span>
                      {' '}
                      <span className="text-slate-600 dark:text-slate-400">
                        {notification.content || getNotificationText(notification.type)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                      {formatDistanceToNowVN(notification.createdAt)}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="flex-shrink-0 self-center">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const formatDistanceToNowVN = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const getNotificationText = (type: string) => {
  switch (type) {
    case 'like_post': return 'đã thích bài viết của bạn';
    case 'comment_post': return 'đã bình luận về bài viết của bạn';
    case 'reply_comment': return 'đã trả lời bình luận của bạn';
    case 'follow': return 'đã bắt đầu theo dõi bạn';
    case 'group_invite': return 'đã mời bạn tham gia nhóm';
    case 'streak_warning': return 'Bạn sắp mất chuỗi học tập! Hãy học ngay.';
    case 'level_up': return 'Chúc mừng! Bạn vừa thăng cấp mới.';
    case 'daily_goal': return 'Tuyệt vời! Bạn đã hoàn thành mục tiêu ngày.';
    case 'share_deck': return 'đã chia sẻ một bộ thẻ với bạn';
    case 'system': return 'Thông báo từ hệ thống';
    default: return 'đã gửi một thông báo';
  }
};

export default Notifications;
