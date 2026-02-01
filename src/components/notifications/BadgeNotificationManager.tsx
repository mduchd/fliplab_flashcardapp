import React, { useState, useEffect, useCallback } from 'react';
import BadgeNotification from './BadgeNotification';
import type { Badge } from '../../constants/badgeConstants';

interface NotificationItem {
  id: string;
  badge: Badge;
}

let notificationQueue: Badge[] = [];
let addToQueueCallback: ((badge: Badge) => void) | null = null;

// Global function to show badge notification
export const showBadgeNotification = (badge: Badge) => {
  if (addToQueueCallback) {
    addToQueueCallback(badge);
  } else {
    notificationQueue.push(badge);
  }
};

const BadgeNotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addToQueue = useCallback((badge: Badge) => {
    const id = `${badge.id}-${Date.now()}`;
    setNotifications(prev => [...prev, { id, badge }]);
  }, []);

  useEffect(() => {
    // Register callback
    addToQueueCallback = addToQueue;

    // Process any queued notifications
    if (notificationQueue.length > 0) {
      notificationQueue.forEach(badge => addToQueue(badge));
      notificationQueue = [];
    }

    return () => {
      addToQueueCallback = null;
    };
  }, [addToQueue]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 140}px)` // Stack notifications
          }}
        >
          <BadgeNotification
            badge={notification.badge}
            onClose={() => removeNotification(notification.id)}
            duration={5000}
          />
        </div>
      ))}
    </>
  );
};

export default BadgeNotificationManager;
