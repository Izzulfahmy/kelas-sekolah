package curriculum

import "gorm.io/gorm"

// Repository defines the interface for curriculum data operations
type Repository interface {
	GetAllCurriculums() ([]Curriculum, error)
	Create(curr Curriculum) (Curriculum, error)
	Update(curr Curriculum) (Curriculum, error)
	Delete(ID int) error
	// FindByID tidak diperlukan jika GetAllCurriculums sudah lengkap
}
type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository { return &repository{db} }

// GetAllCurriculums fetches all curriculums with their related phases and mappings
func (r *repository) GetAllCurriculums() ([]Curriculum, error) {
	var curriculums []Curriculum
	// Lakukan Nested Preloading di sini
	err := r.db.Model(&Curriculum{}).
		// 1. Muat relasi Fases, urutkan berdasarkan ID
		Preload("Fases", func(db *gorm.DB) *gorm.DB {
			return db.Order("fase.id ASC")
		}).
		// 2. Untuk setiap Fase yang dimuat, muat juga relasi Tingkatans-nya
		Preload("Fases.Tingkatans", func(db *gorm.DB) *gorm.DB {
			return db.Order("tingkatan.urutan ASC")
		}).
		Order("kurikulum.id ASC").
		Find(&curriculums).Error
	return curriculums, err
}

// Create handles the creation of a new curriculum
func (r *repository) Create(curr Curriculum) (Curriculum, error) {
	err := r.db.Create(&curr).Error
	return curr, err
}

// Update handles updating an existing curriculum
func (r *repository) Update(curr Curriculum) (Curriculum, error) {
	// Omit Fases to prevent GORM from trying to update the relation
	err := r.db.Omit("Fases").Save(&curr).Error
	return curr, err
}

// Delete handles deleting a curriculum
func (r *repository) Delete(ID int) error {
	return r.db.Delete(&Curriculum{}, ID).Error
}
