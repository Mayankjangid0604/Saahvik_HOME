import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as staff from '../controllers/staff/staff.controller';
import { createStaffProfileSchema, updateStaffProfileSchema } from '../validation/staff';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(staff.listStaff));
router.get('/:userId/profile', asyncHandler(staff.getStaffProfile));
router.put('/:userId/profile', authorize('OWNER', 'WARDEN'), validate(updateStaffProfileSchema), asyncHandler(staff.updateStaffProfile));

export default router;
