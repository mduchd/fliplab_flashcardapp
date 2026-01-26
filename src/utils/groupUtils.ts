/**
 * Utility functions for displaying group activity information
 */

/**
 * Format relative time from ISO date string
 * Returns human-readable relative time like "2 giờ trước", "3 ngày trước"
 */
export function getRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} năm trước`;
}

/**
 * Get activity status based on last update time
 * Returns color and text for activity indicator
 */
export function getActivityStatus(updatedAt: string): {
  color: 'green' | 'yellow' | 'gray';
  text: string;
  isActive: boolean;
} {
  const now = new Date();
  const date = new Date(updatedAt);
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 24) {
    return { color: 'green', text: 'Rất hoạt động', isActive: true };
  } else if (diffHours < 72) {
    return { color: 'yellow', text: 'Hoạt động', isActive: true };
  } else {
    return { color: 'gray', text: 'Ít hoạt động', isActive: false };
  }
}

/**
 * Estimate active members based on total members
 * This is a heuristic until we have real data
 */
export function estimateActiveMembers(totalMembers: number): number {
  // Assume 20-40% of members are active
  const percentage = 0.2 + Math.random() * 0.2;
  return Math.max(1, Math.floor(totalMembers * percentage));
}

/**
 * Get member count display text
 */
export function getMemberCountText(count: number): string {
  if (count === 1) return '1 thành viên';
  if (count < 1000) return `${count} thành viên`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K thành viên`;
  return `${(count / 1000000).toFixed(1)}M thành viên`;
}
