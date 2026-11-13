import { Request, Response } from 'express';
import { staffService } from '../../services/staff/staff.service';
import { ok } from '../../utils/response';
import { param } from '../../utils/params';

export const getStaffProfile = async (req: Request, res: Response) => {
  ok(res, await staffService.getProfile(param(req.params.userId)));
};

export const updateStaffProfile = async (req: Request, res: Response) => {
  ok(res, await staffService.createOrUpdateProfile(param(req.params.userId), req.body));
};

export const listStaff = async (req: Request, res: Response) => {
  ok(res, await staffService.listStaff(req.user!.orgId));
};
