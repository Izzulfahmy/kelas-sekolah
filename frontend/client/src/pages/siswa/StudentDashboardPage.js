import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDashboardPage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/profile/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setProfile(response.data);
            } catch (error) {
                console.error("Gagal mengambil profil:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <p>Memuat data...</p>;
    }

    return (
        <div>
            <h1>Selamat Datang, {profile ? profile.username : 'Siswa'}!</h1>
            <p>Ini adalah halaman utama dasbor Anda. Di sini Anda bisa melihat jadwal pelajaran dan nilai.</p>
        </div>
    );
};

export default StudentDashboardPage;