package extracurricular

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

func (h *handler) GetAllExtracurriculars(c *gin.Context) {
	items, err := h.repository.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch extracurriculars"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func (h *handler) CreateExtracurricular(c *gin.Context) {
	var item Extracurricular
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	item.SekolahID = 1
	newItem, err := h.repository.Create(item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create extracurricular"})
		return
	}
	c.JSON(http.StatusCreated, newItem)
}

func (h *handler) UpdateExtracurricular(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var item Extracurricular
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	item.ID = uint(id)
	item.SekolahID = 1
	updatedItem, err := h.repository.Update(item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update extracurricular"})
		return
	}
	c.JSON(http.StatusOK, updatedItem)
}

func (h *handler) DeleteExtracurricular(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete extracurricular"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Extracurricular deleted successfully"})
}
