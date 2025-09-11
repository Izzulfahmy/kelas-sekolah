import React, { useState, useEffect } from 'react';
import api from '../../api'; // pakai instance api
import toast from 'react-hot-toast';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import './MataPelajaranPage.css'; // optional kalau mau styling khusus

const MataPelajaranPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({ nama_mapel: '', deskripsi: '' });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/subjects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubjects(response.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data mata pelajaran.');
        }
    };

    const openFormModal = (subject = null) => {
        setEditingSubject(subject);
        setFormData(subject ? {
            nama_mapel: subject.nama_mapel,
            deskripsi: subject.deskripsi || ''
        } : { nama_mapel: '', deskripsi: '' });
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingSubject(null);
        setFormData({ nama_mapel: '', deskripsi: '' });
    };

    const openConfirmModal = (subjectId) => {
        setSubjectToDelete(subjectId);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSubjectToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promise = editingSubject
            ? api.put(`/api/subjects/${editingSubject.id}`, formData, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              })
            : api.post('/api/subjects', formData, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });

        toast.promise(promise.then(() => fetchSubjects()), {
            loading: 'Menyimpan...',
            success: `Data berhasil ${editingSubject ? 'diperbarui' : 'disimpan'}!`,
            error: 'Gagal menyimpan data.',
        });
        closeFormModal();
    };

    const handleDeleteConfirm = async () => {
        if (!subjectToDelete) return;

        const promise = api
            .delete(`/api/subjects/${subjectToDelete}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then(() => fetchSubjects());

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
                <h1>Manajemen Mata Pelajaran</h1>
                <button className="btn-add" onClick={() => openFormModal()}>+ Tambah Mata Pelajaran</button>
            </div>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Mata Pelajaran</th>
                            <th>Deskripsi</th>
                            <th className="aksi-header">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subject, index) => (
                            <tr key={subject.id}>
                                <td data-label="No">{index + 1}</td>
                                <td data-label="Nama Mata Pelajaran">{subject.nama_mapel}</td>
                                <td data-label="Deskripsi">{subject.deskripsi}</td>
                                <td data-label="Aksi" className="actions-cell">
                                    <div className="action-buttons">
                                        <button
                                            className="btn-edit btn-icon"
                                            title="Edit"
                                            onClick={() => openFormModal(subject)}
                                        >
                                            <FaPencilAlt />
                                        </button>
                                        <button
                                            className="btn-delete btn-icon"
                                            title="Delete"
                                            onClick={() => openConfirmModal(subject.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {subjects.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                                    Tidak ada data mata pelajaran.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form Tambah/Edit */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFormModal}>
                            &times;
                        </button>
                        <h2>{editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <div className="form-group">
                                <label>
                                    Nama Mata Pelajaran <span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama_mapel}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nama_mapel: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
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

            {/* Modal Konfirmasi Hapus */}
            {isConfirmModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeConfirmModal}>
                            &times;
                        </button>
                        <h2>Konfirmasi Penghapusan</h2>
                        <p>
                            Apakah Anda yakin ingin menghapus mata pelajaran ini? <br />
                            <strong>Aksi ini tidak dapat dibatalkan.</strong>
                        </p>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeConfirmModal}>
                                Batal
                            </button>
                            <button type="button" className="btn-confirm-delete" onClick={handleDeleteConfirm}>
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MataPelajaranPage;
