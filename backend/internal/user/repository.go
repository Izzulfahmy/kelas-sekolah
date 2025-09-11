package user

import (
	"gorm.io/gorm"
)

type Repository interface {
	Save(user User) (User, error)
	FindByUsername(username string) (User, error)
	FindByRole(role string) ([]User, error)
	FindByID(ID int) (User, error)
	Update(user User) (User, error)
	Delete(ID int) error // --- fungsi baru
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Save(user User) (User, error) {
	err := r.db.Create(&user).Error
	if err != nil {
		return user, err
	}
	return user, nil
}

func (r *repository) FindByUsername(username string) (User, error) {
	var user User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return user, err
	}
	return user, nil
}

func (r *repository) FindByRole(role string) ([]User, error) {
	var users []User
	err := r.db.Where("role = ?", role).Find(&users).Error
	if err != nil {
		return users, err
	}
	return users, nil
}

func (r *repository) FindByID(ID int) (User, error) {
	var user User
	err := r.db.Where("id = ?", ID).First(&user).Error
	if err != nil {
		return user, err
	}
	return user, nil
}

func (r *repository) Update(user User) (User, error) {
	err := r.db.Save(&user).Error
	if err != nil {
		return user, err
	}
	return user, nil
}

// --- fungsi baru untuk hapus user berdasarkan ID ---
func (r *repository) Delete(ID int) error {
	return r.db.Delete(&User{}, ID).Error
}
