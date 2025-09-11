import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPen, FaTrash } from 'react-icons/fa';
import './ExtracurricularPage.css';

const ExtracurricularPage = () => {
    const [extracurriculars, setExtracurriculars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [deletingData, setDeletingData] = useState(null);
    const [formData, setFormData] = useState({ nama_eskul: '', deskripsi: '' });

    // --- Ambil data dari API
    useEffect(() => {
        fetchExtracurriculars();
    }, []);

    const fetchExtracurriculars = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/extracurriculars', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExtracurriculars(response.data || []);
        } catch {
            toast.error('Gagal mengambil data ekstrakurikuler.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Modal Tambah/Edit
    const openFormModal = (data = null) => {
        setEditingData(data);
        setFormData(
            data
                ? { nama_eskul: data.nama_eskul, deskripsi: data.deskripsi || '' }
                : { nama_eskul: '', deskripsi: '' }
        );
        setIsFormModalOpen(true);
    };
    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingData(null);
        setFormData({ nama_eskul: '', deskripsi: '' });
    };

    // --- Modal Delete
    const openDeleteModal = (data) => {
        setDeletingData(data);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setDeletingData(null);
        setIsDeleteModalOpen(false);
    };

    // --- Simpan (Tambah / Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const promise = editingData
                ? api.put(`/api/extracurriculars/${editingData.id}`, formData, config)
                : api.post('/api/extracurriculars', { ...formData, sekolah_id: 1 }, config);

            await toast.promise(promise.then(() => fetchExtracurriculars()), {
                loading: 'Menyimpan data...',
                success: `Ekstrakurikuler berhasil ${editingData ? 'diperbarui' : 'ditambahkan'}!`,
                error: 'Terjadi kesalahan saat menyimpan.',
            });
            closeFormModal();
        } catch {
            toast.error('Terjadi kesalahan saat menyimpan.');
        }
    };

    // --- Hapus
    const confirmDelete = async () => {
        if (!deletingData) return;
        try {
            const token = localStorage.getItem('token');
            const promise = api
                .delete(`/api/extracurriculars/${deletingData.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(() => fetchExtracurriculars());

            await toast.promise(promise, {
                loading: `Menghapus ${deletingData.nama_eskul}...`,
                success: 'Ekstrakurikuler berhasil dihapus!',
                error: 'Gagal menghapus data.',
            });
            closeDeleteModal();
        } catch {
            toast.error('Gagal menghapus data.');
        }
    };

    return (
        <div className="extracurricular-page data-page-container">
            <div className="page-header">
                <h1>Manajemen Ekstrakurikuler</h1>
                <button className="btn-add" onClick={() => openFormModal()}>
                    + Tambah Ekstrakurikuler
                </button>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Ekstrakurikuler</th>
                            <th>Deskripsi</th>
                            <th className="aksi-header">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    Memuat data...
                                </td>
                            </tr>
                        ) : extracurriculars.length > 0 ? (
                            extracurriculars.map((item, index) => (
                                <tr key={item.id}>
                                    <td data-label="No">{index + 1}</td>
                                    <td data-label="Nama Ekstrakurikuler" className="nama-cell">
                                        {item.nama_eskul}
                                    </td>
                                    <td data-label="Deskripsi">{item.deskripsi || '-'}</td>
                                    <td data-label="Aksi" className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                type="button"
                                                className="btn-edit btn-icon"
                                                title="Edit"
                                                onClick={() => openFormModal(item)}
                                            >
                                                <FaPen />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-delete btn-icon"
                                                title="Hapus"
                                                onClick={() => openDeleteModal(item)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    Tidak ada data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFormModal}>
                            &times;
                        </button>
                        <h2>{editingData ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <div className="form-group">
                                <label>
                                    Nama Ekstrakurikuler<span className="required-asterisk">*</span>
                                </label>
                                <input
                                    name="nama_eskul"
                                    value={formData.nama_eskul}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nama_eskul: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={(e) =>
                                        setFormData({ ...formData, deskripsi: e.target.value })
                                    }
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeFormModal}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-save">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Hapus */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeDeleteModal}>
                            &times;
                        </button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>
                            Apakah Anda yakin ingin menghapus:{' '}
                            <strong>{deletingData?.nama_eskul}</strong>?
                        </p>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeDeleteModal}>
                                Batal
                            </button>
                            <button type="button" className="btn-confirm-delete" onClick={confirmDelete}>
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExtracurricularPage;
