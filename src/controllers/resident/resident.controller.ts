import { Request, Response } from 'express';
import { residentService } from '../../services/resident/resident.service';
import { paginationSchema } from '../../utils/pagination';
import { ok, created, paginated } from '../../utils/response';
import { param, queryStr } from '../../utils/params';

export const listResidents = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  const { residents, total } = await residentService.list(req.user!.orgId, pagination, req.query.status as any);
  paginated(res, residents, total, pagination.page, pagination.limit);
};

export const getResident = async (req: Request, res: Response) => {
  ok(res, await residentService.get(req.user!.orgId, param(req.params.residentId)));
};

export const createResident = async (req: Request, res: Response) => {
  created(res, await residentService.create(req.user!.orgId, req.body));
};

export const updateResident = async (req: Request, res: Response) => {
  ok(res, await residentService.update(req.user!.orgId, param(req.params.residentId), req.body));
};

export const checkoutResident = async (req: Request, res: Response) => {
  ok(res, await residentService.checkout(req.user!.orgId, param(req.params.residentId), req.body.exitReason));
};

export const searchResidents = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  const { residents, total } = await residentService.search(req.user!.orgId, queryStr(req.query.q), pagination);
  paginated(res, residents, total, pagination.page, pagination.limit);
};
