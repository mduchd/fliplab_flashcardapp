import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId; // User who follows
  following: mongoose.Types.ObjectId; // User being followed
  createdAt: Date;
}

const FollowSchema: Schema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique follow relationship
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for efficient queries
FollowSchema.index({ follower: 1 });
FollowSchema.index({ following: 1 });

export const Follow = mongoose.model<IFollow>('Follow', FollowSchema);
