import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

// Lấy danh sách thông báo của tôi - Phân trang
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};

// Đánh dấu đã đọc 1 thông báo
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOne({ _id: id, recipient: userId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Thông báo không tìm thấy' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};

// Đánh dấu đã đọc TẤT CẢ
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};
