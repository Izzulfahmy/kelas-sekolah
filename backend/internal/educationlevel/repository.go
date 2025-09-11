package educationlevel

import "gorm.io/gorm"

type Repository interface {
	Create(level EducationLevel) (EducationLevel, error)
	FindAll() ([]EducationLevel, error)
	Update(level EducationLevel) (EducationLevel, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(level EducationLevel) (EducationLevel, error) {
	err := r.db.Create(&level).Error
	return level, err
}

func (r *repository) FindAll() ([]EducationLevel, error) {
	var levels []EducationLevel
	err := r.db.Order("id asc").Find(&levels).Error
	return levels, err
}

func (r *repository) Update(level EducationLevel) (EducationLevel, error) {
	err := r.db.Save(&level).Error
	return level, err
}

func (r *repository) Delete(ID int) error {
	err := r.db.Delete(&EducationLevel{}, ID).Error
	return err
}
