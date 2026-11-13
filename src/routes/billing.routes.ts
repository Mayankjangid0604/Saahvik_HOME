import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as billing from '../controllers/billing/billing.controller';
import { createInvoiceSchema, updateInvoiceSchema } from '../validation/billing';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(billing.listInvoices));
router.post('/', authorize('OWNER', 'WARDEN'), validate(createInvoiceSchema), asyncHandler(billing.createInvoice));
router.get('/overdue', asyncHandler(billing.getOverdueInvoices));
router.get('/resident/:residentId', asyncHandler(billing.getResidentInvoices));
router.get('/:invoiceId', asyncHandler(billing.getInvoice));
router.patch('/:invoiceId', authorize('OWNER', 'WARDEN'), validate(updateInvoiceSchema), asyncHandler(billing.updateInvoice));

export default router;
