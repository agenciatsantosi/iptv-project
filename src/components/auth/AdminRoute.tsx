import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { isAdmin, loading: adminLoading, initialize } = useAdmin();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Se não estiver autenticado ou não for admin, redireciona
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
