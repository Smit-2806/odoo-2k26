import { Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';
import PDFDocument from 'pdfkit';

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
      subtotal: inv.subtotal,
      tax: inv.tax,
      total: inv.total,
      status: inv.status,
      emailStatus: inv.emailStatus,
      pdfUrl: inv.pdfUrl,
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
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'Required field: status.' }
    });
  }

  const validStatuses = ['GENERATED', 'SENT', 'APPROVED', 'PAID', 'REJECTED', 'OVERDUE'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }
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
        await tx.purchaseOrder.update({
          where: { id: inv.purchaseOrderId },
          data: { status: 'COMPLETED' }
        });

        await tx.auditLog.create({
          data: {
            category: 'INVOICE',
            message: `Payment released - Invoice ${inv.invoiceNumber} marked as PAID. PO ${inv.purchaseOrder.poNumber} completed.`,
            user: req.user?.name || 'System'
          }
        });
      } else {
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

export const getInvoicePdf = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
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
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invoice not found.' }
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    doc.fillColor('#4B5563').fontSize(20).text('INVOICE', { align: 'right' });
    doc.fontSize(10).fillColor('#1F2937');
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Invoice Date: ${invoice.invoiceDate.toISOString().split('T')[0]}`, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate.toISOString().split('T')[0]}`, { align: 'right' });
    doc.text(`PO Number: ${invoice.purchaseOrder.poNumber}`, { align: 'right' });

    doc.moveDown(2);

    doc.fontSize(14).fillColor('#1F2937').text('Bill From:', { underline: true });
    const vendor = invoice.purchaseOrder.quotation.vendor;
    doc.fontSize(10).fillColor('#4B5563');
    doc.text(vendor.companyName);
    doc.text(vendor.address);
    doc.text(`Phone: ${vendor.phone}`);
    doc.text(`Tax ID: ${vendor.taxId}`);

    doc.moveDown(1);

    doc.fontSize(14).fillColor('#1F2937').text('Bill To:', { underline: true });
    doc.fontSize(10).fillColor('#4B5563');
    doc.text('VendorBridge Procurement Corp');
    doc.text('123 Corporate Way, Suite 500');
    doc.text('corporate@vendorbridge.com');

    doc.moveDown(2);

    const initialY = doc.y;
    doc.fillColor('#1F2937').fontSize(11).text('Item Name', 50, initialY, { width: 200 });
    doc.text('Quantity', 250, initialY, { width: 70, align: 'right' });
    doc.text('Unit Price', 340, initialY, { width: 80, align: 'right' });
    doc.text('Total', 440, initialY, { width: 100, align: 'right' });

    doc.moveDown(0.5);
    doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(0.5);

    const items = invoice.purchaseOrder.quotation.items;
    doc.fillColor('#4B5563').fontSize(10);
    items.forEach(item => {
      const startY = doc.y;
      doc.text(item.rfqItem.name, 50, startY, { width: 200 });
      doc.text(item.rfqItem.quantity.toString(), 250, startY, { width: 70, align: 'right' });
      doc.text(`INR ${item.unitPrice.toFixed(2)}`, 340, startY, { width: 80, align: 'right' });
      doc.text(`INR ${item.totalPrice.toFixed(2)}`, 440, startY, { width: 100, align: 'right' });
      doc.moveDown(1);
    });

    doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(1);

    const summaryY = doc.y;
    doc.fontSize(10).fillColor('#4B5563');
    doc.text('Subtotal:', 340, summaryY, { width: 80, align: 'right' });
    doc.text(`INR ${invoice.subtotal.toFixed(2)}`, 440, summaryY, { width: 100, align: 'right' });

    doc.moveDown(0.5);
    const gstY = doc.y;
    doc.text('GST (18%):', 340, gstY, { width: 80, align: 'right' });
    doc.text(`INR ${invoice.tax.toFixed(2)}`, 440, gstY, { width: 100, align: 'right' });

    doc.moveDown(0.5);
    const totalY = doc.y;
    doc.fontSize(12).fillColor('#1F2937').text('Total:', 340, totalY, { width: 80, align: 'right' });
    doc.text(`INR ${invoice.total.toFixed(2)}`, 440, totalY, { width: 100, align: 'right' });

    doc.end();
  } catch (error: any) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Error generating PDF.' }
      });
    }
  }
};

export const emailInvoice = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            quotation: {
              include: {
                vendor: true
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invoice not found.' }
      });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        emailStatus: 'SENT'
      }
    });

    await prisma.auditLog.create({
      data: {
        category: 'INVOICE',
        message: `Email notification sent - Invoice ${invoice.invoiceNumber} successfully dispatched to ${invoice.purchaseOrder.quotation.vendor.companyName}.`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error simulating email dispatch.' }
    });
  }
};
