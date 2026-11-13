import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';
import * as audit from '../controllers/audit/audit.controller';

const router = Router();
router.use(authenticate, authorize('OWNER'));

router.get('/', asyncHandler(audit.listAuditLogs));

export default router;
