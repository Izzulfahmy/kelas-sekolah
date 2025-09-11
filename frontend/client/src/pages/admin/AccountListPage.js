import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

const AccountListPage = ({ role }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resettingUser, setResettingUser] = useState(null);
    const [resetFormData, setResetFormData] = useState({ username: '', new_password: '' });
    
    const title = `Daftar Akun ${role.charAt(0).toUpperCase() + role.slice(1)}`;

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/api/users?role=${role}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAccounts(response.data || []);
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Tidak dapat terhubung ke server.');
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);
    
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
        if (resetFormData.new_password) {
            payload.new_password = resetFormData.new_password;
        }

        const promise = api.put(
            `/api/users/${resettingUser.id}/reset-password`,
            payload,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        ).then(() => {
            fetchAccounts();
        });

        toast.promise(promise, {
            loading: 'Menyimpan perubahan...',
            success: `Kredensial untuk ${resettingUser.username} berhasil diperbarui!`,
            error: (err) => `Error: ${err.response?.data?.error || 'Gagal memperbarui'}`,
        });

        closeResetModal();
    };

    return (
        <div className="account-list">
            <div className="page-header">
                <h1>{title}</h1>
            </div>

            {!loading && !error && (
                <table className="account-table">
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>Nama</th>
                            <th>Username</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account, index) => (
                            <tr key={account.id}>
                                <td data-label="NO">{index + 1}</td>
                                <td data-label="Nama">{account.nama || '-'}</td>
                                <td data-label="Username">{account.username}</td>
                                <td data-label="Aksi" className="actions-cell">
                                    <div className="action-buttons">
                                        <button className="btn-edit" onClick={() => openResetModal(account)}>Edit Akun</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {isResetModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* --- Tombol Close --- */}
                        <button className="modal-close-button" onClick={closeResetModal}>&times;</button>
                        <h2>Edit Akun: {resettingUser?.username}</h2>
                        <form onSubmit={handleResetPassword}>
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
                                <button type="submit" className="btn-save">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountListPage;
