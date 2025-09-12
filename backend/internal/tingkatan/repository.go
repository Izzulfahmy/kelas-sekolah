package tingkatan

import "gorm.io/gorm"

type Repository interface {
	Create(tingkatan Tingkatan) (Tingkatan, error)
	FindAll() ([]Tingkatan, error)
	Update(tingkatan Tingkatan) (Tingkatan, error)
	Delete(ID int) error
}
type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository { return &repository{db} }

func (r *repository) Create(tingkatan Tingkatan) (Tingkatan, error) {
	err := r.db.Create(&tingkatan).Error
	return tingkatan, err
}

func (r *repository) FindAll() ([]Tingkatan, error) {
	var tingkatans []Tingkatan
	err := r.db.Order("urutan asc").Find(&tingkatans).Error
	return tingkatans, err
}

func (r *repository) Update(tingkatan Tingkatan) (Tingkatan, error) {
	err := r.db.Save(&tingkatan).Error
	return tingkatan, err
}

func (r *repository) Delete(ID int) error {
	return r.db.Delete(&Tingkatan{}, ID).Error
}
