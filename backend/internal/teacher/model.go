package teacher

import "time"

// Definisikan tipe ENUM di Go
type JenisKelamin string
type Agama string
type StatusGuru string

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
	Aktif    StatusGuru = "Aktif"
	NonAktif StatusGuru = "NonAktif"
)

type Teacher struct {
	ID uint `gorm:"primaryKey" json:"id"`
	// --- Field baru untuk relasi ke tabel user ---
	UserID          uint         `json:"user_id"`
	SekolahID       int          `json:"sekolah_id"`
	NamaLengkap     string       `json:"nama_lengkap"`
	NamaPanggilan   string       `json:"nama_panggilan"`
	GelarAkademik   string       `json:"gelar_akademik"`
	NipNuptk        string       `json:"nip_nuptk"`
	JenisKelamin    JenisKelamin `gorm:"type:jenis_kelamin_enum" json:"jenis_kelamin"`
	TempatLahir     string       `json:"tempat_lahir"`
	TanggalLahir    time.Time    `json:"tanggal_lahir"`
	ProgramStudi    string       `json:"program_studi"`
	Agama           Agama        `gorm:"type:agama_enum" json:"agama"`
	Kewarganegaraan string       `json:"kewarganegaraan"`
	NoHp            string       `json:"no_hp"`
	Provinsi        string       `json:"provinsi"`
	KotaKabupaten   string       `json:"kota_kabupaten"`
	Kecamatan       string       `json:"kecamatan"`
	DesaKelurahan   string       `json:"desa_kelurahan"`
	KodePos         string       `json:"kode_pos"`
	AlamatTambahan  string       `json:"alamat_tambahan"`
	StatusGuru      StatusGuru   `gorm:"type:status_guru_enum" json:"status_guru"`
}

func (Teacher) TableName() string {
	return "guru"
}
