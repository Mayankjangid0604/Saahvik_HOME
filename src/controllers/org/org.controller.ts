import { Request, Response } from 'express';
import { orgService } from '../../services/org/org.service';
import { ok, created } from '../../utils/response';
import { param } from '../../utils/params';

export const getOrg = async (req: Request, res: Response) => {
  ok(res, await orgService.getOrg(req.user!.orgId));
};

export const updateOrg = async (req: Request, res: Response) => {
  ok(res, await orgService.updateOrg(req.user!.orgId, req.body));
};

export const listUsers = async (req: Request, res: Response) => {
  ok(res, await orgService.listUsers(req.user!.orgId, req.query.role as any));
};

export const createUser = async (req: Request, res: Response) => {
  created(res, await orgService.createUser(req.user!.orgId, req.body));
};

export const updateUser = async (req: Request, res: Response) => {
  ok(res, await orgService.updateUser(req.user!.orgId, param(req.params.userId), req.body));
};

export const getUser = async (req: Request, res: Response) => {
  ok(res, await orgService.getUser(req.user!.orgId, param(req.params.userId)));
};
