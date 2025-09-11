package student

import "time"

type JenisKelamin string
type Agama string
type StatusSiswa string

const (
	LakiLaki  JenisKelamin = "Laki-laki"
	Perempuan JenisKelamin = "Perempuan"
)
const (
	Islam            Agama = "Islam"
	KristenProtestan Agama = "Kristen Protestan"
	KristenKatolik   Agama = "Kristen Katolik"
	Hindu            Agama = "Hindu"
	Buddha           Agama = "Buddha"
	Khonghucu        Agama = "Khonghucu"
)
const (
	Aktif  StatusSiswa = "Aktif"
	Lulus  StatusSiswa = "Lulus"
	Keluar StatusSiswa = "Keluar"
)

type Student struct {
	ID uint `gorm:"primaryKey" json:"id"`
	// --- PERBAIKAN: Tambahkan gorm:"column:..." pada field yang namanya berbeda ---
	UserID          uint         `gorm:"column:user_id" json:"user_id"`
	SekolahID       int          `gorm:"column:sekolah_id" json:"sekolah_id"`
	NIPD            string       `gorm:"column:nipd" json:"nipd"`
	NISN            string       `gorm:"column:nisn" json:"nisn"`
	NamaLengkap     string       `gorm:"column:nama_lengkap" json:"nama_lengkap"`
	NamaPanggilan   string       `gorm:"column:nama_panggilan" json:"nama_panggilan"`
	JenisKelamin    JenisKelamin `gorm:"column:jenis_kelamin;type:jenis_kelamin_enum" json:"jenis_kelamin"`
	TempatLahir     string       `gorm:"column:tempat_lahir" json:"tempat_lahir"`
	TanggalLahir    time.Time    `gorm:"column:tanggal_lahir" json:"tanggal_lahir"`
	Agama           Agama        `gorm:"column:agama;type:agama_enum" json:"agama"`
	Kewarganegaraan string       `gorm:"column:kewarganegaraan" json:"kewarganegaraan"`
	Provinsi        string       `gorm:"column:provinsi" json:"provinsi"`
	KotaKabupaten   string       `gorm:"column:kota_kabupaten" json:"kota_kabupaten"`
	Kecamatan       string       `gorm:"column:kecamatan" json:"kecamatan"`
	DesaKelurahan   string       `gorm:"column:desa_kelurahan" json:"desa_kelurahan"`
	KodePos         string       `gorm:"column:kode_pos" json:"kode_pos"`
	AlamatTambahan  string       `gorm:"column:alamat_tambahan" json:"alamat_tambahan"`
	NamaAyah        string       `gorm:"column:nama_ayah" json:"nama_ayah"`
	NamaIbu         string       `gorm:"column:nama_ibu" json:"nama_ibu"`
	NoHp            string       `gorm:"column:no_hp" json:"no_hp"`
	StatusSiswa     StatusSiswa  `gorm:"column:status_siswa;type:status_siswa_enum" json:"status_siswa"`
}

func (Student) TableName() string {
	return "siswa"
}
