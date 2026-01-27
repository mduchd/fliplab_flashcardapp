import React, { useState, useEffect } from 'react';
import { HiUserPlus, HiUserMinus, HiLink, HiCheck } from 'react-icons/hi2';
import { followService } from '../../services/followService';
import { useToastContext } from '../../contexts/ToastContext';

interface FollowShareActionsProps {
  targetUserId: string;
  currentUserId?: string;
  isOwnProfile: boolean;
}

const FollowShareActions: React.FC<FollowShareActionsProps> = ({
  targetUserId,
  currentUserId,
  isOwnProfile,
}) => {
  const toast = useToastContext();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Load follow status and counts
  useEffect(() => {
    loadFollowData();
  }, [targetUserId]);

  const loadFollowData = async () => {
    try {
      // Get followers/following count
      const [followersRes, followingRes] = await Promise.all([
        followService.getFollowers(targetUserId),
        followService.getFollowing(targetUserId),
      ]);

      if (followersRes.success) setFollowersCount(followersRes.data.count);
      if (followingRes.success) setFollowingCount(followingRes.data.count);

      // Get follow status if viewing another user's profile
      if (!isOwnProfile && currentUserId) {
        const statusRes = await followService.getFollowStatus(targetUserId);
        if (statusRes.success) {
          setIsFollowing(statusRes.data.isFollowing);
        }
      }
    } catch (error) {
      console.error('Failed to load follow data', error);
    }
  };

  const handleFollowToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        const res = await followService.unfollow(targetUserId);
        if (res.success) {
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
          toast.success('Đã hủy theo dõi');
        }
      } else {
        const res = await followService.follow(targetUserId);
        if (res.success) {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
          toast.success('Đã theo dõi');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${targetUserId}`;
    navigator.clipboard.writeText(profileUrl);
    setLinkCopied(true);
    toast.success('Đã sao chép link profile!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-3">
      {/* Followers/Following Stats */}
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Follow/Unfollow Button - Only show if viewing someone else's profile */}
        {!isOwnProfile && (
          <button
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
              isFollowing
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>Đang xử lý...</>
            ) : isFollowing ? (
              <>
                <HiUserMinus className="w-5 h-5" />
                Hủy theo dõi
              </>
            ) : (
              <>
                <HiUserPlus className="w-5 h-5" />
                Theo dõi
              </>
            )}
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShareProfile}
          className={`${isOwnProfile ? 'flex-1' : ''} flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600`}
        >
          {linkCopied ? (
            <>
              <HiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              Đã sao chép!
            </>
          ) : (
            <>
              <HiLink className="w-5 h-5" />
              Chia sẻ
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FollowShareActions;
