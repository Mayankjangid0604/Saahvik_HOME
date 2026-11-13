import { Request, Response } from 'express';
import { complaintService } from '../../services/complaint/complaint.service';
import { paginationSchema } from '../../utils/pagination';
import { ok, created, paginated } from '../../utils/response';
import { param } from '../../utils/params';

export const listComplaints = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  const { complaints, total } = await complaintService.list(req.user!.orgId, pagination, req.query.status as any);
  paginated(res, complaints, total, pagination.page, pagination.limit);
};

export const getComplaint = async (req: Request, res: Response) => {
  ok(res, await complaintService.get(req.user!.orgId, param(req.params.complaintId)));
};

export const createComplaint = async (req: Request, res: Response) => {
  created(res, await complaintService.create(req.user!.orgId, req.user!.userId, req.body));
};

export const updateComplaint = async (req: Request, res: Response) => {
  ok(res, await complaintService.update(req.user!.orgId, param(req.params.complaintId), req.body));
};
