import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';
import * as report from '../controllers/report/report.controller';

const router = Router();
router.use(authenticate, authorize('OWNER', 'WARDEN'));

router.get('/occupancy', asyncHandler(report.occupancyReport));
router.get('/revenue', asyncHandler(report.revenueReport));
router.get('/outstanding', asyncHandler(report.outstandingDuesReport));
router.get('/complaints', asyncHandler(report.complaintSummaryReport));
router.get('/export/:type', asyncHandler(report.exportReportPDF));

export default router;
