import mongoose, { Document, Schema, Types } from 'mongoose';

// Answer interface for student's responses
export interface IAnswer {
  questionIndex: number;
  selectedAnswer: number; // Index of selected option
  isCorrect: boolean;
  timeSpent?: number; // Seconds spent on this question
}

// QuizSession Document interface
export interface IQuizSession extends Document {
  quizId: Types.ObjectId;
  studentId: Types.ObjectId;
  answers: IAnswer[];
  score: number; // Percentage (0-100)
  correctCount: number;
  totalQuestions: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // Total seconds spent
  passed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  questionIndex: {
    type: Number,
    required: true,
    min: 0,
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number,
    min: 0,
  },
}, { _id: false });

const quizSessionSchema = new Schema<IQuizSession>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    correctCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
quizSessionSchema.index({ quizId: 1, studentId: 1 });
quizSessionSchema.index({ studentId: 1, createdAt: -1 });
quizSessionSchema.index({ status: 1, startedAt: -1 });

// Prevent duplicate active sessions
quizSessionSchema.index(
  { quizId: 1, studentId: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'in-progress' }
  }
);

export const QuizSession = mongoose.model<IQuizSession>('QuizSession', quizSessionSchema);
