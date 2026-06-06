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
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

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
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route 
            path="vendors" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PROCUREMENT']}>
                <Vendors />
              </RoleGuard>
            } 
          />
          <Route 
            path="rfqs" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PROCUREMENT']}>
                <RFQs />
              </RoleGuard>
            } 
          />
          <Route 
            path="quotations" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'VENDOR', 'PROCUREMENT']}>
                <Quotations />
              </RoleGuard>
            } 
          />
          <Route 
            path="quotations/compare/:rfqId" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PROCUREMENT']}>
                <QuotationComparison />
              </RoleGuard>
            } 
          />
          <Route 
            path="approvals" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PROCUREMENT', 'FINANCE']}>
                <Approvals />
              </RoleGuard>
            } 
          />
          <Route 
            path="purchase-orders" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR']}>
                <PurchaseOrders />
              </RoleGuard>
            } 
          />
          <Route 
            path="invoices" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'FINANCE', 'VENDOR']}>
                <Invoices />
              </RoleGuard>
            } 
          />
          <Route 
            path="activity" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PROCUREMENT', 'FINANCE']}>
                <ActivityLogs />
              </RoleGuard>
            } 
          />
          <Route 
            path="reports" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'PROCUREMENT', 'FINANCE']}>
                <Reports />
              </RoleGuard>
            } 
          />
        </Route>
 
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
 
export default AppRouter;
