import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Routes, Route } from 'react-router-dom';
import './AdminLayout.css';
import { 
    FaTachometerAlt, FaUsers, FaUserShield, FaUserGraduate, FaChalkboardTeacher, 
    FaSignOutAlt, FaChevronDown, FaBars, FaSchool, FaCalendarAlt, FaBook, 
    FaClipboardList, FaUsersCog, FaCheckDouble, FaUserCheck, FaFutbol, 
    FaFileInvoiceDollar, FaLaptopCode, FaPrint, FaUserTie, FaCog, FaDatabase, FaTasks,
    FaUserCircle
} from 'react-icons/fa';

import AdminDashboardPage from '../../pages/admin/AdminDashboardPage';
import AccountListPage from '../../pages/admin/AccountListPage';
import SchoolProfilePage from '../../pages/admin/SchoolProfilePage';
import TeacherDataPage from '../../pages/admin/TeacherDataPage';
import StudentDataPage from '../../pages/admin/StudentDataPage';
import DataMasterPage from '../../pages/admin/DataMasterPage';
import PlaceholderPage from '../../pages/admin/PlaceholderPage';

import CurriculumPage from '../../pages/admin/CurriculumPage';
import MataPelajaranPage from '../../pages/admin/MataPelajaranPage';
import ExtracurricularPage from '../../pages/admin/ExtracurricularPage';
import AcademicYearPage from '../../pages/admin/AcademicYearPage';
import ManajemenKelasPage from '../../pages/admin/ManajemenKelasPage';


const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openSubmenus, setOpenSubmenus] = useState({});
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleAccountMenu = () => setIsAccountMenuOpen(!isAccountMenuOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSubmenu = (menuName) => {
        setOpenSubmenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    const SubmenuNavLink = ({ to, icon, text }) => (
        <li><NavLink to={to}>{icon}<span>{text}</span></NavLink></li>
    );

    return (
        <div className="admin-layout">
            <div className="icon-bar">
                <button className="hamburger-btn icon-bar-btn" onClick={toggleSidebar}>
                    <FaBars />
                </button>
            </div>

            <div className="content-wrapper">
                {isSidebarOpen && window.innerWidth <= 768 && <div className="overlay open" onClick={toggleSidebar}></div>}

                <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header"><h2>Menu Admin</h2></div>
                    <ul className="sidebar-menu">
                        <li><NavLink to="/admin" end><FaTachometerAlt /><span>Dashboard</span></NavLink></li>
                        
                        <li>
                            <button onClick={() => toggleSubmenu('sekolah')} className="submenu-toggle">
                                <span className="menu-item-group"><FaSchool /><span>Manajemen Sekolah</span></span>
                                <FaChevronDown className={`arrow ${openSubmenus['sekolah'] ? 'open' : ''}`} />
                            </button>
                            {openSubmenus['sekolah'] && (
                                <ul className="submenu">
                                    <SubmenuNavLink to="/admin/profil-sekolah" icon={<FaSchool />} text="Profil Sekolah" />
                                    <SubmenuNavLink to="/admin/tahun-pelajaran" icon={<FaCalendarAlt />} text="Tahun Pelajaran" />
                                </ul>
                            )}
                        </li>

                        <li>
                            <button onClick={() => toggleSubmenu('akademik')} className="submenu-toggle">
                                <span className="menu-item-group"><FaBook /><span>Manajemen Akademik</span></span>
                                <FaChevronDown className={`arrow ${openSubmenus['akademik'] ? 'open' : ''}`} />
                            </button>
                            {openSubmenus['akademik'] && (
                                <ul className="submenu">
                                    <SubmenuNavLink to="/admin/kurikulum" icon={<FaBook />} text="Kurikulum" />
                                    <SubmenuNavLink to="/admin/mata-pelajaran" icon={<FaClipboardList />} text="Mata Pelajaran" />
                                    <SubmenuNavLink to="/admin/manajemen-kelas" icon={<FaUsersCog />} text="Manajemen Kelas" />
                                    <SubmenuNavLink to="/admin/ekstrakurikuler" icon={<FaFutbol />} text="Ekstrakurikuler" />
                                    <SubmenuNavLink to="/admin/skema-penilaian" icon={<FaCheckDouble />} text="Skema Penilaian" />
                                </ul>
                            )}
                        </li>

                        <li>
                            <button onClick={() => toggleSubmenu('pengguna')} className="submenu-toggle">
                                <span className="menu-item-group"><FaUsers /><span>Manajemen Pengguna</span></span>
                                <FaChevronDown className={`arrow ${openSubmenus['pengguna'] ? 'open' : ''}`} />
                            </button>
                            {openSubmenus['pengguna'] && (
                                <ul className="submenu">
                                    <SubmenuNavLink to="/admin/data-guru" icon={<FaUserTie />} text="Data Guru" />
                                    <SubmenuNavLink to="/admin/data-siswa" icon={<FaUserGraduate />} text="Data Siswa" />
                                    <li>
                                        <button onClick={() => toggleSubmenu('akun')} className="submenu-toggle nested">
                                            <span className="menu-item-group"><FaUserShield/><span>Akun Pengguna</span></span>
                                            <FaChevronDown className={`arrow ${openSubmenus['akun'] ? 'open' : ''}`} />
                                        </button>
                                        {openSubmenus['akun'] && (
                                            <ul className="submenu nested-submenu">
                                                <SubmenuNavLink to="/admin/akun/admin" icon={<FaUserShield />} text="Admin" />
                                                <SubmenuNavLink to="/admin/akun/guru" icon={<FaChalkboardTeacher />} text="Guru" />
                                                <SubmenuNavLink to="/admin/akun/siswa" icon={<FaUserGraduate />} text="Siswa" />
                                            </ul>
                                        )}
                                    </li>
                                </ul>
                            )}
                        </li>
                        
                        <li>
                            <button onClick={() => toggleSubmenu('aktivitas')} className="submenu-toggle">
                                <span className="menu-item-group"><FaTasks /><span>Aktivitas & Penilaian</span></span>
                                <FaChevronDown className={`arrow ${openSubmenus['aktivitas'] ? 'open' : ''}`} />
                            </button>
                            {openSubmenus['aktivitas'] && (
                                <ul className="submenu">
                                    <li>
                                        <button onClick={() => toggleSubmenu('kehadiran')} className="submenu-toggle nested">
                                            <span className="menu-item-group"><FaUserCheck /><span>Kehadiran</span></span>
                                            <FaChevronDown className={`arrow ${openSubmenus['kehadiran'] ? 'open' : ''}`} />
                                        </button>
                                        {openSubmenus['kehadiran'] && (
                                            <ul className="submenu nested-submenu">
                                                <SubmenuNavLink to="/admin/kehadiran/siswa" text="Siswa" />
                                                <SubmenuNavLink to="/admin/kehadiran/guru" text="Guru" />
                                            </ul>
                                        )}
                                    </li>
                                    <SubmenuNavLink to="/admin/pembiayaan" icon={<FaFileInvoiceDollar />} text="Pembiayaan" />
                                    <SubmenuNavLink to="/admin/cbt" icon={<FaLaptopCode />} text="CBT" />
                                    <SubmenuNavLink to="/admin/raport" icon={<FaPrint />} text="Raport" />
                                </ul>
                            )}
                        </li>

                        <li>
                            <button onClick={() => toggleSubmenu('pengaturan')} className="submenu-toggle">
                                <span className="menu-item-group"><FaCog /><span>Pengaturan Lanjutan</span></span>
                                <FaChevronDown className={`arrow ${openSubmenus['pengaturan'] ? 'open' : ''}`} />
                            </button>
                            {openSubmenus['pengaturan'] && (
                                <ul className="submenu">
                                    <SubmenuNavLink to="/admin/pengaturan/data-master" icon={<FaDatabase />} text="Data Master" />
                                </ul>
                            )}
                        </li>
                    </ul>
                </aside>

                <main className="main-content">
                    <header className="header">
                         <button className="hamburger-btn mobile-hamburger" onClick={toggleSidebar}><FaBars /></button>
                        <div className="header-right">
                           <div className="account-menu" ref={accountMenuRef}>
                                <button onClick={toggleAccountMenu} className="account-menu-button">
                                    <FaUserCircle />
                                </button>
                                {isAccountMenuOpen && (
                                    <div className="account-dropdown">
                                        <div className="dropdown-profile-info">
                                            <strong>Nama Pengguna</strong>
                                            <small>admin@example.com</small>
                                        </div>
                                        <button onClick={handleLogout} className="logout-button-dropdown">
                                            <FaSignOutAlt />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                    <div className="content-area">
                        <Routes>
                            <Route path="/" element={<AdminDashboardPage />} />
                            <Route path="profil-sekolah" element={<SchoolProfilePage />} />
                            <Route path="tahun-pelajaran" element={<AcademicYearPage />} />
                            
                            <Route path="kurikulum" element={<CurriculumPage />} />
                            <Route path="mata-pelajaran" element={<MataPelajaranPage />} />
                            <Route path="manajemen-kelas" element={<ManajemenKelasPage />} />
                            <Route path="ekstrakurikuler" element={<ExtracurricularPage />} />

                            <Route path="skema-penilaian" element={<PlaceholderPage title="Skema Penilaian" />} />
                            <Route path="data-guru" element={<TeacherDataPage />} />
                            <Route path="data-siswa" element={<StudentDataPage />} />
                            <Route path="akun/admin" element={<AccountListPage role="admin" />} />
                            <Route path="akun/guru" element={<AccountListPage role="guru" />} />
                            <Route path="akun/siswa" element={<AccountListPage role="siswa" />} />
                            <Route path="kehadiran/siswa" element={<PlaceholderPage title="Kehadiran Siswa" />} />
                            <Route path="kehadiran/guru" element={<PlaceholderPage title="Kehadiran Guru" />} />
                            <Route path="pembiayaan" element={<PlaceholderPage title="Pembiayaan" />} />
                            <Route path="cbt" element={<PlaceholderPage title="CBT (Computer-Based Test)" />} />
                            <Route path="raport" element={<PlaceholderPage title="Raport" />} />
                            <Route path="pengaturan/data-master" element={<DataMasterPage />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

