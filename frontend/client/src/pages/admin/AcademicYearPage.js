import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPen, FaTrash } from 'react-icons/fa';
import './AcademicYearPage.css'; // Gunakan file CSS yang sama

// Komponen Toggle Switch (Tidak ada perubahan)
const ToggleSwitch = ({ isActive, onToggle }) => (
    <label className="toggle-switch">
        <input type="checkbox" checked={isActive} onChange={onToggle} />
        <span className="slider"></span>
    </label>
);

const AcademicYearPage = () => {
    const [academicYears, setAcademicYears] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [deletingData, setDeletingData] = useState(null);
    
    const initialFormData = {
        nama_tahun_ajaran: '',
        semester: 'Ganjil',
        metode_absensi: 'HARIAN',
        kepala_sekolah_id: '',
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [academicYearResponse, teacherResponse] = await Promise.all([
                api.get('/api/academic-years', config),
                api.get('/api/teachers', config)
            ]);
            
            setAcademicYears(academicYearResponse.data || []);
            setTeachers(teacherResponse.data || []);

        } catch {
            toast.error('Gagal mengambil data dari server.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openFormModal = (data = null) => {
        setEditingData(data);
        if (data) {
            setFormData({
                nama_tahun_ajaran: data.nama_tahun_ajaran || '',
                semester: data.semester || 'Ganjil',
                metode_absensi: data.metode_absensi || 'HARIAN',
                kepala_sekolah_id: data.kepala_sekolah_id || '',
            });
        } else {
            setFormData(initialFormData);
        }
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingData(null);
        setFormData(initialFormData);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openDeleteModal = (data) => {
        setDeletingData(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingData(null);
        setIsDeleteModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const payload = {
                ...formData,
                sekolah_id: 1,
                kepala_sekolah_id: formData.kepala_sekolah_id ? parseInt(formData.kepala_sekolah_id) : null,
                status: editingData ? editingData.status : 'Tidak Aktif',
            };

            const promise = editingData
                ? api.put(`/api/academic-years/${editingData.id}`, payload, config)
                : api.post('/api/academic-years', payload, config);

            await toast.promise(promise.then(() => fetchData()), {
                loading: 'Menyimpan data...',
                success: `Tahun Ajaran berhasil ${editingData ? 'diperbarui' : 'ditambahkan'}!`,
                error: 'Terjadi kesalahan saat menyimpan.',
            });
            closeFormModal();
        } catch {
            toast.error('Terjadi kesalahan saat menyimpan.');
        }
    };

    const confirmDelete = async () => {
        if (!deletingData) return;
        try {
            const token = localStorage.getItem('token');
            const promise = api
                .delete(`/api/academic-years/${deletingData.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(() => fetchData());

            await toast.promise(promise, {
                loading: `Menghapus ${deletingData.nama_tahun_ajaran}...`,
                success: 'Tahun Ajaran berhasil dihapus!',
                error: 'Gagal menghapus data.',
            });
            closeDeleteModal();
        } catch {
            toast.error('Gagal menghapus data.');
        }
    };

    // --- FUNGSI HANDLE STATUS DENGAN LOGIKA BARU ---
    const handleStatusToggle = async (toggledItem) => {
        const newStatus = toggledItem.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';

        // Jika user mencoba mengaktifkan (dari Tidak Aktif -> Aktif)
        if (newStatus === 'Aktif') {
            const currentActiveYear = academicYears.find(year => year.status === 'Aktif');
            const originalState = JSON.parse(JSON.stringify(academicYears)); // Simpan state awal untuk rollback

            // 1. Optimistic UI Update: Langsung ubah di tampilan
            setAcademicYears(prevYears =>
                prevYears.map(year => {
                    // Aktifkan item yang di-toggle
                    if (year.id === toggledItem.id) return { ...year, status: 'Aktif' };
                    // Nonaktifkan item yang sebelumnya aktif
                    if (currentActiveYear && year.id === currentActiveYear.id) return { ...year, status: 'Tidak Aktif' };
                    return year;
                })
            );

            // 2. Kirim request ke API
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const apiRequests = [];

                // Request untuk mengaktifkan item baru
                const newActivePayload = { ...toggledItem, status: 'Aktif' };
                apiRequests.push(api.put(`/api/academic-years/${toggledItem.id}`, newActivePayload, config));

                // Jika ada item yang aktif sebelumnya, buat request untuk menonaktifkannya
                if (currentActiveYear) {
                    const oldActivePayload = { ...currentActiveYear, status: 'Tidak Aktif' };
                    apiRequests.push(api.put(`/api/academic-years/${currentActiveYear.id}`, oldActivePayload, config));
                }

                await Promise.all(apiRequests);
                toast.success(`${toggledItem.nama_tahun_ajaran} berhasil diaktifkan.`);

            } catch (error) {
                // 3. Rollback jika API gagal
                setAcademicYears(originalState);
                toast.error('Gagal mengubah status, perubahan dibatalkan.');
            }
        } else {
            // Jika user hanya menonaktifkan item (Aktif -> Tidak Aktif), proses seperti biasa
            const originalStatus = toggledItem.status;
            setAcademicYears(prevYears =>
                prevYears.map(year =>
                    year.id === toggledItem.id ? { ...year, status: newStatus } : year
                )
            );

            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const payload = { ...toggledItem, status: newStatus };

                await api.put(`/api/academic-years/${toggledItem.id}`, payload, config);
                toast.success(`Status ${toggledItem.nama_tahun_ajaran} diubah menjadi ${newStatus}`);
            } catch (error) {
                setAcademicYears(prevYears =>
                    prevYears.map(year =>
                        year.id === toggledItem.id ? { ...year, status: originalStatus } : year
                    )
                );
                toast.error('Gagal mengubah status.');
            }
        }
    };


    const getKepalaSekolahName = (teacherId) => {
        if (!teacherId || teachers.length === 0) return '-';
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.nama_lengkap : '-';
    };

    return (
        <div className="academic-year-page data-page-container">
            <div className="page-header">
                <h1>Manajemen Tahun Pelajaran</h1>
                <button className="btn-add" onClick={() => openFormModal()}>
                    + Tambah Tahun Ajaran
                </button>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Tahun Ajaran</th>
                            <th>Semester</th>
                            <th>Kepala Sekolah</th>
                            <th>Status</th>
                            <th className="aksi-header">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : academicYears.length > 0 ? (
                            academicYears.map((item, index) => (
                                <tr key={item.id}>
                                    <td data-label="No">{index + 1}</td>
                                    <td data-label="Tahun Ajaran">{item.nama_tahun_ajaran}</td>
                                    <td data-label="Semester">{item.semester}</td>
                                    <td data-label="Kepala Sekolah">{getKepalaSekolahName(item.kepala_sekolah_id)}</td>
                                    <td data-label="Status">
                                        <ToggleSwitch
                                            isActive={item.status === 'Aktif'}
                                            onToggle={() => handleStatusToggle(item)}
                                        />
                                    </td>
                                    <td data-label="Aksi" className="actions-cell">
                                        <div className="action-buttons">
                                            <button type="button" className="btn-edit btn-icon" title="Edit" onClick={() => openFormModal(item)}><FaPen /></button>
                                            <button type="button" className="btn-delete btn-icon" title="Hapus" onClick={() => openDeleteModal(item)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form Tambah/Edit */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFormModal}>&times;</button>
                        <h2>{editingData ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <div className="form-group">
                                <label>Nama Tahun Ajaran<span className="required-asterisk">*</span></label>
                                <input name="nama_tahun_ajaran" value={formData.nama_tahun_ajaran} onChange={handleFormChange} required />
                            </div>
                            <div className="form-group">
                                <label>Semester<span className="required-asterisk">*</span></label>
                                <select name="semester" value={formData.semester} onChange={handleFormChange} required>
                                    <option value="Ganjil">Ganjil</option>
                                    <option value="Genap">Genap</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kepala Sekolah</label>
                                <select name="kepala_sekolah_id" value={formData.kepala_sekolah_id} onChange={handleFormChange}>
                                    <option value="">-- Pilih Kepala Sekolah --</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.nama_lengkap}
                                        </option>
                                    ))}
                                </select>
                            </div>
                             <div className="form-group">
                                <label>Metode Absensi<span className="required-asterisk">*</span></label>
                                <select name="metode_absensi" value={formData.metode_absensi} onChange={handleFormChange} required>
                                    <option value="HARIAN">Harian</option>
                                    <option value="REKAP_SEMESTER">Rekap Semester</option>
                                </select>
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
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>Apakah Anda yakin ingin menghapus: <strong>{deletingData?.nama_tahun_ajaran}</strong>?</p>
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

export default AcademicYearPage;