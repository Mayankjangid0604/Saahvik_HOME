import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/password';
import { notFound, conflict } from '../../utils/errors';
import { UserRole } from '@prisma/client';
import { v4 as uuid } from 'uuid';

export class OrgService {
  async getOrg(orgId: string) {
    const org = await prisma.org.findUnique({ where: { id: orgId } });
    if (!org) throw notFound('Organization');
    return org;
  }

  async updateOrg(orgId: string, data: Record<string, unknown>) {
    return prisma.org.update({ where: { id: orgId }, data });
  }

  async listUsers(orgId: string, role?: UserRole) {
    return prisma.user.findMany({
      where: { orgId, ...(role ? { role } : {}) },
      select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(orgId: string, data: {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: 'WARDEN' | 'STAFF' | 'PARENT';
    password?: string;
  }) {
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { orgId_email: { orgId, email: data.email } } });
      if (existing) throw conflict('Email already in use');
    }
    if (data.phone) {
      const existing = await prisma.user.findUnique({ where: { orgId_phone: { orgId, phone: data.phone } } });
      if (existing) throw conflict('Phone already in use');
    }

    const password = data.password || uuid().slice(0, 12);
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        orgId,
        email: data.email,
        phone: data.phone,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as UserRole,
      },
    });

    return {
      user: { id: user.id, email: user.email, phone: user.phone, firstName: user.firstName, lastName: user.lastName, role: user.role },
      generatedPassword: !data.password ? password : undefined,
    };
  }

  async updateUser(orgId: string, userId: string, data: Record<string, unknown>) {
    const user = await prisma.user.findFirst({ where: { id: userId, orgId } });
    if (!user) throw notFound('User');
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async getUser(orgId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, orgId },
      include: { staffProfile: true },
    });
    if (!user) throw notFound('User');
    return user;
  }
}

export const orgService = new OrgService();
