import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // Format YYYY-MM-DD
  count: number; // Số thẻ đã học trong ngày
  target: number; // Mục tiêu của ngày đó (để tham khảo)
  metGoal: boolean; // Đã đạt mục tiêu chưa
}

const studyLogSchema = new Schema<IStudyLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true, // Index để query nhanh theo ngày
    },
    count: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      default: 0,
    },
    metGoal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index để đảm bảo mỗi user chỉ có 1 log cho 1 ngày (hoặc query nhanh)
studyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const StudyLog = mongoose.model<IStudyLog>('StudyLog', studyLogSchema);
