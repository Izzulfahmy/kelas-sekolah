import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaPen, FaTrash, FaPlus, FaBook, FaLayerGroup, FaArrowLeft } from 'react-icons/fa';
import './CurriculumPage.css';

const CurriculumPage = () => {
    // State utama
    const [curriculums, setCurriculums] = useState([]);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk Modal Kurikulum
    const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
    const [editingCurriculum, setEditingCurriculum] = useState(null);
    const [curriculumFormData, setCurriculumFormData] = useState({ nama_kurikulum: '', deskripsi: '' });

    // State untuk Modal Fase
    const [isFaseModalOpen, setIsFaseModalOpen] = useState(false);
    const [editingFase, setEditingFase] = useState(null);
    const [faseFormData, setFaseFormData] = useState({ nama_fase: '', deskripsi: '' });

    // State untuk Modal Konfirmasi Hapus
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingData, setDeletingData] = useState(null); // { type: 'kurikulum' | 'fase', data: {} }

    // --- Ambil Data Awal ---
    const fetchCurriculums = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/curriculums', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurriculums(response.data || []);
        } catch (error) {
            toast.error('Gagal mengambil data kurikulum.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurriculums();
    }, [fetchCurriculums]);

    useEffect(() => {
        if (selectedCurriculum) {
            const updatedSelection = curriculums.find(c => c.id === selectedCurriculum.id);
            setSelectedCurriculum(updatedSelection || null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curriculums]);


    // --- Handler untuk memilih kurikulum ---
    const handleSelectCurriculum = (curriculum) => {
        setSelectedCurriculum(curriculum);
    };

    // --- Handler untuk Modal Kurikulum ---
    const openCurriculumModal = (data = null) => {
        setEditingCurriculum(data);
        setCurriculumFormData(data ? { nama_kurikulum: data.nama_kurikulum, deskripsi: data.deskripsi || '' } : { nama_kurikulum: '', deskripsi: '' });
        setIsCurriculumModalOpen(true);
    };
    const closeCurriculumModal = () => {
        setIsCurriculumModalOpen(false);
        setEditingCurriculum(null);
    };
    const handleCurriculumSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const promise = editingCurriculum
            ? api.put(`/api/curriculums/${editingCurriculum.id}`, curriculumFormData, config)
            : api.post('/api/curriculums', { ...curriculumFormData, sekolah_id: 1 }, config);
        
        toast.promise(promise, {
            loading: 'Menyimpan kurikulum...',
            success: `Kurikulum berhasil ${editingCurriculum ? 'diperbarui' : 'ditambahkan'}.`,
            error: 'Gagal menyimpan kurikulum.',
        });

        try {
            await promise;
            fetchCurriculums();
            closeCurriculumModal();
        } catch (error) {
            console.error(error);
        }
    };

    // --- Handler untuk Modal Fase ---
    const openFaseModal = (data = null) => {
        setEditingFase(data);
        setFaseFormData(data ? { nama_fase: data.nama_fase, deskripsi: data.deskripsi || '' } : { nama_fase: '', deskripsi: '' });
        setIsFaseModalOpen(true);
    };
    const closeFaseModal = () => {
        setIsFaseModalOpen(false);
        setEditingFase(null);
    };
    const handleFaseSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCurriculum) return;
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const payload = { ...faseFormData, kurikulum_id: selectedCurriculum.id };

        const promise = editingFase
            ? api.put(`/api/fases/${editingFase.id}`, payload, config)
            : api.post('/api/fases', payload, config);

        toast.promise(promise, {
            loading: 'Menyimpan fase...',
            success: `Fase berhasil ${editingFase ? 'diperbarui' : 'ditambahkan'}.`,
            error: 'Gagal menyimpan fase.',
        });

        try {
            await promise;
            fetchCurriculums();
            closeFaseModal();
        } catch (error) {
            console.error(error);
        }
    };

    // --- Handler untuk Modal Hapus ---
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
        const url = type === 'kurikulum' ? `/api/curriculums/${data.id}` : `/api/fases/${data.id}`;
        const name = type === 'kurikulum' ? data.nama_kurikulum : data.nama_fase;

        const promise = api.delete(url, config);
        
        toast.promise(promise, {
            loading: `Menghapus ${name}...`,
            success: `${type.charAt(0).toUpperCase() + type.slice(1)} berhasil dihapus.`,
            error: `Gagal menghapus ${name}.`,
        });

        try {
            await promise;
            if (type === 'kurikulum' && selectedCurriculum?.id === data.id) {
                setSelectedCurriculum(null);
            }
            fetchCurriculums();
            closeDeleteModal();
        } catch (error) {
            console.error(error);
        }
    };

    const isDetailVisible = selectedCurriculum !== null;

    return (
        <div className="curriculum-page">
            <div className="page-header">
                <h1>Manajemen Kurikulum & Fase</h1>
            </div>

            <div className={`master-detail-layout ${isDetailVisible ? 'detail-visible' : ''}`}>
                {/* Kolom Kiri: Daftar Kurikulum */}
                <aside className="master-panel">
                    <div className="panel-header">
                        <h2>Daftar Kurikulum</h2>
                        <button className="btn-add-master" onClick={() => openCurriculumModal()}>
                            <FaPlus /> Tambah
                        </button>
                    </div>
                    <div className="master-list">
                        {isLoading ? <p className="loading-text">Memuat...</p> : (
                            curriculums.map(curr => (
                                <div
                                    key={curr.id}
                                    className={`master-item ${selectedCurriculum?.id === curr.id ? 'active' : ''}`}
                                    onClick={() => handleSelectCurriculum(curr)}
                                >
                                    <div className="item-icon"><FaBook /></div>
                                    <div className="item-content">
                                        <span className="item-title">{curr.nama_kurikulum}</span>
                                        <span className="item-subtitle">{curr.deskripsi || 'Tidak ada deskripsi'}</span>
                                    </div>
                                    <div className="item-actions">
                                        <button className="btn-action-icon" onClick={(e) => { e.stopPropagation(); openCurriculumModal(curr); }}><FaPen /></button>
                                        <button className="btn-action-icon" onClick={(e) => { e.stopPropagation(); openDeleteModal('kurikulum', curr); }}><FaTrash /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Kolom Kanan: Detail & Manajemen Fase */}
                <main className="detail-panel">
                    {selectedCurriculum ? (
                        <>
                            {/* Header khusus untuk mobile, berisi tombol kembali dan tambah */}
                            <div className="detail-panel-header-mobile">
                                <button className="btn-back-mobile" onClick={() => setSelectedCurriculum(null)}>
                                    <FaArrowLeft />
                                </button>
                                <h2>{selectedCurriculum.nama_kurikulum}</h2>
                                <button className="btn-add-fase-header-mobile" onClick={() => openFaseModal()}>
                                    <FaPlus />
                                </button>
                            </div>

                            {/* Header untuk desktop */}
                            <div className="panel-header panel-header-desktop">
                                <h2>Detail: {selectedCurriculum.nama_kurikulum}</h2>
                                <button className="btn-add-detail" onClick={() => openFaseModal()}>
                                    <FaPlus /> Tambah
                                </button>
                            </div>
                            
                            <div className="detail-content">
                                <h4>Deskripsi Kurikulum</h4>
                                <p>{selectedCurriculum.deskripsi || 'Tidak ada deskripsi.'}</p>
                                <hr />
                                <h4>Daftar Fase</h4>
                                {selectedCurriculum.fases && selectedCurriculum.fases.length > 0 ? (
                                    <div className="master-list"> {/* Menggunakan style yang sama dengan daftar kurikulum */}
                                        {selectedCurriculum.fases.map(fase => (
                                            <div key={fase.id} className="master-item"> {/* Menggunakan style item yang sama */}
                                                <div className="item-icon"><FaLayerGroup /></div>
                                                <div className="item-content">
                                                    <span className="item-title">{fase.nama_fase}</span>
                                                    <span className="item-subtitle">{fase.deskripsi || 'Tidak ada deskripsi'}</span>
                                                </div>
                                                <div className="item-actions">
                                                    <button className="btn-action-icon" onClick={() => openFaseModal(fase)}><FaPen /></button>
                                                    <button className="btn-action-icon" onClick={() => openDeleteModal('fase', fase)}><FaTrash /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <FaLayerGroup size={32} />
                                        <p>Belum ada fase untuk kurikulum ini.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state-full">
                            <FaBook size={50} />
                            <h2>Pilih Kurikulum</h2>
                            <p>Silakan pilih kurikulum dari daftar di sebelah kiri untuk melihat detailnya.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* MODALS */}
            {isCurriculumModalOpen && (
                <div className="modal-overlay" onClick={closeCurriculumModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeCurriculumModal}>&times;</button>
                        <h2>{editingCurriculum ? 'Edit Kurikulum' : 'Tambah Kurikulum'}</h2>
                        <form onSubmit={handleCurriculumSubmit} className="data-form">
                            <div className="form-group">
                                <label>Nama Kurikulum <span className="required-asterisk">*</span></label>
                                <input value={curriculumFormData.nama_kurikulum} onChange={e => setCurriculumFormData({...curriculumFormData, nama_kurikulum: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea value={curriculumFormData.deskripsi} onChange={e => setCurriculumFormData({...curriculumFormData, deskripsi: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeCurriculumModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isFaseModalOpen && (
                 <div className="modal-overlay" onClick={closeFaseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeFaseModal}>&times;</button>
                        <h2>{editingFase ? 'Edit Fase' : 'Tambah Fase Baru'}</h2>
                        <p className="modal-subtitle">Untuk Kurikulum: <strong>{selectedCurriculum?.nama_kurikulum}</strong></p>
                        <form onSubmit={handleFaseSubmit} className="data-form">
                            <div className="form-group">
                                <label>Nama Fase <span className="required-asterisk">*</span></label>
                                <input value={faseFormData.nama_fase} onChange={e => setFaseFormData({...faseFormData, nama_fase: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea value={faseFormData.deskripsi} onChange={e => setFaseFormData({...faseFormData, deskripsi: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeFaseModal}>Batal</button>
                                <button type="submit" className="btn-save">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                 <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
                        <h2>Konfirmasi Hapus</h2>
                        <p>
                            Apakah Anda yakin ingin menghapus {deletingData?.type}:{' '}
                            <strong>{deletingData?.type === 'kurikulum' ? deletingData?.data.nama_kurikulum : deletingData?.data.nama_fase}</strong>?
                        </p>
                        {deletingData?.type === 'kurikulum' && <p className="warning-text">Menghapus kurikulum juga akan menghapus semua fase di dalamnya.</p>}
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

export default CurriculumPage;
