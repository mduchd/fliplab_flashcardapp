import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
  groupId: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  images: string[];
  sharedFlashcardSet?: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: {
    _id?: Types.ObjectId;
    author: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    replies: {
      _id?: Types.ObjectId;
      author: Types.ObjectId;
      content: string;
      createdAt: Date;
    }[];
    createdAt: Date;
  }[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bài viết là bắt buộc'],
      maxlength: [5000, 'Nội dung không được vượt quá 5000 ký tự'],
    },
    images: [{
      type: String,
    }],
    sharedFlashcardSet: {
      type: Schema.Types.ObjectId,
      ref: 'FlashcardSet',
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
      }],
      replies: [{
        author: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
postSchema.index({ groupId: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', postSchema);
