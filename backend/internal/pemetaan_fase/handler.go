package pemetaan_fase

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type handler struct {
	repository Repository
}

func NewHandler(repository Repository) *handler {
	return &handler{repository}
}

// UpdateMappingsByFaseID menangani pembaruan pemetaan tingkatan untuk sebuah fase
func (h *handler) UpdateMappingsByFaseID(c *gin.Context) {
	// Baca parameter ":id" dari URL
	faseID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Fase ID"})
		return
	}

	var input struct {
		TingkatanIDs []uint `json:"tingkatan_ids"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	err = h.repository.UpdateMappingsByFaseID(faseID, input.TingkatanIDs)
	if err != nil {
		// Tambahkan log untuk mencatat error detail di konsol backend
		log.Printf("ERROR: Gagal memperbarui pemetaan untuk faseID %d: %v", faseID, err)

		// Berikan respons yang lebih spesifik jika fase tidak ditemukan
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Fase dengan ID yang diberikan tidak ditemukan"})
			return
		}

		// Untuk error lainnya, kembalikan error server internal
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan saat memperbarui pemetaan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mappings updated successfully"})
}
