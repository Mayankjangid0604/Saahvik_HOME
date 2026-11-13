import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as res from '../controllers/resident/resident.controller';
import { createResidentSchema, updateResidentSchema, checkoutResidentSchema } from '../validation/resident';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(res.listResidents));
router.post('/', authorize('OWNER', 'WARDEN'), validate(createResidentSchema), asyncHandler(res.createResident));
router.get('/search', asyncHandler(res.searchResidents));
router.get('/:residentId', asyncHandler(res.getResident));
router.patch('/:residentId', authorize('OWNER', 'WARDEN'), validate(updateResidentSchema), asyncHandler(res.updateResident));
router.post('/:residentId/checkout', authorize('OWNER', 'WARDEN'), validate(checkoutResidentSchema), asyncHandler(res.checkoutResident));

export default router;
