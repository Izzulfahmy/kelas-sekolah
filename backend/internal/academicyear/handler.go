// kelas-sekolah/backend/internal/academicyear/handler.go

package academicyear

import (
	"fmt"
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

type AcademicYearInput struct {
	NamaTahunAjaran string `json:"nama_tahun_ajaran" binding:"required"`
	Semester        string `json:"semester" binding:"required"`
	Status          string `json:"status" binding:"required"`
	MetodeAbsensi   string `json:"metode_absensi" binding:"required"`
	KepalaSekolahID *int   `json:"kepala_sekolah_id"`
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

	// (Opsional) Periksa apakah data memang ada sebelum mencoba update
	_, err = h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tahun ajaran tidak ditemukan"})
		return
	}

	fmt.Printf("[HANDLER] Meneruskan data update untuk ID %d ke repository...\n", id)

	// --- PERUBAHAN CARA MEMANGGIL REPOSITORY ---
	// Tidak lagi memodifikasi struct, langsung teruskan ID dan input
	updatedYear, err := h.repository.Update(id, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui tahun ajaran"})
		return
	}

	c.JSON(http.StatusOK, updatedYear)
}

// --- FUNGSI LAINNYA TETAP SAMA (TIDAK PERLU DIUBAH) ---
func (h *handler) GetAllAcademicYears(c *gin.Context) {
	years, err := h.repository.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tahun ajaran"})
		return
	}
	c.JSON(http.StatusOK, years)
}
func (h *handler) CreateAcademicYear(c *gin.Context) {
	var input AcademicYearInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}
	academicYear := AcademicYear{
		SekolahID:       1,
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
