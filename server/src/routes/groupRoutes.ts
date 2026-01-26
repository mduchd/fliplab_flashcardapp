import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deletePost,
  toggleCommentLike,
  addReply,
  togglePinPost,
  votePoll,
  deleteComment,
  approvePost,
  rejectPost,
  exploreContent,
} from '../controllers/groupController.js';

const router = express.Router();

// Explore route (must be before /:id)
router.get('/explore/all', authMiddleware, exploreContent);

// Group routes
router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getGroups);
router.get('/:id', authMiddleware, getGroup);
router.put('/:id', authMiddleware, updateGroup);
router.delete('/:id', authMiddleware, deleteGroup);
router.post('/:id/join', authMiddleware, joinGroup);
router.post('/:id/leave', authMiddleware, leaveGroup);

// Post routes
router.post('/:id/posts', authMiddleware, createPost);
router.get('/:id/posts', authMiddleware, getPosts);
router.post('/:groupId/posts/:postId/like', authMiddleware, toggleLike);
router.post('/:groupId/posts/:postId/comments', authMiddleware, addComment);
router.delete('/:groupId/posts/:postId', authMiddleware, deletePost);
router.post('/:groupId/posts/:postId/pin', authMiddleware, togglePinPost);
router.post('/:groupId/posts/:postId/vote', authMiddleware, votePoll);
router.post('/:groupId/posts/:postId/approve', authMiddleware, approvePost);
router.post('/:groupId/posts/:postId/reject', authMiddleware, rejectPost);

// Comment routes
router.post('/:groupId/posts/:postId/comments/:commentId/like', authMiddleware, toggleCommentLike);
router.delete('/:groupId/posts/:postId/comments/:commentId', authMiddleware, deleteComment);
router.post('/:groupId/posts/:postId/comments/:commentId/replies', authMiddleware, addReply);

export default router;

