import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}
