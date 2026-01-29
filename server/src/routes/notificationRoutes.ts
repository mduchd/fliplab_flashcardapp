import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
