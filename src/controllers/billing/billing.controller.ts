import { Request, Response } from 'express';
import { billingService } from '../../services/billing/billing.service';
import { paginationSchema } from '../../utils/pagination';
import { ok, created, paginated } from '../../utils/response';
import { param } from '../../utils/params';

export const listInvoices = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  const { invoices, total } = await billingService.listInvoices(req.user!.orgId, pagination, req.query.status as any);
  paginated(res, invoices, total, pagination.page, pagination.limit);
};

export const getInvoice = async (req: Request, res: Response) => {
  ok(res, await billingService.getInvoice(req.user!.orgId, param(req.params.invoiceId)));
};

export const createInvoice = async (req: Request, res: Response) => {
  created(res, await billingService.createInvoice(req.user!.orgId, req.body));
};

export const updateInvoice = async (req: Request, res: Response) => {
  ok(res, await billingService.updateInvoice(req.user!.orgId, param(req.params.invoiceId), req.body));
};

export const getResidentInvoices = async (req: Request, res: Response) => {
  ok(res, await billingService.getResidentInvoices(req.user!.orgId, param(req.params.residentId)));
};

export const getOverdueInvoices = async (req: Request, res: Response) => {
  ok(res, await billingService.getOverdueInvoices(req.user!.orgId));
};
