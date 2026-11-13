import { prisma } from '../../config/database';
import { PaginationQuery, paginationArgs } from '../../utils/pagination';

export class AuditService {
  async log(orgId: string, userId: string | null, action: string, entity: string, entityId?: string, details?: Record<string, unknown>, ip?: string) {
    return prisma.auditLog.create({
      data: { orgId, userId, action, entity, entityId, details: details ? (details as any) : undefined, ip },
    });
  }

  async list(orgId: string, pagination: PaginationQuery, filters?: { entity?: string; userId?: string; startDate?: Date; endDate?: Date }) {
    const where: Record<string, unknown> = { orgId };
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        ...paginationArgs(pagination),
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { logs, total };
  }
}

export const auditService = new AuditService();
