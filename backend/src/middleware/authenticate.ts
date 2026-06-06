import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vendorbridge-key-change-in-prod';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access denied. No token provided.' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token.' }
    });
  }
};
