package student

import (
	"net/http"
	"strconv"
	"time"

	"kelas-sekolah/backend/internal/user"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Handler membutuhkan akses ke repository siswa dan user
type handler struct {
	studentRepo Repository
	userRepo    user.Repository
}

func NewHandler(studentRepo Repository, userRepo user.Repository) *handler {
	return &handler{studentRepo, userRepo}
}

// Struct untuk menerima input JSON yang lengkap
type StudentInput struct {
	ID              uint   `json:"id"`
	SekolahID       int    `json:"sekolah_id"`
	NIPD            string `json:"nipd" binding:"required"`
	NISN            string `json:"nisn" binding:"required"`
	NamaLengkap     string `json:"nama_lengkap" binding:"required"`
	NamaPanggilan   string `json:"nama_panggilan"`
	JenisKelamin    string `json:"jenis_kelamin" binding:"required"`
	TempatLahir     string `json:"tempat_lahir" binding:"required"`
	TanggalLahir    string `json:"tanggal_lahir" binding:"required"`
	Agama           string `json:"agama" binding:"required"`
	Kewarganegaraan string `json:"kewarganegaraan" binding:"required"`
	Provinsi        string `json:"provinsi"`
	KotaKabupaten   string `json:"kota_kabupaten"`
	Kecamatan       string `json:"kecamatan"`
	DesaKelurahan   string `json:"desa_kelurahan"`
	KodePos         string `json:"kode_pos"`
	AlamatTambahan  string `json:"alamat_tambahan"`
	NamaAyah        string `json:"nama_ayah"`
	NamaIbu         string `json:"nama_ibu"`
	NoHp            string `json:"no_hp"`
	StatusSiswa     string `json:"status_siswa" binding:"required"`
	// Field tambahan untuk pembuatan akun
	Username string `json:"username"`
	Password string `json:"password"`
}

// GET /students
func (h *handler) GetAllStudents(c *gin.Context) {
	students, err := h.studentRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}
	c.JSON(http.StatusOK, students)
}

// POST /students
func (h *handler) CreateStudent(c *gin.Context) {
	var input StudentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}
	if input.Username == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password are required for a new student account"})
		return
	}

	// --- Cek apakah username sudah ada ---
	_, err := h.userRepo.FindByUsername(input.Username)
	if err == nil {
		// --- PERUBAHAN PESAN ERROR DI SINI ---
		c.JSON(http.StatusConflict, gin.H{"error": "Maaf, username sudah ada !"})
		return
	}

	// 1. Buat Akun User terlebih dahulu
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.MinCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	newUser := user.User{
		Nama:     input.NamaLengkap,
		Username: input.Username,
		Password: string(passwordHash),
		Role:     user.Siswa,
	}
	createdUser, err := h.userRepo.Save(newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user account"})
		return
	}

	// 2. Buat Data Siswa dengan user_id yang terhubung
	tanggalLahir, _ := time.Parse("2006-01-02", input.TanggalLahir)
	student := Student{
		UserID:          createdUser.ID,
		SekolahID:       1, // sementara hardcoded, bisa diubah sesuai kebutuhan
		NIPD:            input.NIPD,
		NISN:            input.NISN,
		NamaLengkap:     input.NamaLengkap,
		NamaPanggilan:   input.NamaPanggilan,
		JenisKelamin:    JenisKelamin(input.JenisKelamin),
		TempatLahir:     input.TempatLahir,
		TanggalLahir:    tanggalLahir,
		Agama:           Agama(input.Agama),
		Kewarganegaraan: input.Kewarganegaraan,
		Provinsi:        input.Provinsi,
		KotaKabupaten:   input.KotaKabupaten,
		Kecamatan:       input.Kecamatan,
		DesaKelurahan:   input.DesaKelurahan,
		KodePos:         input.KodePos,
		AlamatTambahan:  input.AlamatTambahan,
		NamaAyah:        input.NamaAyah,
		NamaIbu:         input.NamaIbu,
		NoHp:            input.NoHp,
		StatusSiswa:     StatusSiswa(input.StatusSiswa),
	}
	newStudent, err := h.studentRepo.Create(student)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create student data"})
		return
	}

	c.JSON(http.StatusCreated, newStudent)
}

// PUT /students/:id
func (h *handler) UpdateStudent(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var input StudentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	existingStudent, err := h.studentRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student data not found"})
		return
	}

	tanggalLahir, _ := time.Parse("2006-01-02", input.TanggalLahir)

	// Perbarui field dari data yang ada
	existingStudent.NIPD = input.NIPD
	existingStudent.NISN = input.NISN
	existingStudent.NamaLengkap = input.NamaLengkap
	existingStudent.NamaPanggilan = input.NamaPanggilan
	existingStudent.JenisKelamin = JenisKelamin(input.JenisKelamin)
	existingStudent.TempatLahir = input.TempatLahir
	existingStudent.TanggalLahir = tanggalLahir
	existingStudent.Agama = Agama(input.Agama)
	existingStudent.Kewarganegaraan = input.Kewarganegaraan
	existingStudent.Provinsi = input.Provinsi
	existingStudent.KotaKabupaten = input.KotaKabupaten
	existingStudent.Kecamatan = input.Kecamatan
	existingStudent.DesaKelurahan = input.DesaKelurahan
	existingStudent.KodePos = input.KodePos
	existingStudent.AlamatTambahan = input.AlamatTambahan
	existingStudent.NamaAyah = input.NamaAyah
	existingStudent.NamaIbu = input.NamaIbu
	existingStudent.NoHp = input.NoHp
	existingStudent.StatusSiswa = StatusSiswa(input.StatusSiswa)

	updatedStudent, err := h.studentRepo.Update(existingStudent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update student"})
		return
	}
	c.JSON(http.StatusOK, updatedStudent)
}

// DELETE /students/:id
func (h *handler) DeleteStudent(c *gin.Context) {
	studentID, _ := strconv.Atoi(c.Param("id"))

	studentToDelete, err := h.studentRepo.FindByID(studentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student data not found"})
		return
	}

	if err := h.userRepo.Delete(int(studentToDelete.UserID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student data and account deleted successfully"})
}
