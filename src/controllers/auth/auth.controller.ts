import { Request, Response } from 'express';
import { authService } from '../../services/auth/auth.service';
import { prisma } from '../../config/database';
import { ok, created } from '../../utils/response';

export const registerOrg = async (req: Request, res: Response) => {
  created(res, await authService.registerOrg(req.body));
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password, totpCode } = req.body;
  ok(res, await authService.login(identifier, password, req.ip, req.headers['user-agent'] as string, totpCode));
};

export const refreshToken = async (req: Request, res: Response) => {
  ok(res, await authService.refreshToken(req.body.refreshToken));
};

export const requestOTP = async (req: Request, res: Response) => {
  ok(res, await authService.requestOTP(req.body.phone, req.body.purpose));
};

export const verifyOTP = async (req: Request, res: Response) => {
  ok(res, await authService.verifyOTP(req.body.phone, req.body.code, req.body.purpose));
};

export const resetPassword = async (req: Request, res: Response) => {
  ok(res, await authService.resetPassword(req.body.token, req.body.newPassword));
};

export const changePassword = async (req: Request, res: Response) => {
  ok(res, await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword));
};

export const setup2FA = async (req: Request, res: Response) => {
  ok(res, await authService.toggle2FA(req.user!.userId, req.body.enable));
};

export const confirm2FA = async (req: Request, res: Response) => {
  ok(res, await authService.confirm2FA(req.user!.userId, req.body.code));
};

export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, orgId: true, is2FAEnabled: true },
  });
  ok(res, user);
};
