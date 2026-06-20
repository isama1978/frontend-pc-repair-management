import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Si no está autenticado, lo redirige al login de forma limpia
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza las sub-rutas (páginas del sistema)
  return <Outlet />;
};