import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaUsers, FaChalkboardTeacher, FaInfoCircle, FaPen, FaTrash, FaPlus, FaArrowLeft, FaChevronRight, FaChevronLeft, FaUniversity } from 'react-icons/fa';
import './ManajemenKelasPage.css';

const ManajemenKelasPage = () => {
    // Data utama
    const [allTahunAjaran, setAllTahunAjaran] = useState([]);
    const [allTingkatan, setAllTingkatan] = useState([]);
    const [allGuru, setAllGuru] = useState([]);
    const [allSiswa, setAllSiswa] = useState([]);
    const [allMapel, setAllMapel] = useState([]);

    // State untuk panel master (daftar kelas)
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
    const [listKelas, setListKelas] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // State untuk panel detail
    const [activeTab, setActiveTab] = useState('info');

    // State untuk modals
    const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);
    const [isPengajarModalOpen, setIsPengajarModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [editingData, setEditingData] = useState(null);
    const [deletingData, setDeletingData] = useState(null);

    // State untuk form
    const [kelasFormData, setKelasFormData] = useState({ nama_kelas: '', tingkatan_id: '', wali_kelas_id: '' });
    const [pengajarFormData, setPengajarFormData] = useState({ guru_id: '', mata_pelajaran_id: '' });
    
    // State khusus untuk tab anggota kelas
    const [anggotaKelasIds, setAnggotaKelasIds] = useState(new Set());
    const [isSavingAnggota, setIsSavingAnggota] = useState(false);

    // --- Ambil Data Awal (Dropdowns, dll) ---
    const fetchInitialData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [resTahun, resTingkat, resGuru, resSiswa, resMapel] = await Promise.all([
                api.get('/api/academic-years', config),
                api.get('/api/tingkatans', config),
                api.get('/api/teachers', config),
                api.get('/api/students', config),
                api.get('/api/mata-pelajaran', config)
            ]);

            const tahunAjaranData = resTahun.data || [];
            setAllTahunAjaran(tahunAjaranData);
            setAllTingkatan(resTingkat.data || []);
            setAllGuru(resGuru.data || []);
            setAllSiswa(resSiswa.data || []);
            setAllMapel(resMapel.data || []);
            
            const activeYear = tahunAjaranData.find(th => th.status === 'Aktif');
            if (activeYear) {
                setSelectedTahunAjaran(activeYear.id);
            } else if (tahunAjaranData.length > 0) {
                setSelectedTahunAjaran(tahunAjaranData[0].id);
            }
        } catch (error) {
            toast.error('Gagal memuat data awal.');
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // --- Ambil Daftar Kelas Berdasarkan Tahun Ajaran ---
    const fetchKelas = useCallback(async () => {
        if (!selectedTahunAjaran) return;
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/api/kelas?tahun_ajaran_id=${selectedTahunAjaran}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListKelas(response.data || []);
        } catch (error) {
            setListKelas([]); // Kosongkan jika error
            toast.error('Gagal mengambil daftar kelas.');
        }
    }, [selectedTahunAjaran]);

    useEffect(() => {
        fetchKelas();
    }, [fetchKelas]);
    
    // --- Logika untuk memperbarui detail kelas saat daftar kelas berubah ---
    useEffect(() => {
        if (selectedKelas) {
            const updatedKelas = listKelas.find(k => k.id === selectedKelas.id);
            if (updatedKelas) {
                // Fetch ulang detail lengkap untuk data yang paling baru
                const token = localStorage.getItem('token');
                api.get(`/api/kelas/${updatedKelas.id}`, { headers: { Authorization: `Bearer ${token}` } })
                   .then(res => setSelectedKelas(res.data))
                   .catch(() => toast.error('Gagal memuat ulang detail kelas.'));
            } else {
                setSelectedKelas(null);
            }
        }
    }, [listKelas, selectedKelas?.id]);


    // --- Handlers ---
    const handleSelectKelas = (kelas) => {
        const token = localStorage.getItem('token');
        // Selalu fetch data terbaru saat kelas dipilih
        api.get(`/api/kelas/${kelas.id}`, { headers: { Authorization: `Bearer ${token}` } })
           .then(res => {
                setSelectedKelas(res.data);
                setAnggotaKelasIds(new Set(res.data.anggota_kelas?.map(a => a.id) || []));
                setActiveTab('info');
           })
           .catch(() => toast.error('Gagal memuat detail kelas.'));
    };
    
    // --- Handlers Modal Kelas ---
    const openKelasModal = (kelas = null) => {
        setEditingData(kelas);
        if (kelas) {
            setKelasFormData({
                nama_kelas: kelas.nama_kelas,
                tingkatan_id: kelas.tingkatan_id,
                wali_kelas_id: kelas.wali_kelas_id || ''
            });
        } else {
            setKelasFormData({ nama_kelas: '', tingkatan_id: '', wali_kelas_id: '' });
        }
        setIsKelasModalOpen(true);
    };
    const closeKelasModal = () => setIsKelasModalOpen(false);
    const handleKelasSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const payload = {
            ...kelasFormData,
            tahun_ajaran_id: parseInt(selectedTahunAjaran, 10),
            tingkatan_id: parseInt(kelasFormData.tingkatan_id, 10),
            wali_kelas_id: kelasFormData.wali_kelas_id ? parseInt(kelasFormData.wali_kelas_id, 10) : null,
        };

        const promise = editingData
            ? api.put(`/api/kelas/${editingData.id}`, payload, config)
            : api.post('/api/kelas', payload, config);

        await toast.promise(promise.then(() => fetchKelas()), {
            loading: 'Menyimpan kelas...',
            success: `Kelas berhasil ${editingData ? 'diperbarui' : 'dibuat'}.`,
            error: 'Gagal menyimpan kelas.',
        });
        
        fetchKelas();
        closeKelasModal();
    };

    // --- Handlers Modal Hapus ---
    const openDeleteModal = (type, data) => {
        setDeletingData({ type, data });
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => setIsDeleteModalOpen(false);
    const confirmDelete = async () => {
        if (!deletingData) return;
        const { type, data } = deletingData;
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        let promise;
        let successMsg = '';
        
        if (type === 'kelas') {
            promise = api.delete(`/api/kelas/${data.id}`, config);
            successMsg = `Kelas ${data.nama_kelas} berhasil dihapus.`;
        } else if (type === 'pengajar') {
            promise = api.delete(`/api/kelas/${selectedKelas.id}/pengajar/${data.id}`, config);
            successMsg = `Penugasan guru berhasil dihapus.`;
        }
        
        await toast.promise(promise, {
            loading: 'Menghapus...',
            success: successMsg,
            error: 'Gagal menghapus.',
        });
        
        if (type === 'kelas') {
            setSelectedKelas(null);
        }
        fetchKelas();
        closeDeleteModal();
    };

    // --- Handlers Anggota Kelas ---
    const handleToggleSiswa = (siswaId) => {
        setAnggotaKelasIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(siswaId)) {
                newSet.delete(siswaId);
            } else {
                newSet.add(siswaId);
            }
            return newSet;
        });
    };
    const handleSaveAnggota = async () => {
        if (!selectedKelas) return;
        setIsSavingAnggota(true);
        const payload = { siswa_ids: Array.from(anggotaKelasIds) };
        const token = localStorage.getItem('token');
        
        await toast.promise(
            api.put(`/api/kelas/${selectedKelas.id}/anggota`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            {
                loading: 'Menyimpan anggota kelas...',
                success: 'Anggota kelas berhasil diperbarui.',
                error: 'Gagal menyimpan perubahan.',
            }
        );

        fetchKelas(); // Untuk update jumlah siswa di master list
        setIsSavingAnggota(false);
    };

    const { siswaTersedia, siswaDiKelas } = useMemo(() => {
        const siswaDiKelasMap = new Set(anggotaKelasIds);
        const diKelas = allSiswa.filter(s => siswaDiKelasMap.has(s.id));
        const tersedia = allSiswa.filter(s => !siswaDiKelasMap.has(s.id));
        return { siswaTersedia: tersedia, siswaDiKelas: diKelas };
    }, [allSiswa, anggotaKelasIds]);

    // --- Handlers Pengajar Kelas ---
    const openPengajarModal = () => {
        setPengajarFormData({ guru_id: '', mata_pelajaran_id: '' });
        setIsPengajarModalOpen(true);
    };
    const closePengajarModal = () => setIsPengajarModalOpen(false);
    const handlePengajarSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = {
            guru_id: parseInt(pengajarFormData.guru_id, 10),
            mata_pelajaran_id: parseInt(pengajarFormData.mata_pelajaran_id, 10),
        };
        await toast.promise(
            api.post(`/api/kelas/${selectedKelas.id}/pengajar`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            {
                loading: 'Menambahkan guru pengajar...',
                success: 'Guru pengajar berhasil ditambahkan.',
                error: (err) => err.response?.data?.error || 'Gagal menambahkan.',
            }
        );
        fetchKelas();
        closePengajarModal();
    };


    const isDetailVisible = selectedKelas !== null;

    if (isLoadingData) {
        return (
            <div className="manajemen-kelas-page">
                <div className="empty-state-full">
                    <p>Memuat data awal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="manajemen-kelas-page">
            <div className={`master-detail-layout ${isDetailVisible ? 'detail-visible' : ''}`}>
                <aside className="master-panel">
                    <div className="panel-header">
                        <h2>Daftar Kelas</h2>
                        <button className="btn-add-master" onClick={() => openKelasModal()} disabled={!selectedTahunAjaran}>
                            <FaPlus /> Tambah
                        </button>
                    </div>
                    <div className="panel-controls">
                        <select
                            value={selectedTahunAjaran}
                            onChange={(e) => {
                                setSelectedTahunAjaran(e.target.value);
                                setSelectedKelas(null);
                            }}
                        >
                            {allTahunAjaran.map(th => (
                                <option key={th.id} value={th.id}>{th.nama_tahun_ajaran} ({th.semester}) - {th.status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="master-list">
                        {listKelas.map(kelas => (
                            <div key={kelas.id} className={`master-item ${selectedKelas?.id === kelas.id ? 'active' : ''}`} onClick={() => handleSelectKelas(kelas)}>
                                <div className="item-content">
                                    <span className="item-title">{kelas.nama_kelas}</span>
                                    <span className="item-subtitle">Wali: {kelas.wali_kelas?.nama_lengkap || '-'} | {kelas.jumlah_siswa || 0} Siswa</span>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-action-icon" title="Edit Kelas" onClick={(e) => { e.stopPropagation(); openKelasModal(kelas); }}><FaPen /></button>
                                    <button className="btn-action-icon" title="Hapus Kelas" onClick={(e) => { e.stopPropagation(); openDeleteModal('kelas', kelas); }}><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <main className="detail-panel">
                    {selectedKelas ? (
                        <>
                            <div className="detail-panel-header">
                                <button className="btn-back-mobile" onClick={() => setSelectedKelas(null)}><FaArrowLeft /></button>
                                <h2>{selectedKelas.nama_kelas}</h2>
                            </div>
                            <div className="detail-tabs">
                                <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}><FaInfoCircle /> Info</button>
                                <button className={activeTab === 'anggota' ? 'active' : ''} onClick={() => setActiveTab('anggota')}><FaUsers /> Anggota</button>
                                <button className={activeTab === 'pengajar' ? 'active' : ''} onClick={() => setActiveTab('pengajar')}><FaChalkboardTeacher /> Pengajar</button>
                            </div>
                            <div className="detail-content">
                                {activeTab === 'info' && (
                                    <div className="tab-content-info">
                                        <div className="info-grid">
                                            <strong>Nama Kelas:</strong> <p>{selectedKelas.nama_kelas}</p>
                                            <strong>Tahun Ajaran:</strong> <p>{selectedKelas.tahun_ajaran?.nama_tahun_ajaran || ''} ({selectedKelas.tahun_ajaran?.semester || ''})</p>
                                            <strong>Tingkatan:</strong> <p>{selectedKelas.tingkatan?.nama_tingkatan || ''}</p>
                                            <strong>Wali Kelas:</strong> <p>{selectedKelas.wali_kelas?.nama_lengkap || 'Belum diatur'}</p>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'anggota' && (
                                    <div>
                                        <div className="dual-list-box">
                                            <div className="list-box">
                                                <h3>Siswa Tersedia ({siswaTersedia.length})</h3>
                                                <div className="list-items">
                                                    {siswaTersedia.map(s => (
                                                        <div key={s.id} className="list-item" onClick={() => handleToggleSiswa(s.id)}>
                                                            <span>{s.nama_lengkap}</span> <FaChevronRight />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="list-box">
                                                <h3>Siswa di Kelas Ini ({siswaDiKelas.length})</h3>
                                                <div className="list-items">
                                                     {siswaDiKelas.map(s => (
                                                        <div key={s.id} className="list-item" onClick={() => handleToggleSiswa(s.id)}>
                                                            <FaChevronLeft /> <span>{s.nama_lengkap}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel-footer-actions">
                                            <button className="btn-save-mapping" onClick={handleSaveAnggota} disabled={isSavingAnggota}>
                                                {isSavingAnggota ? 'Menyimpan...' : 'Simpan Anggota'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'pengajar' && (
                                    <div>
                                        <div className="panel-header-alt">
                                            <h3>Mata Pelajaran & Guru Ajar</h3>
                                            <button className="btn-add-master btn-add-detail" onClick={openPengajarModal}><FaPlus /> Tugaskan Guru</button>
                                        </div>
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Mata Pelajaran</th><th>Guru</th><th>Aksi</th></tr>
                                            </thead>
                                            <tbody>
                                                {selectedKelas.pengajar_kelas?.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.mata_pelajaran.nama_mapel}</td>
                                                        <td>{p.guru.nama_lengkap}</td>
                                                        <td>
                                                            <button className="btn-icon btn-delete" onClick={() => openDeleteModal('pengajar', p)}><FaTrash /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state-full">
                            <FaUniversity size={50} />
                            <h2>Manajemen Kelas</h2>
                            <p>Pilih kelas dari daftar di sebelah kiri untuk melihat detailnya.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Tambah/Edit Kelas */}
            {isKelasModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeKelasModal}>&times;</button>
                        <h2>{editingData ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
                        <form onSubmit={handleKelasSubmit} className="data-form">
                            <div className="form-group">
                                <label>Nama Kelas</label>
                                <input name="nama_kelas" value={kelasFormData.nama_kelas} onChange={(e) => setKelasFormData({...kelasFormData, nama_kelas: e.target.value})} required/>
                            </div>
                            <div className="form-group">
                                <label>Tingkatan</label>
                                <select name="tingkatan_id" value={kelasFormData.tingkatan_id} onChange={(e) => setKelasFormData({...kelasFormData, tingkatan_id: e.target.value})} required>
                                    <option value="">-- Pilih Tingkatan --</option>
                                    {allTingkatan.map(t => <option key={t.id} value={t.id}>{t.nama_tingkatan}</option>)}
                                </select>
                            </div>
                             <div className="form-group">
                                <label>Wali Kelas</label>
                                <select name="wali_kelas_id" value={kelasFormData.wali_kelas_id} onChange={(e) => setKelasFormData({...kelasFormData, wali_kelas_id: e.target.value})}>
                                    <option value="">-- Pilih Wali Kelas (Opsional) --</option>
                                    {allGuru.map(g => <option key={g.id} value={g.id}>{g.nama_lengkap}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeKelasModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Pengajar */}
            {isPengajarModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closePengajarModal}>&times;</button>
                        <h2>Tugaskan Guru Pengajar</h2>
                        <form onSubmit={handlePengajarSubmit} className="data-form">
                            <div className="form-group">
                                <label>Mata Pelajaran</label>
                                <select name="mata_pelajaran_id" value={pengajarFormData.mata_pelajaran_id} onChange={(e) => setPengajarFormData({...pengajarFormData, mata_pelajaran_id: e.target.value})} required>
                                    <option value="">-- Pilih Mapel --</option>
                                    {allMapel.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
                                </select>
                            </div>
                             <div className="form-group">
                                <label>Guru</label>
                                <select name="guru_id" value={pengajarFormData.guru_id} onChange={(e) => setPengajarFormData({...pengajarFormData, guru_id: e.target.value})} required>
                                    <option value="">-- Pilih Guru --</option>
                                    {allGuru.map(g => <option key={g.id} value={g.id}>{g.nama_lengkap}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closePengajarModal}>Batal</button>
                                <button type="submit" className="btn-save">Tambahkan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Modal Konfirmasi Hapus */}
            {isDeleteModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>Apakah Anda yakin ingin menghapus data ini?</p>
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

export default ManajemenKelasPage;

