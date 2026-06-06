import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/user';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. You do not have permission to perform this action.' }
      });
    }

    next();
  };
};
