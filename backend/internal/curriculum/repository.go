package curriculum

import "gorm.io/gorm"

type Repository interface {
	Create(curr Curriculum) (Curriculum, error)
	FindAll() ([]Curriculum, error)
	Update(curr Curriculum) (Curriculum, error)
	Delete(ID int) error
}
type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository { return &repository{db} }
func (r *repository) Create(curr Curriculum) (Curriculum, error) {
	err := r.db.Create(&curr).Error
	return curr, err
}
func (r *repository) FindAll() ([]Curriculum, error) {
	var currs []Curriculum
	err := r.db.Order("id asc").Find(&currs).Error
	return currs, err
}
func (r *repository) Update(curr Curriculum) (Curriculum, error) {
	err := r.db.Save(&curr).Error
	return curr, err
}
func (r *repository) Delete(ID int) error { return r.db.Delete(&Curriculum{}, ID).Error }
