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
} from '../controllers/groupController.js';

const router = express.Router();

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

// Comment routes
router.post('/:groupId/posts/:postId/comments/:commentId/like', authMiddleware, toggleCommentLike);
router.post('/:groupId/posts/:postId/comments/:commentId/replies', authMiddleware, addReply);

export default router;

