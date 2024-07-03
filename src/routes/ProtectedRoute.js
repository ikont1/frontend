import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading/Loading';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <Loading/>
  }

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
