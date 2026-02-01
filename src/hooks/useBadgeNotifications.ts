import { useEffect, useRef } from 'react';
import { BADGES, checkBadgeUnlocked } from '../constants/badgeConstants';
import { showBadgeNotification } from '../components/notifications/BadgeNotificationManager';

/**
 * Hook to automatically detect and notify when user unlocks new badges
 * @param userStats - Current user statistics
 * @param enabled - Whether to enable badge detection (default: true)
 */
export const useBadgeNotifications = (userStats: any, enabled: boolean = true) => {
  const previousUnlockedRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !userStats) return;

    // Get currently unlocked badges
    const currentUnlocked = new Set<string>();
    BADGES.forEach(badge => {
      if (checkBadgeUnlocked(badge, userStats)) {
        currentUnlocked.add(badge.id);
      }
    });

    // On first load, just store current state without showing notifications
    if (!isInitializedRef.current) {
      previousUnlockedRef.current = currentUnlocked;
      isInitializedRef.current = true;
      return;
    }

    // Find newly unlocked badges
    const newlyUnlocked: string[] = [];
    currentUnlocked.forEach(badgeId => {
      if (!previousUnlockedRef.current.has(badgeId)) {
        newlyUnlocked.push(badgeId);
      }
    });

    // Show notifications for newly unlocked badges
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(badgeId => {
        const badge = BADGES.find(b => b.id === badgeId);
        if (badge) {
          // Delay each notification slightly for better UX
          setTimeout(() => {
            showBadgeNotification(badge);
          }, newlyUnlocked.indexOf(badgeId) * 300);
        }
      });
    }

    // Update previous state
    previousUnlockedRef.current = currentUnlocked;

  }, [userStats, enabled]);
};

/**
 * Manually trigger a badge notification (for testing or special cases)
 */
export const triggerBadgeNotification = (badgeId: string) => {
  const badge = BADGES.find(b => b.id === badgeId);
  if (badge) {
    showBadgeNotification(badge);
  }
};
