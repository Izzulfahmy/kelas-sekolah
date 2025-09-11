import axios from 'axios';

// Logika Otomatis untuk Menentukan Alamat Backend

// Dapatkan hostname dari URL browser saat ini (bisa 'localhost' atau '192.168.x.x')
const hostname = window.location.hostname;

// Tentukan baseURL berdasarkan hostname.
// Jika di komputer (localhost), API akan ke localhost:8080.
// Jika di HP (IP), API akan ke alamat IP yang sama di port 8080.
const baseURL = `http://${hostname}:8080`;

// Buat instance axios dengan baseURL yang dinamis
const api = axios.create({
  baseURL: baseURL,
});

export default api;