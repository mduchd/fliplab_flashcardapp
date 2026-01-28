import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HiBell, 
  HiCheck, 
  HiClock, 
  HiTrash,
  HiEnvelopeOpen,
  HiMegaphone,
  HiBookOpen,
  HiTrophy,
  HiLightBulb
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';

// Mock Notification Types
type NotificationType = 'system' | 'study' | 'achievement' | 'info';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string; // ISO string
  read: boolean;
  link?: string;
}

// Mock Data Generator
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Chào mừng bạn đến với FlipLab!',
    message: 'Hãy bắt đầu hành trình học tập của bạn bằng cách tạo bộ thẻ đầu tiên.',
    type: 'system',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
    link: '/create'
  },
  {
    id: '2',
    title: 'Đã đến giờ học!',
    message: 'Bạn chưa hoàn thành mục tiêu hàng ngày. Hãy dành 15 phút để ôn tập ngay nhé.',
    type: 'study',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    link: '/?tab=sets'
  },
  {
    id: '3',
    title: 'Thành tích mới: Người mới bắt đầu',
    message: 'Chúc mừng! Bạn đã hoàn thành 5 bài quiz đầu tiên.',
    type: 'achievement',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true
  },
  {
    id: '4',
    title: 'Cập nhật hệ thống v2.1',
    message: 'Chúng tôi vừa cập nhật tính năng tạo thư mục mới với nhiều màu sắc hơn.',
    type: 'info',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true
  }
];

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // Try to load from local storage or use mock
      const saved = localStorage.getItem('notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Sync to local storage whenever notifications change
  useEffect(() => {
    if (!isLoading && notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      // Dispatch custom event to notify Sidebar immediately
      window.dispatchEvent(new Event('notifications-updated'));
    } else if (!isLoading && notifications.length === 0) {
       localStorage.setItem('notifications', JSON.stringify([]));
       window.dispatchEvent(new Event('notifications-updated'));
    }
  }, [notifications, isLoading]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleCardClick = (notification: Notification) => {
     if (!notification.read) {
       handleMarkAsRead(notification.id);
     }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleDelete = (id: string) => {
    const itemToDelete = notifications.find(n => n.id === id);
    if (!itemToDelete) return;

    setNotifications(prev => prev.filter(n => n.id !== id));
    
    toast.success('Đã xóa thông báo', () => {
      setNotifications(prev => {
        // Checking if already restored to avoid dupes (simple check)
        if (prev.find(n => n.id === itemToDelete.id)) return prev;
        
        const newNotifications = [...prev, itemToDelete];
        // Sort by date desc to maintain order
        return newNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    });
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;
    
    if (window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) {
      const itemsToDelete = [...notifications];
      setNotifications([]);
      toast.success('Đã xóa tất cả thông báo', () => {
        setNotifications(itemsToDelete);
      });
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'system': return <HiMegaphone className="w-6 h-6 text-blue-500" />;
      case 'study': return <HiBookOpen className="w-6 h-6 text-orange-500" />;
      case 'achievement': return <HiTrophy className="w-6 h-6 text-yellow-500" />;
      case 'info': return <HiLightBulb className="w-6 h-6 text-purple-500" />;
      default: return <HiBell className="w-6 h-6 text-slate-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 hour
    if (diff < 1000 * 60 * 60) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins} phút trước`;
    }
    // Less than 24 hours
    if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} giờ trước`;
    }
    // Days
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} ngày trước`;
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <HiBell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Thông báo
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold text-white bg-red-500 rounded-full shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Cập nhật mới nhất về hoạt động học tập của bạn
            </p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <HiEnvelopeOpen className="w-4 h-4" />
                Đánh dấu đã đọc tất cả
              </button>
            )}
            {notifications.length > 0 && filter === 'all' && (
              <button 
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <HiTrash className="w-4 h-4" />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              filter === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Chưa đọc
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <HiBell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {filter === 'all' ? 'Bạn chưa có thông báo nào' : 'Bạn đã đọc hết các thông báo'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Khi có hoạt động mới, thông báo sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => handleCardClick(notification)}
                className={`group relative p-4 rounded-xl border transition-all duration-200 flex gap-4 ${
                  notification.read 
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
                    : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:shadow-md'
                } cursor-pointer`}
              >
                {/* Icon */}
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  notification.read 
                    ? 'bg-slate-100 dark:bg-slate-800' 
                    : 'bg-white dark:bg-slate-800 shadow-sm ring-2 ring-blue-100 dark:ring-blue-900'
                }`}>
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pointer-events-none">
                  <div className="flex items-start justify-between gap-4 mb-1">
                     <h4 className={`text-base truncate pr-8 pointer-events-auto ${
                       notification.read 
                        ? 'font-medium text-slate-800 dark:text-slate-200' 
                        : 'font-bold text-slate-900 dark:text-white'
                     }`}>
                       {notification.title}
                     </h4>
                     
                     <span className="shrink-0 text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                       <HiClock className="w-3 h-3" />
                       {formatTime(notification.date)}
                     </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 pr-8 pointer-events-auto">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3 pointer-events-auto">
                    {notification.link && (
                      <button 
                        onClick={() => {
                          handleMarkAsRead(notification.id);
                          navigate(notification.link!);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Xem chi tiết
                      </button>
                    )}
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <HiCheck className="w-3.5 h-3.5" />
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="absolute top-4 right-4">
                    <span className="block w-3 h-3 bg-red-500 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"></span>
                  </div>
                )}
                
                {/* Delete Button - Vertically Centered */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
