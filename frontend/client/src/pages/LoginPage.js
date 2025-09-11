import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ✅ Ganti axios dengan api.js
import api from '../api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // ✅ Ganti axios.post jadi api.post dan hapus baseURL manual
            const response = await api.post('/api/login', {
                username,
                password
            });

            if (response.data.token) {
                // Simpan token dan role
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);

                // Pengalihan berdasarkan role
                const role = response.data.role;
                if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate(`/${role}/dashboard`);
                }
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'Username atau password salah.');
            } else {
                setError('Tidak dapat terhubung ke server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p>
                    Belum punya akun? <Link to="/register">Register di sini</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
