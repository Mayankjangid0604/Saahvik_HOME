import { Request, Response } from 'express';
import { settingsService } from '../../services/settings/settings.service';
import { ok } from '../../utils/response';

export const getOrgSettings = async (req: Request, res: Response) => {
  ok(res, await settingsService.getOrgSettings(req.user!.orgId));
};

export const updateOrgSettings = async (req: Request, res: Response) => {
  ok(res, await settingsService.updateOrgSettings(req.user!.orgId, req.body));
};

export const getAdmissionFormConfig = async (req: Request, res: Response) => {
  ok(res, await settingsService.getAdmissionFormConfig(req.user!.orgId));
};

export const updateAdmissionFormConfig = async (req: Request, res: Response) => {
  ok(res, await settingsService.updateAdmissionFormConfig(req.user!.orgId, req.body.fields));
};
