import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPen, FaTrash } from 'react-icons/fa';
import './MataPelajaranPage.css'; // File CSS yang akan kita perbarui

const MataPelajaranPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [formData, setFormData] = useState({ kode_mapel: '', nama_mapel: '' });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/mata-pelajaran', { headers: { Authorization: `Bearer ${token}` } });
            setSubjects(response.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data mata pelajaran.');
        } finally {
            setIsLoading(false);
        }
    };

    const openFormModal = (subject = null) => {
        setEditingSubject(subject);
        setFormData(subject ? { kode_mapel: subject.kode_mapel, nama_mapel: subject.nama_mapel } : { kode_mapel: '', nama_mapel: '' });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingSubject(null);
        setFormData({ kode_mapel: '', nama_mapel: '' });
    };

    const openConfirmModal = (subject) => {
        setSubjectToDelete(subject);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setSubjectToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const promise = editingSubject ? api.put(`/api/mata-pelajaran/${editingSubject.id}`, formData, config) : api.post('/api/mata-pelajaran', formData, config);
        await toast.promise(promise.then(() => fetchSubjects()), {
            loading: 'Menyimpan...',
            success: `Data berhasil ${editingSubject ? 'diperbarui' : 'ditambahkan'}!`,
            error: 'Gagal menyimpan data.',
        });
        closeFormModal();
    };

    const handleDeleteConfirm = async () => {
        if (!subjectToDelete) return;
        const token = localStorage.getItem('token');
        const promise = api.delete(`/api/mata-pelajaran/${subjectToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(() => fetchSubjects());
        await toast.promise(promise, {
            loading: `Menghapus ${subjectToDelete.nama_mapel}...`,
            success: 'Data berhasil dihapus!',
            error: 'Gagal menghapus data.',
        });
        closeConfirmModal();
    };

    return (
        // Nama class utama ini akan digunakan di file CSS
        <div className="matapelajaran-page data-page-container">
            <div className="page-header">
                <h1>Manajemen Mata Pelajaran</h1>
                <button className="btn-add" onClick={() => openFormModal()}>+ Tambah Mata Pelajaran</button>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Kode Mapel</th>
                            <th>Nama Mata Pelajaran</th>
                            <th className="aksi-header">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : subjects.length > 0 ? (
                            subjects.map((subject, index) => (
                                <tr key={subject.id}>
                                    <td data-label="No">{index + 1}</td>
                                    <td data-label="Kode Mapel">{subject.kode_mapel}</td>
                                    <td data-label="Nama Mata Pelajaran">{subject.nama_mapel}</td>
                                    <td data-label="Aksi" className="actions-cell">
                                        <div className="action-buttons">
                                            <button type="button" className="btn-edit btn-icon" title="Edit" onClick={() => openFormModal(subject)}>
                                                <FaPen />
                                            </button>
                                            <button type="button" className="btn-delete btn-icon" title="Hapus" onClick={() => openConfirmModal(subject)}>
                                                <FaTrash />
                                            </button>
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

            {/* Modal Form */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFormModal}>&times;</button>
                        <h2>{editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <div className="form-group">
                                <label>Kode Mapel <span className="required-asterisk">*</span></label>
                                <input type="text" value={formData.kode_mapel} onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Nama Mata Pelajaran <span className="required-asterisk">*</span></label>
                                <input type="text" value={formData.nama_mapel} onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeFormModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {isConfirmModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeConfirmModal}>&times;</button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>Apakah Anda yakin ingin menghapus: <strong>{subjectToDelete?.nama_mapel}</strong>?</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeConfirmModal}>Batal</button>
                            <button type="button" className="btn-confirm-delete" onClick={handleDeleteConfirm}>Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MataPelajaranPage;