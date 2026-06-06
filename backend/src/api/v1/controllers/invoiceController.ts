import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const whereClause: any = {};

    if (role === 'VENDOR') {
      const profile = await prisma.vendorProfile.findUnique({
        where: { userId: req.user!.id }
      });
      if (profile) {
        whereClause.purchaseOrder = {
          quotation: { vendorId: profile.id }
        };
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        purchaseOrder: {
          select: {
            poNumber: true,
            quotation: {
              include: {
                vendor: true
              }
            }
          }
        }
      }
    });

    const formatted = invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      purchaseOrderId: inv.purchaseOrderId,
      purchaseOrderNumber: inv.purchaseOrder.poNumber,
      vendorName: inv.purchaseOrder.quotation.vendor.companyName,
      amount: inv.amount,
      status: inv.status,
      invoiceDate: inv.invoiceDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0]
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching Invoices.' }
    });
  }
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // e.g. PAID

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: status.' }
    });
  }

  try {
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id },
        data: { status },
        include: {
          purchaseOrder: true
        }
      });

      if (status === 'PAID') {
        // Complete purchase order status
        await tx.purchaseOrder.update({
          where: { id: inv.purchaseOrderId },
          data: { status: 'COMPLETED' }
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            category: 'INVOICE',
            message: `Payment released - Invoice ${inv.invoiceNumber} marked as PAID. PO ${inv.purchaseOrder.poNumber} completed.`,
            user: req.user?.name || 'System'
          }
        });
      } else {
        // Audit Log
        await tx.auditLog.create({
          data: {
            category: 'INVOICE',
            message: `Invoice Status update - ${inv.invoiceNumber} status changed to ${status}.`,
            user: req.user?.name || 'System'
          }
        });
      }

      return inv;
    });

    return res.status(200).json({
      success: true,
      data: updatedInvoice
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating invoice status.' }
    });
  }
};
