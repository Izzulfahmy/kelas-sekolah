import React from 'react';
import { Navigate } from 'react-router-dom';

// --- PERUBAHAN DI SINI: Terima 'children' sebagai properti ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Cek 1: Apakah sudah login?
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Cek 2: Apakah rolenya diizinkan?
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  // --- PERUBAHAN UTAMA DI SINI ---
  // Jika semua pengecekan lolos, tampilkan komponen "anak"-nya.
  // Bukan lagi <Outlet />, tetapi 'children' yang sebenarnya (yaitu AdminLayout).
  return children;
};

export default ProtectedRoute;