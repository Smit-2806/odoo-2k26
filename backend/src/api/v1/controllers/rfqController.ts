import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const createRfq = async (req: AuthRequest, res: Response) => {
  const { 
    title, 
    description, 
    submissionDeadline, 
    deliveryTerms, 
    paymentTerms, 
    category, 
    items,
    assignedVendors // array of vendorProfile IDs
  } = req.body;

  if (!title || !description || !submissionDeadline || !category || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required fields: title, description, submissionDeadline, category, items.' }
    });
  }

  try {
    const rfq = await prisma.rfq.create({
      data: {
        title,
        description,
        category,
        submissionDeadline: new Date(submissionDeadline),
        deliveryTerms: deliveryTerms || 'FOB',
        paymentTerms: paymentTerms || '30 days net',
        creatorId: req.user!.id,
        status: 'PUBLISHED', // Default to PUBLISHED
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: Number(item.quantity),
            uom: item.uom,
            description: item.description || ''
          }))
        },
        assignments: {
          create: (assignedVendors || []).map((vId: string) => ({
            vendorId: vId
          }))
        }
      },
      include: {
        items: true,
        assignments: true
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        category: 'RFQ',
        message: `RFQ published - "${title}" sent to ${assignedVendors?.length || 0} assigned vendors.`,
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

      // If role is VENDOR, only return PUBLISHED RFQs that are assigned to them
      rfqs = await prisma.rfq.findMany({
        where: {
          status: 'PUBLISHED',
          assignments: {
            some: {
              vendorId: profile.id
            }
          }
        },
        include: {
          items: true,
          creator: {
            select: { name: true }
          },
          assignments: true
        }
      });
    } else {
      // Procurement/Admin/Finance sees all RFQs
      rfqs = await prisma.rfq.findMany({
        include: {
          items: true,
          creator: {
            select: { name: true }
          },
          assignments: true
        }
      });
    }

    // Map output to match frontend expectations (include assignedVendors list of vendor IDs)
    const formatted = rfqs.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      category: r.category,
      submissionDeadline: r.submissionDeadline.toISOString().split('T')[0],
      deliveryTerms: r.deliveryTerms,
      paymentTerms: r.paymentTerms,
      creatorName: r.creator.name,
      createdAt: r.createdAt.toISOString().split('T')[0],
      items: r.items,
      assignedVendors: r.assignments.map(a => a.vendorId)
    }));

    return res.status(200).json({
      success: true,
      data: formatted
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
        assignments: true,
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

    const formatted = {
      id: rfq.id,
      title: rfq.title,
      description: rfq.description,
      status: rfq.status,
      category: rfq.category,
      submissionDeadline: rfq.submissionDeadline.toISOString().split('T')[0],
      deliveryTerms: rfq.deliveryTerms,
      paymentTerms: rfq.paymentTerms,
      creatorName: rfq.creator.name,
      createdAt: rfq.createdAt.toISOString().split('T')[0],
      items: rfq.items,
      assignedVendors: rfq.assignments.map(a => a.vendorId),
      quotations: rfq.quotations
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching RFQ.' }
    });
  }
};

export const publishRfq = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const rfq = await prisma.rfq.update({
      where: { id },
      data: { status: 'PUBLISHED' }
    });

    await prisma.auditLog.create({
      data: {
        category: 'RFQ',
        message: `RFQ published - "${rfq.title}" status changed to PUBLISHED.`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(200).json({
      success: true,
      data: rfq
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error publishing RFQ.' }
    });
  }
};

export const closeRfq = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const rfq = await prisma.rfq.update({
      where: { id },
      data: { status: 'CLOSED' }
    });

    await prisma.auditLog.create({
      data: {
        category: 'RFQ',
        message: `RFQ closed - "${rfq.title}" status changed to CLOSED.`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(200).json({
      success: true,
      data: rfq
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error closing RFQ.' }
    });
  }
};
