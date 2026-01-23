import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDailyGoal extends Document {
  userId: Types.ObjectId;
  targetCards: number;
  studiedToday: number;
  lastResetDate: Date;
  completedDays: number;
}

const dailyGoalSchema = new Schema<IDailyGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    targetCards: {
      type: Number,
      default: 20,
      min: 1,
      max: 1000,
    },
    studiedToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
    completedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const DailyGoal = mongoose.model<IDailyGoal>('DailyGoal', dailyGoalSchema);
