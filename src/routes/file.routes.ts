import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import * as file from '../controllers/file/file.controller';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
  filename: (_req, f, cb) => cb(null, `${uuid()}${path.extname(f.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const router = Router();
router.use(authenticate);

router.post('/upload', upload.single('file'), asyncHandler(file.uploadFile));
router.get('/', asyncHandler(file.listFiles));
router.get('/search', asyncHandler(file.searchFiles));
router.get('/storage', asyncHandler(file.getStorageUsage));
router.get('/:fileId', asyncHandler(file.getFile));
router.get('/:fileId/download', asyncHandler(file.downloadFile));
router.delete('/:fileId', asyncHandler(file.deleteFile));

export default router;
