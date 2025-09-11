package position

import "gorm.io/gorm"

type Repository interface {
	Create(pos Position) (Position, error)
	FindAll() ([]Position, error)
	Update(pos Position) (Position, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(pos Position) (Position, error) {
	err := r.db.Create(&pos).Error
	return pos, err
}

func (r *repository) FindAll() ([]Position, error) {
	var positions []Position
	err := r.db.Order("id asc").Find(&positions).Error
	return positions, err
}

func (r *repository) Update(pos Position) (Position, error) {
	err := r.db.Save(&pos).Error
	return pos, err
}

func (r *repository) Delete(ID int) error {
	err := r.db.Delete(&Position{}, ID).Error
	return err
}
