import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProcurementStore } from '../store/procurementStore';
import type { Role } from '../store/procurementStore';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const currentUser = useProcurementStore((state) => state.currentUser);

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
