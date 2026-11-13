import { Request, Response } from 'express';
import { auditService } from '../../services/audit/audit.service';
import { paginationSchema } from '../../utils/pagination';
import { paginated } from '../../utils/response';

export const listAuditLogs = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  const filters = {
    entity: req.query.entity as string,
    userId: req.query.userId as string,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
  };
  const { logs, total } = await auditService.list(req.user!.orgId, pagination, filters);
  paginated(res, logs, total, pagination.page, pagination.limit);
};
