package extracurricular

import "gorm.io/gorm"

type Repository interface {
	Create(extra Extracurricular) (Extracurricular, error)
	FindAll() ([]Extracurricular, error)
	Update(extra Extracurricular) (Extracurricular, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(extra Extracurricular) (Extracurricular, error) {
	err := r.db.Create(&extra).Error
	return extra, err
}

func (r *repository) FindAll() ([]Extracurricular, error) {
	var extras []Extracurricular
	err := r.db.Order("id asc").Find(&extras).Error
	return extras, err
}

func (r *repository) Update(extra Extracurricular) (Extracurricular, error) {
	err := r.db.Save(&extra).Error
	return extra, err
}

func (r *repository) Delete(ID int) error {
	err := r.db.Delete(&Extracurricular{}, ID).Error
	return err
}
