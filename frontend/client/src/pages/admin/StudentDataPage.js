import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import './StudentDataPage.css'; // Gunakan CSS khusus siswa

// Fungsi helper untuk format tanggal
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};

const StudentDataPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingStudent, setDeletingStudent] = useState(null);

    // State awal yang lengkap untuk form siswa
    const initialFormState = {
        nama_lengkap: '',
        nama_panggilan: '',
        nipd: '',
        nisn: '',
        jenis_kelamin: 'Laki-laki',
        tempat_lahir: '',
        tanggal_lahir: '',
        agama: 'Islam',
        kewarganegaraan: 'Indonesia',
        nama_ayah: '',
        nama_ibu: '',
        no_hp: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        desa_kelurahan: '',
        kode_pos: '',
        alamat_tambahan: '',
        status_siswa: 'Aktif',
        username: '',
        password: '',
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(response.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data siswa.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const openModal = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setFormData({ ...student, tanggal_lahir: formatDateForInput(student.tanggal_lahir) });
        } else {
            setEditingStudent(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (editingStudent) {
            delete payload.username;
            delete payload.password;
        }

        const apiCall = editingStudent
            ? api.put(`/api/students/${editingStudent.id}`, payload, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            : api.post('/api/students', { ...formData, sekolah_id: 1 }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });

        toast.promise(
            apiCall.then(() => fetchStudents()),
            {
                loading: 'Menyimpan data...',
                success: `Data siswa berhasil ${editingStudent ? 'diperbarui' : 'ditambahkan'}!`,
                error: (err) => `Error: ${err.response?.data?.error || 'Terjadi kesalahan'}`,
            }
        );
        closeModal();
    };

    const openDeleteModal = (student) => {
        setDeletingStudent(student);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingStudent(null);
    };

    const confirmDelete = async () => {
        const deletePromise = async () => {
            const token = localStorage.getItem('token');
            await api.delete(`/api/students/${deletingStudent.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchStudents();
        };

        toast.promise(deletePromise(), {
            loading: `Menghapus ${deletingStudent.nama_lengkap}...`,
            success: `Data siswa berhasil dihapus!`,
            error: (err) => `Error: ${err.response?.data?.error || 'Terjadi kesalahan'}`,
        });

        closeDeleteModal();
    };
    
    return (
        <div className="data-page-container">
            <div className="page-header">
                <h1>Data Siswa</h1>
                <button className="btn-add" onClick={() => openModal()}>+ Tambah Siswa</button>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Siswa</th>
                            <th>NISN</th>
                            <th>Status</th>
                            <th className="aksi-header">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Memuat data...</td></tr>
                        ) : (
                            students.map((student, index) => (
                                <tr key={student.id}>
                                    <td data-label="No">{index + 1}</td>
                                    <td data-label="Nama Siswa">{student.nama_lengkap}</td>
                                    <td data-label="NISN">{student.nisn}</td>
                                    <td data-label="Status"><span className={`status ${student.status_siswa.toLowerCase()}`}>{student.status_siswa}</span></td>
                                    <td data-label="Aksi" className="actions-cell">
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => openModal(student)}>Edit</button>
                                            <button className="btn-delete" onClick={() => openDeleteModal(student)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <button className="modal-close-button" onClick={closeModal}>&times;</button>
                        <h2>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h2>
                        <form onSubmit={handleSubmit} className="data-form">
                            <fieldset>
                                <legend>Data Pribadi & Akun</legend>
                                <div className="form-grid">
                                    <div className="form-group"><label>Nama Lengkap<span className="required-asterisk">*</span></label><input name="nama_lengkap" value={formData.nama_lengkap || ''} onChange={handleFormChange} required /></div>
                                    {!editingStudent && (
                                        <>
                                            <div className="form-group"><label>Username<span className="required-asterisk">*</span></label><input name="username" value={formData.username || ''} onChange={handleFormChange} required /></div>
                                            <div className="form-group"><label>Password<span className="required-asterisk">*</span></label><input type="password" name="password" value={formData.password || ''} onChange={handleFormChange} required /></div>
                                        </>
                                    )}
                                    <div className="form-group"><label>Nama Panggilan</label><input name="nama_panggilan" value={formData.nama_panggilan || ''} onChange={handleFormChange} /></div>
                                    <div className="form-group"><label>NIPD<span className="required-asterisk">*</span></label><input name="nipd" value={formData.nipd || ''} onChange={handleFormChange} required /></div>
                                    <div className="form-group"><label>NISN<span className="required-asterisk">*</span></label><input name="nisn" value={formData.nisn || ''} onChange={handleFormChange} required /></div>
                                    <div className="form-group"><label>Jenis Kelamin<span className="required-asterisk">*</span></label><select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleFormChange} required><option>Laki-laki</option><option>Perempuan</option></select></div>
                                    <div className="form-group"><label>Tempat Lahir<span className="required-asterisk">*</span></label><input name="tempat_lahir" value={formData.tempat_lahir || ''} onChange={handleFormChange} required /></div>
                                    <div className="form-group"><label>Tanggal Lahir<span className="required-asterisk">*</span></label><input type="date" name="tanggal_lahir" value={formData.tanggal_lahir || ''} onChange={handleFormChange} required /></div>
                                    <div className="form-group"><label>Agama<span className="required-asterisk">*</span></label><select name="agama" value={formData.agama} onChange={handleFormChange} required><option>Islam</option><option>Kristen Protestan</option><option>Kristen Katolik</option><option>Hindu</option><option>Buddha</option><option>Khonghucu</option></select></div>
                                    <div className="form-group"><label>Kewarganegaraan<span className="required-asterisk">*</span></label><input name="kewarganegaraan" value={formData.kewarganegaraan || 'Indonesia'} onChange={handleFormChange} required/></div>
                                    <div className="form-group"><label>Status Siswa<span className="required-asterisk">*</span></label><select name="status_siswa" value={formData.status_siswa} onChange={handleFormChange} required><option>Aktif</option><option>Lulus</option><option>Keluar</option></select></div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Data Orang Tua & Kontak</legend>
                                <div className="form-grid">
                                    <div className="form-group"><label>Nama Ayah</label><input name="nama_ayah" value={formData.nama_ayah || ''} onChange={handleFormChange} /></div>
                                    <div className="form-group"><label>Nama Ibu</label><input name="nama_ibu" value={formData.nama_ibu || ''} onChange={handleFormChange} /></div>
                                    <div className="form-group"><label>No. HP</label><input name="no_hp" value={formData.no_hp || ''} onChange={handleFormChange} /></div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Alamat</legend>
                                <div className="form-grid">
                                    <div className="form-group"><label>Provinsi</label><input name="provinsi" value={formData.provinsi || ''} onChange={handleFormChange} /></div>
                                    <div className="form-group"><label>Kota/Kabupaten</label><input name="kota_kabupaten" value={formData.kota_kabupaten || ''} onChange={handleFormChange} /></div>
                                    <div className="form-group"><label>Kecamatan</label><input name="kecamatan" value={formData.kecamatan || ''} onChange={handleFormChange} /></div>
                                    <div className="form-group"><label>Desa/Kelurahan</label><input name="desa_kelurahan" value={formData.desa_kelurahan || ''} onChange={handleFormChange} /></div>
                                    <div className="form-group"><label>Kode Pos</label><input name="kode_pos" value={formData.kode_pos || ''} onChange={handleFormChange} maxLength={5} /></div>
                                    <div className="form-group full-width"><label>Alamat Tambahan</label><textarea name="alamat_tambahan" value={formData.alamat_tambahan || ''} onChange={handleFormChange}></textarea></div>
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

            {isDeleteModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>Apakah Anda yakin ingin menghapus data dan akun siswa: <strong>{deletingStudent?.nama_lengkap}</strong>?</p>
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

export default StudentDataPage;
