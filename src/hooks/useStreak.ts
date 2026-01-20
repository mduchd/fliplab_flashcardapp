// Custom hook để quản lý Streak - chuyển đổi từ streak.js
import { useState, useEffect } from 'react';
import type { Streak } from '../types';
import { getStreak, saveStreak } from '../utils/localStorage';
import { getTodayString } from '../utils/helpers';

export const useStreak = () => {
  const [streak, setStreak] = useState<Streak>({
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    studyDates: [],
  });

  // Load từ localStorage
  useEffect(() => {
    const loadedStreak = getStreak();
    setStreak(loadedStreak);
  }, []);

  // Save mỗi khi streak thay đổi
  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  const updateStreak = () => {
    const today = getTodayString();
    
    // Nếu đã học hôm nay rồi thì không làm gì
    if (streak.lastStudyDate === today) {
      return;
    }

    setStreak((prev) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = 1;

      // Nếu học liên tục
      if (prev.lastStudyDate === yesterdayString) {
        newCurrentStreak = prev.currentStreak + 1;
      }

      const newLongestStreak = Math.max(newCurrentStreak, prev.longestStreak);

      return {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: today,
        studyDates: [...prev.studyDates, today],
      };
    });
  };

  const resetStreak = () => {
    setStreak({
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: '',
      studyDates: [],
    });
  };

  return {
    streak,
    updateStreak,
    resetStreak,
  };
};
