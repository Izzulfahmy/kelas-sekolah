import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from './components/auth/AuthLayout';
import AdminLayout from './components/admin/AdminLayout';
import TeacherLayout from './components/guru/TeacherLayout';
import StudentLayout from './components/siswa/StudentLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// --- DUA BARIS DI BAWAH INI DIHAPUS ---
// import AdminDashboardPage from './pages/admin/AdminDashboardPage';
// import AccountListPage from './pages/admin/AccountListPage';
import TeacherDashboardPage from './pages/guru/TeacherDashboardPage';
import TeacherBiodataPage from './pages/guru/TeacherBiodataPage';
import StudentDashboardPage from './pages/siswa/StudentDashboardPage';
import StudentBiodataPage from './pages/siswa/StudentBiodataPage';

// Auth
import ProtectedRoute from './auth/ProtectedRoute';

// Global CSS
import './App.css';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* Rute Publik (Login, Register) */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rute Admin */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>} />
        
        {/* Rute Guru */}
        <Route path="/guru" element={<ProtectedRoute allowedRoles={['guru']}><TeacherLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="biodata" element={<TeacherBiodataPage />} />
        </Route>

        {/* Rute Siswa */}
        <Route path="/siswa" element={<ProtectedRoute allowedRoles={['siswa']}><StudentLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="biodata" element={<StudentBiodataPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;