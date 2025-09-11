package curriculum

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

func (h *handler) GetAllCurriculums(c *gin.Context) {
	curriculums, err := h.repository.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch curriculums"})
		return
	}
	c.JSON(http.StatusOK, curriculums)
}

func (h *handler) CreateCurriculum(c *gin.Context) {
	var curr Curriculum
	if err := c.ShouldBindJSON(&curr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	curr.SekolahID = 1 // Set default
	newCurr, err := h.repository.Create(curr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create curriculum"})
		return
	}
	c.JSON(http.StatusCreated, newCurr)
}

func (h *handler) UpdateCurriculum(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var curr Curriculum
	if err := c.ShouldBindJSON(&curr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	curr.ID = uint(id)
	curr.SekolahID = 1
	updatedCurr, err := h.repository.Update(curr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update curriculum"})
		return
	}
	c.JSON(http.StatusOK, updatedCurr)
}

func (h *handler) DeleteCurriculum(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete curriculum"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Curriculum deleted successfully"})
}
