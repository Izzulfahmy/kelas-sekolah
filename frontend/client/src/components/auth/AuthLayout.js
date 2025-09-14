import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css'; // Mengimpor CSS Module

const AuthLayout = () => {
  return (
    <div className={styles.authLayoutContainer}>
      {/* Sisi Kiri - Visual & Branding */}
      <div className={styles.authSidebar}>
        <div className={styles.auroraBg}></div>
        <div className={styles.authSidebarContent}>
          <div className={styles.logoContainer}>
            {/* SVG Logo */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sistem Informasi Sekolah</span>
          </div>
          <h2>Manajemen Cerdas untuk Pendidikan Modern</h2>
          <p>Kelola data, optimalkan proses, dan tingkatkan efisiensi operasional sekolah Anda.</p>
        </div>
      </div>
      
      {/* Sisi Kanan - Form Login */}
      <main className={styles.authMainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

