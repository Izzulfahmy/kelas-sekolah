// src/pages/admin/AccountListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPencilAlt } from 'react-icons/fa'; // ✅ Ikon yang benar
import './AccountListPage.css';

const AccountListPage = ({ role }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Reset password modal
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resettingUser, setResettingUser] = useState(null);
    const [resetFormData, setResetFormData] = useState({ username: '', new_password: '' });

    const title = `Daftar Akun ${role.charAt(0).toUpperCase() + role.slice(1)}`;

    // --- Ambil akun dari API
    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/api/users?role=${role}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccounts(response.data || []);
        } catch (err) {
            setError(err?.response?.data?.error || 'Tidak dapat terhubung ke server.');
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // --- Modal Reset Password
    const openResetModal = (user) => {
        setResettingUser(user);
        setResetFormData({ username: user.username, new_password: '' });
        setIsResetModalOpen(true);
    };

    const closeResetModal = () => {
        setIsResetModalOpen(false);
        setResetFormData({ username: '', new_password: '' });
        setResettingUser(null);
    };

    const handleFormChange = (e) => {
        setResetFormData({ ...resetFormData, [e.target.name]: e.target.value });
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const payload = { username: resetFormData.username };
        if (resetFormData.new_password) payload.new_password = resetFormData.new_password;

        const promise = api.put(
            `/api/users/${resettingUser.id}/reset-password`,
            payload,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        ).then(() => fetchAccounts());

        toast.promise(promise, {
            loading: 'Menyimpan perubahan...',
            success: `Akun ${resettingUser.username} berhasil diperbarui!`,
            error: (err) => `Error: ${err?.response?.data?.error || 'Gagal menyimpan'}`,
        });

        closeResetModal();
    };

    return (
        <div className="account-page data-page-container">
            <div className="page-header">
                <h1>{title}</h1>
            </div>

            {loading && <p>Memuat data akun...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Username</th>
                                <th className="aksi-header">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada data.</td>
                                </tr>
                            ) : (
                                accounts.map((acc, index) => (
                                    <tr key={acc.id}>
                                        <td data-label="No">{index + 1}</td>
                                        <td data-label="Nama">{acc.nama || '-'}</td>
                                        <td data-label="Username">{acc.username}</td>
                                        <td data-label="Aksi" className="actions-cell">
                                            <div className="action-buttons">
                                                <button
                                                    type="button"
                                                    className="btn-edit btn-icon"
                                                    title="Edit"
                                                    onClick={() => openResetModal(acc)}
                                                >
                                                    <FaPencilAlt /> {/* ✅ Ikon pensil putih */}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Reset Password */}
            {isResetModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeResetModal} aria-label="Tutup">
                            &times;
                        </button>
                        <h2>Edit Akun: {resettingUser?.username}</h2>
                        <form onSubmit={handleResetPassword} className="data-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={resetFormData.username}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password Baru</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={resetFormData.new_password}
                                    onChange={handleFormChange}
                                    placeholder="Kosongkan jika tidak diubah"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeResetModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountListPage;
