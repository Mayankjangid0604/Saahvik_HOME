import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';

export class StaffService {
  async getProfile(userId: string) {
    const profile = await prisma.staffProfile.findUnique({ where: { userId }, include: { user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true } } } });
    if (!profile) throw notFound('Staff profile');
    return profile;
  }

  async createOrUpdateProfile(userId: string, data: Record<string, unknown>) {
    return prisma.staffProfile.upsert({
      where: { userId },
      update: { ...data, joiningDate: data.joiningDate ? new Date(data.joiningDate as string) : undefined },
      create: { userId, ...data, joiningDate: data.joiningDate ? new Date(data.joiningDate as string) : undefined },
    });
  }

  async listStaff(orgId: string) {
    return prisma.user.findMany({
      where: { orgId, role: { in: ['WARDEN', 'STAFF'] } },
      include: { staffProfile: true },
      orderBy: { firstName: 'asc' },
    });
  }
}

export const staffService = new StaffService();
