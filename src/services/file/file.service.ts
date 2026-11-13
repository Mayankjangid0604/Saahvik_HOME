import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { badRequest, notFound } from '../../utils/errors';
import { PaginationQuery, paginationArgs } from '../../utils/pagination';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export class FileService {
  async upload(orgId: string, uploadedBy: string, file: { originalname: string; mimetype: string; size: number; path: string; filename: string }, category?: string) {
    const usage = await this.getStorageUsage(orgId);
    if (usage + file.size > env.FILE_STORAGE_CAP_GB * 1024 * 1024 * 1024) {
      throw badRequest(`Storage cap (${env.FILE_STORAGE_CAP_GB}GB) exceeded`);
    }

    return prisma.file.create({
      data: {
        orgId,
        name: file.originalname,
        path: file.filename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        category,
        uploadedBy,
      },
    });
  }

  async list(orgId: string, pagination: PaginationQuery, category?: string) {
    const where = { orgId, ...(category ? { category } : {}) };
    const [files, total] = await Promise.all([
      prisma.file.findMany({ where, ...paginationArgs(pagination), orderBy: { createdAt: 'desc' } }),
      prisma.file.count({ where }),
    ]);
    return { files, total };
  }

  async get(orgId: string, fileId: string) {
    const file = await prisma.file.findFirst({ where: { id: fileId, orgId } });
    if (!file) throw notFound('File');
    return file;
  }

  async delete(orgId: string, fileId: string) {
    const file = await prisma.file.findFirst({ where: { id: fileId, orgId } });
    if (!file) throw notFound('File');

    try { await fs.unlink(path.join(UPLOAD_DIR, file.path)); } catch {}
    await prisma.file.delete({ where: { id: fileId } });
    return { deleted: true };
  }

  async getStorageUsage(orgId: string): Promise<number> {
    const result = await prisma.file.aggregate({ where: { orgId }, _sum: { sizeBytes: true } });
    return result._sum.sizeBytes || 0;
  }

  async search(orgId: string, query: string, pagination: PaginationQuery) {
    const where = { orgId, name: { contains: query, mode: 'insensitive' as const } };
    const [files, total] = await Promise.all([
      prisma.file.findMany({ where, ...paginationArgs(pagination), orderBy: { createdAt: 'desc' } }),
      prisma.file.count({ where }),
    ]);
    return { files, total };
  }
}

export const fileService = new FileService();
