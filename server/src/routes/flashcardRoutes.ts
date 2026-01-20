import express from 'express';
import {
  getFlashcardSets,
  getFlashcardSet,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  updateStudyProgress,
} from '../controllers/flashcardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.route('/')
  .get(getFlashcardSets)
  .post(createFlashcardSet);

router.route('/:id')
  .get(getFlashcardSet)
  .put(updateFlashcardSet)
  .delete(deleteFlashcardSet);

router.post('/:id/study', updateStudyProgress);

export default router;
