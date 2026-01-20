// Utilities cho localStorage - chuyển đổi từ code vanilla JS
import type { FlashcardSet, User, Streak, DailyGoal } from '../types';

const STORAGE_KEYS = {
  FLASHCARD_SETS: 'flashcardSets',
  CURRENT_USER: 'currentUser',
  STREAK: 'userStreak',
  DAILY_GOAL: 'dailyGoal',
  STUDY_SESSIONS: 'studySessions',
  THEME: 'theme',
} as const;

// Generic localStorage helpers
export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Specific data accessors
export const getFlashcardSets = (): FlashcardSet[] => {
  return storage.get<FlashcardSet[]>(STORAGE_KEYS.FLASHCARD_SETS) || [];
};

export const saveFlashcardSets = (sets: FlashcardSet[]): void => {
  storage.set(STORAGE_KEYS.FLASHCARD_SETS, sets);
};

export const getCurrentUser = (): User | null => {
  return storage.get<User>(STORAGE_KEYS.CURRENT_USER);
};

export const saveCurrentUser = (user: User | null): void => {
  if (user) {
    storage.set(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    storage.remove(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getStreak = (): Streak => {
  return storage.get<Streak>(STORAGE_KEYS.STREAK) || {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    studyDates: [],
  };
};

export const saveStreak = (streak: Streak): void => {
  storage.set(STORAGE_KEYS.STREAK, streak);
};

export const getDailyGoal = (): DailyGoal => {
  return storage.get<DailyGoal>(STORAGE_KEYS.DAILY_GOAL) || {
    target: 20,
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
};

export const saveDailyGoal = (goal: DailyGoal): void => {
  storage.set(STORAGE_KEYS.DAILY_GOAL, goal);
};

export const getTheme = (): 'light' | 'dark' => {
  return storage.get<'light' | 'dark'>(STORAGE_KEYS.THEME) || 'light';
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  storage.set(STORAGE_KEYS.THEME, theme);
};
