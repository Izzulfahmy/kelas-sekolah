import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
                setError('Tidak dapat terhubung ke server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleLogin}>
            <h2>Selamat Datang</h2>
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
            {/* Memindahkan pesan error ke sini */}
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default LoginPage;