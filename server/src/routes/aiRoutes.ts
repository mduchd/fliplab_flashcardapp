import express from 'express';
import { generateFlashcards, chatWithAI } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// POST /api/ai/generate
router.post('/generate', authMiddleware, generateFlashcards);

// POST /api/ai/chat
router.post('/chat', authMiddleware, chatWithAI);

export default router;
