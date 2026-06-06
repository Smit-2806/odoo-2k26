import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const createApproval = async (req: AuthRequest, res: Response) => {
  const { quotationId, comments } = req.body;

  if (!quotationId) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: quotationId.' }
    });
  }

  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { vendor: true }
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quotation not found.' }
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'SHORTLISTED' }
      });

      // L1 Approval
      await tx.approval.create({
        data: {
          quotationId,
          approverId: req.user!.id,
          approved: true,
          status: 'L1_APPROVED',
          stage: 1,
          comments: comments || 'L1 Recommended'
        }
      });

      // L2 pending Approval
      await tx.approval.create({
        data: {
          quotationId,
          approverId: null,
          approved: false,
          status: 'PENDING',
          stage: 2,
          comments: 'Awaiting L2 Finance Approval'
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          category: 'APPROVAL',
          message: `Quotation L1 verified - Selected bid from ${quotation.vendor.companyName} submitted for L2 Finance approval.`,
          user: req.user?.name || 'System'
        }
      });

      return q;
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating L1 approval.' }
    });
  }
};

export const getApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    let approvals;

    if (role === 'FINANCE') {
      approvals = await prisma.approval.findMany({
        include: {
          quotation: {
            include: {
              vendor: true,
              rfq: true
            }
          },
          approver: {
            select: { id: true, name: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'PROCUREMENT') {
      approvals = await prisma.approval.findMany({
        include: {
          quotation: {
            include: {
              vendor: true,
              rfq: true
            }
          },
          approver: {
            select: { id: true, name: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'VENDOR') {
      const profile = await prisma.vendorProfile.findUnique({
        where: { userId: req.user!.id }
      });

      if (!profile) {
        return res.status(400).json({
          success: false,
          error: { message: 'Vendor profile not found.' }
        });
      }

      approvals = await prisma.approval.findMany({
        where: {
          quotation: {
            vendorId: profile.id
          }
        },
        include: {
          quotation: {
            include: {
              vendor: true,
              rfq: true
            }
          },
          approver: {
            select: { id: true, name: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      approvals = await prisma.approval.findMany({
        include: {
          quotation: {
            include: {
              vendor: true,
              rfq: true
            }
          },
          approver: {
            select: { id: true, name: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return res.status(200).json({
      success: true,
      data: approvals
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching approvals.' }
    });
  }
};

export const actionApproval = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { approve, comments } = req.body;

  if (approve === undefined) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: approve (boolean).' }
    });
  }

  try {
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            vendor: true,
            rfq: true
          }
        }
      }
    });

    if (!approval) {
      return res.status(404).json({
        success: false,
        error: { message: 'Approval record not found.' }
      });
    }

    if (approval.stage !== 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Only Stage 2 approvals (Finance Review) can be actioned via this endpoint.' }
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.approval.update({
        where: { id },
        data: {
          approved: approve,
          status: approve ? 'L2_APPROVED' : 'REJECTED',
          approverId: req.user!.id,
          comments: comments || (approve ? 'L2 Approved by Finance' : 'L2 Rejected by Finance')
        }
      });

      const nextQStatus = approve ? 'APPROVED' : 'REJECTED';
      await tx.quotation.update({
        where: { id: approval.quotationId },
        data: { status: nextQStatus }
      });

      if (approve) {
        const poCount = await tx.purchaseOrder.count();
        const poNumber = `PO-2026-000${poCount + 1}`;

        const po = await tx.purchaseOrder.create({
          data: {
            poNumber,
            rfqId: approval.quotation.rfqId,
            quotationId: approval.quotationId,
            status: 'GENERATED',
            totalAmount: approval.quotation.totalAmount,
            shippingAddress: '123 Business Park, Ahmedabad'
          }
        });

        const invCount = await tx.invoice.count();
        const invoiceNumber = `INV-2026-10${invCount + 24}`;

        const totalAmount = approval.quotation.totalAmount;
        const gstPercent = 18;
        const subtotal = totalAmount / (1 + (gstPercent / 100));
        const taxAmount = totalAmount - subtotal;

        await tx.invoice.create({
          data: {
            invoiceNumber,
            purchaseOrderId: po.id,
            status: 'GENERATED',
            amount: totalAmount,
            subtotal: Number(subtotal.toFixed(2)),
            tax: Number(taxAmount.toFixed(2)),
            total: Number(totalAmount.toFixed(2)),
            invoiceDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        await tx.auditLog.create({
          data: {
            category: 'APPROVAL',
            message: `Quotation L2 approved - PO ${po.poNumber} and Invoice generated for ${approval.quotation.vendor.companyName}.`,
            user: req.user?.name || 'System'
          }
        });
      } else {
        await tx.auditLog.create({
          data: {
            category: 'APPROVAL',
            message: `Quotation L2 rejected - Bid from ${approval.quotation.vendor.companyName} rejected. Comments: ${comments || 'None'}`,
            user: req.user?.name || 'System'
          }
        });
      }

      return app;
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error processing L2 approval.' }
    });
  }
};
