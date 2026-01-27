import { Response } from 'express';
import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

// @desc    Follow a user
// @route   POST /api/users/:userId/follow
// @access  Private
export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    // Cannot follow yourself
    if (userId === followerId) {
      res.status(400).json({
        success: false,
        message: 'Bạn không thể theo dõi chính mình',
      });
      return;
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
      return;
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    if (existingFollow) {
      res.status(400).json({
        success: false,
        message: 'Bạn đã theo dõi người dùng này rồi',
      });
      return;
    }

    // Create follow relationship
    await Follow.create({
      follower: followerId,
      following: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Đã theo dõi thành công',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi theo dõi người dùng',
    });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:userId/follow
// @access  Private
export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    const result = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId,
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Bạn chưa theo dõi người dùng này',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Đã hủy theo dõi',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi hủy theo dõi',
    });
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:userId/followers
// @access  Private
export const getFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'username displayName avatar avatarFrame')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        followers: followers.map(f => f.follower),
        count: followers.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách người theo dõi',
    });
  }
};

// @desc    Get users that a user is following
// @route   GET /api/users/:userId/following
// @access  Private
export const getFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'username displayName avatar avatarFrame')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        following: following.map(f => f.following),
        count: following.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách đang theo dõi',
    });
  }
};

// @desc    Check if current user is following target user
// @route   GET /api/users/:userId/follow/status
// @access  Private
export const getFollowStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    const isFollowing = await Follow.exists({
      follower: currentUserId,
      following: userId,
    });

    res.json({
      success: true,
      data: {
        isFollowing: !!isFollowing,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi kiểm tra trạng thái theo dõi',
    });
  }
};
