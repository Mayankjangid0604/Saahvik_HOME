import { Request, Response } from 'express';
import { propertyService } from '../../services/property/property.service';
import { ok, created } from '../../utils/response';
import { param } from '../../utils/params';

export const listProperties = async (req: Request, res: Response) => {
  ok(res, await propertyService.list(req.user!.orgId));
};

export const getProperty = async (req: Request, res: Response) => {
  ok(res, await propertyService.get(req.user!.orgId, param(req.params.propertyId)));
};

export const createProperty = async (req: Request, res: Response) => {
  created(res, await propertyService.create(req.user!.orgId, req.body));
};

export const updateProperty = async (req: Request, res: Response) => {
  ok(res, await propertyService.update(req.user!.orgId, param(req.params.propertyId), req.body));
};

export const createRoom = async (req: Request, res: Response) => {
  created(res, await propertyService.createRoom(req.user!.orgId, param(req.params.propertyId), req.body));
};

export const updateRoom = async (req: Request, res: Response) => {
  ok(res, await propertyService.updateRoom(param(req.params.propertyId), param(req.params.roomId), req.body));
};

export const createBed = async (req: Request, res: Response) => {
  created(res, await propertyService.createBed(param(req.params.roomId), req.body));
};

export const updateBed = async (req: Request, res: Response) => {
  ok(res, await propertyService.updateBed(param(req.params.bedId), req.body));
};

export const getOccupancy = async (req: Request, res: Response) => {
  ok(res, await propertyService.getOccupancyStats(req.user!.orgId));
};
