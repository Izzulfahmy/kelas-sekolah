// kelas-sekolah/backend/internal/school/repository.go

package school

import (
	"gorm.io/gorm"
)

type Repository interface {
	GetProfile() (SchoolProfile, error)
	UpdateProfile(profile SchoolProfile) (SchoolProfile, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) GetProfile() (SchoolProfile, error) {
	var profile SchoolProfile

	// 1. Ambil data profil sekolah dasar beserta relasi Jenjang
	err := r.db.Preload("Jenjang").First(&profile).Error
	if err != nil {
		return profile, err
	}

	// 2. Cari nama kepala sekolah yang aktif dari tahun ajaran
	var activeHeadmasterName string

	// Query ini mencari nama lengkap guru yang ID-nya tercatat sebagai
	// kepala_sekolah_id di tahun ajaran yang statusnya 'Aktif'.
	err = r.db.Table("tahun_ajaran").
		Select("guru.nama_lengkap").
		Joins("JOIN guru ON guru.id = tahun_ajaran.kepala_sekolah_id").
		Where("tahun_ajaran.status = ?", "Aktif").
		Limit(1).
		Row().
		Scan(&activeHeadmasterName)

	// 3. Jika kepala sekolah aktif ditemukan, timpa field KepalaSekolah di profil.
	// Jika tidak ditemukan tahun ajaran aktif, maka akan digunakan nama kepala sekolah
	// default dari tabel profil_sekolah.
	if err == nil && activeHeadmasterName != "" {
		profile.KepalaSekolah = activeHeadmasterName
	}

	return profile, nil
}

func (r *repository) UpdateProfile(profile SchoolProfile) (SchoolProfile, error) {
	err := r.db.Save(&profile).Error
	return profile, err
}
