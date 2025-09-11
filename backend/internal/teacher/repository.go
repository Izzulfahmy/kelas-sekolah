package teacher

import "gorm.io/gorm"

type Repository interface {
	Create(teacher Teacher) (Teacher, error)
	FindAll() ([]Teacher, error)
	FindByID(ID int) (Teacher, error)
	Update(teacher Teacher) (Teacher, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(teacher Teacher) (Teacher, error) {
	err := r.db.Create(&teacher).Error
	return teacher, err
}

func (r *repository) FindAll() ([]Teacher, error) {
	var teachers []Teacher
	err := r.db.Find(&teachers).Error
	return teachers, err
}

func (r *repository) FindByID(ID int) (Teacher, error) {
	var teacher Teacher
	err := r.db.Where("id = ?", ID).First(&teacher).Error
	return teacher, err
}

func (r *repository) Update(teacher Teacher) (Teacher, error) {
	err := r.db.Save(&teacher).Error
	return teacher, err
}

func (r *repository) Delete(ID int) error {
	err := r.db.Delete(&Teacher{}, ID).Error
	return err
}
