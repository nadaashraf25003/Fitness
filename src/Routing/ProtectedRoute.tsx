import React, { FC, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import { UserRole } from '../types/auth.types';
import { Spinner } from '../Components/ui/Spinner';
import { PATHS } from './routePaths';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  allowedRoles?: UserRole[];
  children?: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  adminOnly = false,
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <Spinner size="large" />
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // 3. Admin-Only Guard
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  // 4. Role list Guard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  // 5. Authorized
  return children ? <>{children}</> : <Outlet />;
};
