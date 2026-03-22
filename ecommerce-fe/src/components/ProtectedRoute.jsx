import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
  const token = localStorage.getItem('admin_token');
  const userStr = localStorage.getItem('admin_user');
  const user = userStr ? JSON.parse(userStr) : null;

  // 1. Kiểm tra Token
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // 2. Kiểm tra Role (hỗ trợ cả Array và String đơn lẻ)
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
