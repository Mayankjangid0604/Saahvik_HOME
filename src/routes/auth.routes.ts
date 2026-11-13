import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as auth from '../controllers/auth/auth.controller';
import { registerOrgSchema, loginSchema, requestOTPSchema, verifyOTPSchema, resetPasswordSchema, changePasswordSchema, setup2FASchema, refreshTokenSchema } from '../validation/auth';

const router = Router();

router.post('/register', validate(registerOrgSchema), asyncHandler(auth.registerOrg));
router.post('/login', validate(loginSchema), asyncHandler(auth.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(auth.refreshToken));
router.post('/otp/request', validate(requestOTPSchema), asyncHandler(auth.requestOTP));
router.post('/otp/verify', validate(verifyOTPSchema), asyncHandler(auth.verifyOTP));
router.post('/password/reset', validate(resetPasswordSchema), asyncHandler(auth.resetPassword));
router.post('/password/change', authenticate, validate(changePasswordSchema), asyncHandler(auth.changePassword));
router.post('/2fa/setup', authenticate, validate(setup2FASchema), asyncHandler(auth.setup2FA));
router.post('/2fa/confirm', authenticate, asyncHandler(auth.confirm2FA));
router.get('/me', authenticate, asyncHandler(auth.me));

export default router;
