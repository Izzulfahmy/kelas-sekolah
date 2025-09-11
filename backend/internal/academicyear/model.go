package academicyear

import "kelas-sekolah/backend/internal/teacher"

// Mendefinisikan tipe data custom untuk kolom ENUM di database
type Semester string
type StatusAjaran string
type MetodeAbsensi string

// Nilai-nilai yang diperbolehkan untuk ENUM Semester
const (
	Ganjil Semester = "Ganjil"
	Genap  Semester = "Genap"
)

// Nilai-nilai yang diperbolehkan untuk ENUM StatusAjaran
const (
	Aktif      StatusAjaran = "Aktif"
	TidakAktif StatusAjaran = "Tidak Aktif"
)

// Nilai-nilai yang diperbolehkan untuk ENUM MetodeAbsensi
const (
	Harian        MetodeAbsensi = "HARIAN"
	RekapSemester MetodeAbsensi = "REKAP_SEMESTER"
)

// AcademicYear merepresentasikan struktur tabel 'tahun_ajaran'
type AcademicYear struct {
	ID              uint          `gorm:"primaryKey" json:"id"`
	SekolahID       int           `gorm:"column:sekolah_id" json:"sekolah_id"`
	KepalaSekolahID *int          `gorm:"column:kepala_sekolah_id" json:"kepala_sekolah_id"`
	NamaTahunAjaran string        `gorm:"column:nama_tahun_ajaran" json:"nama_tahun_ajaran"`
	Semester        Semester      `gorm:"column:semester;type:semester_enum" json:"semester"`
	Status          StatusAjaran  `gorm:"column:status;type:status_ajaran_enum" json:"status"`
	MetodeAbsensi   MetodeAbsensi `gorm:"column:metode_absensi;type:metode_absensi_enum" json:"metode_absensi"`

	// Relasi untuk mengambil data kepala sekolah secara otomatis (JOIN)
	// Menggunakan struct Teacher dari package teacher
	KepalaSekolah *teacher.Teacher `gorm:"foreignKey:KepalaSekolahID" json:"kepala_sekolah,omitempty"`
}

// TableName menentukan nama tabel di database untuk struct AcademicYear
func (AcademicYear) TableName() string {
	return "tahun_ajaran"
}
