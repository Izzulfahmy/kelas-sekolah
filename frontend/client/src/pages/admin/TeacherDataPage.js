import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import './TeacherDataPage.css';

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};

const TeacherDataPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTeacher, setDeletingTeacher] = useState(null);

    const initialFormState = {
        nama_lengkap: '',
        nama_panggilan: '',
        gelar_akademik: '',
        nip_nuptk: '',
        jenis_kelamin: 'Laki-laki',
        tempat_lahir: '',
        tanggal_lahir: '',
        program_studi: '',
        agama: 'Islam',
        kewarganegaraan: 'Indonesia',
        no_hp: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        desa_kelurahan: '',
        kode_pos: '',
        alamat_tambahan: '',
        status_guru: 'Aktif',
        username: '',
        password: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- Ambil data guru ---
    const fetchTeachers = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(response.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data guru.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // --- Modal Tambah/Edit ---
    const openModal = (teacher = null) => {
        if (teacher) {
            setEditingTeacher(teacher);
            setFormData({
                ...teacher,
                tanggal_lahir: formatDateForInput(teacher.tanggal_lahir),
            });
        } else {
            setEditingTeacher(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
        setFormData(initialFormState);
    };

    // --- Form Handling ---
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (editingTeacher) {
            delete payload.username;
            delete payload.password;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const promise = editingTeacher
                ? api.put(`/api/teachers/${editingTeacher.id}`, payload, config)
                : api.post('/api/teachers', { ...formData, sekolah_id: 1 }, config);

            await toast.promise(promise.then(() => fetchTeachers()), {
                loading: 'Menyimpan data...',
                success: `Data guru berhasil ${editingTeacher ? 'diperbarui' : 'ditambahkan'}!`,
                error: (err) => `Error: ${err.response?.data?.error || 'Terjadi kesalahan'}`,
            });
            closeModal();
        } catch (err) {
            toast.error('Terjadi kesalahan saat menyimpan.');
        }
    };

    // --- Modal Delete ---
    const openDeleteModal = (teacher) => {
        setDeletingTeacher(teacher);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingTeacher(null);
    };

    const confirmDelete = async () => {
        if (!deletingTeacher) return;
        try {
            const token = localStorage.getItem('token');
            const promise = api.delete(`/api/teachers/${deletingTeacher.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(() => fetchTeachers());

            await toast.promise(promise, {
                loading: `Menghapus ${deletingTeacher.nama_lengkap}...`,
                success: 'Data guru berhasil dihapus!',
                error: 'Gagal menghapus data.',
            });
            closeDeleteModal();
        } catch (err) {
            toast.error('Gagal menghapus data.');
        }
    };

    // --- Form Fields ---
    const formFields = [
        { name: 'nama_lengkap', label: 'Nama Lengkap', required: true },
        { name: 'nama_panggilan', label: 'Nama Panggilan' },
        { name: 'gelar_akademik', label: 'Gelar Akademik' },
        { name: 'nip_nuptk', label: 'NIP/NUPTK' },
        { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'], required: true },
        { name: 'tempat_lahir', label: 'Tempat Lahir', required: true },
        { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', required: true },
        { name: 'program_studi', label: 'Program Studi' },
        { name: 'agama', label: 'Agama', type: 'select', options: ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Khonghucu'], required: true },
        { name: 'kewarganegaraan', label: 'Kewarganegaraan' },
        { name: 'no_hp', label: 'No. HP' },
        { name: 'status_guru', label: 'Status', type: 'select', options: ['Aktif', 'NonAktif'], required: true },
    ];

    const addressFields = [
        { name: 'provinsi', label: 'Provinsi' },
        { name: 'kota_kabupaten', label: 'Kota/Kabupaten' },
        { name: 'kecamatan', label: 'Kecamatan' },
        { name: 'desa_kelurahan', label: 'Desa/Kelurahan' },
        { name: 'kode_pos', label: 'Kode Pos', maxLength: 5 },
        { name: 'alamat_tambahan', label: 'Alamat Tambahan', type: 'textarea', fullWidth: true },
    ];

    return (
        <div className="teacher-page data-page-container">
            <div className="page-header">
                <h1>Manajemen Data Guru</h1>
                <button className="btn-add" onClick={() => openModal()}>+ Tambah Guru</button>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Guru</th>
                            <th>Status</th>
                            <th className="aksi-header">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : teachers.length > 0 ? (
                            teachers.map((teacher, index) => (
                                <tr key={teacher.id}>
                                    <td data-label="No">{index + 1}</td>
                                    <td data-label="Nama Guru">{teacher.nama_lengkap}</td>
                                    <td data-label="Status">
                                        <span className={`status ${teacher.status_guru.toLowerCase()}`}>
                                            {teacher.status_guru}
                                        </span>
                                    </td>
                                    <td data-label="Aksi" className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                type="button"
                                                className="btn-edit btn-icon"
                                                title="Edit"
                                                onClick={() => openModal(teacher)}
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-delete btn-icon"
                                                title="Delete"
                                                onClick={() => openDeleteModal(teacher)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada data guru.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <button className="modal-close-button" onClick={closeModal} aria-label="Tutup">&times;</button>
                        <h2>{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <fieldset>
                                <legend>Data Pribadi & Akun</legend>
                                <div className="form-grid">
                                    {formFields.map(field => (
                                        <div className="form-group" key={field.name}>
                                            <label>
                                                {field.label}
                                                {field.required && <span className="required-asterisk">*</span>}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleFormChange}
                                                    required={field.required}
                                                >
                                                    {field.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type || 'text'}
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleFormChange}
                                                    required={field.required}
                                                    maxLength={field.maxLength}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {!editingTeacher && (
                                        <>
                                            <div className="form-group">
                                                <label>Username<span className="required-asterisk">*</span></label>
                                                <input
                                                    name="username"
                                                    value={formData.username || ''}
                                                    onChange={handleFormChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Password<span className="required-asterisk">*</span></label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password || ''}
                                                    onChange={handleFormChange}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Alamat</legend>
                                <div className="form-grid">
                                    {addressFields.map(field => (
                                        <div
                                            className={`form-group ${field.fullWidth ? 'full-width' : ''}`}
                                            key={field.name}
                                        >
                                            <label>{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleFormChange}
                                                />
                                            ) : (
                                                <input
                                                    type={field.type || 'text'}
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleFormChange}
                                                    maxLength={field.maxLength}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Delete */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <button className="modal-close-button" onClick={closeDeleteModal} aria-label="Tutup">&times;</button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>Apakah Anda yakin ingin menghapus data guru: <strong>{deletingTeacher?.nama_lengkap}</strong>?</p>
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

export default TeacherDataPage;
