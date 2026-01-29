import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  postId: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId; // Nếu là rep comment thì có ID của comment cha
  likes: Types.ObjectId[];
  isAnonymous?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bình luận không được để trống'],
      maxlength: [1000, 'Bình luận không được quá 1000 ký tự'],
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index để load comment của 1 bài post nhanh hơn
commentSchema.index({ postId: 1, createdAt: 1 });
// Index để tìm reply nhanh hơn
commentSchema.index({ parentId: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
