import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import './SchoolProfilePage.css';

const SchoolProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [educationLevels, setEducationLevels] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const profilePromise = api.get('/api/school-profile', { headers });
            const levelsPromise = api.get('/api/education-levels', { headers });

            const [profileResponse, levelsResponse] = await Promise.all([profilePromise, levelsPromise]);

            setProfile(profileResponse.data);
            setFormData(profileResponse.data);
            setEducationLevels(levelsResponse.data || []);
        } catch (error) {
            toast.error("Gagal mengambil data.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = name === 'jenjang_id' ? (value ? parseInt(value, 10) : null) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const updatePromise = async () => {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            await api.put('/api/school-profile', formData, { headers });
            
            // Fetch ulang setelah update untuk data yang konsisten
            const response = await api.get('/api/school-profile', { headers });
            setProfile(response.data);
            setFormData(response.data);
        };

        toast.promise(updatePromise(), {
            loading: 'Menyimpan profil...',
            success: 'Profil sekolah berhasil diperbarui!',
            error: 'Gagal memperbarui profil.',
        });
        setIsEditing(false);
    };

    if (isLoading) {
        return <p>Memuat profil sekolah...</p>;
    }

    const fields = [
        { name: 'nama_sekolah', label: 'Nama Sekolah', required: true },
        { name: 'npsn', label: 'NPSN' },
        { 
            name: 'jenjang_id', 
            label: 'Jenjang Pendidikan', 
            type: 'select', 
            options: educationLevels.map(level => ({ value: level.id, label: level.nama_jenjang })) 
        },
        { name: 'naungan', label: 'Naungan' },
        // --- PERUBAHAN DI SINI ---
        { name: 'kepala_sekolah', label: 'Kepala Sekolah', readOnly: true }, // Tambahkan properti readOnly
        { name: 'telepon', label: 'Telepon' },
        { name: 'email', label: 'Email' },
        { name: 'website', label: 'Website' },
        { name: 'alamat', label: 'Alamat', type: 'textarea', fullWidth: true },
        { name: 'kelurahan', label: 'Kelurahan' },
        { name: 'kecamatan', label: 'Kecamatan' },
        { name: 'kota_kabupaten', label: 'Kota/Kabupaten' },
        { name: 'provinsi', label: 'Provinsi' },
        { name: 'kode_pos', label: 'Kode Pos' },
    ];

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Profil Sekolah</h1>
                {!isEditing && (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                        Edit Profil
                    </button>
                )}
            </div>

            <form onSubmit={handleUpdate}>
                <div className="profile-form">
                    {fields.map(field => (
                        <div key={field.name} className={`form-group-profile ${field.fullWidth ? 'full-width' : ''}`}>
                            <label htmlFor={field.name}>{field.label}</label>
                            {isEditing ? (
                                field.type === 'select' ? (
                                    <select
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">-- Pilih Jenjang --</option>
                                        {field.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleFormChange}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleFormChange}
                                        required={field.required}
                                        // --- PERUBAHAN DI SINI ---
                                        readOnly={field.readOnly} // Terapkan properti readOnly ke input
                                    />
                                )
                            ) : (
                                <div className="view-box">
                                    {field.name === 'jenjang_id' ? (profile.jenjang?.nama_jenjang || '-') : (profile[field.name] || '-')}
                                </div>
                            )}
                        </div>
                    ))}

                    {isEditing && (
                        <div className="profile-actions">
                            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Batal</button>
                            <button type="submit" className="btn-save">Simpan Perubahan</button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SchoolProfilePage;