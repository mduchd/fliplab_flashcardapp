import express from 'express';
import multer from 'multer';
import { importFile, previewFile } from '../controllers/importController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.csv'];
    
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng PDF, Word (.docx), hoặc Text (.txt)'));
    }
  }
});

// Routes
router.post('/file', authMiddleware, upload.single('file'), importFile);
router.post('/preview', authMiddleware, upload.single('file'), previewFile);

export default router;
