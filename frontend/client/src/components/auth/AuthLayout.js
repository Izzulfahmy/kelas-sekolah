import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout-container">
      <Outlet />
    </div>
  );
};

export default AuthLayout;