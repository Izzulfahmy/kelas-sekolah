import React, { useState, useEffect } from 'react';
import api from '../../../api';
import toast from 'react-hot-toast';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const TingkatanTab = () => {
    const [tingkatans, setTingkatans] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ nama_tingkatan: '', urutan: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/tingkatans', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTingkatans(response.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data tingkatan.");
        }
    };

    const openFormModal = (item = null) => {
        setEditingItem(item);
        setFormData(item ? { nama_tingkatan: item.nama_tingkatan, urutan: item.urutan } : { nama_tingkatan: '', urutan: '' });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingItem(null);
    };

    const openConfirmModal = (item) => {
        setItemToDelete(item);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            urutan: parseInt(formData.urutan, 10) || 0,
            sekolah_id: 1, // Sesuaikan jika perlu
        };

        const promise = editingItem
            ? api.put(`/api/tingkatans/${editingItem.id}`, payload, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            : api.post('/api/tingkatans', payload, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });

        toast.promise(promise.then(() => fetchData()), {
            loading: 'Menyimpan...',
            success: `Data berhasil ${editingItem ? 'diperbarui' : 'disimpan'}!`,
            error: 'Gagal menyimpan data.',
        });
        closeFormModal();
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        const promise = api.delete(`/api/tingkatans/${itemToDelete.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(() => fetchData());

        toast.promise(promise, {
            loading: 'Menghapus...',
            success: 'Data berhasil dihapus!',
            error: 'Gagal menghapus data.',
        });
        closeConfirmModal();
    };

    return (
        <div>
            <div className="crud-header">
                <h3>Manajemen Tingkatan Kelas</h3>
                <button className="btn-add" onClick={() => openFormModal()}>+ Tambah Tingkatan</button>
            </div>
            <table className="master-table">
                <thead>
                    <tr>
                        <th>Nama Tingkatan</th>
                        <th>Urutan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {tingkatans.map(item => (
                        <tr key={item.id}>
                            <td data-label="Nama Tingkatan">{item.nama_tingkatan}</td>
                            <td data-label="Urutan">{item.urutan}</td>
                            <td data-label="Aksi">
                                <div className="action-buttons">
                                    <button className="btn-edit btn-icon" title="Edit" onClick={() => openFormModal(item)}><FaPencilAlt /></button>
                                    <button className="btn-delete btn-icon" title="Hapus" onClick={() => openConfirmModal(item)}><FaTrash /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {isFormModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFormModal}>&times;</button>
                        <h2>{editingItem ? 'Edit Tingkatan' : 'Tambah Tingkatan Baru'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Tingkatan</label>
                                <input type="text" value={formData.nama_tingkatan} onChange={(e) => setFormData({ ...formData, nama_tingkatan: e.target.value })} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Urutan</label>
                                <input type="number" value={formData.urutan} onChange={(e) => setFormData({ ...formData, urutan: e.target.value })} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeFormModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isConfirmModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeConfirmModal}>&times;</button>
                        <h2>Konfirmasi Penghapusan</h2>
                        <p>Apakah Anda yakin ingin menghapus <strong>{itemToDelete?.nama_tingkatan}</strong>?</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeConfirmModal}>Batal</button>
                            <button type="button" className="btn-delete" onClick={handleDeleteConfirm}>Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TingkatanTab;

