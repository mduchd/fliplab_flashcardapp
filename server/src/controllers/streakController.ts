import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Streak } from '../models/Streak.js';
import { DailyGoal } from '../models/DailyGoal.js';

import { StudyLog } from '../models/StudyLog.js';

// @desc    Get user streak stats
// @route   GET /api/streaks
// @access  Private
export const getMyStreak = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    let streak = await Streak.findOne({ userId });
    
    // Nếu chưa có thì tạo mới
    if (!streak) {
      streak = await Streak.create({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        studyDates: []
      });
    }

    // Lấy Daily Goal (Mô hình này lưu 1 document duy nhất cho user và reset daily)
    let dailyGoal = await DailyGoal.findOne({ userId });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Nếu chưa có daily goal thì tạo default
    if (!dailyGoal) {
       dailyGoal = await DailyGoal.create({
         userId,
         targetCards: 20,
         studiedToday: 0,
         lastResetDate: today,
         completedDays: 0
       });
    } else {
        // Kiểm tra reset nếu qua ngày mới logic backend (an toàn hơn frontend)
        const lastReset = new Date(dailyGoal.lastResetDate);
        lastReset.setHours(0, 0, 0, 0);
        
        if (lastReset.getTime() !== today.getTime()) {
            dailyGoal.studiedToday = 0;
            dailyGoal.lastResetDate = today;
            await dailyGoal.save();
        }
    }

    // --- Lấy lịch sử 14 ngày gần nhất từ StudyLog ---
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    // Convert to YYYY-MM-DD for string comparison if needed, but Mongo Date query works if stored as Date properly
    // Our StudyLog stores date as string YYYY-MM-DD
    const logs = await StudyLog.find({
        userId,
        createdAt: { $gte: twoWeeksAgo } // Dùng createdAt hoặc date string để filter
    }).sort({ date: 1 });
    
    // Map logs to simple array
    const history = logs.map(log => ({
        date: log.date,
        count: log.count,
        metGoal: log.metGoal
    }));

    res.json({
      success: true,
      data: {
        streak,
        dailyGoal,
        history // Trả về lịch sử thật
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync progress (increment cards count)
// @route   POST /api/streaks/sync
// @access  Private
export const syncProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { count } = req.body; // Số lượng card vừa học thêm
    
    const increment = count || 1;
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];

    // 1. Cập nhật Daily Goal
    let dailyGoal = await DailyGoal.findOne({ userId });

    if (!dailyGoal) {
      dailyGoal = await DailyGoal.create({
        userId,
        targetCards: 20,
        studiedToday: 0,
        lastResetDate: today,
        completedDays: 0
      });
    }
    
    // Check reset
    const lastReset = dailyGoal.lastResetDate ? new Date(dailyGoal.lastResetDate) : new Date(0);
    lastReset.setHours(0,0,0,0);
    
    if (lastReset.getTime() !== today.getTime()) {
        dailyGoal.studiedToday = 0;
        dailyGoal.lastResetDate = today;
    }

    // Check complete target logic (để tăng completedDays)
    const wasCompleted = dailyGoal.studiedToday >= dailyGoal.targetCards;
    
    dailyGoal.studiedToday += increment;
    
    // Nếu vừa hoàn thành hôm nay
    if (!wasCompleted && dailyGoal.studiedToday >= dailyGoal.targetCards) {
        dailyGoal.completedDays += 1;
    }
    
    await dailyGoal.save();

    // 2. Cập nhật StudyLog (Lịch sử chi tiết)
    let todayLog = await StudyLog.findOne({ userId, date: dateString });
    if (!todayLog) {
        todayLog = new StudyLog({
            userId,
            date: dateString,
            count: 0,
            target: dailyGoal.targetCards,
            metGoal: false
        });
    }
    
    todayLog.count += increment;
    todayLog.target = dailyGoal.targetCards; // Update target if changed
    todayLog.metGoal = todayLog.count >= todayLog.target;
    await todayLog.save();


    // 3. Cập nhật Streak
    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = new Streak({ userId, currentStreak: 0, longestStreak: 0, studyDates: [] });
    }

    const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null;
    let isStreakUpdated = false;
    let isStreakBroken = false;

    const lastDateZero = lastDate ? new Date(lastDate) : null;
    if (lastDateZero) lastDateZero.setHours(0, 0, 0, 0);

    if (!lastDateZero || lastDateZero.getTime() !== today.getTime()) {
        // Chưa học hôm nay (hoặc lần đầu log trong ngày)
        
        // Check nếu học hôm qua
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDateZero && lastDateZero.getTime() === yesterday.getTime()) {
            streak.currentStreak += 1;
        } else if (!lastDateZero || lastDateZero.getTime() < yesterday.getTime()) {
            // Mất chuỗi hoặc lần đầu
            streak.currentStreak = 1;
            isStreakBroken = true;
        }
        
        // Update longest
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }
        
        if (!streak.studyDates) streak.studyDates = [];
        streak.studyDates.push(now);
        streak.lastStudyDate = now;
        isStreakUpdated = true;
    } else {
        // Đã học hôm nay -> chỉ update timestamp
        streak.lastStudyDate = now;
    }

    await streak.save();

    res.json({
      success: true,
      data: {
        dailyGoal,
        streak,
        streakUpdated: isStreakUpdated
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Daily Goal Target
// @route   PUT /api/streaks/target
// @access  Private
export const updateGoalTarget = async (req: AuthRequest, res: Response) => {
    try {
        const { target } = req.body;
        const userId = req.userId;

        let dailyGoal = await DailyGoal.findOne({ userId });
        if (dailyGoal) {
            dailyGoal.targetCards = target;
            await dailyGoal.save();
        } else {
             await DailyGoal.create({
                userId,
                targetCards: target,
                studiedToday: 0,
                lastResetDate: new Date()
             });
        }
        
        res.json({ success: true, message: 'Updated goal target' });
    } catch(error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
