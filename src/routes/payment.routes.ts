import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as pay from '../controllers/payment/payment.controller';
import { createPaymentOrderSchema, verifyPaymentSchema, recordManualPaymentSchema } from '../validation/payment';

const router = Router();
router.use(authenticate);

router.post('/order', authorize('OWNER', 'WARDEN'), validate(createPaymentOrderSchema), asyncHandler(pay.createPaymentOrder));
router.post('/verify', validate(verifyPaymentSchema), asyncHandler(pay.verifyPayment));
router.post('/manual', authorize('OWNER', 'WARDEN'), validate(recordManualPaymentSchema), asyncHandler(pay.recordManualPayment));
router.get('/invoice/:invoiceId', asyncHandler(pay.getInvoicePayments));
router.get('/resident/:residentId', asyncHandler(pay.getResidentPayments));

export default router;
