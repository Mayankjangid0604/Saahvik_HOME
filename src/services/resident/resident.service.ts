import { prisma } from '../../config/database';
import { notFound, badRequest, conflict } from '../../utils/errors';
import { ResidentStatus } from '@prisma/client';
import { PaginationQuery, paginationArgs } from '../../utils/pagination';

export class ResidentService {
  async list(orgId: string, pagination: PaginationQuery, status?: ResidentStatus) {
    const where = { orgId, ...(status ? { status } : {}) };
    const [residents, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        ...paginationArgs(pagination),
        include: { bed: { include: { room: { include: { property: { select: { id: true, name: true } } } } } }, guardian: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resident.count({ where }),
    ]);
    return { residents, total };
  }

  async get(orgId: string, residentId: string) {
    const r = await prisma.resident.findFirst({
      where: { id: residentId, orgId },
      include: {
        bed: { include: { room: { include: { property: true } } } },
        guardian: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        feeConfig: true,
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!r) throw notFound('Resident');
    return r;
  }

  async create(orgId: string, data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: any;
    address?: string;
    idProofType?: string;
    idProofNumber?: string;
    bedId?: string;
    guardianId?: string;
    customFields?: Record<string, unknown>;
    fees?: Array<{ feeType: string; amount: number; recurrence: any; startDate: string; endDate?: string }>;
  }) {
    if (data.bedId) {
      const bed = await prisma.bed.findUnique({ where: { id: data.bedId }, include: { resident: true } });
      if (!bed) throw notFound('Bed');
      if (bed.resident) throw conflict('Bed is already occupied');
    }

    const { fees, dateOfBirth, ...residentData } = data;

    const resident = await prisma.resident.create({
      data: {
        orgId,
        ...residentData,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        customFields: residentData.customFields as any,
        feeConfig: fees ? {
          create: fees.map(f => ({
            ...f,
            startDate: new Date(f.startDate),
            endDate: f.endDate ? new Date(f.endDate) : undefined,
          })),
        } : undefined,
      } as any,
      include: { bed: true, feeConfig: true },
    });

    return resident;
  }

  async update(orgId: string, residentId: string, data: Record<string, unknown>) {
    const r = await prisma.resident.findFirst({ where: { id: residentId, orgId } });
    if (!r) throw notFound('Resident');

    if (data.bedId && data.bedId !== r.bedId) {
      const bed = await prisma.bed.findUnique({ where: { id: data.bedId as string }, include: { resident: true } });
      if (!bed) throw notFound('Bed');
      if (bed.resident) throw conflict('Bed is already occupied');
    }

    return prisma.resident.update({
      where: { id: residentId },
      data,
      include: { bed: true, feeConfig: true },
    });
  }

  async checkout(orgId: string, residentId: string, exitReason?: string) {
    const r = await prisma.resident.findFirst({ where: { id: residentId, orgId } });
    if (!r) throw notFound('Resident');
    if (r.status !== ResidentStatus.ACTIVE) throw badRequest('Resident is not active');

    return prisma.resident.update({
      where: { id: residentId },
      data: {
        status: ResidentStatus.CHECKED_OUT,
        exitDate: new Date(),
        exitReason,
        bedId: null,
      },
    });
  }

  async search(orgId: string, query: string, pagination: PaginationQuery) {
    const where = {
      orgId,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } },
      ],
    };
    const [residents, total] = await Promise.all([
      prisma.resident.findMany({ where, ...paginationArgs(pagination), orderBy: { firstName: 'asc' } }),
      prisma.resident.count({ where }),
    ]);
    return { residents, total };
  }
}

export const residentService = new ResidentService();
