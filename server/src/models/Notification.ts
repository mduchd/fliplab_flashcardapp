import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId; // Người nhận thông báo
  sender: Types.ObjectId;    // Người tạo ra hành động (Admin, User khác)
  type: 'like_post' | 'comment_post' | 'reply_comment' | 'follow' | 'group_invite' | 'system' | 'streak_warning' | 'level_up' | 'daily_goal' | 'share_deck';
  referenceId?: Types.ObjectId; // ID của đối tượng liên quan (PostId, CommentId, GroupId...)
  referenceModel?: 'Post' | 'Comment' | 'Group' | 'User' | 'FlashcardSet'; // Tên Model liên quan
  content?: string; // Nội dung ngắn gọn (tùy chọn)
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like_post', 'comment_post', 'reply_comment', 'follow', 'group_invite', 'system', 'streak_warning', 'level_up', 'daily_goal', 'share_deck'],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    referenceModel: {
      type: String,
      enum: ['Post', 'Comment', 'Group', 'User', 'FlashcardSet'],
      required: false,
    },
    content: {
      type: String,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Chỉ cần createdAt
  }
);

// Index để load thông báo của user nhanh, sắp xếp mới nhất trước
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
