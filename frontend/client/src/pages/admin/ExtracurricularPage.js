import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import './ExtracurricularPage.css';

const ExtracurricularPage = () => {
    const [extracurriculars, setExtracurriculars] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [dataToDelete, setDataToDelete] = useState(null);
    const [formData, setFormData] = useState({ nama_ekskul: '', deskripsi: '' });

    useEffect(() => {
        fetchExtracurriculars();
    }, []);

    const fetchExtracurriculars = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/extracurriculars', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExtracurriculars(response.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data ekstrakurikuler.');
        }
    };

    const openFormModal = (data = null) => {
        setEditingData(data);
        setFormData(data ? { nama_ekskul: data.nama_ekskul, deskripsi: data.deskripsi } : { nama_ekskul: '', deskripsi: '' });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingData(null);
        setFormData({ nama_ekskul: '', deskripsi: '' });
    };

    const openConfirmModal = (id) => {
        setDataToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setDataToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promise = editingData
            ? api.put(`/api/extracurriculars/${editingData.id}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            : api.post('/api/extracurriculars', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

        toast.promise(promise.then(() => fetchExtracurriculars()), {
            loading: 'Menyimpan...',
            success: `Data berhasil ${editingData ? 'diperbarui' : 'disimpan'}!`,
            error: 'Gagal menyimpan data.',
        });
        closeFormModal();
    };

    const handleDeleteConfirm = async () => {
        if (!dataToDelete) return;

        const promise = api.delete(`/api/extracurriculars/${dataToDelete}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(() => fetchExtracurriculars());

        toast.promise(promise, {
            loading: 'Menghapus...',
            success: 'Data berhasil dihapus!',
            error: 'Gagal menghapus data.',
        });
        closeConfirmModal();
    };

    return (
        <div className="data-page-container">
            <div className="page-header">
                <h1>Manajemen Ekstrakurikuler</h1>
                <button className="btn-add" onClick={() => openFormModal()}>+ Tambah Ekstrakurikuler</button>
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
                        {extracurriculars.map((item, index) => (
                            <tr key={item.id}>
                                <td data-label="No">{index + 1}</td>
                                <td data-label="Nama Ekstrakurikuler">{item.nama_ekskul}</td>
                                <td data-label="Deskripsi">{item.deskripsi}</td>
                                <td data-label="Aksi" className="actions-cell">
                                    <div className="action-buttons">
                                        <button className="btn-edit btn-icon" title="Edit" onClick={() => openFormModal(item)}>
                                            <FaPencilAlt />
                                        </button>
                                        <button className="btn-delete btn-icon" title="Delete" onClick={() => openConfirmModal(item.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFormModal}>&times;</button>
                        <h2>{editingData ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <div className="form-group">
                                <label>Nama Ekstrakurikuler <span className="required-asterisk">*</span></label>
                                <input
                                    type="text"
                                    value={formData.nama_ekskul}
                                    onChange={(e) => setFormData({ ...formData, nama_ekskul: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeFormModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Delete */}
            {isConfirmModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeConfirmModal}>&times;</button>
                        <h2>Konfirmasi Penghapusan</h2>
                        <p>Apakah Anda yakin ingin menghapus data ini? Aksi ini tidak dapat dibatalkan.</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeConfirmModal}>Batal</button>
                            <button type="button" className="btn-confirm-delete" onClick={handleDeleteConfirm}>Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExtracurricularPage;
