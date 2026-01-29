import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createComment, getPostComments, deleteComment } from '../controllers/commentController.js';

const router = express.Router();

// Tất cả thao tác đều cần đăng nhập
router.use(authMiddleware);

router.post('/', createComment);
router.get('/post/:postId', getPostComments);
router.delete('/:id', deleteComment);

export default router;
