import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  image?: string;
  coverImage?: string;
  createdBy: Types.ObjectId;
  admins: Types.ObjectId[];
  members: Types.ObjectId[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Tên nhóm là bắt buộc'],
      trim: true,
      minlength: [2, 'Tên nhóm phải có ít nhất 2 ký tự'],
      maxlength: [100, 'Tên nhóm không được vượt quá 100 ký tự'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    },
    image: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for search
groupSchema.index({ name: 'text', description: 'text' });

export const Group = mongoose.model<IGroup>('Group', groupSchema);
