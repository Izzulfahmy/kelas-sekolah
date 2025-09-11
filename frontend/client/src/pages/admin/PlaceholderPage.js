import React from 'react';

// Halaman generik yang menerima judul sebagai 'prop'
const PlaceholderPage = ({ title }) => {
    return (
        <div>
            <h1>{title}</h1>
            <p>Fitur untuk halaman ini sedang dalam tahap pengembangan.</p>
            <p>Anda dapat mulai membangun komponen dan logika untuk fitur "{title}" di sini.</p>
        </div>
    );
};

export default PlaceholderPage;