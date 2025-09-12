package curriculum

import "gorm.io/gorm"

type Repository interface {
	Create(curr Curriculum) (Curriculum, error)
	FindAll() ([]Curriculum, error)
	// Tambahkan FindByID untuk mengambil kurikulum tunggal dengan fasenya
	FindByID(ID int) (Curriculum, error)
	Update(curr Curriculum) (Curriculum, error)
	Delete(ID int) error
}
type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository { return &repository{db} }

func (r *repository) Create(curr Curriculum) (Curriculum, error) {
	err := r.db.Create(&curr).Error
	return curr, err
}

// Ubah FindAll untuk memuat fase terkait (Preload)
func (r *repository) FindAll() ([]Curriculum, error) {
	var currs []Curriculum
	err := r.db.Preload("Fases").Order("id asc").Find(&currs).Error
	return currs, err
}

// Fungsi baru
func (r *repository) FindByID(ID int) (Curriculum, error) {
	var curr Curriculum
	err := r.db.Preload("Fases").First(&curr, ID).Error
	return curr, err
}

func (r *repository) Update(curr Curriculum) (Curriculum, error) {
	err := r.db.Omit("Fases").Save(&curr).Error
	return curr, err
}

func (r *repository) Delete(ID int) error {
	return r.db.Delete(&Curriculum{}, ID).Error
}
