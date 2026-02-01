# 🎯 BADGE NOTIFICATION SYSTEM

## 📋 Tổng Quan

Hệ thống thông báo huy hiệu tự động phát hiện và hiển thị toast notifications khi user unlock badges mới.

---

## 🏗️ Kiến Trúc

### Components:
1. **BadgeNotification.tsx** - Toast notification component
2. **BadgeNotificationManager.tsx** - Manager để handle multiple notifications
3. **useBadgeNotifications.ts** - Hook tự động detect badge unlocks

---

## 🚀 Cách Sử Dụng

### 1. Setup trong App.tsx hoặc Layout

```tsx
import BadgeNotificationManager from './components/notifications/BadgeNotificationManager';

function App() {
  return (
    <>
      {/* Your app content */}
      <BadgeNotificationManager />
    </>
  );
}
```

### 2. Sử dụng Hook trong Component

```tsx
import { useBadgeNotifications } from './hooks/useBadgeNotifications';

function ProfilePage() {
  const { data: userStats } = useUserStats(); // Your stats hook
  
  // Auto-detect badge unlocks
  useBadgeNotifications(userStats);
  
  return <YourComponent />;
}
```

### 3. Manual Trigger (Optional)

```tsx
import { triggerBadgeNotification } from './hooks/useBadgeNotifications';

// Trigger manually for testing
triggerBadgeNotification('STREAK_7'); // Badge ID
```

### 4. Global Function

```tsx
import { showBadgeNotification } from './components/notifications/BadgeNotificationManager';
import { BADGES } from './constants/badgeConstants';

// Show notification programmatically
const badge = BADGES.find(b => b.id === 'MASTER_50');
if (badge) {
  showBadgeNotification(badge);
}
```

---

## 🎨 Features

### ✅ Tự Động Detect
- Hook tự động so sánh trạng thái cũ/mới
- Chỉ hiển thị notification cho badges MỚI unlock
- Không spam khi refresh/reload

### ✅ Beautiful UI  
- **Tier-specific styling** - mỗi tier có màu, shadow riêng
- **Smooth animations** - slide in/out, bounce effect
- **Sparkle effects** - hiệu ứng lấp lánh
- **Auto-dismiss** - tự đóng sau 5 giây

### ✅ Smart Queueing
- **Multiple notifications** - stack từ trên xuống
- **Staggered timing** - delay 300ms giữa các notification
- **Non-blocking** - không ảnh hưởng UX

### ✅ Responsive
- **Mobile-friendly** - tự điều chỉnh vị trí
- **Dark mode support** - đầy đủ dark mode
- **Accessibility** - có thể đóng bằng button

---

## 📊 Notification Styling

### Bronze Tier:
```
Border: orange-700/50
Gradient: from-orange-100 to-orange-200
Shadow: shadow-lg shadow-orange-500/50
Text: text-orange-700
```

### Silver Tier:
```
Border: slate-400/70
Gradient: from-slate-50 to-slate-200
Shadow: shadow-lg shadow-slate-400/50
Text: text-slate-700
```

### Gold Tier:
```
Border: yellow-500/80
Gradient: from-yellow-100 to-yellow-300
Shadow: shadow-[0_0_30px_rgba(234,179,8,0.6)]
Text: text-yellow-700
```

### Diamond Tier:
```
Border: cyan-400/80
Gradient: from-cyan-100 to-blue-200
Shadow: shadow-[0_0_35px_rgba(34,211,238,0.7)]
Text: text-cyan-700
```

---

## 🧪 Testing

### Test Badge Unlock:
```tsx
import { triggerBadgeNotification } from './hooks/useBadgeNotifications';

// Test different tiers
triggerBadgeNotification('STREAK_3');    // Bronze
triggerBadgeNotification('STREAK_7');    // Silver
triggerBadgeNotification('STREAK_14');   // Gold
triggerBadgeNotification('STREAK_30');   // Diamond

// Test multiple unlocks
setTimeout(() => triggerBadgeNotification('MASTER_10'), 0);
setTimeout(() => triggerBadgeNotification('CREATOR_5'), 300);
setTimeout(() => triggerBadgeNotification('QUIZ_TAKER'), 600);
```

---

## ⚙️ Configuration

### Customize Duration:
```tsx
<BadgeNotification 
  badge={badge}
  onClose={onClose}
  duration={7000} // 7 seconds instead of 5
/>
```

### Disable Auto-Detection:
```tsx
useBadgeNotifications(userStats, false); // Pass false to disable
```

### Custom Positioning:
Modify position in `BadgeNotification.tsx`:
```tsx
// Change from top-right to bottom-right
className="fixed bottom-20 right-6 z-[9999]"
```

---

## 🔧 Backend Integration

### Server-Side Notification Creation:

```javascript
// When user unlocks badge on backend
await Notification.create({
  recipient: userId,
  type: 'badge_unlock',
  referenceId: badgeId,
  content: `Chúc mừng! Bạn đã mở khóa huy hiệu "${badgeName}"`,
  isRead: false
});
```

### API Response Example:
```json
{
  "success": true,
  "data": {
    "badge": {
      "id": "STREAK_7",
      "name": "Ngọn Đuốc",
      "tier": "SILVER"
    },
    "notification": {
      "type": "badge_unlock",
      "content": "Chúc mừng! Bạn đã mở khóa huy hiệu Ngọn Đuốc"
    }
  }
}
```

---

## 📝 Best Practices

### ✅ DO:
- Sử dụng hook trong top-level components (App, Profile, Dashboard)
- Test trên nhiều screen sizes
- Kiểm tra dark mode
- Limit số notifications hiển thị cùng lúc (max 3-4)

### ❌ DON'T:
- Đừng gọi hook trong loops hoặc conditionals
- Đừng spam notifications cho testing
- Đừng disable auto-dismiss trừ khi cần thiết
- Đừng modify tier styling arbitrarily

---

## 🐛 Troubleshooting

### Notification không hiện:
1. Kiểm tra `BadgeNotificationManager` đã mount chưa
2. Verify `userStats` có đang update không
3. Check console cho errors
4. Ensure badge ID tồn tại trong BADGES array

### Notification bị duplicate:
1. Kiểm tra hook có bị gọi multiple times không
2. Verify dependency array của useEffect
3. Check component có bị re-mount không

### Styling không đúng:
1. Verify tier name đúng (BRONZE, SILVER, GOLD, DIAMOND)
2. Check Tailwind classes có compile không
3. Ensure dark mode classes applied

---

## 🎉 Kết Quả

✅ **Beautiful badge unlock notifications**
✅ **Tự động detect và hiển thị**
✅ **Production-ready**
✅ **Fully responsive & accessible**
✅ **Dark mode support**

**Status: READY FOR PRODUCTION** 🚀
