import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import { getMyStreak, syncProgress, updateGoalTarget } from '../controllers/streakController.js';

const router = express.Router();

router.use(protect); // All routes protected

router.get('/', getMyStreak);
router.post('/sync', syncProgress);
router.put('/target', updateGoalTarget);

export default router;
