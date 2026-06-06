import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const getVendors = async (req: AuthRequest, res: Response) => {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Formatting for frontend compatibility
    const formatted = vendors.map(v => ({
      id: v.id,
      companyName: v.companyName,
      taxId: v.taxId,
      phone: v.phone,
      address: v.address,
      website: v.website,
      status: v.status,
      // Parse businessFields back to array
      businessFields: v.businessFields ? v.businessFields.split(',') : [],
      // Mock ratings/overdueInvoices if not in schema (stored locally/derived)
      rating: v.status === 'APPROVED' ? 4.2 : 0, 
      overdueInvoices: v.status === 'BLOCKED' ? 2 : 0,
      createdAt: v.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching vendors.' }
    });
  }
};

export const getVendorById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        quotations: true
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor profile not found.' }
      });
    }

    const formatted = {
      ...vendor,
      businessFields: vendor.businessFields ? vendor.businessFields.split(',') : [],
      rating: vendor.status === 'APPROVED' ? 4.2 : 0,
      overdueInvoices: vendor.status === 'BLOCKED' ? 2 : 0
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching vendor.' }
    });
  }
};

export const verifyVendor = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { approve } = req.body; // boolean

  if (approve === undefined) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: approve (boolean).' }
    });
  }

  try {
    const status = approve ? 'APPROVED' : 'REJECTED';
    const vendor = await prisma.vendorProfile.update({
      where: { id },
      data: {
        status,
        verifiedAt: approve ? new Date() : null
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        category: 'VENDOR',
        message: `Vendor review - "${vendor.companyName}" marked as ${status}`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating vendor verification.' }
    });
  }
};

export const blockVendor = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { block } = req.body; // boolean

  if (block === undefined) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: block (boolean).' }
    });
  }

  try {
    const status = block ? 'BLOCKED' : 'APPROVED';
    const vendor = await prisma.vendorProfile.update({
      where: { id },
      data: { status }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        category: 'VENDOR',
        message: `Vendor profile status updated - "${vendor.companyName}" is now ${status}`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating vendor status.' }
    });
  }
};
