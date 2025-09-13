package kelas

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

// --- Input Structs ---
type KelasInput struct {
	NamaKelas     string `json:"nama_kelas" binding:"required"`
	TahunAjaranID int    `json:"tahun_ajaran_id" binding:"required"`
	TingkatanID   int    `json:"tingkatan_id" binding:"required"`
	WaliKelasID   *int   `json:"wali_kelas_id"`
}
type AnggotaInput struct {
	// PERBAIKAN: Mengubah tipe data menjadi []uint
	SiswaIDs []uint `json:"siswa_ids"`
}
type PengajarInput struct {
	GuruID          int `json:"guru_id" binding:"required"`
	MataPelajaranID int `json:"mata_pelajaran_id" binding:"required"`
}

// --- Handlers ---
func (h *handler) GetAllKelas(c *gin.Context) {
	tahunAjaranIDStr := c.Query("tahun_ajaran_id")
	if tahunAjaranIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tahun_ajaran_id query parameter is required"})
		return
	}
	tahunAjaranID, err := strconv.Atoi(tahunAjaranIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tahun_ajaran_id"})
		return
	}

	kelas, err := h.repository.FindAllByTahunAjaran(tahunAjaranID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch kelas"})
		return
	}
	c.JSON(http.StatusOK, kelas)
}

func (h *handler) GetKelasByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	kelas, err := h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kelas not found"})
		return
	}
	c.JSON(http.StatusOK, kelas)
}

func (h *handler) CreateKelas(c *gin.Context) {
	var input KelasInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	k := Kelas{
		SekolahID:     1,
		NamaKelas:     input.NamaKelas,
		TahunAjaranID: input.TahunAjaranID,
		TingkatanID:   input.TingkatanID,
		WaliKelasID:   input.WaliKelasID,
	}

	newKelas, err := h.repository.Create(k)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create kelas"})
		return
	}
	c.JSON(http.StatusCreated, newKelas)
}

func (h *handler) UpdateKelas(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var input KelasInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	k, err := h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kelas not found"})
		return
	}

	k.NamaKelas = input.NamaKelas
	k.TingkatanID = input.TingkatanID
	k.WaliKelasID = input.WaliKelasID
	// Tahun Ajaran tidak diubah saat edit

	updatedKelas, err := h.repository.Update(k)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update kelas"})
		return
	}
	c.JSON(http.StatusOK, updatedKelas)
}

func (h *handler) DeleteKelas(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete kelas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kelas deleted successfully"})
}

func (h *handler) UpdateAnggotaKelas(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var input AnggotaInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := h.repository.UpdateAnggota(id, input.SiswaIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update class members"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Class members updated successfully"})
}

func (h *handler) AddPengajarKelas(c *gin.Context) {
	kelasID, _ := strconv.Atoi(c.Param("id"))
	var input PengajarInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p := PengajarKelas{
		KelasID:         kelasID,
		GuruID:          input.GuruID,
		MataPelajaranID: input.MataPelajaranID,
	}
	newPengajar, err := h.repository.AddPengajar(p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add teacher to class"})
		return
	}
	c.JSON(http.StatusCreated, newPengajar)
}

func (h *handler) RemovePengajarKelas(c *gin.Context) {
	pengajarID, _ := strconv.Atoi(c.Param("pengajarId"))
	if err := h.repository.RemovePengajar(pengajarID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove teacher from class"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Teacher removed from class successfully"})
}
