import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const createRfq = async (req: AuthRequest, res: Response) => {
  const { title, description, submissionDeadline, deliveryTerms, paymentTerms, items } = req.body;

  if (!title || !description || !submissionDeadline || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required fields: title, description, submissionDeadline, items.' }
    });
  }

  try {
    const rfq = await prisma.rfq.create({
      data: {
        title,
        description,
        submissionDeadline: new Date(submissionDeadline),
        deliveryTerms: deliveryTerms || 'FOB',
        paymentTerms: paymentTerms || '30 days net',
        creatorId: req.user!.id,
        status: 'PUBLISHED', // Default status on creation
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: Number(item.quantity),
            uom: item.uom,
            description: item.description || ''
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        category: 'RFQ',
        message: `RFQ published - "${title}" sent to assigned vendors.`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(201).json({
      success: true,
      data: rfq
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating RFQ.' }
    });
  }
};

export const getRfqs = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    let rfqs;

    if (role === 'VENDOR') {
      // Find the vendor profile of the current vendor user
      const profile = await prisma.vendorProfile.findUnique({
        where: { userId: req.user!.id }
      });

      if (!profile) {
        return res.status(400).json({
          success: false,
          error: { message: 'Vendor profile not found for user.' }
        });
      }

      // If they are a VENDOR, show RFQs that match their category or are PUBLISHED
      // For simplicity, we show all published RFQs that align with the hackathon flow
      rfqs = await prisma.rfq.findMany({
        where: {
          status: 'PUBLISHED'
        },
        include: {
          items: true,
          creator: {
            select: { name: true }
          }
        }
      });
    } else {
      // Procurement/Admin/Finance sees all RFQs
      rfqs = await prisma.rfq.findMany({
        include: {
          items: true,
          creator: {
            select: { name: true }
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: rfqs
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching RFQs.' }
    });
  }
};

export const getRfqById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const rfq = await prisma.rfq.findUnique({
      where: { id },
      include: {
        items: true,
        quotations: {
          include: {
            vendor: true
          }
        },
        creator: {
          select: { name: true }
        }
      }
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        error: { message: 'RFQ not found.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: rfq
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching RFQ.' }
    });
  }
};
