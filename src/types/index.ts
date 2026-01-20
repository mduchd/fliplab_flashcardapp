// Định nghĩa các kiểu dữ liệu cho Flashcard App

export interface Flashcard {
  term: string;
  definition: string;
  imageUrl?: string;
}

export interface FlashcardSet {
  id: string;
  name: string;
  description: string;
  category: string;
  userId: string;
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyDates: string[];
}

export interface DailyGoal {
  target: number;
  progress: number;
  lastUpdated: string;
}

export interface StudySession {
  setId: string;
  mode: 'flashcard' | 'quiz' | 'match';
  cardsStudied: number;
  correctAnswers: number;
  timestamp: string;
  duration: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  onUndo?: () => void;
}
