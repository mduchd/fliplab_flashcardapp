import mongoose, { Document, Schema } from 'mongoose';

export interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [100, 'Folder name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      default: 'blue', // Default color theme
    },
    icon: {
      type: String,
      default: '📁', // Default folder emoji
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's folders
folderSchema.index({ userId: 1, name: 1 });

export const Folder = mongoose.model<IFolder>('Folder', folderSchema);
