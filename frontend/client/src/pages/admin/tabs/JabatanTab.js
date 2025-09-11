import React, { useState, useEffect } from 'react';
import api from '../../../api'; // Menggunakan instance api
import toast from 'react-hot-toast';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const JabatanTab = () => {
    const [positions, setPositions] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Untuk modal form
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Untuk modal konfirmasi
    const [positionToDelete, setPositionToDelete] = useState(null); // ID jabatan yang akan dihapus
    const [editingPosition, setEditingPosition] = useState(null);
    const [formData, setFormData] = useState({ nama_jabatan: '' });

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/positions', { // Menggunakan api
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPositions(response.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data jabatan.");
        }
    };

    const openFormModal = (pos = null) => {
        setEditingPosition(pos);
        setFormData(pos ? { nama_jabatan: pos.nama_jabatan } : { nama_jabatan: '' });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingPosition(null);
        setFormData({ nama_jabatan: '' });
    };

    const openConfirmModal = (positionId) => {
        setPositionToDelete(positionId);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setPositionToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promise = editingPosition
            ? api.put(`/api/positions/${editingPosition.id}`, formData, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }) // Menggunakan api
            : api.post('/api/positions', formData, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); // Menggunakan api

        toast.promise(promise.then(() => fetchPositions()), {
            loading: 'Menyimpan...',
            success: `Data berhasil ${editingPosition ? 'diperbarui' : 'disimpan'}!`,
            error: 'Gagal menyimpan data.',
        });
        closeFormModal(); // Tutup modal form
    };

    const handleDeleteConfirm = async () => {
        if (!positionToDelete) return;

        const promise = api.delete(`/api/positions/${positionToDelete}`, { // Menggunakan api
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(() => fetchPositions());

        toast.promise(promise, {
            loading: 'Menghapus...',
            success: 'Data berhasil dihapus!',
            error: 'Gagal menghapus data.',
        });
        closeConfirmModal(); // Tutup modal konfirmasi
    };

    return (
        <div>
            <div className="crud-header">
                <h3>Manajemen Jabatan</h3>
                <button className="btn-add" onClick={() => openFormModal()}>+ Tambah Jabatan</button>
            </div>
            <table className="master-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Jabatan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map(pos => (
                        <tr key={pos.id}>
                            <td data-label="ID">{pos.id}</td>
                            <td data-label="Nama Jabatan">{pos.nama_jabatan}</td>
                            <td data-label="Aksi">
                                <div className="action-buttons">
                                    <button className="btn-edit btn-icon" title="Edit" onClick={() => openFormModal(pos)}><FaPencilAlt /></button>
                                    <button className="btn-delete btn-icon" title="Delete" onClick={() => openConfirmModal(pos.id)}><FaTrash /></button> {/* Ubah onClick */}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal untuk Form Tambah/Edit */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFormModal}>&times;</button>
                        <h2>{editingPosition ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Jabatan</label>
                                <input
                                    type="text"
                                    value={formData.nama_jabatan}
                                    onChange={(e) => setFormData({ nama_jabatan: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeFormModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal untuk Konfirmasi Hapus (BARU) */}
            {isConfirmModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm"> {/* Tambah kelas 'modal-confirm' */}
                        <button className="modal-close-button" onClick={closeConfirmModal}>&times;</button>
                        <h2>Konfirmasi Penghapusan</h2>
                        <p>Apakah Anda yakin ingin menghapus data ini? Aksi ini tidak dapat dibatalkan.</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeConfirmModal}>Batal</button>
                            <button type="button" className="btn-delete" onClick={handleDeleteConfirm}>Hapus</button> {/* Warna merah untuk Hapus */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JabatanTab;