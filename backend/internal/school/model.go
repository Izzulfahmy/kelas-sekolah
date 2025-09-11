package school

import "kelas-sekolah/backend/internal/educationlevel"

type SchoolProfile struct {
	ID            uint                          `gorm:"primaryKey;default:1" json:"id"`
	NPSN          string                        `gorm:"column:npsn" json:"npsn"`
	NamaSekolah   string                        `gorm:"column:nama_sekolah" json:"nama_sekolah"`
	JenjangID     *uint                         `gorm:"column:jenjang_id" json:"jenjang_id"`
	Jenjang       educationlevel.EducationLevel `gorm:"foreignKey:JenjangID" json:"jenjang"`
	Naungan       string                        `gorm:"column:naungan" json:"naungan"`
	KepalaSekolah string                        `gorm:"column:kepala_sekolah" json:"kepala_sekolah"`
	Alamat        string                        `gorm:"column:alamat" json:"alamat"`
	Kelurahan     string                        `gorm:"column:kelurahan" json:"kelurahan"`
	Kecamatan     string                        `gorm:"column:kecamatan" json:"kecamatan"`
	KotaKabupaten string                        `gorm:"column:kota_kabupaten" json:"kota_kabupaten"`
	Provinsi      string                        `gorm:"column:provinsi" json:"provinsi"`
	KodePos       string                        `gorm:"column:kode_pos" json:"kode_pos"`
	Telepon       string                        `gorm:"column:telepon" json:"telepon"`
	Email         string                        `gorm:"column:email" json:"email"`
	Website       string                        `gorm:"column:website" json:"website"`
}

func (SchoolProfile) TableName() string {
	return "profil_sekolah"
}
