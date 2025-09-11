package user

import (
	"time"
)

type Role string

const (
	Admin Role = "admin"
	Guru  Role = "guru"
	Siswa Role = "siswa"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nama      string    `json:"nama"` // <-- Field baru untuk nama user
	Username  string    `gorm:"unique;not null" json:"username"`
	Password  string    `gorm:"not null" json:"-"`
	Role      Role      `gorm:"type:user_role;not null" json:"role"`
	CreatedAt time.Time `json:"created_at"`
}
