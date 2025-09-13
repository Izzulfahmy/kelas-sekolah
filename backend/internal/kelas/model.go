package kelas

import (
	"kelas-sekolah/backend/internal/academicyear"
	"kelas-sekolah/backend/internal/matapelajaran"
	"kelas-sekolah/backend/internal/student"
	"kelas-sekolah/backend/internal/teacher" // PERBAIKAN: Mengganti "guru" menjadi "teacher"
	"kelas-sekolah/backend/internal/tingkatan"
)

// Definisikan struct untuk tabel `kelas`
type Kelas struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	SekolahID     int    `gorm:"column:sekolah_id" json:"sekolah_id"`
	TahunAjaranID int    `gorm:"column:tahun_ajaran_id" json:"tahun_ajaran_id"`
	TingkatanID   int    `gorm:"column:tingkatan_id" json:"tingkatan_id"`
	WaliKelasID   *int   `gorm:"column:wali_kelas_id" json:"wali_kelas_id"`
	NamaKelas     string `gorm:"column:nama_kelas" json:"nama_kelas"`

	// Relasi
	TahunAjaran   academicyear.AcademicYear `gorm:"foreignKey:TahunAjaranID" json:"tahun_ajaran"`
	Tingkatan     tingkatan.Tingkatan       `gorm:"foreignKey:TingkatanID" json:"tingkatan"`
	WaliKelas     *teacher.Teacher          `gorm:"foreignKey:WaliKelasID" json:"wali_kelas"` // PERBAIKAN: Menggunakan teacher.Teacher
	AnggotaKelas  []student.Student         `gorm:"many2many:anggota_kelas;" json:"anggota_kelas"`
	PengajarKelas []PengajarKelas           `gorm:"foreignKey:KelasID" json:"pengajar_kelas"`

	JumlahSiswa uint `gorm:"-" json:"jumlah_siswa"`
}

// Definisikan struct untuk tabel `anggota_kelas`
type AnggotaKelas struct {
	KelasID uint `gorm:"primaryKey" json:"kelas_id"`
	SiswaID uint `gorm:"primaryKey" json:"siswa_id"`
}

// Definisikan struct untuk tabel `pengajar_kelas`
type PengajarKelas struct {
	ID              uint `gorm:"primaryKey" json:"id"`
	KelasID         int  `gorm:"column:kelas_id" json:"kelas_id"`
	GuruID          int  `gorm:"column:guru_id" json:"guru_id"`
	MataPelajaranID int  `gorm:"column:mata_pelajaran_id" json:"mata_pelajaran_id"`

	// Relasi
	Guru          teacher.Teacher             `gorm:"foreignKey:GuruID" json:"guru"` // PERBAIKAN: Menggunakan teacher.Teacher
	MataPelajaran matapelajaran.MataPelajaran `gorm:"foreignKey:MataPelajaranID" json:"mata_pelajaran"`
}

// Menentukan nama tabel
func (Kelas) TableName() string         { return "kelas" }
func (AnggotaKelas) TableName() string  { return "anggota_kelas" }
func (PengajarKelas) TableName() string { return "pengajar_kelas" }
