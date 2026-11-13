import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as comm from '../controllers/communication/communication.controller';
import { sendNotificationSchema, markReadSchema } from '../validation/communication';

const router = Router();
router.use(authenticate);

router.post('/send', authorize('OWNER', 'WARDEN'), validate(sendNotificationSchema), asyncHandler(comm.sendNotification));
router.get('/notifications', asyncHandler(comm.getNotifications));
router.post('/notifications/read', validate(markReadSchema), asyncHandler(comm.markAsRead));
router.get('/email-usage', authorize('OWNER'), asyncHandler(comm.getEmailUsage));

export default router;
