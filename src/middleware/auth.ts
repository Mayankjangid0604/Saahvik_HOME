import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { unauthorized, forbidden } from '../utils/errors';
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw unauthorized('Missing token');

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    throw unauthorized('Invalid token');
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role as UserRole)) throw forbidden();
    next();
  };
}

export function orgGuard(req: Request, _res: Response, next: NextFunction) {
  const orgId = req.params.orgId || req.body?.orgId;
  if (orgId && req.user?.orgId !== orgId) throw forbidden('Org mismatch');
  next();
}
