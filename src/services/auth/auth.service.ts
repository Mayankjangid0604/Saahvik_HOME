import { prisma } from '../../config/database';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyToken, TokenPayload } from '../../utils/jwt';
import { generateOTP, otpExpiresAt } from '../../utils/otp';
import { AppError, unauthorized, notFound, badRequest } from '../../utils/errors';
import { OTPPurpose, UserRole } from '@prisma/client';

export class AuthService {
  async registerOrg(data: {
    orgName: string;
    email: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const slug = data.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.org.findUnique({ where: { slug } });
    if (existing) throw new AppError(409, 'Organization name already taken');

    const passwordHash = await hashPassword(data.password);

    const org = await prisma.org.create({
      data: {
        name: data.orgName,
        slug,
        email: data.email,
        phone: data.phone,
        users: {
          create: {
            email: data.email,
            phone: data.phone,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: UserRole.OWNER,
          },
        },
        orgSettings: { create: {} },
      },
      include: { users: true },
    });

    const user = org.users[0];
    const payload: TokenPayload = { userId: user.id, orgId: org.id, role: user.role };

    return {
      org: { id: org.id, name: org.name, slug: org.slug },
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async login(identifier: string, password: string, ip?: string, userAgent?: string, totpCode?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        isActive: true,
      },
    });

    if (!user) {
      await this.recordLoginAudit(null, ip, userAgent, false, 'User not found');
      throw unauthorized('Invalid credentials');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await this.recordLoginAudit(user.id, ip, userAgent, false, 'Wrong password');
      throw unauthorized('Invalid credentials');
    }

    if (user.is2FAEnabled) {
      if (!totpCode) throw new AppError(428, '2FA code required', 'TOTP_REQUIRED');
      // Basic TOTP stub — in production would verify against twoFASecret
      const otp = await prisma.oTP.findFirst({
        where: { userId: user.id, code: totpCode, purpose: OTPPurpose.TWO_FA_SETUP, usedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!otp) throw unauthorized('Invalid 2FA code');
      await prisma.oTP.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
    }

    await this.recordLoginAudit(user.id, ip, userAgent, true);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const payload: TokenPayload = { userId: user.id, orgId: user.orgId, role: user.role };

    return {
      user: { id: user.id, email: user.email, phone: user.phone, firstName: user.firstName, lastName: user.lastName, role: user.role },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async refreshToken(token: string) {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) throw unauthorized('Invalid refresh token');

    const newPayload: TokenPayload = { userId: user.id, orgId: user.orgId, role: user.role };
    return {
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload),
    };
  }

  async requestOTP(phone: string, purpose: OTPPurpose) {
    const user = await prisma.user.findFirst({ where: { phone, isActive: true } });
    if (!user) throw notFound('User');

    const code = generateOTP();
    await prisma.oTP.create({
      data: { userId: user.id, code, purpose, expiresAt: otpExpiresAt() },
    });

    // In production: send via SMS provider
    return { message: 'OTP sent', ...(process.env.NODE_ENV === 'test' ? { code } : {}) };
  }

  async verifyOTP(phone: string, code: string, purpose: OTPPurpose) {
    const user = await prisma.user.findFirst({ where: { phone, isActive: true } });
    if (!user) throw notFound('User');

    const otp = await prisma.oTP.findFirst({
      where: { userId: user.id, code, purpose, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw unauthorized('Invalid or expired OTP');

    await prisma.oTP.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

    if (purpose === OTPPurpose.LOGIN) {
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      const payload: TokenPayload = { userId: user.id, orgId: user.orgId, role: user.role };
      return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
    }

    if (purpose === OTPPurpose.PASSWORD_RESET) {
      const resetToken = signAccessToken({ userId: user.id, orgId: user.orgId, role: 'RESET' });
      return { resetToken };
    }

    return { verified: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = verifyToken(token);
    if ((payload as TokenPayload & { role: string }).role !== 'RESET') throw badRequest('Invalid reset token');

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: payload.userId }, data: { passwordHash } });
    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound('User');

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw unauthorized('Current password is incorrect');

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Password changed' };
  }

  async toggle2FA(userId: string, enable: boolean) {
    if (enable) {
      const code = generateOTP();
      await prisma.oTP.create({
        data: { userId, code, purpose: OTPPurpose.TWO_FA_SETUP, expiresAt: otpExpiresAt() },
      });
      return { message: '2FA setup OTP generated', ...(process.env.NODE_ENV === 'test' ? { code } : {}) };
    }

    await prisma.user.update({ where: { id: userId }, data: { is2FAEnabled: false, twoFASecret: null } });
    return { message: '2FA disabled' };
  }

  async confirm2FA(userId: string, code: string) {
    const otp = await prisma.oTP.findFirst({
      where: { userId, code, purpose: OTPPurpose.TWO_FA_SETUP, usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!otp) throw badRequest('Invalid 2FA code');

    await prisma.oTP.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
    await prisma.user.update({ where: { id: userId }, data: { is2FAEnabled: true } });
    return { message: '2FA enabled' };
  }

  private async recordLoginAudit(userId: string | null, ip?: string, userAgent?: string, success = false, reason?: string) {
    if (!userId) return;
    await prisma.loginAudit.create({ data: { userId, ip, userAgent, success, reason } });
  }
}

export const authService = new AuthService();
