package user

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type handler struct {
	repository Repository
}

// Kembalikan NewHandler seperti semula
func NewHandler(repository Repository) *handler {
	return &handler{repository}
}

// Struct untuk input JSON saat membuat user baru dari panel admin
type CreateUserInput struct {
	Nama     string `json:"nama" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// Fungsi CreateUser sekarang hanya membuat user, tanpa logika tambahan
func (h *handler) CreateUser(c *gin.Context) {
	var input CreateUserInput
	err := c.ShouldBindJSON(&input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	newUser := User{
		Nama:     input.Nama,
		Username: input.Username,
		Role:     Role(input.Role),
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.MinCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	newUser.Password = string(passwordHash)

	createdUser, err := h.repository.Save(newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdUser)
}

func (h *handler) GetUsersByRole(c *gin.Context) {
	role := c.Query("role")
	if role == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role query parameter is required"})
		return
	}

	users, err := h.repository.FindByRole(role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// Struct untuk input update
type UpdateUserInput struct {
	Nama     string `json:"nama"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *handler) UpdateUser(c *gin.Context) {
	idString := c.Param("id")
	id, _ := strconv.Atoi(idString)

	var input UpdateUserInput
	err := c.ShouldBindJSON(&input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	user, err := h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if input.Nama != "" {
		user.Nama = input.Nama
	}
	if input.Username != "" {
		user.Username = input.Username
	}
	if input.Password != "" {
		passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.MinCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		user.Password = string(passwordHash)
	}

	updatedUser, err := h.repository.Update(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, updatedUser)
}

// --- Perbarui Struct Input ResetPassword ---
type ResetPasswordInput struct {
	Username    string `json:"username"`     // Bisa update username
	NewPassword string `json:"new_password"` // Bisa update password
}

// --- Perbarui Logika ResetPassword ---
func (h *handler) ResetPassword(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var input ResetPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	userToUpdate, err := h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Jika username baru diisi dan berbeda dari yang lama
	if input.Username != "" && input.Username != userToUpdate.Username {
		// Cek apakah username baru sudah dipakai akun lain
		_, err := h.repository.FindByUsername(input.Username)
		if err == nil { // jika tidak error, berarti username sudah ada
			c.JSON(http.StatusConflict, gin.H{"error": "Maaf, username sudah ada !"})
			return
		}
		// Jika aman, update username
		userToUpdate.Username = input.Username
	}

	// Jika password baru diisi
	if input.NewPassword != "" {
		passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.MinCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
			return
		}
		userToUpdate.Password = string(passwordHash)
	}

	// Simpan perubahan
	_, err = h.repository.Update(userToUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Credentials updated successfully"})
}

func (h *handler) DeleteUser(c *gin.Context) {
	idString := c.Param("id")
	id, _ := strconv.Atoi(idString)

	_, err := h.repository.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	err = h.repository.Delete(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
