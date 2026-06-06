import { create } from 'zustand';

export type Role = 'ADMIN' | 'PROCUREMENT' | 'FINANCE' | 'VENDOR';
export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
export type RfqStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type QuotationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type PoStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
export type InvoiceStatus = 'SUBMITTED' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Vendor {
  id: string;
  companyName: string;
  taxId: string;
  phone: string;
  address: string;
  category: string;
  status: VendorStatus;
  rating: number;
  overdueInvoices: number;
}

export interface RfqItem {
  id: string;
  name: string;
  quantity: number;
  uom: string;
}

export interface Rfq {
  id: string;
  title: string;
  description: string;
  status: RfqStatus;
  submissionDeadline: string;
  category: string;
  items: RfqItem[];
  assignedVendors: string[]; // Vendor IDs
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  rfqItemId: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  status: QuotationStatus;
  deliveryDays: number;
  paymentTerms: string;
  rating: number;
  items: QuotationItem[];
  gstPercent: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
}

export interface ApprovalStep {
  role: string;
  approverName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AWAITING';
  date?: string;
  comments?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string;
  rfqTitle: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  shippingAddress: string;
  status: PoStatus;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  vendorName: string;
  amount: number;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
}

export interface AuditLog {
  id: string;
  category: 'RFQ' | 'APPROVAL' | 'INVOICE' | 'VENDOR' | 'SYSTEM';
  message: string;
  timestamp: string;
  user: string;
}

interface ProcurementState {
  currentUser: User | null;
  vendors: Vendor[];
  rfqs: Rfq[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  
  // Actions
  login: (email: string, role: Role) => void;
  logout: () => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'rating' | 'overdueInvoices'>) => void;
  verifyVendor: (vendorId: string, approve: boolean) => void;
  createRfq: (rfq: Omit<Rfq, 'id' | 'createdAt' | 'status'>) => void;
  submitQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'status'>) => void;
  approveQuotation: (quotationId: string, comments: string, approve: boolean) => void;
  markInvoicePaid: (invoiceId: string) => void;
  addAuditLog: (category: AuditLog['category'], message: string) => void;
}

const mockVendors: Vendor[] = [
  { id: 'v1', companyName: 'Infra Supplies Pvt Ltd', taxId: '27AABCS1429Bz0', phone: '+91 98765 43210', address: '456, Industrial Estate, Surat', category: 'Furniture', status: 'APPROVED', rating: 4.5, overdueInvoices: 0 },
  { id: 'v2', companyName: 'Tech Core LTD', taxId: '27AABCS1430Bz1', phone: '+91 98765 43211', address: '101, Tech Park, Bangalore', category: 'IT', status: 'APPROVED', rating: 4.2, overdueInvoices: 0 },
  { id: 'v3', companyName: 'OfficeNeed Co.', taxId: '27AABCS1431Bz2', phone: '+91 98765 43212', address: '789, Business Square, Ahmedabad', category: 'Office Supplies', status: 'APPROVED', rating: 3.8, overdueInvoices: 1 },
  { id: 'v4', companyName: 'FastLog Transport', taxId: '27AABCS1432Bz3', phone: '+91 98765 43213', address: '12, Logistics Lane, Surat', category: 'Logistics', status: 'BLOCKED', rating: 2.5, overdueInvoices: 3 },
  { id: 'v5', companyName: 'Green Services', taxId: '27AABCS1433Bz4', phone: '+91 98765 43214', address: '23, Eco Plaza, Mumbai', category: 'Janitorial', status: 'PENDING', rating: 0.0, overdueInvoices: 0 }
];

const mockRfqs: Rfq[] = [
  {
    id: 'rfq1',
    title: 'Office Furniture Procurement Q2',
    description: 'Ergonomic chairs and standing desks for 3rd floor expansion.',
    status: 'PUBLISHED',
    submissionDeadline: '2026-06-15',
    category: 'Furniture',
    items: [
      { id: 'item1', name: 'Ergonomic chair', quantity: 25, uom: 'NOS' },
      { id: 'item2', name: 'Standing desk', quantity: 10, uom: 'NOS' }
    ],
    assignedVendors: ['v1', 'v2', 'v3'],
    createdAt: '2026-06-01'
  }
];

const mockQuotations: Quotation[] = [
  {
    id: 'q1',
    rfqId: 'rfq1',
    vendorId: 'v1',
    vendorName: 'Infra Supplies Pvt Ltd',
    status: 'APPROVED',
    deliveryDays: 10,
    paymentTerms: '20 days net',
    rating: 4.5,
    items: [
      { id: 'qi1', rfqItemId: 'item1', unitPrice: 3500, totalPrice: 87500 },
      { id: 'qi2', rfqItemId: 'item2', unitPrice: 8200, totalPrice: 82000 }
    ],
    gstPercent: 18,
    subtotal: 169500,
    gstAmount: 30510,
    grandTotal: 200010,
    notes: 'Includes free delivery and assembly.',
    createdAt: '2026-06-03'
  },
  {
    id: 'q2',
    rfqId: 'rfq1',
    vendorId: 'v2',
    vendorName: 'Tech Core LTD',
    status: 'UNDER_REVIEW',
    deliveryDays: 14,
    paymentTerms: '30 days net',
    rating: 4.2,
    items: [
      { id: 'qi3', rfqItemId: 'item1', unitPrice: 3800, totalPrice: 95000 },
      { id: 'qi4', rfqItemId: 'item2', unitPrice: 8500, totalPrice: 85000 }
    ],
    gstPercent: 18,
    subtotal: 180000,
    gstAmount: 32400,
    grandTotal: 212400,
    createdAt: '2026-06-04'
  }
];

const mockPOs: PurchaseOrder[] = [
  {
    id: 'po1',
    poNumber: 'PO-2026-0001',
    rfqId: 'rfq1',
    rfqTitle: 'Office Furniture Procurement Q2',
    quotationId: 'q1',
    vendorId: 'v1',
    vendorName: 'Infra Supplies Pvt Ltd',
    totalAmount: 200010,
    shippingAddress: '123 Business Park, Ahmedabad',
    status: 'ACCEPTED',
    createdAt: '2026-06-04'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2026-1024',
    purchaseOrderId: 'po1',
    purchaseOrderNumber: 'PO-2026-0001',
    vendorName: 'Infra Supplies Pvt Ltd',
    amount: 200010,
    status: 'SUBMITTED',
    invoiceDate: '2026-06-05',
    dueDate: '2026-07-05'
  }
];

const mockLogs: AuditLog[] = [
  { id: 'l1', category: 'VENDOR', message: 'Vendor added - FastLog transport registered and pending verifications', timestamp: '2026-06-01T15:20:00Z', user: 'System' },
  { id: 'l2', category: 'RFQ', message: 'RFQ published - office furniture Q2 sent to 3 vendors', timestamp: '2026-06-02T10:00:00Z', user: 'Rahul Mehta' },
  { id: 'l3', category: 'APPROVAL', message: 'Approval pending - PO-2026-0001 awaiting L2 approval by Priya Shah', timestamp: '2026-06-04T09:15:00Z', user: 'Rahul Mehta' },
  { id: 'l4', category: 'APPROVAL', message: 'Quotation selected - Infra Supplies Pvt Ltd selected for office furniture Q2', timestamp: '2026-06-04T21:15:00Z', user: 'Priya Shah' }
];

export const useProcurementStore = create<ProcurementState>((set, get) => ({
  currentUser: { id: 'u1', email: 'officer@vendorbridge.com', name: 'Rahul Mehta', role: 'PROCUREMENT' },
  vendors: mockVendors,
  rfqs: mockRfqs,
  quotations: mockQuotations,
  purchaseOrders: mockPOs,
  invoices: mockInvoices,
  auditLogs: mockLogs,

  login: (email, role) => {
    const name = role === 'PROCUREMENT' ? 'Rahul Mehta' : role === 'FINANCE' ? 'Priya Shah' : role === 'ADMIN' ? 'Admin User' : 'Supplier User';
    set({ currentUser: { id: 'user-' + role.toLowerCase(), email, name, role } });
    get().addAuditLog('SYSTEM', `${name} logged in as ${role}`);
  },

  logout: () => {
    const user = get().currentUser;
    if (user) {
      get().addAuditLog('SYSTEM', `${user.name} logged out`);
    }
    set({ currentUser: null });
  },

  addVendor: (vendor) => {
    const newVendor: Vendor = {
      ...vendor,
      id: 'v-' + Math.random().toString(36).substr(2, 9),
      rating: 0.0,
      overdueInvoices: 0
    };
    set((state) => ({ vendors: [...state.vendors, newVendor] }));
    get().addAuditLog('VENDOR', `Vendor registered - ${vendor.companyName} pending review.`);
  },

  verifyVendor: (vendorId, approve) => {
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === vendorId ? { ...v, status: approve ? 'APPROVED' : 'REJECTED' } : v
      )
    }));
    const vendor = get().vendors.find(v => v.id === vendorId);
    get().addAuditLog('VENDOR', `Vendor review - ${vendor?.companyName} status updated to ${approve ? 'APPROVED' : 'REJECTED'}.`);
  },

  createRfq: (rfq) => {
    const newRfq: Rfq = {
      ...rfq,
      id: 'rfq-' + Math.random().toString(36).substr(2, 9),
      status: 'PUBLISHED',
      createdAt: new Date().toISOString().split('T')[0]
    };
    set((state) => ({ rfqs: [...state.rfqs, newRfq] }));
    get().addAuditLog('RFQ', `RFQ published - "${rfq.title}" sent to assigned vendors.`);
  },

  submitQuotation: (quotation) => {
    const newQuotation: Quotation = {
      ...quotation,
      id: 'q-' + Math.random().toString(36).substr(2, 9),
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().split('T')[0]
    };
    set((state) => ({ quotations: [...state.quotations, newQuotation] }));
    get().addAuditLog('RFQ', `Quotation submitted - Bid of ${quotation.grandTotal} received from ${quotation.vendorName}.`);
  },

  approveQuotation: (quotationId, comments, approve) => {
    // 1. Update Quotation Status
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === quotationId ? { ...q, status: approve ? 'APPROVED' : 'REJECTED' } : q
      )
    }));
    
    const quotation = get().quotations.find((q) => q.id === quotationId);
    if (!quotation) return;

    if (approve) {
      // 2. Auto-generate Purchase Order
      const newPoNumber = `PO-${new Date().getFullYear()}-00` + (get().purchaseOrders.length + 1);
      const newPO: PurchaseOrder = {
        id: 'po-' + Math.random().toString(36).substr(2, 9),
        poNumber: newPoNumber,
        rfqId: quotation.rfqId,
        rfqTitle: get().rfqs.find(r => r.id === quotation.rfqId)?.title || 'Office Procurement',
        quotationId: quotation.id,
        vendorId: quotation.vendorId,
        vendorName: quotation.vendorName,
        totalAmount: Number(quotation.grandTotal),
        shippingAddress: '123 Business Park, Ahmedabad',
        status: 'SENT',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      // 3. Auto-generate Invoice
      const newInvNumber = `INV-${new Date().getFullYear()}-10` + (get().invoices.length + 24);
      const newInvoice: Invoice = {
        id: 'inv-' + Math.random().toString(36).substr(2, 9),
        invoiceNumber: newInvNumber,
        purchaseOrderId: newPO.id,
        purchaseOrderNumber: newPO.poNumber,
        vendorName: newPO.vendorName,
        amount: newPO.totalAmount,
        status: 'SUBMITTED',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      set((state) => ({
        purchaseOrders: [...state.purchaseOrders, newPO],
        invoices: [...state.invoices, newInvoice]
      }));

      get().addAuditLog('APPROVAL', `Quotation approved - PO ${newPO.poNumber} generated for ${quotation.vendorName}. Comments: ${comments}`);
    } else {
      get().addAuditLog('APPROVAL', `Quotation rejected - Bid from ${quotation.vendorName} marked rejected. Comments: ${comments}`);
    }
  },

  markInvoicePaid: (invoiceId) => {
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv
      )
    }));
    
    const invoice = get().invoices.find(i => i.id === invoiceId);
    if (invoice) {
      // Complete purchase order status
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === invoice.purchaseOrderId ? { ...po, status: 'COMPLETED' } : po
        )
      }));
      get().addAuditLog('INVOICE', `Payment processed - Invoice ${invoice.invoiceNumber} marked as PAID.`);
    }
  },

  addAuditLog: (category, message) => {
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      category,
      message,
      timestamp: new Date().toISOString(),
      user: get().currentUser?.name || 'System'
    };
    // Immutable array push
    set((state) => ({ auditLogs: [...state.auditLogs, newLog] }));
  }
}));
