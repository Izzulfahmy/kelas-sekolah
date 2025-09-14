import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Pastikan path ini benar dan file api.js ada
import styles from './LoginPage.module.css'; // Mengimpor CSS Module

// --- SVG Icons Component ---
const EyeIcon = ({ isVisible }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isVisible ? (
            <>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
            </>
        )}
    </svg>
);


const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/login', {
                username,
                password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);

                const role = response.data.role;
                if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate(`/${role}/dashboard`);
                }
            }
        } catch (err) {
            if (err.response) {
                setError('Username atau password salah.'); 
            } else {
                setError('Tidak dapat terhubung ke server. Coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginFormContainer}>
            <div className={styles.authFormHeader} style={{ animationDelay: '0.1s' }}>
                <h2>Selamat Datang Kembali</h2>
                <p>Masuk untuk melanjutkan ke dasbor Anda.</p>
            </div>

            <form onSubmit={handleLogin} noValidate>
                 {error && <p className={styles.errorMessage}>{error}</p>}

                <div className={styles.inputGroup} style={{ animationDelay: '0.2s' }}>
                     <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} placeholder="Username" />
                </div>

                <div className={styles.inputGroup} style={{ animationDelay: '0.3s' }}>
                    <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input type={isPasswordVisible ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} placeholder="Password" />
                    <button type="button" className={styles.passwordToggle} onClick={() => setPasswordVisible(!isPasswordVisible)}>
                        <EyeIcon isVisible={isPasswordVisible} />
                    </button>
                </div>

                <button type="submit" disabled={loading} className={styles.loginButton} style={{ animationDelay: '0.4s' }}>
                    {loading ? <div className={styles.spinner}></div> : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;

