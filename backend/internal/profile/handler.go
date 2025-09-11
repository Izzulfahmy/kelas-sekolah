package profile

import (
	"kelas-sekolah/backend/internal/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

type handler struct {
	userRepository user.Repository
}

func NewHandler(userRepository user.Repository) *handler {
	return &handler{userRepository}
}

func (h *handler) GetMyProfile(c *gin.Context) {
	// Ambil userID dari context yang sudah di-set oleh middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	// Cari user di database berdasarkan ID
	foundUser, err := h.userRepository.FindByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	c.JSON(http.StatusOK, foundUser)
}
