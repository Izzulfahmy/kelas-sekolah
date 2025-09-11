package teacher

import (
	"net/http"
	"strconv"
	"time"

	"kelas-sekolah/backend/internal/user"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Handler sekarang butuh akses ke kedua repository
type handler struct {
	teacherRepo Repository
	userRepo    user.Repository
}

func NewHandler(teacherRepo Repository, userRepo user.Repository) *handler {
	return &handler{teacherRepo: teacherRepo, userRepo: userRepo}
}

// Struct input yang lebih lengkap, termasuk username dan password
type TeacherInput struct {
	ID              uint   `json:"id"`
	SekolahID       int    `json:"sekolah_id"`
	NamaLengkap     string `json:"nama_lengkap" binding:"required"`
	NamaPanggilan   string `json:"nama_panggilan"`
	GelarAkademik   string `json:"gelar_akademik"`
	NipNuptk        string `json:"nip_nuptk"`
	JenisKelamin    string `json:"jenis_kelamin" binding:"required"`
	TempatLahir     string `json:"tempat_lahir" binding:"required"`
	TanggalLahir    string `json:"tanggal_lahir" binding:"required"`
	ProgramStudi    string `json:"program_studi"`
	Agama           string `json:"agama" binding:"required"`
	Kewarganegaraan string `json:"kewarganegaraan"`
	NoHp            string `json:"no_hp"`
	Provinsi        string `json:"provinsi"`
	KotaKabupaten   string `json:"kota_kabupaten"`
	Kecamatan       string `json:"kecamatan"`
	DesaKelurahan   string `json:"desa_kelurahan"`
	KodePos         string `json:"kode_pos"`
	AlamatTambahan  string `json:"alamat_tambahan"`
	StatusGuru      string `json:"status_guru" binding:"required"`
	// Field baru untuk akun
	Username string `json:"username"`
	Password string `json:"password"`
}

// GET /teachers
func (h *handler) GetAllTeachers(c *gin.Context) {
	teachers, err := h.teacherRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teachers"})
		return
	}
	c.JSON(http.StatusOK, teachers)
}

// POST /teachers (dibuat lebih cerdas: bikin user + guru)
func (h *handler) CreateTeacher(c *gin.Context) {
	var input TeacherInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// Validasi username & password wajib ada
	if input.Username == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password are required for new teacher"})
		return
	}

	// --- Tambahan: Cek apakah username sudah ada ---
	_, err := h.userRepo.FindByUsername(input.Username)
	if err == nil { // Jika err nil, artinya user ditemukan (username sudah dipakai)
		c.JSON(http.StatusConflict, gin.H{"error": "Maaf, username sudah ada !"})
		return
	}

	// 1. Buat akun user
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.MinCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	newUser := user.User{
		Nama:     input.NamaLengkap,
		Username: input.Username,
		Password: string(passwordHash),
		Role:     user.Guru,
	}
	createdUser, err := h.userRepo.Save(newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user account"})
		return
	}

	// 2. Buat data guru yang terhubung dengan user
	tanggalLahir, _ := time.Parse("2006-01-02", input.TanggalLahir)
	teacher := Teacher{
		UserID:          createdUser.ID,
		SekolahID:       input.SekolahID,
		NamaLengkap:     input.NamaLengkap,
		NamaPanggilan:   input.NamaPanggilan,
		GelarAkademik:   input.GelarAkademik,
		NipNuptk:        input.NipNuptk,
		JenisKelamin:    JenisKelamin(input.JenisKelamin),
		TempatLahir:     input.TempatLahir,
		TanggalLahir:    tanggalLahir,
		ProgramStudi:    input.ProgramStudi,
		Agama:           Agama(input.Agama),
		Kewarganegaraan: input.Kewarganegaraan,
		NoHp:            input.NoHp,
		Provinsi:        input.Provinsi,
		KotaKabupaten:   input.KotaKabupaten,
		Kecamatan:       input.Kecamatan,
		DesaKelurahan:   input.DesaKelurahan,
		KodePos:         input.KodePos,
		AlamatTambahan:  input.AlamatTambahan,
		StatusGuru:      StatusGuru(input.StatusGuru),
	}
	newTeacher, err := h.teacherRepo.Create(teacher)
	if err != nil {
		// TODO: rollback user jika guru gagal dibuat
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create teacher data"})
		return
	}

	c.JSON(http.StatusCreated, newTeacher)
}

// PUT /teachers/:id
func (h *handler) UpdateTeacher(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var input TeacherInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// 1. Ambil data guru lama
	existingTeacher, err := h.teacherRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher data not found"})
		return
	}

	// 2. Parse tanggal lahir
	tanggalLahir, err := time.Parse("2006-01-02", input.TanggalLahir)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format for Tanggal Lahir, use YYYY-MM-DD"})
		return
	}

	// 3. Update field-field guru
	existingTeacher.NamaLengkap = input.NamaLengkap
	existingTeacher.NamaPanggilan = input.NamaPanggilan
	existingTeacher.GelarAkademik = input.GelarAkademik
	existingTeacher.NipNuptk = input.NipNuptk
	existingTeacher.JenisKelamin = JenisKelamin(input.JenisKelamin)
	existingTeacher.TempatLahir = input.TempatLahir
	existingTeacher.TanggalLahir = tanggalLahir
	existingTeacher.ProgramStudi = input.ProgramStudi
	existingTeacher.Agama = Agama(input.Agama)
	existingTeacher.Kewarganegaraan = input.Kewarganegaraan
	existingTeacher.NoHp = input.NoHp
	existingTeacher.Provinsi = input.Provinsi
	existingTeacher.KotaKabupaten = input.KotaKabupaten
	existingTeacher.Kecamatan = input.Kecamatan
	existingTeacher.DesaKelurahan = input.DesaKelurahan
	existingTeacher.KodePos = input.KodePos
	existingTeacher.AlamatTambahan = input.AlamatTambahan
	existingTeacher.StatusGuru = StatusGuru(input.StatusGuru)

	// 4. Simpan perubahan
	updatedTeacher, err := h.teacherRepo.Update(existingTeacher)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update teacher"})
		return
	}
	c.JSON(http.StatusOK, updatedTeacher)
}

// DELETE /teachers/:id
func (h *handler) DeleteTeacher(c *gin.Context) {
	teacherID, _ := strconv.Atoi(c.Param("id"))

	// 1. Cari data guru untuk dapatkan UserID
	teacherToDelete, err := h.teacherRepo.FindByID(teacherID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher data not found"})
		return
	}

	// 2. Hapus user → otomatis hapus guru lewat ON DELETE CASCADE
	if err := h.userRepo.Delete(int(teacherToDelete.UserID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Teacher data and account deleted successfully"})
}
