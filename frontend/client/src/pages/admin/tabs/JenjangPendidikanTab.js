import React, { useState, useEffect } from 'react';
import api from '../../../api'; // Menggunakan instance api
import toast from 'react-hot-toast';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const JenjangPendidikanTab = () => {
    const [levels, setLevels] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Untuk modal form
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Untuk modal konfirmasi
    const [levelToDelete, setLevelToDelete] = useState(null); // ID jenjang yang akan dihapus
    const [editingLevel, setEditingLevel] = useState(null);
    const [formData, setFormData] = useState({ nama_jenjang: '' });

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/education-levels', { // Menggunakan api
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setLevels(response.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data jenjang pendidikan.");
        }
    };

    const openFormModal = (level = null) => {
        setEditingLevel(level);
        setFormData(level ? { nama_jenjang: level.nama_jenjang } : { nama_jenjang: '' });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingLevel(null);
        setFormData({ nama_jenjang: '' });
    };

    const openConfirmModal = (levelId) => {
        setLevelToDelete(levelId);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setLevelToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promise = editingLevel
            ? api.put(`/api/education-levels/${editingLevel.id}`, formData, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }) // Menggunakan api
            : api.post('/api/education-levels', formData, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); // Menggunakan api

        toast.promise(promise.then(() => fetchLevels()), {
            loading: 'Menyimpan...',
            success: `Data berhasil ${editingLevel ? 'diperbarui' : 'disimpan'}!`,
            error: 'Gagal menyimpan data.',
        });
        closeFormModal(); // Tutup modal form
    };

    const handleDeleteConfirm = async () => {
        if (!levelToDelete) return;

        const promise = api.delete(`/api/education-levels/${levelToDelete}`, { // Menggunakan api
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(() => fetchLevels());

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
                <h3>Manajemen Jenjang Pendidikan</h3>
                <button className="btn-add" onClick={() => openFormModal()}>+ Tambah Jenjang</button>
            </div>
            <table className="master-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Jenjang</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {levels.map(level => (
                        <tr key={level.id}>
                            <td data-label="ID">{level.id}</td>
                            <td data-label="Nama Jenjang">{level.nama_jenjang}</td>
                            <td data-label="Aksi">
                                <div className="action-buttons">
                                    <button className="btn-edit btn-icon" title="Edit" onClick={() => openFormModal(level)}><FaPencilAlt /></button>
                                    <button className="btn-delete btn-icon" title="Delete" onClick={() => openConfirmModal(level.id)}><FaTrash /></button> {/* Ubah onClick */}
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
                        <h2>{editingLevel ? 'Edit Jenjang' : 'Tambah Jenjang Baru'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Jenjang</label>
                                <input
                                    type="text"
                                    value={formData.nama_jenjang}
                                    onChange={(e) => setFormData({ nama_jenjang: e.target.value })}
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

export default JenjangPendidikanTab;