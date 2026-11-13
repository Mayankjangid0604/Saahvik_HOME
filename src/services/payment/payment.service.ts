import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { notFound, badRequest } from '../../utils/errors';
import { InvoiceStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import crypto from 'crypto';

let razorpayInstance: any = null;

function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  }
  return razorpayInstance;
}

export class PaymentService {
  async createOrder(orgId: string, data: { invoiceId: string; amount: number; method: string }) {
    const invoice = await prisma.invoice.findFirst({ where: { id: data.invoiceId, orgId } });
    if (!invoice) throw notFound('Invoice');
    if (invoice.status === InvoiceStatus.PAID) throw badRequest('Invoice already paid');
    if (invoice.status === InvoiceStatus.CANCELLED) throw badRequest('Invoice is cancelled');

    if (data.method === 'RAZORPAY') {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount: Math.round(data.amount * 100),
        currency: 'INR',
        receipt: invoice.number,
        notes: { invoiceId: invoice.id, orgId },
      });

      const payment = await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          residentId: invoice.residentId,
          amount: data.amount,
          method: PaymentMethod.RAZORPAY,
          razorpayOrderId: order.id,
        },
      });

      return { payment, razorpayOrderId: order.id, razorpayKeyId: env.RAZORPAY_KEY_ID };
    }

    throw badRequest('Use recordManualPayment for non-Razorpay methods');
  }

  async verifyPayment(data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: data.razorpayOrderId } });
    if (!payment) throw notFound('Payment');

    const body = data.razorpayOrderId + '|' + data.razorpayPaymentId;
    const expected = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expected !== data.razorpaySignature) throw badRequest('Invalid payment signature');

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await this.updateInvoiceStatus(payment.invoiceId);
    return updated;
  }

  async recordManualPayment(orgId: string, data: { invoiceId: string; amount: number; method: string; notes?: string }) {
    const invoice = await prisma.invoice.findFirst({ where: { id: data.invoiceId, orgId } });
    if (!invoice) throw notFound('Invoice');
    if (invoice.status === InvoiceStatus.PAID) throw badRequest('Invoice already paid');

    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        residentId: invoice.residentId,
        amount: data.amount,
        method: data.method as PaymentMethod,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        notes: data.notes,
      },
    });

    await this.updateInvoiceStatus(invoice.id);
    return payment;
  }

  async getPaymentsByInvoice(invoiceId: string) {
    return prisma.payment.findMany({ where: { invoiceId }, orderBy: { createdAt: 'desc' } });
  }

  async getPaymentsByResident(residentId: string) {
    return prisma.payment.findMany({
      where: { residentId },
      include: { invoice: { select: { id: true, number: true, total: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async updateInvoiceStatus(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: { where: { status: PaymentStatus.COMPLETED } } } });
    if (!invoice) return;

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    let status: InvoiceStatus;
    if (totalPaid >= invoice.total) {
      status = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    } else {
      return;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status, ...(status === InvoiceStatus.PAID ? { paidAt: new Date() } : {}) },
    });
  }
}

export const paymentService = new PaymentService();
