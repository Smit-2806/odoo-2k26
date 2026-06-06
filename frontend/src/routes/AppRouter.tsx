import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { LandingPage } from '../pages/landing/LandingPage';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Vendors } from '../pages/vendors/Vendors';
import { RFQs } from '../pages/rfqs/RFQs';
import { Quotations } from '../pages/quotations/Quotations';
import { QuotationComparison } from '../pages/quotations/QuotationComparison';
import { Approvals } from '../pages/approvals/Approvals';
import { PurchaseOrders } from '../pages/purchase-orders/PurchaseOrders';
import { Invoices } from '../pages/invoices/Invoices';
import { ActivityLogs } from '../pages/notifications/ActivityLogs';
import { Reports } from '../pages/reports/Reports';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="index" element={<Navigate to="login" replace />} />
        </Route>

        {/* Dashboard / ERP routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="rfqs" element={<RFQs />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="quotations/compare/:rfqId" element={<QuotationComparison />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="activity" element={<ActivityLogs />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
