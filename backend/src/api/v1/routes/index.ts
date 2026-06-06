import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate';
import { authorize } from '../../../middleware/authorize';

// Controllers
import * as auth from '../controllers/authController';
import * as vendors from '../controllers/vendorController';
import * as rfqs from '../controllers/rfqController';
import * as quotations from '../controllers/quotationController';
import * as pos from '../controllers/poController';
import * as invoices from '../controllers/invoiceController';
import * as reports from '../controllers/reportController';
import * as logs from '../controllers/logController';
import * as approvals from '../controllers/approvalController';
import * as finance from '../controllers/financeController';
import * as notification from '../controllers/notificationController';

const router = Router();

// 1. Authentication
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate as any, auth.getMe);

// 2. Vendors
router.get('/vendors', authenticate as any, authorize(['ADMIN', 'PROCUREMENT']) as any, vendors.getVendors);
router.get('/vendors/:id', authenticate as any, authorize(['ADMIN', 'PROCUREMENT']) as any, vendors.getVendorById);
router.put('/vendors/:id/verify', authenticate as any, authorize(['ADMIN']) as any, vendors.verifyVendor);
router.put('/vendors/:id/block', authenticate as any, authorize(['ADMIN']) as any, vendors.blockVendor);

// 3. RFQs
router.post('/rfqs', authenticate as any, authorize(['ADMIN', 'PROCUREMENT']) as any, rfqs.createRfq);
router.get('/rfqs', authenticate as any, rfqs.getRfqs);
router.get('/rfqs/:id', authenticate as any, rfqs.getRfqById);
router.put('/rfqs/:id/publish', authenticate as any, authorize(['ADMIN', 'PROCUREMENT']) as any, rfqs.publishRfq);
router.put('/rfqs/:id/close', authenticate as any, authorize(['ADMIN', 'PROCUREMENT']) as any, rfqs.closeRfq);

// 4. Quotations
router.post('/quotations', authenticate as any, authorize(['VENDOR']) as any, quotations.submitQuotation);
router.get('/quotations', authenticate as any, quotations.getQuotations);
router.get('/quotations/:id', authenticate as any, quotations.getQuotationById);
router.put('/quotations/:id/approve', authenticate as any, authorize(['ADMIN', 'PROCUREMENT', 'FINANCE']) as any, quotations.approveQuotation);
router.put('/quotations/:id/shortlist', authenticate as any, authorize(['ADMIN', 'PROCUREMENT']) as any, quotations.shortlistQuotation);

// 4.5 Approvals
router.post('/approvals', authenticate as any, authorize(['ADMIN', 'PROCUREMENT']) as any, approvals.createApproval);
router.get('/approvals', authenticate as any, approvals.getApprovals);
router.put('/approvals/:id/action', authenticate as any, authorize(['ADMIN', 'FINANCE']) as any, approvals.actionApproval);

// 5. Purchase Orders
router.get('/purchase-orders', authenticate as any, pos.getPurchaseOrders);
router.get('/purchase-orders/:id', authenticate as any, pos.getPoById);
router.put('/purchase-orders/:id/status', authenticate as any, pos.updatePoStatus);

// 6. Invoices
router.get('/invoices', authenticate as any, invoices.getInvoices);
router.put('/invoices/:id/status', authenticate as any, authorize(['ADMIN', 'FINANCE']) as any, invoices.updateInvoiceStatus);
router.get('/invoices/:id/pdf', authenticate as any, invoices.getInvoicePdf);
router.post('/invoices/:id/email', authenticate as any, invoices.emailInvoice);

// 7. Reports
router.get('/reports/stats', authenticate as any, reports.getStats);
router.get('/reports/download/pdf', authenticate as any, reports.downloadPdf);
router.get('/reports/download/csv', authenticate as any, reports.downloadCsv);

// 8. Audit Logs
router.get('/audit-logs', authenticate as any, logs.getAuditLogs);
router.post('/audit-logs', authenticate as any, logs.createAuditLog);

// 9. Finance (Budgets & Expenses)
router.get('/finance/budgets', authenticate as any, finance.getBudgets);
router.post('/finance/budgets', authenticate as any, authorize(['ADMIN', 'FINANCE']) as any, finance.createBudget);
router.get('/finance/expenses', authenticate as any, finance.getExpenses);
router.post('/finance/expenses', authenticate as any, authorize(['ADMIN', 'FINANCE']) as any, finance.createExpense);

// 10. Notifications
router.get('/notifications', authenticate as any, notification.getNotifications);
router.put('/notifications/:id/read', authenticate as any, notification.markRead);
router.put('/notifications/read-all', authenticate as any, notification.markAllRead);

export default router;
