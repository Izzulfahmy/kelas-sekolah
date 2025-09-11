import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ✅ Ganti axios dengan api.js
import api from '../api';

const RegisterPage = () => {
    const [nama, setNama] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('siswa');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // ✅ Ganti axios.post jadi api.post dan hapus baseURL manual
            const response = await api.post('/api/register', {
                nama,
                username,
                password,
                role
            });

            if (response.status === 200) {
                alert('Registrasi berhasil! Silakan login.');
                navigate('/');
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'Terjadi kesalahan saat registrasi.');
            } else {
                setError('Tidak dapat terhubung ke server.');
            }
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleRegister}>
                <h2>Register</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div className="form-group">
                    <label htmlFor="nama">Nama Lengkap</label>
                    <input
                        type="text"
                        id="nama"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
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
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Daftar sebagai</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="siswa">Siswa</option>
                        <option value="guru">Guru</option>
                    </select>
                </div>

                <button type="submit">Register</button>
                <p>
                    Sudah punya akun? <Link to="/">Login di sini</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;
