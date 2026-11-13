import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as org from '../controllers/org/org.controller';
import { updateOrgSchema, createUserSchema, updateUserSchema } from '../validation/org';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(org.getOrg));
router.patch('/', authorize('OWNER'), validate(updateOrgSchema), asyncHandler(org.updateOrg));
router.get('/users', asyncHandler(org.listUsers));
router.post('/users', authorize('OWNER', 'WARDEN'), validate(createUserSchema), asyncHandler(org.createUser));
router.get('/users/:userId', asyncHandler(org.getUser));
router.patch('/users/:userId', authorize('OWNER', 'WARDEN'), validate(updateUserSchema), asyncHandler(org.updateUser));

export default router;
