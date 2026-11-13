import { Response } from 'express';

export function ok(res: Response, data: unknown, statusCode = 200) {
  res.status(statusCode).json({ success: true, data });
}

export function created(res: Response, data: unknown) {
  ok(res, data, 201);
}

export function paginated(res: Response, data: unknown[], total: number, page: number, limit: number) {
  res.status(200).json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}
