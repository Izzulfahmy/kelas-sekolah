package academicyear

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type handler struct {
	repository Repository
}

func NewHandler(repository Repository) *handler {
	return &handler{repository}
}

// AcademicYearInput adalah struct untuk validasi data JSON yang masuk
type AcademicYearInput struct {
	NamaTahunAjaran string `json:"nama_tahun_ajaran" binding:"required"`
	Semester        string `json:"semester" binding:"required"`
	Status          string `json:"status" binding:"required"`
	MetodeAbsensi   string `json:"metode_absensi" binding:"required"`
	// Menggunakan pointer agar ID bisa bernilai null/kosong
	KepalaSekolahID *int `json:"kepala_sekolah_id"`
}

// GetAllAcademicYears menangani request GET /api/academic-years
func (h *handler) GetAllAcademicYears(c *gin.Context) {
	years, err := h.repository.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tahun ajaran"})
		return
	}
	c.JSON(http.StatusOK, years)
}

// CreateAcademicYear menangani request POST /api/academic-years
func (h *handler) CreateAcademicYear(c *gin.Context) {
	var input AcademicYearInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	academicYear := AcademicYear{
		SekolahID:       1, // Default, bisa disesuaikan dengan logic autentikasi
		NamaTahunAjaran: input.NamaTahunAjaran,
		Semester:        Semester(input.Semester),
		Status:          StatusAjaran(input.Status),
		MetodeAbsensi:   MetodeAbsensi(input.MetodeAbsensi),
		KepalaSekolahID: input.KepalaSekolahID,
	}

	newYear, err := h.repository.Create(academicYear)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat tahun ajaran"})
		return
	}

	c.JSON(http.StatusCreated, newYear)
}

// UpdateAcademicYear menangani request PUT /api/academic-years/:id
func (h *handler) UpdateAcademicYear(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var input AcademicYearInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	existingYear, err := h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tahun ajaran tidak ditemukan"})
		return
	}

	existingYear.NamaTahunAjaran = input.NamaTahunAjaran
	existingYear.Semester = Semester(input.Semester)
	existingYear.Status = StatusAjaran(input.Status)
	existingYear.MetodeAbsensi = MetodeAbsensi(input.MetodeAbsensi)
	existingYear.KepalaSekolahID = input.KepalaSekolahID

	updatedYear, err := h.repository.Update(existingYear)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui tahun ajaran"})
		return
	}

	c.JSON(http.StatusOK, updatedYear)
}

// DeleteAcademicYear menangani request DELETE /api/academic-years/:id
func (h *handler) DeleteAcademicYear(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	_, err = h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tahun ajaran tidak ditemukan"})
		return
	}

	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tahun ajaran"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tahun ajaran berhasil dihapus"})
}
