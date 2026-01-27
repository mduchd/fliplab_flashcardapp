import express from 'express';
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizResults,
  joinQuiz,
  startQuizSession,
  submitQuiz,
  getMyQuizSessions,
} from '../controllers/quizController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ========== STATIC ROUTES (MUST BE BEFORE DYNAMIC ROUTES) ==========
router.get('/my-quizzes', authMiddleware, getMyQuizzes);
router.get('/my-sessions', authMiddleware, getMyQuizSessions);

// ========== TEACHER ROUTES ==========
router.post('/', authMiddleware, createQuiz);
router.get('/:id', authMiddleware, getQuizById);
router.put('/:id', authMiddleware, updateQuiz);
router.delete('/:id', authMiddleware, deleteQuiz);
router.get('/:id/results', authMiddleware, getQuizResults);

// ========== STUDENT ROUTES ==========
router.post('/join', authMiddleware, joinQuiz);
router.post('/:id/start', authMiddleware, startQuizSession);
router.post('/:id/submit', authMiddleware, submitQuiz);

export default router;
