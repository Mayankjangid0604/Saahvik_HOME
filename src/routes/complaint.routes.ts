import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as complaint from '../controllers/complaint/complaint.controller';
import { createComplaintSchema, updateComplaintSchema } from '../validation/complaint';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(complaint.listComplaints));
router.post('/', validate(createComplaintSchema), asyncHandler(complaint.createComplaint));
router.get('/:complaintId', asyncHandler(complaint.getComplaint));
router.patch('/:complaintId', authorize('OWNER', 'WARDEN'), validate(updateComplaintSchema), asyncHandler(complaint.updateComplaint));

export default router;
