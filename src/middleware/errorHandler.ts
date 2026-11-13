import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message, code: err.code });
    return;
  }

  if (err instanceof ZodError) {
    const issues = (err as any).issues || (err as any).errors || [];
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: issues.map((e: any) => ({ path: (e.path || []).join('.'), message: e.message })),
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
