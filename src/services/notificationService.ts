import api from './api';

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  type: 'like_post' | 'comment_post' | 'reply_comment' | 'follow' | 'group_invite' | 'system' | 'streak_warning' | 'level_up' | 'daily_goal' | 'share_deck' | 'badge_unlock';
  referenceId?: string;
  referenceModel?: 'Post' | 'Comment' | 'Group' | 'User' | 'FlashcardSet';
  content?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  // Lấy danh sách thông báo
  async getMyNotifications(page = 1, limit = 20): Promise<{
    success: boolean;
    data: Notification[];
    pagination: { page: number; limit: number; total: number; pages: number };
    unreadCount: number;
  }> {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Đánh dấu đã đọc 1 cái
  async markAsRead(id: string): Promise<{ success: boolean; data: Notification }> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Đánh dấu đọc hết
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};
