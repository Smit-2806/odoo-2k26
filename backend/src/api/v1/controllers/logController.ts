import { Request, Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching audit logs.' }
    });
  }
};

export const createAuditLog = async (req: AuthRequest, res: Response) => {
  const { category, message } = req.body;

  if (!category || !message) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required fields: category, message.' }
    });
  }

  try {
    const log = await prisma.auditLog.create({
      data: {
        category,
        message,
        user: req.user?.name || 'System'
      }
    });

    return res.status(201).json({
      success: true,
      data: log
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating audit log.' }
    });
  }
};
