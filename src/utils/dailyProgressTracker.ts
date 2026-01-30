/**
 * Daily Progress Tracker
 * Handles updating daily study progress and streaks for Daily Goal feature
 * Now syncs with Server via streakService efficiently using Debounce
 */

import { streakService } from '../services/streakService';

interface DailyProgress {
  date: string;
  cardsStudied: number;
}

interface StreakData {
  currentStreak: number;
  lastStudiedDate: string;
}

// In-memory state for debounce logic
let pendingCount = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 2000; // 2 seconds

export const dailyProgressTracker = {
  /**
   * Increment daily progress by a certain number of cards
   */
  incrementProgress(cardCount: number = 1): void {
    // 1. Update In-Memory Pending Count
    pendingCount += cardCount;

    // 2. Optimistic UI Update (Immediate)
    // We update local storage immediately based on current value + 1
    // Read fresh to avoid race in logic, but since this runs in JS thread, it's safe mostly
    this.updateLocalProgress(cardCount);

    // 3. Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 4. Set new timer to sync with server
    debounceTimer = setTimeout(() => {
      this.syncPendingProgress();
    }, DEBOUNCE_DELAY);
  },

  /**
   * Actual Sync Function called after delay
   */
  async syncPendingProgress() {
    if (pendingCount === 0) return;

    const countToSync = pendingCount;
    pendingCount = 0; // Reset before async call to avoid double sync logic if needed
    
    try {
      // Server Sync
      const response = await streakService.syncProgress(countToSync);
      
      if (response.success && response.data) {
        // Cập nhật lại LocalStorage với dữ liệu chuẩn từ Server (Source of Truth)
        const serverGoal = response.data.dailyGoal;
        const serverStreak = response.data.streak;
        
        const today = new Date().toISOString().split('T')[0];
        
        // Update Progress Store
        const progress: DailyProgress = {
            date: today,
            cardsStudied: serverGoal.studiedToday
        };
        localStorage.setItem('dailyProgress', JSON.stringify(progress));

        // Update Streak Store
        const streakData: StreakData = {
            currentStreak: serverStreak.currentStreak,
            lastStudiedDate: serverStreak.lastStudyDate ? new Date(serverStreak.lastStudyDate).toISOString().split('T')[0] : ''
        };
        localStorage.setItem('streakData', JSON.stringify(streakData));

        // Redispatch Event to ensure consistency
        window.dispatchEvent(new CustomEvent('dailyProgressUpdate', { 
            detail: progress 
        }));
        
        if (response.data.streakUpdated) {
            window.dispatchEvent(new CustomEvent('streakUpdated', { 
                detail: streakData 
            }));
        }
      }
    } catch (error) {
      console.error('Failed to sync progress with server', error);
      // If fail, we might want to add back to pendingCount?
      // For now, let's keep it simple. LocalStorage is already updated optimistically in step 2.
    }
  },

  updateLocalProgress(cardCount: number) {
      const today = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem('dailyProgress');
      
      let progress: DailyProgress;
      
      if (stored) {
        progress = JSON.parse(stored);
        const storedDate = progress.date.includes('T') ? progress.date.split('T')[0] : progress.date;
        
        if (storedDate !== today) {
          progress = { date: today, cardsStudied: cardCount };
        } else {
          progress.cardsStudied += cardCount;
        }
      } else {
        progress = { date: today, cardsStudied: cardCount };
      }
      
      localStorage.setItem('dailyProgress', JSON.stringify(progress));
      
      // Emit event immediately
      window.dispatchEvent(new CustomEvent('dailyProgressUpdate', { 
        detail: progress 
      }));
  },

  /**
   * Initialize / fetch stats from server on App load
   */
  async initStats() {
      try {
          const response = await streakService.getMyStats();
          if (response.success) {
             const { dailyGoal, streak } = response.data;
             const today = new Date().toISOString().split('T')[0];

             // Check if local waiting changes exist (unlikely on load but good practice)
             // ...

             // Sync LocalStorage
             const progress: DailyProgress = {
                date: today,
                cardsStudied: dailyGoal.studiedToday
             };
             localStorage.setItem('dailyProgress', JSON.stringify(progress));
             localStorage.setItem('settings_dailyGoal', dailyGoal.targetCards.toString()); // Sync target

             const streakData: StreakData = {
                currentStreak: streak.currentStreak,
                lastStudiedDate: streak.lastStudyDate ? new Date(streak.lastStudyDate).toISOString().split('T')[0] : ''
             };
             localStorage.setItem('streakData', JSON.stringify(streakData));

             // Dispatch events updates
             window.dispatchEvent(new CustomEvent('dailyProgressUpdate', { detail: progress }));
             window.dispatchEvent(new CustomEvent('streakUpdated', { detail: streakData }));
          }
      } catch (error) {
          console.error("Failed to init stats", error);
      }
  },

  /**
   * Check if studied today
   */
  hasStudiedToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('streakData');
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    
    // Check if date matches
    if (data.lastStudiedDate !== today) {
        return false;
    }

    // Additional Check: If Date matches but Progress is 0, it means Daily Goal was reset (New Day logic)
    // but Streak Date might be desynced or timezone overlapped. 
    // We strictly require at least 1 card studied to show "Completed".
    return this.getProgress() > 0;
  },

  /**
   * Get current progress (Read from LocalStorage for speed)
   */
  getProgress(): number {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('dailyProgress');
    
    if (!stored) return 0;
    
    const progress: DailyProgress = JSON.parse(stored);
    const storedDate = progress.date.includes('T') ? progress.date.split('T')[0] : progress.date;
    
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
  }
};
