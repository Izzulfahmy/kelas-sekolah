package educationlevel

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

// GET /education-levels
func (h *handler) GetAllEducationLevels(c *gin.Context) {
	levels, err := h.repository.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch education levels"})
		return
	}
	c.JSON(http.StatusOK, levels)
}

// POST /education-levels
func (h *handler) CreateEducationLevel(c *gin.Context) {
	var level EducationLevel
	if err := c.ShouldBindJSON(&level); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	newLevel, err := h.repository.Create(level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create education level"})
		return
	}
	c.JSON(http.StatusCreated, newLevel)
}

// PUT /education-levels/:id
func (h *handler) UpdateEducationLevel(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var level EducationLevel
	if err := c.ShouldBindJSON(&level); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	level.ID = uint(id)
	updatedLevel, err := h.repository.Update(level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update education level"})
		return
	}
	c.JSON(http.StatusOK, updatedLevel)
}

// DELETE /education-levels/:id
func (h *handler) DeleteEducationLevel(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete education level"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Education level deleted successfully"})
}
