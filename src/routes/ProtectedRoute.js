// ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading/Loading';

const ProtectedRoute = ({ requiredPermission }) => {
  const { token, loading, permissions } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // Verifica se o usuário está autenticado
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Verifica se o usuário tem a permissão necessária para acessar a rota
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/sem-permissao" />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;