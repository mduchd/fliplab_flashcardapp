import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Avatar from '../../components/Avatar';
import { notificationService, Notification } from '../../services/notificationService';
import { HiCheck, HiCheckCircle, HiBell } from 'react-icons/hi2';

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
      // Dispatch event update sidebar count
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error('Error marking all read', error);
    }
  };

  const handleClickNotification = async (notification: Notification) => {
    // 1. Mark as read frontend first
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
        window.dispatchEvent(new Event('notifications-updated'));
      } catch (error) {
        console.error(error);
      }
    }

    // 2. Navigate based on type
    switch (notification.type) {
      case 'like_post':
      case 'comment_post':
        if (notification.referenceId) {
          // TODO: Logic navigate to specific post in group, currently assume stored in Post Model reference
          // For now, simpler to navigate to groups if we don't have exact URL structure
          // Better: /groups/:groupId?postId=:postId if we have groupId
          alert('Chức năng điều hướng chi tiết bài viết đang được cập nhật...');
        }
        break;
      case 'follow':
        navigate(`/profile/${notification.sender._id}`);
        break;
      case 'group_invite':
        navigate('/groups');
        break;
      default:
        break;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <HiBell className="w-6 h-6 text-blue-500" />
              Thông báo
            </h1>
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <HiCheckCircle className="w-4 h-4" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <HiBell className="w-12 h-12 text-slate-300 mb-3" />
                <p>Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => handleClickNotification(notification)}
                  className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Avatar
                      avatarUrl={notification.sender.avatar}
                      displayName={notification.sender.displayName}
                      size="md"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200 text-sm">
                      <span className="font-bold">{notification.sender.displayName}</span>
                      {' '}
                      <span className="text-slate-600 dark:text-slate-400">
                        {notification.content || getNotificationText(notification.type)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNowVN(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 self-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
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

// Format date function similar to formatDistanceToNow
const formatDistanceToNowVN = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'vừa xong';
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
    default: return 'đã gửi một thông báo';
  }
};

export default Notifications;
