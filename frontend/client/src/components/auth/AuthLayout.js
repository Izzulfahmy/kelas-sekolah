import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout-container">
      {/* Sisi Kiri (Dual-Tone) */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <h2>Sistem Informasi Sekolah</h2>
          <p>Kelola data sekolah Anda dengan mudah dan efisien.</p>
        </div>
      </div>
      {/* Sisi Kanan (Form) */}
      <div className="auth-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;