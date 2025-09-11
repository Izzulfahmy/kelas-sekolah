package school

import "gorm.io/gorm"

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
	// --- PERUBAHAN: Gunakan Preload untuk mengambil data jenjang ---
	err := r.db.Preload("Jenjang").First(&profile).Error
	return profile, err
}

func (r *repository) UpdateProfile(profile SchoolProfile) (SchoolProfile, error) {
	err := r.db.Save(&profile).Error
	return profile, err
}
