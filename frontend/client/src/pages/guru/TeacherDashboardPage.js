import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboardPage = () => {
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
    }, []); // Array dependensi kosong agar hanya berjalan sekali

    if (loading) {
        return <p>Memuat data...</p>;
    }

    return (
        <div>
            <h1>Selamat Datang, {profile ? profile.username : 'Guru'}!</h1>
            <p>Ini adalah halaman utama dasbor Anda. Di sini Anda bisa melihat ringkasan aktivitas belajar mengajar.</p>
        </div>
    );
};

export default TeacherDashboardPage;