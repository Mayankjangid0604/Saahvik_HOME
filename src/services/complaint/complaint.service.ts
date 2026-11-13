import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import { ComplaintStatus } from '@prisma/client';
import { PaginationQuery, paginationArgs } from '../../utils/pagination';

export class ComplaintService {
  async list(orgId: string, pagination: PaginationQuery, status?: ComplaintStatus) {
    const where = { orgId, ...(status ? { status } : {}) };
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        ...paginationArgs(pagination),
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.count({ where }),
    ]);
    return { complaints, total };
  }

  async get(orgId: string, complaintId: string) {
    const c = await prisma.complaint.findFirst({
      where: { id: complaintId, orgId },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!c) throw notFound('Complaint');
    return c;
  }

  async create(orgId: string, createdById: string, data: { title: string; description: string; category: string; priority?: string }) {
    return prisma.complaint.create({
      data: { orgId, createdById, ...data } as any,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async update(orgId: string, complaintId: string, data: Record<string, unknown>) {
    const c = await prisma.complaint.findFirst({ where: { id: complaintId, orgId } });
    if (!c) throw notFound('Complaint');

    const updateData: Record<string, unknown> = { ...data };
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }
    if (data.assignedToId && c.status === ComplaintStatus.OPEN) {
      updateData.status = ComplaintStatus.ASSIGNED;
    }

    return prisma.complaint.update({ where: { id: complaintId }, data: updateData });
  }
}

export const complaintService = new ComplaintService();
