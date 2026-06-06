import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const getPurchaseOrders = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const whereClause: any = {};

    if (role === 'VENDOR') {
      const profile = await prisma.vendorProfile.findUnique({
        where: { userId: req.user!.id }
      });
      if (profile) {
        whereClause.quotation = { vendorId: profile.id };
      }
    }

    const pos = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        rfq: {
          select: { title: true }
        },
        quotation: {
          include: {
            vendor: true
          }
        }
      }
    });

    const formatted = pos.map(po => ({
      id: po.id,
      poNumber: po.poNumber,
      rfqId: po.rfqId,
      rfqTitle: po.rfq.title,
      quotationId: po.quotationId,
      vendorId: po.quotation.vendorId,
      vendorName: po.quotation.vendor.companyName,
      totalAmount: po.totalAmount,
      shippingAddress: po.shippingAddress,
      status: po.status,
      createdAt: po.createdAt.toISOString().split('T')[0]
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching Purchase Orders.' }
    });
  }
};

export const getPoById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        rfq: true,
        quotation: {
          include: {
            vendor: true,
            items: {
              include: {
                rfqItem: true
              }
            }
          }
        }
      }
    });

    if (!po) {
      return res.status(404).json({
        success: false,
        error: { message: 'Purchase Order not found.' }
      });
    }

    const formatted = {
      id: po.id,
      poNumber: po.poNumber,
      rfqId: po.rfqId,
      rfqTitle: po.rfq.title,
      quotationId: po.quotationId,
      vendorId: po.quotation.vendorId,
      vendorName: po.quotation.vendor.companyName,
      vendorAddress: po.quotation.vendor.address,
      vendorPhone: po.quotation.vendor.phone,
      totalAmount: po.totalAmount,
      shippingAddress: po.shippingAddress,
      status: po.status,
      createdAt: po.createdAt.toISOString().split('T')[0],
      items: po.quotation.items.map(item => ({
        id: item.id,
        name: item.rfqItem.name,
        quantity: item.rfqItem.quantity,
        uom: item.rfqItem.uom,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching Purchase Order.' }
    });
  }
};

export const updatePoStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: status.' }
    });
  }

  try {
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        category: 'INVOICE',
        message: `PO Status update - ${po.poNumber} status changed to ${status}.`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(200).json({
      success: true,
      data: po
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating Purchase Order status.' }
    });
  }
};
