import React, { useState, useEffect } from 'react';
import { HiUserPlus, HiUserMinus, HiLink, HiCheck } from 'react-icons/hi2';
import { followService } from '../../services/followService';
import { useToastContext } from '../../contexts/ToastContext';

interface FollowShareActionsProps {
  targetUserId: string;
  currentUserId?: string;
  isOwnProfile: boolean;
  variant?: 'primary' | 'secondary';
  mode?: 'full' | 'stats-only' | 'buttons-only';
}

const FollowShareActions: React.FC<FollowShareActionsProps> = ({
  targetUserId,
  currentUserId,
  isOwnProfile,
  variant = 'primary',
  mode = 'full'
}) => {
  // ... existing hooks ... 
  const toast = useToastContext();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsFollowingLoading] = useState(false); // Renamed to avoid confusion if needed
  const [linkCopied, setLinkCopied] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // ... existing loadFollowData logic ...
  // Re-pasting useEffect and loadFollowData for context completeness in replacement if needed, 
  // but since we focus on return logic, I'll rely on React preservation or carefully replacing just the render mostly.
  // Wait, I need to keep the logic. I will replace the whole component body securely.

  useEffect(() => {
    loadFollowData();
  }, [targetUserId]);

  const loadFollowData = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        followService.getFollowers(targetUserId),
        followService.getFollowing(targetUserId),
      ]);
      if (followersRes.success) setFollowersCount(followersRes.data.count);
      if (followingRes.success) setFollowingCount(followingRes.data.count);

      if (!isOwnProfile && currentUserId) {
        const statusRes = await followService.getFollowStatus(targetUserId);
        if (statusRes.success) setIsFollowing(statusRes.data.isFollowing);
      }
    } catch (error) {
      console.error('Failed to load follow data', error);
    }
  };

  const handleFollowToggle = async () => {
    if (isLoading) return;
    setIsFollowingLoading(true);
    try {
      if (isFollowing) {
        const res = await followService.unfollow(targetUserId);
        if (res.success) {
           setIsFollowing(false);
           setFollowersCount(Math.max(0, followersCount - 1));
           toast.success('Đã hủy theo dõi');
        }
      } else {
        const res = await followService.follow(targetUserId);
        if (res.success) {
           setIsFollowing(true);
           setFollowersCount(followersCount + 1);
           toast.success('Đã theo dõi');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${targetUserId}`;
    navigator.clipboard.writeText(profileUrl);
    setLinkCopied(true);
    toast.success('Đã sao chép link profile!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const showStats = mode === 'full' || mode === 'stats-only';
  const showButtons = mode === 'full' || mode === 'buttons-only';

  return (
    <div className="w-full space-y-3">
      {/* Followers/Following Stats */}
      {showStats && (
        <div className="flex items-center justify-center gap-4 text-center">
        <div className="group cursor-pointer transition-transform hover:scale-110 duration-200">
            <div className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {followersCount}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Người theo dõi
            </div>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <div className="group cursor-pointer transition-transform hover:scale-110 duration-200">
            <div className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {followingCount}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Đang theo dõi
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showButtons && (
        <div className="flex gap-2 w-full">
          {/* Follow/Unfollow Button */}
          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                isFollowing
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30 shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? '...' : isFollowing ? (
                <><HiUserMinus className="w-5 h-5" /> Hủy</>
              ) : (
                <><HiUserPlus className="w-5 h-5" /> Theo dõi</>
              )}
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={handleShareProfile}
            className={`${isOwnProfile ? 'flex-1' : ''} flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
               variant === 'secondary'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {linkCopied ? (
              <>
                <HiCheck className="w-5 h-5 text-green-600" />
                Đã chép
              </>
            ) : (
              <>
                <HiLink className="w-5 h-5" />
                Chia sẻ
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowShareActions;
