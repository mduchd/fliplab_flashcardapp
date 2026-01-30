import express from 'express';
import { translateText } from '../controllers/translationController.js';
// import { protect } from '../middleware/authMiddleware'; 
// Có thể comment protect để test cho dễ, hoặc bật lên nếu muốn bảo mật. 
// Tạm thời bật protect để chỉ user đăng nhập mới dùng được (tránh spam public).
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/translate
router.post('/', authMiddleware, translateText);

export default router;
