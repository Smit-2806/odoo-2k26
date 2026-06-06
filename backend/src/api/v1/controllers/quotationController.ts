import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const submitQuotation = async (req: AuthRequest, res: Response) => {
  const {
    rfqId,
    deliveryDays,
    paymentTerms,
    notes,
    items, // array of { rfqItemId, unitPrice }
    gstPercent
  } = req.body;

  if (!rfqId || !deliveryDays || !paymentTerms || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required fields: rfqId, deliveryDays, paymentTerms, items.' }
    });
  }

  try {
    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!vendorProfile) {
      return res.status(400).json({
        success: false,
        error: { message: 'Only registered vendors can submit quotations.' }
      });
    }

    if (vendorProfile.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        error: { message: 'Your vendor profile must be APPROVED to submit bids.' }
      });
    }

    // Calculate subtotal, gst, grandTotal
    let subtotal = 0;
    const itemsData = [];

    for (const item of items) {
      const rfqItem = await prisma.rfqItem.findUnique({
        where: { id: item.rfqItemId }
      });

      if (!rfqItem) {
        return res.status(404).json({
          success: false,
          error: { message: `RFQ Item not found: ${item.rfqItemId}` }
        });
      }

      const unitPrice = Number(item.unitPrice);
      const totalPrice = unitPrice * rfqItem.quantity;
      subtotal += totalPrice;

      itemsData.push({
        rfqItemId: item.rfqItemId,
        unitPrice,
        totalPrice,
        notes: item.notes || ''
      });
    }

    const gst = gstPercent ? Number(gstPercent) : 18; // Default 18%
    const gstAmount = (subtotal * gst) / 100;
    const grandTotal = subtotal + gstAmount;

    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        vendorId: vendorProfile.id,
        status: 'SUBMITTED',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        deliverySchedule: `${deliveryDays} days`,
        paymentTerms,
        notes,
        totalAmount: grandTotal,
        items: {
          create: itemsData
        }
      },
      include: {
        items: true,
        vendor: true
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        category: 'RFQ',
        message: `Quotation submitted - Bid of ${grandTotal.toFixed(2)} received from ${vendorProfile.companyName}.`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(201).json({
      success: true,
      data: quotation
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error submitting quotation.' }
    });
  }
};

export const getQuotations = async (req: AuthRequest, res: Response) => {
  const { rfqId } = req.query;

  try {
    const role = req.user?.role;
    const whereClause: any = {};

    if (rfqId) {
      whereClause.rfqId = String(rfqId);
    }

    if (role === 'VENDOR') {
      const profile = await prisma.vendorProfile.findUnique({
        where: { userId: req.user!.id }
      });
      if (profile) {
        whereClause.vendorId = profile.id;
      }
    }

    const quotations = await prisma.quotation.findMany({
      where: whereClause,
      include: {
        vendor: true,
        rfq: {
          select: { title: true }
        },
        items: {
          include: {
            rfqItem: true
          }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, role: true, email: true }
            }
          }
        }
      }
    });

    // Formatting for frontend store structure compatibility
    const formatted = quotations.map(q => {
      const subtotal = q.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const gstPercent = 18;
      const gstAmount = (subtotal * gstPercent) / 100;
      
      return {
        id: q.id,
        rfqId: q.rfqId,
        vendorId: q.vendorId,
        vendorName: q.vendor.companyName,
        status: q.status,
        deliveryDays: parseInt(q.deliverySchedule) || 10,
        paymentTerms: q.paymentTerms,
        rating: 4.2, // mock rating
        gstPercent,
        subtotal,
        gstAmount,
        grandTotal: q.totalAmount,
        notes: q.notes || '',
        createdAt: q.createdAt.toISOString().split('T')[0],
        items: q.items.map(item => ({
          id: item.id,
          rfqItemId: item.rfqItemId,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          name: item.rfqItem?.name || 'Item'
        })),
        approvals: q.approvals?.map(app => ({
          id: app.id,
          approved: app.approved,
          comments: app.comments,
          createdAt: app.createdAt.toISOString(),
          approver: app.approver
        })) || []
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching quotations.' }
    });
  }
};

export const getQuotationById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const q = await prisma.quotation.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfq: true,
        items: {
          include: {
            rfqItem: true
          }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, role: true, email: true }
            }
          }
        }
      }
    });

    if (!q) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quotation not found.' }
      });
    }

    const subtotal = q.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const gstPercent = 18;
    const gstAmount = (subtotal * gstPercent) / 100;

    const formatted = {
      id: q.id,
      rfqId: q.rfqId,
      vendorId: q.vendorId,
      vendorName: q.vendor.companyName,
      status: q.status,
      deliveryDays: parseInt(q.deliverySchedule) || 10,
      paymentTerms: q.paymentTerms,
      rating: 4.2,
      gstPercent,
      subtotal,
      gstAmount,
      grandTotal: q.totalAmount,
      notes: q.notes || '',
      createdAt: q.createdAt.toISOString().split('T')[0],
      items: q.items.map(item => ({
        id: item.id,
        rfqItemId: item.rfqItemId,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        name: item.rfqItem?.name || 'Item'
      })),
      approvals: q.approvals?.map(app => ({
        id: app.id,
        approved: app.approved,
        comments: app.comments,
        createdAt: app.createdAt.toISOString(),
        approver: app.approver
      })) || []
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching quotation.' }
    });
  }
};

export const approveQuotation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { approve, comments } = req.body;

  if (approve === undefined) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: approve (boolean).' }
    });
  }

  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfq: true
      }
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quotation not found.' }
      });
    }

    const userRole = req.user!.role;

    const updatedQuotation = await prisma.$transaction(async (tx) => {
      let nextStatus = quotation.status;

      if (userRole === 'PROCUREMENT') {
        // L1 Review
        nextStatus = approve ? 'UNDER_REVIEW' : 'REJECTED';
      } else if (userRole === 'FINANCE' || userRole === 'ADMIN') {
        // L2 Approval
        nextStatus = approve ? 'APPROVED' : 'REJECTED';
      } else {
        throw new Error('Unauthorized role for quotation approval/review.');
      }

      const q = await tx.quotation.update({
        where: { id },
        data: { status: nextStatus }
      });

      // Add approval logs
      await tx.approval.create({
        data: {
          quotationId: id,
          approverId: req.user!.id,
          approved: approve,
          comments: comments || (userRole === 'PROCUREMENT' ? 'L1 Verified' : 'L2 Approved')
        }
      });

      if (approve && (userRole === 'FINANCE' || userRole === 'ADMIN')) {
        // Auto-generate Purchase Order
        const poCount = await tx.purchaseOrder.count();
        const poNumber = `PO-2026-000${poCount + 1}`;

        const po = await tx.purchaseOrder.create({
          data: {
            poNumber,
            rfqId: q.rfqId,
            quotationId: q.id,
            status: 'SENT',
            totalAmount: q.totalAmount,
            shippingAddress: '123 Business Park, Ahmedabad'
          }
        });

        // Auto-generate Invoice
        const invCount = await tx.invoice.count();
        const invoiceNumber = `INV-2026-10${invCount + 24}`;

        await tx.invoice.create({
          data: {
            invoiceNumber,
            purchaseOrderId: po.id,
            status: 'SUBMITTED',
            amount: q.totalAmount,
            invoiceDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            category: 'APPROVAL',
            message: `Quotation L2 approved - PO ${po.poNumber} generated for ${quotation.vendor.companyName}. Comments: ${comments || 'None'}`,
            user: req.user?.name || 'System'
          }
        });
      } else if (!approve) {
        // Rejection Audit Log
        await tx.auditLog.create({
          data: {
            category: 'APPROVAL',
            message: `Quotation rejected (${userRole === 'PROCUREMENT' ? 'L1' : 'L2'}) - Bid from ${quotation.vendor.companyName} marked rejected. Comments: ${comments || 'None'}`,
            user: req.user?.name || 'System'
          }
        });
      } else {
        // L1 Recommendation Audit Log (Procurement selected a vendor, awaiting Finance L2)
        await tx.auditLog.create({
          data: {
            category: 'APPROVAL',
            message: `Quotation L1 verified - Selected bid from ${quotation.vendor.companyName} submitted for L2 Finance approval. Comments: ${comments || 'None'}`,
            user: req.user?.name || 'System'
          }
        });
      }

      return q;
    });

    return res.status(200).json({
      success: true,
      data: updatedQuotation
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error processing approval.' }
    });
  }
};
