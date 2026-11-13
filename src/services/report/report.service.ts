import { prisma } from '../../config/database';
import { InvoiceStatus, PaymentStatus, ResidentStatus, ComplaintStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';

export class ReportService {
  async occupancyReport(orgId: string) {
    const properties = await prisma.property.findMany({
      where: { orgId, isActive: true },
      include: {
        rooms: {
          where: { isActive: true },
          include: { beds: { where: { isActive: true }, include: { resident: { select: { id: true, firstName: true, lastName: true, status: true } } } } },
        },
      },
    });

    const data = properties.map(p => ({
      property: p.name,
      rooms: p.rooms.map(r => ({
        number: r.number,
        type: r.roomType,
        beds: r.beds.map(b => ({
          label: b.label,
          occupied: !!b.resident,
          resident: b.resident ? `${b.resident.firstName} ${b.resident.lastName}` : null,
        })),
      })),
      totalBeds: p.rooms.reduce((s, r) => s + r.beds.length, 0),
      occupied: p.rooms.reduce((s, r) => s + r.beds.filter(b => b.resident).length, 0),
    }));

    const totalBeds = data.reduce((s, d) => s + d.totalBeds, 0);
    const totalOccupied = data.reduce((s, d) => s + d.occupied, 0);

    return { properties: data, summary: { totalBeds, totalOccupied, totalVacant: totalBeds - totalOccupied, occupancyRate: totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0 } };
  }

  async revenueReport(orgId: string, startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: { invoice: { orgId }, status: PaymentStatus.COMPLETED, paidAt: { gte: startDate, lte: endDate } },
      include: { invoice: { select: { number: true } }, resident: { select: { firstName: true, lastName: true } } },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const byMethod: Record<string, number> = {};
    payments.forEach(p => { byMethod[p.method] = (byMethod[p.method] || 0) + p.amount; });

    return { payments, summary: { totalRevenue, byMethod, count: payments.length } };
  }

  async outstandingDuesReport(orgId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { orgId, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] } },
      include: { resident: { select: { id: true, firstName: true, lastName: true } }, payments: { where: { status: PaymentStatus.COMPLETED } } },
      orderBy: { dueDate: 'asc' },
    });

    const data = invoices.map(inv => {
      const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      return { invoiceNumber: inv.number, resident: `${inv.resident.firstName} ${inv.resident.lastName}`, total: inv.total, paid, outstanding: inv.total - paid, dueDate: inv.dueDate, isOverdue: inv.dueDate < new Date() };
    });

    const totalOutstanding = data.reduce((sum, d) => sum + d.outstanding, 0);
    return { invoices: data, summary: { totalOutstanding, count: data.length, overdue: data.filter(d => d.isOverdue).length } };
  }

  async complaintSummaryReport(orgId: string) {
    const complaints = await prisma.complaint.findMany({ where: { orgId } });

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    complaints.forEach(c => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
    });

    const resolved = complaints.filter(c => c.resolvedAt);
    const avgResolutionMs = resolved.length > 0
      ? resolved.reduce((sum, c) => sum + (c.resolvedAt!.getTime() - c.createdAt.getTime()), 0) / resolved.length
      : 0;

    return { summary: { total: complaints.length, byStatus, byCategory, byPriority, avgResolutionHours: Math.round(avgResolutionMs / 3600000) } };
  }

  async generatePDF(title: string, data: Record<string, unknown>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: 'right' });
      doc.moveDown(2);

      if (data.summary) {
        doc.fontSize(14).text('Summary');
        doc.moveDown(0.5);
        const summary = data.summary as Record<string, unknown>;
        Object.entries(summary).forEach(([key, value]) => {
          if (typeof value === 'object') {
            doc.fontSize(11).text(`${key}:`);
            Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
              doc.fontSize(10).text(`  ${k}: ${v}`, { indent: 20 });
            });
          } else {
            doc.fontSize(11).text(`${key}: ${value}`);
          }
        });
      }

      doc.end();
    });
  }
}

export const reportService = new ReportService();
