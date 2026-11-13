import { Request, Response } from 'express';
import { reportService } from '../../services/report/report.service';
import { ok } from '../../utils/response';

export const occupancyReport = async (req: Request, res: Response) => {
  ok(res, await reportService.occupancyReport(req.user!.orgId));
};

export const revenueReport = async (req: Request, res: Response) => {
  const startDate = new Date(req.query.startDate as string);
  const endDate = new Date(req.query.endDate as string);
  ok(res, await reportService.revenueReport(req.user!.orgId, startDate, endDate));
};

export const outstandingDuesReport = async (req: Request, res: Response) => {
  ok(res, await reportService.outstandingDuesReport(req.user!.orgId));
};

export const complaintSummaryReport = async (req: Request, res: Response) => {
  ok(res, await reportService.complaintSummaryReport(req.user!.orgId));
};

export const exportReportPDF = async (req: Request, res: Response) => {
  const reportType = req.params.type;
  let data: Record<string, unknown>;

  switch (reportType) {
    case 'occupancy':
      data = await reportService.occupancyReport(req.user!.orgId);
      break;
    case 'outstanding':
      data = await reportService.outstandingDuesReport(req.user!.orgId);
      break;
    case 'complaints':
      data = await reportService.complaintSummaryReport(req.user!.orgId);
      break;
    default:
      res.status(400).json({ success: false, error: 'Invalid report type' });
      return;
  }

  const pdf = await reportService.generatePDF(`${reportType} Report`, data);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.pdf"`);
  res.send(pdf);
};
