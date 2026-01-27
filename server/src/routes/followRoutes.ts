import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
} from '../controllers/followController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Follow/Unfollow routes
router.post('/:userId/follow', followUser);
router.delete('/:userId/follow', unfollowUser);
router.get('/:userId/follow/status', getFollowStatus);

// Get followers/following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

export default router;
