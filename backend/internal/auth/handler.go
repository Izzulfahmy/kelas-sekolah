package auth

import (
	"kelas-sekolah/backend/config"
	"kelas-sekolah/backend/internal/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{service}
}

// Struct untuk menampung input dari JSON
type RegisterInput struct {
	Nama     string `json:"nama" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	// --- PERBAIKAN: Tambahkan spasi di antara tag ---
	Password string `json:"password" binding:"required"`
}

func (h *handler) RegisterUser(c *gin.Context) {
	var input RegisterInput

	err := c.ShouldBindJSON(&input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if input.Role != "siswa" && input.Role != "guru" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role for registration"})
		return
	}

	newUser, err := h.service.RegisterUser(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful", "user": newUser})
}

func (h *handler) Login(c *gin.Context) {
	var input LoginInput

	err := c.ShouldBindJSON(&input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	token, err := h.service.Login(input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	loggedInUser, _ := user.NewRepository(config.DB).FindByUsername(input.Username)

	c.JSON(http.StatusOK, gin.H{"token": token, "role": loggedInUser.Role})
}
