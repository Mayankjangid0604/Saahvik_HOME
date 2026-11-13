import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';

export class SettingsService {
  async getOrgSettings(orgId: string) {
    const settings = await prisma.orgSettings.findUnique({ where: { orgId } });
    if (!settings) throw notFound('Org settings');
    return settings;
  }

  async updateOrgSettings(orgId: string, data: Record<string, unknown>) {
    return prisma.orgSettings.upsert({
      where: { orgId },
      update: data,
      create: { orgId, ...data },
    });
  }

  async getAdmissionFormConfig(orgId: string) {
    return prisma.admissionFormConfig.findUnique({ where: { orgId } });
  }

  async updateAdmissionFormConfig(orgId: string, fields: unknown[]) {
    return prisma.admissionFormConfig.upsert({
      where: { orgId },
      update: { fields: fields as any },
      create: { orgId, fields: fields as any },
    });
  }
}

export const settingsService = new SettingsService();
