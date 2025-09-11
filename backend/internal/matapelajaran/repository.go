package matapelajaran

import "gorm.io/gorm"

type Repository interface {
	Create(mp MataPelajaran) (MataPelajaran, error)
	FindAll() ([]MataPelajaran, error)
	Update(mp MataPelajaran) (MataPelajaran, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(mp MataPelajaran) (MataPelajaran, error) {
	err := r.db.Create(&mp).Error
	return mp, err
}

func (r *repository) FindAll() ([]MataPelajaran, error) {
	var mps []MataPelajaran
	err := r.db.Order("id asc").Find(&mps).Error
	return mps, err
}

func (r *repository) Update(mp MataPelajaran) (MataPelajaran, error) {
	err := r.db.Save(&mp).Error
	return mp, err
}

func (r *repository) Delete(ID int) error {
	err := r.db.Delete(&MataPelajaran{}, ID).Error
	return err
}
