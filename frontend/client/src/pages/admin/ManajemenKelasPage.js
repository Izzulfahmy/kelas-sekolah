import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import {
  FaUsers, FaChalkboardTeacher, FaInfoCircle,
  FaPen, FaTrash, FaPlus, FaArrowLeft,
  FaChevronRight, FaChevronLeft, FaUniversity
} from 'react-icons/fa';
import './ManajemenKelasPage.css';

const getTokenHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const ManajemenKelasPage = () => {
  // Data utama
  const [allTahunAjaran, setAllTahunAjaran] = useState([]);
  const [allTingkatan, setAllTingkatan] = useState([]);
  const [allGuru, setAllGuru] = useState([]);
  const [allSiswa, setAllSiswa] = useState([]);
  const [allMapel, setAllMapel] = useState([]);

  // Master panel
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
  const [listKelas, setListKelas] = useState([]);
  const [kelasDetailsMap, setKelasDetailsMap] = useState({});
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Detail panel
  const [activeTab, setActiveTab] = useState('info');

  // Modals & forms
  const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);
  const [isPengajarModalOpen, setIsPengajarModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [deletingData, setDeletingData] = useState(null);

  const [kelasFormData, setKelasFormData] = useState({ nama_kelas: '', tingkatan_id: '', wali_kelas_id: '' });
  const [pengajarFormData, setPengajarFormData] = useState({ guru_id: '', mata_pelajaran_id: '' });

  // Anggota state (ids)
  const [anggotaKelasIds, setAnggotaKelasIds] = useState(new Set());
  const [isSavingAnggota, setIsSavingAnggota] = useState(false);

  // ---------- Fetch initial data ----------
  const fetchInitialData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const config = getTokenHeader();
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
      if (activeYear) setSelectedTahunAjaran(activeYear.id);
      else if (tahunAjaranData.length > 0) setSelectedTahunAjaran(tahunAjaranData[0].id);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data awal.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ---------- Helper: fetch detail satu kelas ----------
  const fetchKelasDetail = useCallback(async (kelasId) => {
    try {
      const config = getTokenHeader();
      const res = await api.get(`/api/kelas/${kelasId}`, config);
      return res.data;
    } catch (err) {
      console.warn(`Gagal fetch detail kelas ${kelasId}`, err);
      return null;
    }
  }, []);

  // ---------- Fetch list kelas dan detail ----------
  const fetchKelas = useCallback(async () => {
    if (!selectedTahunAjaran) return;
    try {
      const config = getTokenHeader();
      const res = await api.get(`/api/kelas?tahun_ajaran_id=${selectedTahunAjaran}`, config);
      const kelasList = res.data || [];
      setListKelas(kelasList);

      // fetch detail untuk setiap kelas (agar kita punya semua anggota)
      const promises = kelasList.map(k => fetchKelasDetail(k.id));
      const settled = await Promise.allSettled(promises);

      const newMap = {};
      for (let i = 0; i < settled.length; i++) {
        const s = settled[i];
        const k = kelasList[i];
        if (s.status === 'fulfilled' && s.value) {
          newMap[k.id] = s.value;
        } else {
          newMap[k.id] = k; // fallback
        }
      }
      setKelasDetailsMap(prev => ({ ...prev, ...newMap }));

      if (kelasList.length > 0 && !selectedKelas) {
        const first = kelasList[0];
        const detail = newMap[first.id] || first;
        setSelectedKelas(detail);
        const ids = (detail.anggota_kelas || []).map(a => Number(a.siswa?.id)).filter(Boolean);
        setAnggotaKelasIds(new Set(ids));
      }
    } catch (err) {
      console.error(err);
      setListKelas([]);
      toast.error('Gagal mengambil daftar kelas.');
    }
  }, [selectedTahunAjaran, fetchKelasDetail, selectedKelas]);

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  // ---------- Pilih kelas ----------
  const handleSelectKelas = useCallback(async (kelas) => {
    const kelasId = Number(kelas.id);
    const cached = kelasDetailsMap[kelasId];
    if (cached && cached.id) {
      setSelectedKelas(cached);
      const ids = (cached.anggota_kelas || []).map(a => Number(a.siswa?.id)).filter(Boolean);
      setAnggotaKelasIds(new Set(ids));
      setActiveTab('info');
      return;
    }
    try {
      const detail = await fetchKelasDetail(kelasId);
      if (detail) {
        setKelasDetailsMap(prev => ({ ...prev, [kelasId]: detail }));
        setSelectedKelas(detail);
        const ids = (detail.anggota_kelas || []).map(a => Number(a.siswa?.id)).filter(Boolean);
        setAnggotaKelasIds(new Set(ids));
        setActiveTab('info');
      } else {
        toast.error('Gagal memuat detail kelas.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat detail kelas.');
    }
  }, [kelasDetailsMap, fetchKelasDetail]);

  // ---------- Toggle siswa ----------
  const handleToggleSiswa = (siswaId) => {
    const idNum = Number(siswaId);
    setAnggotaKelasIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idNum)) newSet.delete(idNum);
      else newSet.add(idNum);
      return newSet;
    });
  };

  // ---------- Simpan anggota ----------
  const handleSaveAnggota = async () => {
    if (!selectedKelas) return;
    setIsSavingAnggota(true);
    try {
      const payload = { siswa_ids: Array.from(anggotaKelasIds).map(n => Number(n)) };
      const config = getTokenHeader();
      await toast.promise(
        api.put(`/api/kelas/${selectedKelas.id}/anggota`, payload, config),
        {
          loading: 'Menyimpan anggota kelas...',
          success: 'Anggota kelas berhasil diperbarui.',
          error: 'Gagal menyimpan perubahan.',
        }
      );

      // refresh list & details agar peta anggota semua kelas terupdate
      await fetchKelas();

      // ambil detail kelas terbaru untuk selected kelas
      const updatedDetail = await fetchKelasDetail(selectedKelas.id);
      if (updatedDetail) {
        setKelasDetailsMap(prev => ({ ...prev, [selectedKelas.id]: updatedDetail }));
        setSelectedKelas(updatedDetail);
        const ids = (updatedDetail.anggota_kelas || []).map(a => Number(a.siswa?.id)).filter(Boolean);
        setAnggotaKelasIds(new Set(ids));
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan anggota.');
    } finally {
      setIsSavingAnggota(false);
    }
  };

  // ---------- Siswa sudah terpakai ----------
  const siswaSudahTerpakai = useMemo(() => {
    const ids = new Set();
    Object.values(kelasDetailsMap).forEach(k => {
      (k.anggota_kelas || []).forEach(a => {
        const sid = Number(a.siswa?.id);
        if (sid) ids.add(sid);
      });
    });
    return ids;
  }, [kelasDetailsMap]);

  // ---------- Data siswa tersedia vs di kelas ----------
  const { siswaTersedia, siswaDiKelas } = useMemo(() => {
    const diKelasSet = new Set(Array.from(anggotaKelasIds).map(n => Number(n)));
    const diKelas = allSiswa.filter(s => diKelasSet.has(Number(s.id)));
    const tersedia = allSiswa.filter(s => {
      const idNum = Number(s.id);
      if (diKelasSet.has(idNum)) return false;
      // allow member of this class to still appear in its "di kelas ini" (handled above),
      // but if a student is used in any class (including this one), exclude from available.
      // to allow moving within same class, the diKelasSet check above already keeps members out of tersedia.
      if (siswaSudahTerpakai.has(idNum)) return false;
      return true;
    });
    return { siswaTersedia: tersedia, siswaDiKelas: diKelas };
  }, [allSiswa, anggotaKelasIds, siswaSudahTerpakai]);

  // ---------- CRUD kelas ----------
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
    try {
      const tokenHeader = getTokenHeader();
      const payload = {
        ...kelasFormData,
        tahun_ajaran_id: parseInt(selectedTahunAjaran, 10),
        tingkatan_id: parseInt(kelasFormData.tingkatan_id, 10),
        wali_kelas_id: kelasFormData.wali_kelas_id ? parseInt(kelasFormData.wali_kelas_id, 10) : null,
      };
      const promise = editingData
        ? api.put(`/api/kelas/${editingData.id}`, payload, tokenHeader)
        : api.post('/api/kelas', payload, tokenHeader);

      await toast.promise(promise, {
        loading: 'Menyimpan kelas...',
        success: `Kelas berhasil ${editingData ? 'diperbarui' : 'dibuat'}.`,
        error: 'Gagal menyimpan kelas.',
      });

      await fetchKelas();
      setIsKelasModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan kelas.');
    }
  };

  // ---------- Pengajar ----------
  const openPengajarModal = (data = null) => {
    setEditingData(data);
    if (data) {
      setPengajarFormData({
        guru_id: data.guru_id,
        mata_pelajaran_id: data.mata_pelajaran_id
      });
    } else {
      setPengajarFormData({ guru_id: '', mata_pelajaran_id: '' });
    }
    setIsPengajarModalOpen(true);
  };
  const closePengajarModal = () => setIsPengajarModalOpen(false);

  const handlePengajarSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKelas) return;
    try {
      const tokenHeader = getTokenHeader();
      const payload = {
        guru_id: parseInt(pengajarFormData.guru_id, 10),
        mata_pelajaran_id: parseInt(pengajarFormData.mata_pelajaran_id, 10),
      };
      const promise = editingData
        ? api.put(`/api/kelas/${selectedKelas.id}/pengajar/${editingData.id}`, payload, tokenHeader)
        : api.post(`/api/kelas/${selectedKelas.id}/pengajar`, payload, tokenHeader);

      await toast.promise(promise, {
        loading: editingData ? 'Memperbarui guru pengajar...' : 'Menambahkan guru pengajar...',
        success: editingData ? 'Guru pengajar berhasil diperbarui.' : 'Guru pengajar berhasil ditambahkan.',
        error: (err) => err.response?.data?.error || 'Gagal menyimpan.',
      });

      await fetchKelas();
      const updated = await fetchKelasDetail(selectedKelas.id);
      if (updated) {
        setKelasDetailsMap(prev => ({ ...prev, [selectedKelas.id]: updated }));
        setSelectedKelas(updated);
      }
      setIsPengajarModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan pengajar.');
    }
  };

  // ---------- Hapus ----------
  const openDeleteModal = (type, data) => {
    setDeletingData({ type, data });
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const confirmDelete = async () => {
    if (!deletingData) return;
    const { type, data } = deletingData;
    try {
      const tokenHeader = getTokenHeader();
      let promise;
      let successMsg = '';

      if (type === 'kelas') {
        promise = api.delete(`/api/kelas/${data.id}`, tokenHeader);
        successMsg = `Kelas ${data.nama_kelas} berhasil dihapus.`;
      } else if (type === 'pengajar') {
        promise = api.delete(`/api/kelas/${selectedKelas.id}/pengajar/${data.id}`, tokenHeader);
        successMsg = `Penugasan guru berhasil dihapus.`;
      }
      await toast.promise(promise, {
        loading: 'Menghapus...',
        success: successMsg,
        error: 'Gagal menghapus.',
      });

      await fetchKelas();
      if (type === 'kelas') setSelectedKelas(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus.');
    }
  };

  // ---------- Render ----------
  const isDetailVisible = selectedKelas !== null;

  if (isLoadingData) {
    return (
      <div className="manajemen-kelas-page">
        <div className="empty-state-full"><p>Memuat data awal...</p></div>
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
                <option key={th.id} value={th.id}>
                  {th.nama_tahun_ajaran} ({th.semester}) - {th.status}
                </option>
              ))}
            </select>
          </div>

          <div className="master-list">
            {listKelas.map(kelas => (
              <div
                key={kelas.id}
                className={`master-item ${selectedKelas?.id === kelas.id ? 'active' : ''}`}
                onClick={() => handleSelectKelas(kelas)}
              >
                <div className="item-content">
                  <span className="item-title">{kelas.nama_kelas}</span>
                  <span className="item-subtitle">Wali: {kelas.wali_kelas?.nama_lengkap || '-'} | {kelas.jumlah_siswa || 0} Siswa</span>
                </div>
                <div className="item-actions">
                  <button className="btn-action-icon" title="Edit Kelas" onClick={(e) => { e.stopPropagation(); openKelasModal(kelas); }}>
                    <FaPen />
                  </button>
                  <button className="btn-action-icon" title="Hapus Kelas" onClick={(e) => { e.stopPropagation(); openDeleteModal('kelas', kelas); }}>
                    <FaTrash />
                  </button>
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
                      <strong>Tahun Ajaran:</strong> <p>{selectedKelas.tahun_ajaran?.nama_tahun_ajaran} ({selectedKelas.tahun_ajaran?.semester})</p>
                      <strong>Tingkatan:</strong> <p>{selectedKelas.tingkatan?.nama_tingkatan}</p>
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
                      <button className="btn-add-master btn-add-detail" onClick={() => openPengajarModal()}><FaPlus /> Tugaskan Guru</button>
                    </div>
                    <div className="teacher-list-card">
                      {selectedKelas.pengajar_kelas?.map(p => (
                        <div className="teacher-card" key={p.id}>
                          <div>
                            <h4>{p.mata_pelajaran.nama_mapel}</h4>
                            <p>{p.guru.nama_lengkap}</p>
                          </div>
                          <div className="teacher-actions">
                            <button className="btn-action-icon btn-edit" onClick={() => openPengajarModal(p)}><FaPen /></button>
                            <button className="btn-action-icon btn-delete" onClick={() => openDeleteModal('pengajar', p)}><FaTrash /></button>
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* Modal Kelas */}
      {isKelasModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeKelasModal}>&times;</button>
            <h2>{editingData ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
            <form onSubmit={handleKelasSubmit} className="data-form">
              <div className="form-group">
                <label>Nama Kelas</label>
                <input name="nama_kelas" value={kelasFormData.nama_kelas} onChange={(e) => setKelasFormData({ ...kelasFormData, nama_kelas: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Tingkatan</label>
                <select name="tingkatan_id" value={kelasFormData.tingkatan_id} onChange={(e) => setKelasFormData({ ...kelasFormData, tingkatan_id: e.target.value })} required>
                  <option value="">-- Pilih Tingkatan --</option>
                  {allTingkatan.map(t => <option key={t.id} value={t.id}>{t.nama_tingkatan}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Wali Kelas</label>
                <select name="wali_kelas_id" value={kelasFormData.wali_kelas_id} onChange={(e) => setKelasFormData({ ...kelasFormData, wali_kelas_id: e.target.value })}>
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

      {/* Modal Pengajar */}
      {isPengajarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closePengajarModal}>&times;</button>
            <h2>{editingData ? 'Edit Guru Pengajar' : 'Tugaskan Guru Pengajar'}</h2>
            <form onSubmit={handlePengajarSubmit} className="data-form">
              <div className="form-group">
                <label>Mata Pelajaran</label>
                <select name="mata_pelajaran_id" value={pengajarFormData.mata_pelajaran_id} onChange={(e) => setPengajarFormData({ ...pengajarFormData, mata_pelajaran_id: e.target.value })} required>
                  <option value="">-- Pilih Mapel --</option>
                  {allMapel.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Guru</label>
                <select name="guru_id" value={pengajarFormData.guru_id} onChange={(e) => setPengajarFormData({ ...pengajarFormData, guru_id: e.target.value })} required>
                  <option value="">-- Pilih Guru --</option>
                  {allGuru.map(g => <option key={g.id} value={g.id}>{g.nama_lengkap}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closePengajarModal}>Batal</button>
                <button type="submit" className="btn-save">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
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
