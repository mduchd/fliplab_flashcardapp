import mongoose, { Document, Schema, Types } from 'mongoose';

// Question interface
export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3)
  timeLimit?: number; // Optional time limit per question (seconds)
}

// Quiz Document interface
export interface IQuiz extends Document {
  title: string;
  description?: string;
  createdBy: Types.ObjectId;
  questions: IQuestion[];
  settings: {
    timeLimit: number; // Total quiz time limit (minutes)
    passingScore: number; // Percentage (0-100)
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResults: boolean; // Show results immediately after quiz
    allowRetake: boolean;
  };
  isPublic: boolean;
  accessCode?: string; // For private quizzes
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length === 4,
      message: 'Each question must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  timeLimit: {
    type: Number,
    min: 5,
    max: 300, // Max 5 minutes per question
  },
}, { _id: false });

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (v: IQuestion[]) => v.length > 0,
        message: 'Quiz must have at least 1 question',
      },
    },
    settings: {
      timeLimit: {
        type: Number,
        required: true,
        default: 30, // 30 minutes
        min: 1,
        max: 180, // Max 3 hours
      },
      passingScore: {
        type: Number,
        required: true,
        default: 60,
        min: 0,
        max: 100,
      },
      shuffleQuestions: {
        type: Boolean,
        default: false,
      },
      shuffleOptions: {
        type: Boolean,
        default: false,
      },
      showResults: {
        type: Boolean,
        default: true,
      },
      allowRetake: {
        type: Boolean,
        default: true,
      },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    accessCode: {
      type: String,
      trim: true,
      sparse: true, // Allow null but ensure uniqueness when present
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ accessCode: 1 }, { sparse: true });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
