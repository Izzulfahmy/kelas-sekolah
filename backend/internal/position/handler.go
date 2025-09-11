package position

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

func (h *handler) GetAllPositions(c *gin.Context) {
	positions, err := h.repository.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch positions"})
		return
	}
	c.JSON(http.StatusOK, positions)
}

func (h *handler) CreatePosition(c *gin.Context) {
	var pos Position
	if err := c.ShouldBindJSON(&pos); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	// Set sekolah_id default
	pos.SekolahID = 1
	newPos, err := h.repository.Create(pos)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create position"})
		return
	}
	c.JSON(http.StatusCreated, newPos)
}

func (h *handler) UpdatePosition(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var pos Position
	if err := c.ShouldBindJSON(&pos); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	pos.ID = uint(id)
	pos.SekolahID = 1
	updatedPos, err := h.repository.Update(pos)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update position"})
		return
	}
	c.JSON(http.StatusOK, updatedPos)
}

func (h *handler) DeletePosition(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.repository.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete position"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Position deleted successfully"})
}
