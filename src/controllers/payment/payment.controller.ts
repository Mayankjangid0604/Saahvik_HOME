import { Request, Response } from 'express';
import { paymentService } from '../../services/payment/payment.service';
import { ok, created } from '../../utils/response';
import { param } from '../../utils/params';

export const createPaymentOrder = async (req: Request, res: Response) => {
  created(res, await paymentService.createOrder(req.user!.orgId, req.body));
};

export const verifyPayment = async (req: Request, res: Response) => {
  ok(res, await paymentService.verifyPayment(req.body));
};

export const recordManualPayment = async (req: Request, res: Response) => {
  created(res, await paymentService.recordManualPayment(req.user!.orgId, req.body));
};

export const getInvoicePayments = async (req: Request, res: Response) => {
  ok(res, await paymentService.getPaymentsByInvoice(param(req.params.invoiceId)));
};

export const getResidentPayments = async (req: Request, res: Response) => {
  ok(res, await paymentService.getPaymentsByResident(param(req.params.residentId)));
};
