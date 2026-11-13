import { Request, Response } from 'express';
import { fileService } from '../../services/file/file.service';
import { paginationSchema } from '../../utils/pagination';
import { ok, created, paginated } from '../../utils/response';
import { param, queryStr } from '../../utils/params';
import path from 'path';

export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return; }
  created(res, await fileService.upload(req.user!.orgId, req.user!.userId, req.file as any, req.body.category));
};

export const listFiles = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  const { files, total } = await fileService.list(req.user!.orgId, pagination, queryStr(req.query.category));
  paginated(res, files, total, pagination.page, pagination.limit);
};

export const getFile = async (req: Request, res: Response) => {
  ok(res, await fileService.get(req.user!.orgId, param(req.params.fileId)));
};

export const downloadFile = async (req: Request, res: Response) => {
  const file = await fileService.get(req.user!.orgId, param(req.params.fileId));
  res.download(path.join(process.cwd(), 'uploads', file.path), file.name);
};

export const deleteFile = async (req: Request, res: Response) => {
  ok(res, await fileService.delete(req.user!.orgId, param(req.params.fileId)));
};

export const searchFiles = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  const { files, total } = await fileService.search(req.user!.orgId, queryStr(req.query.q), pagination);
  paginated(res, files, total, pagination.page, pagination.limit);
};

export const getStorageUsage = async (req: Request, res: Response) => {
  const bytes = await fileService.getStorageUsage(req.user!.orgId);
  ok(res, { usedBytes: bytes, usedGB: +(bytes / (1024 * 1024 * 1024)).toFixed(2), capGB: 10 });
};
