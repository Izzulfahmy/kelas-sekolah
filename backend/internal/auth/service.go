package auth

import (
	"errors"
	"kelas-sekolah/backend/internal/student" // <-- Import paket student
	"kelas-sekolah/backend/internal/teacher" // <-- Import paket teacher
	"kelas-sekolah/backend/internal/user"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type Service interface {
	RegisterUser(input RegisterInput) (user.User, error)
	Login(input LoginInput) (string, error)
}

type service struct {
	userRepository    user.Repository
	teacherRepository teacher.Repository
	studentRepository student.Repository // <-- Tambahkan dependensi student repository
}

func NewService(userRepo user.Repository, teacherRepo teacher.Repository, studentRepo student.Repository) *service {
	return &service{
		userRepository:    userRepo,
		teacherRepository: teacherRepo,
		studentRepository: studentRepo,
	}
}

func (s *service) RegisterUser(input RegisterInput) (user.User, error) {
	// Cek apakah username sudah ada
	_, err := s.userRepository.FindByUsername(input.Username)
	if err == nil {
		return user.User{}, errors.New("username already exists")
	}

	newUser := user.User{
		Nama:     input.Nama, // Simpan juga nama user
		Username: input.Username,
		Role:     user.Role(input.Role),
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.MinCost)
	if err != nil {
		return newUser, err
	}

	newUser.Password = string(passwordHash)

	createdUser, err := s.userRepository.Save(newUser)
	if err != nil {
		return createdUser, err
	}

	// --- LOGIKA BARU: Jika role adalah Guru, buat juga data guru ---
	if createdUser.Role == user.Guru {
		newTeacherData := teacher.Teacher{
			UserID:      createdUser.ID,
			NamaLengkap: createdUser.Nama,
			SekolahID:   1, // Default sekolah_id sementara
		}
		_, err := s.teacherRepository.Create(newTeacherData)
		if err != nil {
			return user.User{}, err
		}
	}

	// --- LOGIKA BARU: Jika role adalah Siswa, buat juga data siswa ---
	if createdUser.Role == user.Siswa {
		newStudentData := student.Student{
			UserID:          createdUser.ID,
			NamaLengkap:     createdUser.Nama,
			SekolahID:       1, // Default sekolah_id sementara
			NIPD:            "default",
			NISN:            "default",
			JenisKelamin:    "Laki-laki",
			TempatLahir:     "-",
			TanggalLahir:    time.Now(),
			Agama:           "Islam",
			Kewarganegaraan: "Indonesia",
		}
		_, err := s.studentRepository.Create(newStudentData)
		if err != nil {
			return user.User{}, err
		}
	}

	return createdUser, nil
}

func (s *service) Login(input LoginInput) (string, error) {
	username := input.Username
	password := input.Password

	foundUser, err := s.userRepository.FindByUsername(username)
	if err != nil {
		return "", errors.New("no user found with that username")
	}

	err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(password))
	if err != nil {
		return "", errors.New("invalid password")
	}

	// Generate JWT Token
	token, err := s.generateJWT(foundUser.ID, foundUser.Role)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *service) generateJWT(userID uint, userRole user.Role) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    userRole,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token berlaku 24 jam
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return signedToken, err
	}

	return signedToken, nil
}
