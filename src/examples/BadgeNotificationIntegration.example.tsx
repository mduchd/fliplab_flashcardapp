/**
 * BADGE NOTIFICATION - INTEGRATION EXAMPLE
 * 
 * File này demo cách tích hợp badge notification system vào app.
 * Copy code này vào components tương ứng.
 */

// ============================================
// 1. App.tsx hoặc MainLayout.tsx
// ============================================

import BadgeNotificationManager from './components/notifications/BadgeNotificationManager';

function App() {
  return (
    <div className="app">
      {/* Your existing app content */}
      <Routes>
        {/* ... routes ... */}
      </Routes>

      {/* 🎯 Add this at the end of App */}
      <BadgeNotificationManager />
    </div>
  );
}

// ============================================
// 2. Profile.tsx hoặc Dashboard.tsx
// ============================================

import { useBadgeNotifications } from '../hooks/useBadgeNotifications';

function Profile() {
  // Get user stats from your existing hook/context
  const { data: userStats } = useUserStats(); // or however you get stats
  
  // 🎯 Auto-detect badge unlocks
  useBadgeNotifications(userStats);

  return (
    <div>
      {/* Your existing profile content */}
      <ActivityStats userStats={userStats} />
    </div>
  );
}

// ============================================
// 3. Testing Component (Optional)
// ============================================

import { triggerBadgeNotification } from '../hooks/useBadgeNotifications';

function BadgeTestingPanel() {
  const testBadges = () => {
    // Test all tiers
    setTimeout(() => triggerBadgeNotification('STREAK_3'), 0);      // Bronze
    setTimeout(() => triggerBadgeNotification('STREAK_7'), 500);    // Silver  
    setTimeout(() => triggerBadgeNotification('STREAK_14'), 1000);  // Gold
    setTimeout(() => triggerBadgeNotification('STREAK_30'), 1500);  // Diamond
  };

  return (
    <div className="p-4">
      <button 
        onClick={testBadges}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Test Badge Notifications
      </button>
    </div>
  );
}

// ============================================
// 4. Manual Trigger from API Response
// ============================================

import { showBadgeNotification } from '../components/notifications/BadgeNotificationManager';
import { BADGES } from '../constants/badgeConstants';

async function handleStudySession() {
  const response = await api.post('/flashcards/study-session', sessionData);
  
  // If backend returns newly unlocked badges
  if (response.data.unlockedBadges) {
    response.data.unlockedBadges.forEach((badgeId: string) => {
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge) {
        showBadgeNotification(badge);
      }
    });
  }
}

// ============================================
// 5. With Custom User Stats Hook
// ============================================

import { useBadgeNotifications } from '../hooks/useBadgeNotifications';
import { useAuth } from '../contexts/AuthContext';

function useUserBadgeTracking() {
  const { user } = useAuth();
  
  const userStats = {
    streak: user?.stats?.streak || 0,
    masteredCards: user?.stats?.masteredCards || 0,
    createdDecks: user?.stats?.createdDecks || 0,
    totalReviews: user?.stats?.totalReviews || 0,
    // ... other stats
  };

  // Auto-notify on badge unlock
  useBadgeNotifications(userStats);

  return userStats;
}

// Usage in component:
function SomeComponent() {
  const stats = useUserBadgeTracking(); // Auto-detects badges!
  return <div>...</div>;
}

// ============================================
// 6. Conditional Enable/Disable
// ============================================

function ProfileSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { userStats } = useUserStats();

  // Only show badge notifications if user enabled them
  useBadgeNotifications(userStats, notificationsEnabled);

  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={notificationsEnabled}
          onChange={e => setNotificationsEnabled(e.target.checked)}
        />
        Enable badge notifications
      </label>
    </div>
  );
}

// ============================================
// 7. With React Query / SWR
// ============================================

import { useQuery } from '@tanstack/react-query';
import { useBadgeNotifications } from '../hooks/useBadgeNotifications';

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats
  });

  // Auto-notify when stats change
  useBadgeNotifications(stats);

  return <div>...</div>;
}

// ============================================
// 8. Export for Testing
// ============================================

export {
  // For manual testing in console
  triggerBadgeNotification,
  showBadgeNotification
};

// In browser console:
// triggerBadgeNotification('MASTER_50');
