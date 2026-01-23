import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFlashcard {
  term: string;
  definition: string;
  image?: string;
  starred: boolean;
  box: number;
  nextReview?: Date;
}

export interface IFlashcardSet extends Document {
  name: string;
  description?: string;
  cards: IFlashcard[];
  userId: Types.ObjectId;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastStudied?: Date;
  totalStudies: number;
  folderId?: Types.ObjectId;
  color?: string;
}

const flashcardSchema = new Schema<IFlashcard>({
  term: {
    type: String,
    required: [true, 'Term is required'],
    trim: true,
  },
  definition: {
    type: String,
    required: [true, 'Definition is required'],
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  starred: {
    type: Boolean,
    default: false,
  },
  box: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
  },
  nextReview: {
    type: Date,
  },
}, { _id: true });

const flashcardSetSchema = new Schema<IFlashcardSet>(
  {
    name: {
      type: String,
      required: [true, 'Flashcard set name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    cards: {
      type: [flashcardSchema],
      validate: {
        validator: function(cards: IFlashcard[]) {
          return cards.length > 0;
        },
        message: 'Flashcard set must have at least one card',
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    lastStudied: {
      type: Date,
    },
    totalStudies: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#667eea',
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
flashcardSetSchema.index({ name: 'text', description: 'text', tags: 'text' });
flashcardSetSchema.index({ userId: 1, createdAt: -1 });

export const FlashcardSet = mongoose.model<IFlashcardSet>('FlashcardSet', flashcardSetSchema);
