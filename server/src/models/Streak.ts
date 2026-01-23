import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStreak extends Document {
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  studyDates: Date[];
}

const streakSchema = new Schema<IStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStudyDate: {
      type: Date,
    },
    studyDates: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Streak = mongoose.model<IStreak>('Streak', streakSchema);
