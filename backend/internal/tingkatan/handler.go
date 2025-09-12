package tingkatan

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

func (h *handler) GetAllTingkatans(c *gin.Context) {
	tingkatans, err := h.repository.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch grade levels"})
		return
	}
	c.JSON(http.StatusOK, tingkatans)
}

func (h *handler) CreateTingkatan(c *gin.Context) {
	var tingkatan Tingkatan
	if err := c.ShouldBindJSON(&tingkatan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	newTingkatan, err := h.repository.Create(tingkatan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create grade level"})
		return
	}
	c.JSON(http.StatusCreated, newTingkatan)
}

func (h *handler) UpdateTingkatan(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var tingkatan Tingkatan
	if err := c.ShouldBindJSON(&tingkatan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	tingkatan.ID = uint(id)
	updatedTingkatan, err := h.repository.Update(tingkatan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update grade level"})
		return
	}
	c.JSON(http.StatusOK, updatedTingkatan)
}

func (h *handler) DeleteTingkatan(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete grade level"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Grade level deleted successfully"})
}
