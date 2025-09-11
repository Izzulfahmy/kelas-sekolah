import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './StudentLayout.css';
import { FaTachometerAlt, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';

const StudentLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="student-layout">
            {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

            <aside className={`sidebar-student ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Dasbor Siswa</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><NavLink to="/siswa/dashboard" end><FaTachometerAlt /> <span>Dashboard</span></NavLink></li>
                    <li><NavLink to="/siswa/biodata"><FaUser /> <span>Biodata</span></NavLink></li>
                </ul>
            </aside>
            <main className="main-content">
                <header className="header">
                    <button className="hamburger-btn" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <div className="header-right">
                        <button onClick={handleLogout} className="logout-button">
                            <FaSignOutAlt /> <span>Logout</span>
                        </button>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;