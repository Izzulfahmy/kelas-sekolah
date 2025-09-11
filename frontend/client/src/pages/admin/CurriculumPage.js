import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import './CurriculumPage.css';

const CurriculumPage = () => {
    const [curriculums, setCurriculums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingData, setDeletingData] = useState(null);
    const [formData, setFormData] = useState({ nama_kurikulum: '', deskripsi: '' });

    const fetchCurriculums = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/curriculums', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCurriculums(response.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data kurikulum.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurriculums();
    }, [fetchCurriculums]);

    const openModal = (data = null) => {
        setEditingData(data);
        setFormData(data ? { nama_kurikulum: data.nama_kurikulum, deskripsi: data.deskripsi || '' } : { nama_kurikulum: '', deskripsi: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingData(null);
        setFormData({ nama_kurikulum: '', deskripsi: '' });
    };

    const openDeleteModal = (data) => {
        setDeletingData(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingData(null);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promise = editingData
            ? api.put(`/api/curriculums/${editingData.id}`, formData, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            : api.post('/api/curriculums', {...formData, sekolah_id: 1}, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });

        toast.promise(promise.then(() => fetchCurriculums()), {
            loading: 'Menyimpan data...',
            success: `Kurikulum berhasil ${editingData ? 'diperbarui' : 'ditambahkan'}!`,
            error: (err) => `Error: ${err.response?.data?.error || 'Terjadi kesalahan'}`,
        });
        closeModal();
    };

    const confirmDelete = async () => {
        if (!deletingData) return;
        const promise = api.delete(`/api/curriculums/${deletingData.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(() => fetchCurriculums());

        toast.promise(promise, {
            loading: `Menghapus ${deletingData.nama_kurikulum}...`,
            success: 'Kurikulum berhasil dihapus!',
            error: 'Gagal menghapus data.',
        });
        closeDeleteModal();
    };

    return (
        <div className="data-page-container">
            <div className="page-header">
                <h1>Manajemen Kurikulum</h1>
                <button className="btn-add" onClick={() => openModal()}>+ Tambah Kurikulum</button>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Kurikulum</th>
                            <th>Deskripsi</th>
                            <th className="aksi-header">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : curriculums.length > 0 ? (
                            curriculums.map((curr, index) => (
                                <tr key={curr.id}>
                                    <td data-label="No">{index + 1}</td>
                                    <td data-label="Nama Kurikulum">{curr.nama_kurikulum}</td>
                                    <td data-label="Deskripsi">{curr.deskripsi || '-'}</td>
                                    <td data-label="Aksi" className="actions-cell">
                                        <div className="action-buttons">
                                            <button className="btn-edit btn-icon" title="Edit" onClick={() => openModal(curr)}><FaPencilAlt /></button>
                                            <button className="btn-delete btn-icon" title="Delete" onClick={() => openDeleteModal(curr)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeModal}>&times;</button>
                        <h2>{editingData ? 'Edit Kurikulum' : 'Tambah Kurikulum Baru'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <div className="form-group">
                                <label>Nama Kurikulum<span className="required-asterisk">*</span></label>
                                <input name="nama_kurikulum" value={formData.nama_kurikulum} onChange={handleFormChange} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea name="deskripsi" value={formData.deskripsi || ''} onChange={handleFormChange}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>Apakah Anda yakin ingin menghapus kurikulum: <strong>{deletingData?.nama_kurikulum}</strong>?</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeDeleteModal}>Batal</button>
                            <button type="button" className="btn-confirm-delete" onClick={confirmDelete}>Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumPage;