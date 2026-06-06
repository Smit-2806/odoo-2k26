import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProcurementStore } from '../store/procurementStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useProcurementStore((state) => state.currentUser);
  const token = localStorage.getItem('vendorbridge_token');

  if (!currentUser || !token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
