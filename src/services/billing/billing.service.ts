import { prisma } from '../../config/database';
import { notFound, badRequest } from '../../utils/errors';
import { InvoiceStatus } from '@prisma/client';
import { PaginationQuery, paginationArgs } from '../../utils/pagination';

interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export class BillingService {
  async listInvoices(orgId: string, pagination: PaginationQuery, status?: InvoiceStatus) {
    const where = { orgId, ...(status ? { status } : {}) };
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        ...paginationArgs(pagination),
        include: { resident: { select: { id: true, firstName: true, lastName: true } }, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);
    return { invoices, total };
  }

  async getInvoice(orgId: string, invoiceId: string) {
    const inv = await prisma.invoice.findFirst({
      where: { id: invoiceId, orgId },
      include: { resident: true, payments: true },
    });
    if (!inv) throw notFound('Invoice');
    return inv;
  }

  async createInvoice(orgId: string, data: {
    residentId: string;
    items: InvoiceItem[];
    tax?: number;
    discount?: number;
    dueDate: string;
    notes?: string;
  }) {
    const resident = await prisma.resident.findFirst({ where: { id: data.residentId, orgId } });
    if (!resident) throw notFound('Resident');

    const settings = await prisma.orgSettings.findUnique({ where: { orgId } });
    const prefix = settings?.invoicePrefix || 'INV';
    const nextNum = settings?.invoiceNextNumber || 1;
    const number = `${prefix}-${String(nextNum).padStart(6, '0')}`;

    const subtotal = data.items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    const tax = data.tax || 0;
    const discount = data.discount || 0;
    const total = subtotal + tax - discount;

    const invoice = await prisma.invoice.create({
      data: {
        orgId,
        residentId: data.residentId,
        number,
        items: data.items as any,
        subtotal,
        tax,
        discount,
        total,
        dueDate: new Date(data.dueDate),
        notes: data.notes,
      },
      include: { resident: { select: { id: true, firstName: true, lastName: true } } },
    });

    if (settings) {
      await prisma.orgSettings.update({
        where: { orgId },
        data: { invoiceNextNumber: nextNum + 1 },
      });
    }

    return invoice;
  }

  async updateInvoice(orgId: string, invoiceId: string, data: {
    items?: InvoiceItem[];
    tax?: number;
    discount?: number;
    dueDate?: string;
    notes?: string;
    status?: 'PENDING' | 'CANCELLED';
  }) {
    const inv = await prisma.invoice.findFirst({ where: { id: invoiceId, orgId } });
    if (!inv) throw notFound('Invoice');
    if (inv.status === InvoiceStatus.PAID) throw badRequest('Cannot modify a paid invoice');

    const items = data.items || (inv.items as unknown as InvoiceItem[]);
    const subtotal = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    const tax = data.tax ?? inv.tax;
    const discount = data.discount ?? inv.discount;
    const total = subtotal + tax - discount;

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(data.items ? { items: data.items as any } : {}),
        ...(data.tax !== undefined ? { tax } : {}),
        ...(data.discount !== undefined ? { discount } : {}),
        ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.status ? { status: data.status } : {}),
        subtotal,
        total,
      },
      include: { resident: { select: { id: true, firstName: true, lastName: true } }, payments: true },
    });
  }

  async getResidentInvoices(orgId: string, residentId: string) {
    return prisma.invoice.findMany({
      where: { orgId, residentId },
      include: { payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOverdueInvoices(orgId: string) {
    return prisma.invoice.findMany({
      where: { orgId, status: InvoiceStatus.PENDING, dueDate: { lt: new Date() } },
      include: { resident: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }
}

export const billingService = new BillingService();
