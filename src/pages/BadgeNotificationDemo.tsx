import React from 'react';
import { HiSparkles, HiTrophy } from 'react-icons/hi2';
import { triggerBadgeNotification } from '../hooks/useBadgeNotifications';

const BadgeNotificationDemo: React.FC = () => {
  const testSingleBadge = (badgeId: string) => {
    triggerBadgeNotification(badgeId);
  };

  const testMultipleBadges = () => {
    // Test stacking with different tiers
    setTimeout(() => triggerBadgeNotification('STREAK_3'), 0);      // Bronze
    setTimeout(() => triggerBadgeNotification('REVIEW_100'), 400);  // Silver
    setTimeout(() => triggerBadgeNotification('MASTER_50'), 800);   // Gold
    setTimeout(() => triggerBadgeNotification('STREAK_30'), 1200);  // Diamond
  };

  const testAllTiers = () => {
    // Show one of each tier
    setTimeout(() => triggerBadgeNotification('CREATOR_1'), 0);     // Bronze
    setTimeout(() => triggerBadgeNotification('STREAK_7'), 500);    // Silver
    setTimeout(() => triggerBadgeNotification('QUIZ_EXPERT'), 1000); // Gold
    setTimeout(() => triggerBadgeNotification('MASTER_1000'), 1500); // Diamond
  };

  const testNewBadges = () => {
    // Test some newly added badges
    setTimeout(() => triggerBadgeNotification('REVIEW_10'), 0);      // Tập Sự
    setTimeout(() => triggerBadgeNotification('FRIEND'), 400);       // Bạn Bè
    setTimeout(() => triggerBadgeNotification('AI_SORCERER'), 800);  // Thuật Sư
    setTimeout(() => triggerBadgeNotification('QUIZ_CHAMPION'), 1200); // Vô Địch
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <HiTrophy className="w-12 h-12 text-yellow-500 animate-bounce" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Badge Notification Demo
            </h1>
            <HiSparkles className="w-12 h-12 text-cyan-500 animate-pulse" />
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Click các button để xem badge notifications với styling khác nhau!
          </p>
        </div>

        {/* Test Sections */}
        <div className="space-y-8">
          
          {/* Individual Tiers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Test Individual Tiers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => testSingleBadge('STREAK_3')}
                className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-xs opacity-80 mb-1">🟫 BRONZE</div>
                  <div>Tàn Lửa</div>
                </div>
              </button>

              <button
                onClick={() => testSingleBadge('STREAK_7')}
                className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-br from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 shadow-lg shadow-slate-400/30 hover:shadow-xl hover:shadow-slate-400/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-xs opacity-80 mb-1">⚪ SILVER</div>
                  <div>Ngọn Đuốc</div>
                </div>
              </button>

              <button
                onClick={() => testSingleBadge('STREAK_14')}
                className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/60 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-xs opacity-80 mb-1">🟡 GOLD</div>
                  <div>Lửa Hồng</div>
                </div>
              </button>

              <button
                onClick={() => testSingleBadge('STREAK_100')}
                className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-xs opacity-80 mb-1">💎 DIAMOND</div>
                  <div>Bất Tử</div>
                </div>
              </button>
            </div>
          </div>

          {/* Combo Tests */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Test Multiple Notifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={testMultipleBadges}
                className="group px-6 py-5 rounded-xl font-semibold text-white bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <HiSparkles className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                <div>Test Stacking</div>
                <div className="text-xs opacity-80 mt-1">4 badges cascade</div>
              </button>

              <button
                onClick={testAllTiers}
                className="group px-6 py-5 rounded-xl font-semibold text-white bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <HiTrophy className="w-6 h-6 mx-auto mb-2 animate-bounce" />
                <div>All Tiers</div>
                <div className="text-xs opacity-80 mt-1">Bronze → Diamond</div>
              </button>

              <button
                onClick={testNewBadges}
                className="group px-6 py-5 rounded-xl font-semibold text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <HiSparkles className="w-6 h-6 mx-auto mb-2 animate-spin-slow" />
                <div>New Badges</div>
                <div className="text-xs opacity-80 mt-1">Recently added</div>
              </button>
            </div>
          </div>

          {/* More Examples */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              Test Specific Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => testSingleBadge('MASTER_250')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                🧠 Đại Hiền
              </button>
              <button
                onClick={() => testSingleBadge('CREATOR_50')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                ✏️ Tổng Sư
              </button>
              <button
                onClick={() => testSingleBadge('REVIEW_2000')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                📚 Bất Khuất
              </button>
              <button
                onClick={() => testSingleBadge('INSPIRATION')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                👥 Truyền Cảm Hứng
              </button>
              <button
                onClick={() => testSingleBadge('AI_MASTER')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                🤖 Đại Pháp Sư
              </button>
              <button
                onClick={() => testSingleBadge('QUIZ_CHAMPION')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                🎯 Vô Địch
              </button>
              <button
                onClick={() => testSingleBadge('POWER_USER')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                🛠️ Chuyên Gia
              </button>
              <button
                onClick={() => testSingleBadge('FEATURE_MASTER')}
                className="px-4 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                ⭐ Bậc Thầy
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <HiSparkles className="w-5 h-5" />
              Hướng Dẫn
            </h3>
            <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
              <li>✨ <strong>Individual Tiers:</strong> Test từng tier riêng lẻ</li>
              <li>🎯 <strong>Test Stacking:</strong> Xem nhiều notifications stack như thế nào</li>
              <li>🏆 <strong>All Tiers:</strong> Xem progression từ Bronze → Diamond</li>
              <li>🆕 <strong>New Badges:</strong> Test các badges mới thêm vào</li>
              <li>📂 <strong>Categories:</strong> Test badges từ mọi category</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotificationDemo;
