package fase

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type handler struct {
	repository Repository
}

// NewHandler creates a new handler for phases
func NewHandler(repository Repository) *handler {
	return &handler{repository}
}

// GetFasesByCurriculumID handles fetching phases for a specific curriculum
func (h *handler) GetFasesByCurriculumID(c *gin.Context) {
	kurikulumID, err := strconv.Atoi(c.Param("kurikulumID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid curriculum ID"})
		return
	}

	fases, err := h.repository.FindByCurriculumID(kurikulumID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch fases"})
		return
	}
	c.JSON(http.StatusOK, fases)
}

// CreateFase handles the creation of a new phase
func (h *handler) CreateFase(c *gin.Context) {
	var fase Fase
	if err := c.ShouldBindJSON(&fase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	newFase, err := h.repository.Create(fase)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create fase"})
		return
	}
	c.JSON(http.StatusCreated, newFase)
}

// UpdateFase handles updating an existing phase
func (h *handler) UpdateFase(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid phase ID"})
		return
	}

	var fase Fase
	if err := c.ShouldBindJSON(&fase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Make sure the ID from URL param is used
	fase.ID = uint(id)

	updatedFase, err := h.repository.Update(fase)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update fase"})
		return
	}
	c.JSON(http.StatusOK, updatedFase)
}

// DeleteFase handles the deletion of a phase
func (h *handler) DeleteFase(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid phase ID"})
		return
	}

	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete fase"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Fase deleted successfully"})
}
