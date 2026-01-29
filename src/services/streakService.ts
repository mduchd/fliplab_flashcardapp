import api from './api';

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string;
  studyDates: string[];
}

export interface DailyGoalData {
  userId: string;
  targetCards: number;
  studiedToday: number;
  lastResetDate: string;
  completedDays: number;
}

export interface StreakResponse {
  streak: StreakData;
  dailyGoal: DailyGoalData;
}

export const streakService = {
  // Get current streak and goal
  getMyStats: async (): Promise<{ success: boolean; data: StreakResponse }> => {
    const response = await api.get('/streaks');
    return response.data;
  },

  // Sync progress (increment card count)
  syncProgress: async (count: number = 1): Promise<{ 
    success: boolean; 
    data: StreakResponse & { streakUpdated: boolean } 
  }> => {
    const response = await api.post('/streaks/sync', { count });
    return response.data;
  },

  // Update Daily Goal Target
  updateTarget: async (target: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/streaks/target', { target });
    return response.data;
  }
};
