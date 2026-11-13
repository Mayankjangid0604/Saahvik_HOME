import { prisma } from '../../config/database';
import { notFound, conflict, badRequest } from '../../utils/errors';

export class PropertyService {
  async list(orgId: string) {
    return prisma.property.findMany({
      where: { orgId },
      include: { rooms: { include: { beds: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async get(orgId: string, propertyId: string) {
    const p = await prisma.property.findFirst({
      where: { id: propertyId, orgId },
      include: { rooms: { include: { beds: { include: { resident: { select: { id: true, firstName: true, lastName: true, status: true } } } } }, orderBy: { number: 'asc' } } },
    });
    if (!p) throw notFound('Property');
    return p;
  }

  async create(orgId: string, data: { name: string; address?: string; type?: 'HOSTEL' | 'PG' | 'DORMITORY' }) {
    const existing = await prisma.property.findUnique({ where: { orgId_name: { orgId, name: data.name } } });
    if (existing) throw conflict('Property name already exists');
    return prisma.property.create({ data: { orgId, ...data } });
  }

  async update(orgId: string, propertyId: string, data: Record<string, unknown>) {
    const p = await prisma.property.findFirst({ where: { id: propertyId, orgId } });
    if (!p) throw notFound('Property');
    return prisma.property.update({ where: { id: propertyId }, data });
  }

  async createRoom(orgId: string, propertyId: string, data: { number: string; floor?: number; capacity: number; roomType?: any; amenities?: any }) {
    const p = await prisma.property.findFirst({ where: { id: propertyId, orgId } });
    if (!p) throw notFound('Property');

    const existing = await prisma.room.findUnique({ where: { propertyId_number: { propertyId, number: data.number } } });
    if (existing) throw conflict('Room number already exists');

    const room = await prisma.room.create({ data: { propertyId, ...data } });

    // Auto-create beds based on capacity
    const beds = Array.from({ length: data.capacity }, (_, i) => ({
      roomId: room.id,
      label: `${data.number}-${String.fromCharCode(65 + i)}`,
    }));
    await prisma.bed.createMany({ data: beds });

    return prisma.room.findUnique({ where: { id: room.id }, include: { beds: true } });
  }

  async updateRoom(propertyId: string, roomId: string, data: Record<string, unknown>) {
    const room = await prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw notFound('Room');
    return prisma.room.update({ where: { id: roomId }, data, include: { beds: true } });
  }

  async createBed(roomId: string, data: { label: string }) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw notFound('Room');

    const existing = await prisma.bed.findUnique({ where: { roomId_label: { roomId, label: data.label } } });
    if (existing) throw conflict('Bed label already exists in this room');

    return prisma.bed.create({ data: { roomId, label: data.label } });
  }

  async updateBed(bedId: string, data: Record<string, unknown>) {
    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) throw notFound('Bed');
    return prisma.bed.update({ where: { id: bedId }, data });
  }

  async getOccupancyStats(orgId: string) {
    const properties = await prisma.property.findMany({
      where: { orgId, isActive: true },
      include: {
        rooms: {
          where: { isActive: true },
          include: { beds: { where: { isActive: true }, include: { resident: { select: { id: true } } } } },
        },
      },
    });

    return properties.map(p => {
      const totalBeds = p.rooms.reduce((sum, r) => sum + r.beds.length, 0);
      const occupied = p.rooms.reduce((sum, r) => sum + r.beds.filter(b => b.resident).length, 0);
      return {
        propertyId: p.id,
        propertyName: p.name,
        totalRooms: p.rooms.length,
        totalBeds,
        occupied,
        vacant: totalBeds - occupied,
        occupancyRate: totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0,
      };
    });
  }
}

export const propertyService = new PropertyService();
