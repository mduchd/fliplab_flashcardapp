import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Avatar from '../../components/Avatar';
import { notificationService, Notification } from '../../services/notificationService';
import { BADGES } from '../../constants/badgeConstants';
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
import { PiSealCheckFill, PiSketchLogoFill, PiSparkleFill } from 'react-icons/pi';

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
           navigate(`/groups`);
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
        navigate('/');
        break;
      case 'level_up':
      case 'badge_unlock':
        navigate('/profile');
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
      case 'badge_unlock': return <HiTrophy className="w-5 h-5 text-yellow-500" />;
      case 'like_post': return <HiHeart className="w-5 h-5 text-red-500" />;
      case 'comment_post': 
      case 'reply_comment': return <HiChatBubbleLeftEllipsis className="w-5 h-5 text-blue-400" />;
      case 'follow': return <HiUserPlus className="w-5 h-5 text-purple-500" />;
      case 'group_invite': return <HiUserGroup className="w-5 h-5 text-indigo-500" />;
      default: return <HiInformationCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNotificationContent = (notification: Notification) => {
    return (
      <span className="text-slate-600 dark:text-slate-400">
        {notification.content || getNotificationText(notification.type)}
      </span>
    );
  };

  // EXTRACTED EXACTLY FROM BadgeListModal.tsx to ensure 100% UI consistency
  const getBadgeVisuals = (tier: string) => {
    const visuals = {
      BRONZE: {
        styleClass: 'border-orange-700/50 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 text-orange-700 dark:text-orange-400',
        glow: 'shadow-md shadow-orange-500/30',
        label: 'Đồng',
        labelColor: 'text-orange-800 dark:text-orange-200',
        sparkle: <PiSparkleFill className="text-orange-300 w-3 h-3 drop-shadow-sm opacity-80" />
      },
      SILVER: {
        styleClass: 'border-slate-400/70 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-600 dark:to-slate-500 text-slate-600 dark:text-slate-100',
        glow: 'shadow-lg shadow-slate-400/40 dark:shadow-slate-900/60 ring-1 ring-white/50 inset',
        label: 'Bạc',
        labelColor: 'text-slate-700 dark:text-slate-300',
        sparkle: <PiSparkleFill className="text-slate-300 w-4 h-4 drop-shadow-md animate-pulse" />
      },
      GOLD: {
        styleClass: 'border-yellow-500/80 bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-900/40 dark:to-yellow-700/40 text-yellow-700 dark:text-yellow-400',
        glow: 'shadow-[0_4px_25px_rgba(234,179,8,0.5)] ring-2 ring-yellow-500/20',
        label: 'Vàng',
        labelColor: 'text-yellow-800 dark:text-yellow-400',
        sparkle: <PiSparkleFill className="text-yellow-400 w-5 h-5 drop-shadow-lg animate-bounce-slow" />
      },
      DIAMOND: {
        styleClass: 'border-cyan-400/80 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/40 dark:to-blue-800/40 text-cyan-600 dark:text-cyan-300',
        glow: 'shadow-[0_4px_30px_rgba(34,211,238,0.6)] ring-4 ring-cyan-400/20',
        label: 'Kim Cương',
        labelColor: 'text-cyan-800 dark:text-cyan-200',
        sparkle: <PiSketchLogoFill className="text-cyan-200 w-5 h-5 drop-shadow-xl animate-spin-slow" />
      }
    };
    return visuals[tier as keyof typeof visuals] || visuals.BRONZE;
  };

  const renderNotificationItem = (notification: Notification) => {
    // CUSTOM RENDER FOR BADGE UNLOCK
    if (notification.type === 'badge_unlock') {
       const badge = BADGES.find(b => b.id === notification.referenceId);
       
       const content = notification.content || '';
       const isDiamond = content.includes('Kim Cương') || content.includes('Diamond');
       const isGold = content.includes('Vàng') || content.includes('Gold');
       const isSilver = content.includes('Bạc') || content.includes('Silver');
       const tier = badge?.tier || (isDiamond ? 'DIAMOND' : isGold ? 'GOLD' : isSilver ? 'SILVER' : 'BRONZE');
       
       const visuals = getBadgeVisuals(tier);
       const BadgeIcon = badge?.icon || HiTrophy;
       
       return (
         <div
            key={notification._id}
            onClick={() => handleClickNotification(notification)}
            className={`
              p-4 pl-5 flex gap-5 cursor-pointer transition-all relative group
              border-b border-slate-100 dark:border-slate-700
              ${!notification.isRead ? 'bg-slate-50/80 dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
            `}
         >
            {/* 
              EXACT BADGE UI CLONE FROM PROFILE 
              Scaled down from w-24 to w-16 but kept thick premium border
              Border increased from 3px to 5px to match Profile weight
            */}
            <div className={`
              flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center
              border-[5px] ${visuals.styleClass} ${visuals.glow}
              transform group-hover:-translate-y-1 transition-all duration-300 relative
            `}>
               {/* 1. 3D Shine Overlay (The Glass Effect) */}
               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent opacity-50 overflow-hidden pointer-events-none">
                  {tier === 'DIAMOND' && <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-white/30 skew-x-12 translate-x-[-150%]" />}
               </div>
               
               {/* 2. Floating Sparkle */}
               <div className="absolute -top-1 -right-1 z-20 group-hover:scale-125 group-hover:rotate-12 transition-transform">
                  {visuals.sparkle}
               </div>
               
               {/* 3. Main Icon */}
               <BadgeIcon className="w-8 h-8 filter drop-shadow-md z-10" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              {/* Sender & Context Line */}
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hệ thống</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                 <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${visuals.labelColor} border-current opacity-70`}>
                   {visuals.label}
                 </span>
                 {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-auto"></span>
                 )}
              </div>
              
              {/* Main Message */}
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                 Chúc mừng! Bạn đã xuất sắc mở khóa huy hiệu <span className={`font-bold text-base ${visuals.labelColor}`}>{badge?.name}</span>
              </p>
              
              {/* Description & Time */}
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                 <span>{badge?.description}</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                 <span>{formatDistanceToNowVN(notification.createdAt)}</span>
              </p>
            </div>
            
            {/* Background Decor */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
               <PiSealCheckFill className={`w-12 h-12 ${visuals.labelColor}`} />
            </div>
         </div>
       );
    }

    // DEFAULT RENDER
    return (
      <div
        key={notification._id}
        onClick={() => handleClickNotification(notification)}
        className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors relative group border-b border-slate-100 dark:border-slate-700 ${
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
            {getNotificationContent(notification)}
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
    );
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

          <div>
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
              notifications.map(notification => renderNotificationItem(notification))
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

export default Notifications;
