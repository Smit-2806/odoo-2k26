import { create } from 'zustand';
import apiClient from '../api/axios';

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
  description?: string;
}

export interface Rfq {
  id: string;
  title: string;
  description: string;
  status: RfqStatus;
  submissionDeadline: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  category: string;
  items: RfqItem[];
  assignedVendors: string[];
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  rfqItemId: string;
  unitPrice: number;
  totalPrice: number;
  name?: string;
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

interface ReportsStats {
  kpis: {
    totalSpent: number;
    totalVendors: number;
    pendingVendors: number;
    totalRfqs: number;
    overdueInvoices: number;
  };
  categoryData: { category: string; amount: number }[];
  monthlyTrend: { month: string; amount: number }[];
  cycleTimeData: { name: string; days: number }[];
  vendorPerformance: { name: string; rating: number; onTime: number }[];
}

interface ProcurementState {
  currentUser: User | null;
  vendors: Vendor[];
  rfqs: Rfq[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  stats: ReportsStats | null;
  loading: boolean;
  
  // Fetch Actions
  fetchVendors: () => Promise<void>;
  fetchRfqs: () => Promise<void>;
  fetchQuotations: (rfqId?: string) => Promise<void>;
  fetchPurchaseOrders: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  fetchReports: () => Promise<void>;
  initData: () => Promise<void>;

  // Actions
  login: (email: string, role: Role) => Promise<void>;
  logout: () => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'rating' | 'overdueInvoices'>) => Promise<void>;
  verifyVendor: (vendorId: string, approve: boolean) => Promise<void>;
  createRfq: (rfq: Omit<Rfq, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  submitQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  approveQuotation: (quotationId: string, comments: string, approve: boolean) => Promise<void>;
  markInvoicePaid: (invoiceId: string) => Promise<void>;
  addAuditLog: (category: AuditLog['category'], message: string) => Promise<void>;
}

const getInitialUser = (): User | null => {
  const userStr = localStorage.getItem('vendorbridge_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  // Default starting demo session
  return { id: 'u-officer', email: 'officer@vendorbridge.com', name: 'Rahul Mehta', role: 'PROCUREMENT' };
};

export const useProcurementStore = create<ProcurementState>((set, get) => ({
  currentUser: getInitialUser(),
  vendors: [],
  rfqs: [],
  quotations: [],
  purchaseOrders: [],
  invoices: [],
  auditLogs: [],
  stats: null,
  loading: false,

  fetchVendors: async () => {
    try {
      const res = await apiClient.get('/vendors');
      set({ vendors: res.data.data });
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  },

  fetchRfqs: async () => {
    try {
      const res = await apiClient.get('/rfqs');
      const formatted = res.data.data.map((r: any) => ({
        ...r,
        assignedVendors: r.assignedVendors || []
      }));
      set({ rfqs: formatted });
    } catch (err) {
      console.error('Error fetching RFQs:', err);
    }
  },

  fetchQuotations: async (rfqId) => {
    try {
      const url = rfqId ? `/quotations?rfqId=${rfqId}` : '/quotations';
      const res = await apiClient.get(url);
      set({ quotations: res.data.data });
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  },

  fetchPurchaseOrders: async () => {
    try {
      const res = await apiClient.get('/purchase-orders');
      set({ purchaseOrders: res.data.data });
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
    }
  },

  fetchInvoices: async () => {
    try {
      const res = await apiClient.get('/invoices');
      set({ invoices: res.data.data });
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  },

  fetchAuditLogs: async () => {
    try {
      const res = await apiClient.get('/audit-logs');
      set({ auditLogs: res.data.data });
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  },

  fetchReports: async () => {
    try {
      const res = await apiClient.get('/reports/stats');
      set({ stats: res.data.data });
    } catch (err) {
      console.error('Error fetching report stats:', err);
    }
  },

  initData: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().fetchVendors(),
        get().fetchRfqs(),
        get().fetchQuotations(),
        get().fetchPurchaseOrders(),
        get().fetchInvoices(),
        get().fetchAuditLogs(),
        get().fetchReports()
      ]);
    } catch (err) {
      console.error('Error initializing data:', err);
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, role) => {
    try {
      console.log('Logging in as role:', role);
      // Find matching password for email or just use default password
      const password = 'password123';
      const res = await apiClient.post('/auth/login', { email, password });
      
      const { token, user } = res.data.data;
      localStorage.setItem('vendorbridge_token', token);
      localStorage.setItem('vendorbridge_user', JSON.stringify(user));
      
      set({ currentUser: user });
      await get().initData();
    } catch (err) {
      console.error('Login error:', err);
    }
  },

  logout: () => {
    localStorage.removeItem('vendorbridge_token');
    localStorage.removeItem('vendorbridge_user');
    set({
      currentUser: null,
      vendors: [],
      rfqs: [],
      quotations: [],
      purchaseOrders: [],
      invoices: [],
      auditLogs: [],
      stats: null
    });
  },

  addVendor: async (vendor) => {
    try {
      // Registers as a VENDOR role user + vendor profile
      await apiClient.post('/auth/register', {
        email: `vendor-${Math.random().toString(36).substr(2, 5)}@vendorbridge.com`,
        password: 'password123',
        name: vendor.companyName,
        role: 'VENDOR',
        companyName: vendor.companyName,
        taxId: vendor.taxId,
        phone: vendor.phone,
        address: vendor.address,
        businessFields: vendor.category
      });
      await get().fetchVendors();
      await get().fetchAuditLogs();
    } catch (err) {
      console.error('Error adding vendor:', err);
    }
  },

  verifyVendor: async (vendorId, approve) => {
    try {
      await apiClient.put(`/vendors/${vendorId}/verify`, { approve });
      await get().fetchVendors();
      await get().fetchAuditLogs();
      await get().fetchReports();
    } catch (err) {
      console.error('Error verifying vendor:', err);
    }
  },

  createRfq: async (rfq) => {
    try {
      await apiClient.post('/rfqs', {
        title: rfq.title,
        description: rfq.description,
        submissionDeadline: rfq.submissionDeadline,
        deliveryTerms: rfq.deliveryTerms,
        paymentTerms: rfq.paymentTerms,
        items: rfq.items
      });
      await get().fetchRfqs();
      await get().fetchAuditLogs();
      await get().fetchReports();
    } catch (err) {
      console.error('Error creating RFQ:', err);
    }
  },

  submitQuotation: async (quotation) => {
    try {
      await apiClient.post('/quotations', {
        rfqId: quotation.rfqId,
        deliveryDays: quotation.deliveryDays,
        paymentTerms: quotation.paymentTerms,
        notes: quotation.notes,
        items: quotation.items.map(item => ({
          rfqItemId: item.rfqItemId,
          unitPrice: item.unitPrice
        })),
        gstPercent: quotation.gstPercent
      });
      await get().fetchQuotations();
      await get().fetchAuditLogs();
    } catch (err) {
      console.error('Error submitting quotation:', err);
    }
  },

  approveQuotation: async (quotationId, comments, approve) => {
    try {
      await apiClient.put(`/quotations/${quotationId}/approve`, { approve, comments });
      await Promise.all([
        get().fetchQuotations(),
        get().fetchPurchaseOrders(),
        get().fetchInvoices(),
        get().fetchAuditLogs(),
        get().fetchReports()
      ]);
    } catch (err) {
      console.error('Error approving quotation:', err);
    }
  },

  markInvoicePaid: async (invoiceId) => {
    try {
      await apiClient.put(`/invoices/${invoiceId}/status`, { status: 'PAID' });
      await Promise.all([
        get().fetchInvoices(),
        get().fetchPurchaseOrders(),
        get().fetchAuditLogs(),
        get().fetchReports()
      ]);
    } catch (err) {
      console.error('Error marking invoice paid:', err);
    }
  },

  addAuditLog: async (category, message) => {
    try {
      await apiClient.post('/audit-logs', { category, message });
      await get().fetchAuditLogs();
    } catch (err) {
      console.error('Error adding audit log:', err);
    }
  }
}));
