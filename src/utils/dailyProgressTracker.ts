/**
 * Daily Progress Tracker
 * Handles updating daily study progress and streaks for Daily Goal feature
 */

interface DailyProgress {
  date: string;
  cardsStudied: number;
}

interface StreakData {
  currentStreak: number;
  lastStudiedDate: string;
}

export const dailyProgressTracker = {
  /**
   * Increment daily progress by a certain number of cards
   * Also handles Streak updates automatically
   */
  incrementProgress(cardCount: number = 1): void {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('dailyProgress');
    
    let progress: DailyProgress;
    
    // 1. Update Daily Cards Progress
    if (stored) {
      progress = JSON.parse(stored);
      // Check if it's a new day (compare YYYY-MM-DD from ISO string)
      const storedDate = progress.date.includes('T') ? progress.date.split('T')[0] : progress.date;
      
      if (storedDate !== today) {
        // Reset for new day
        progress = { date: today, cardsStudied: cardCount };
      } else {
        // Same day, increment
        progress.cardsStudied += cardCount;
      }
    } else {
      // First time tracking
      progress = { date: today, cardsStudied: cardCount };
    }
    
    localStorage.setItem('dailyProgress', JSON.stringify(progress));
    
    // 2. Check and Update Streak
    this.checkAndUpdateStreak(today);

    // Dispatch custom event for UI updates (Daily Goal)
    window.dispatchEvent(new CustomEvent('dailyProgressUpdate', { 
      detail: progress 
    }));
  },

  /**
   * Check and update streak logic
   */
  checkAndUpdateStreak(today: string): void {
    const storedStreak = localStorage.getItem('streakData');
    let streakData: StreakData = storedStreak ? JSON.parse(storedStreak) : { currentStreak: 0, lastStudiedDate: '' };
    
    const lastDate = streakData.lastStudiedDate;
    
    // If already studied today, do nothing
    if (lastDate === today) return;

    // Calculate dates
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = streakData.currentStreak;

    if (lastDate === yesterdayStr) {
      // Studied yesterday -> Increment streak
      newStreak += 1;
    } else if (lastDate !== today) {
      // Missed a day or first time -> Reset or Start at 1
      // Note: If logic allows freezing streaks, add check here. 
      // For now, reset to 1 if not yesterday (and not today which is covered above)
      newStreak = 1;
    }

    // Save new streak data
    const newStreakData = {
      currentStreak: newStreak,
      lastStudiedDate: today
    };
    
    localStorage.setItem('streakData', JSON.stringify(newStreakData));
    
    // Also update legacy simple keys for compatibility if needed, 
    // but better to stick to one object. 
    // Let's rely on 'streakData' object.

    // Dispatch Streak Event
    window.dispatchEvent(new CustomEvent('streakUpdated', { 
      detail: newStreakData 
    }));
  },

  /**
   * Get current progress
   */
  getProgress(): number {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('dailyProgress');
    
    if (!stored) return 0;
    
    const progress: DailyProgress = JSON.parse(stored);
    const storedDate = progress.date.includes('T') ? progress.date.split('T')[0] : progress.date;
    
    // Only return if it's today's data
    if (storedDate === today) {
      return progress.cardsStudied;
    }
    
    return 0;
  },

  /**
   * Get current streak info
   */
  getStreak(): number {
    const stored = localStorage.getItem('streakData');
    if (!stored) return 0;
    return JSON.parse(stored).currentStreak;
  },

  /**
   * Check if studied today
   */
  hasStudiedToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('streakData');
    if (!stored) return false;
    return JSON.parse(stored).lastStudiedDate === today;
  },

  /**
   * Get daily goal from settings
   */
  getDailyGoal(): number {
    const saved = localStorage.getItem('settings_dailyGoal');
    return saved ? parseInt(saved) : 20;
  },

  /**
   * Check if daily goal is completed
   */
  isGoalCompleted(): boolean {
    return this.getProgress() >= this.getDailyGoal();
  },
};
