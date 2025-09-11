package student

import "gorm.io/gorm"

type Repository interface {
	Create(student Student) (Student, error)
	FindAll() ([]Student, error)
	FindByID(ID int) (Student, error)
	Update(student Student) (Student, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(student Student) (Student, error) {
	err := r.db.Create(&student).Error
	return student, err
}

// ... (Implementasikan fungsi FindAll, FindByID, Update, Delete seperti pada teacher/repository.go)
func (r *repository) FindAll() ([]Student, error) {
	var students []Student
	err := r.db.Find(&students).Error
	return students, err
}

func (r *repository) FindByID(ID int) (Student, error) {
	var student Student
	err := r.db.Where("id = ?", ID).First(&student).Error
	return student, err
}

func (r *repository) Update(student Student) (Student, error) {
	err := r.db.Save(&student).Error
	return student, err
}

func (r *repository) Delete(ID int) error {
	err := r.db.Delete(&Student{}, ID).Error
	return err
}
