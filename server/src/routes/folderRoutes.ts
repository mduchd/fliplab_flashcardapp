import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder,
  moveSetToFolder,
} from '../controllers/folderController.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.route('/')
  .get(getFolders)
  .post(createFolder);

router.route('/:id')
  .get(getFolder)
  .put(updateFolder)
  .delete(deleteFolder);

router.put('/:id/sets/:setId', moveSetToFolder);

export default router;
