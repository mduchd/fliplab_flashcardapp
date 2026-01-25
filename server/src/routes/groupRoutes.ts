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

export default router;
