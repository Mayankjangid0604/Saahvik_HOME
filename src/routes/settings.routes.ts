import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as settings from '../controllers/settings/settings.controller';
import { updateOrgSettingsSchema, admissionFormConfigSchema } from '../validation/settings';

const router = Router();
router.use(authenticate, authorize('OWNER'));

router.get('/', asyncHandler(settings.getOrgSettings));
router.patch('/', validate(updateOrgSettingsSchema), asyncHandler(settings.updateOrgSettings));
router.get('/admission-form', asyncHandler(settings.getAdmissionFormConfig));
router.put('/admission-form', validate(admissionFormConfigSchema), asyncHandler(settings.updateAdmissionFormConfig));

export default router;
