// kelas-sekolah/backend/internal/school/handler.go

package school

import (
	"kelas-sekolah/backend/internal/educationlevel"
	"net/http"

	"github.com/gin-gonic/gin"
)

type handler struct {
	repository Repository
}

func NewHandler(repository Repository) *handler {
	return &handler{repository}
}

// Struct input ini tidak lagi mengandung 'KepalaSekolah'
type UpdateProfileInput struct {
	NamaSekolah   string `json:"nama_sekolah"`
	NPSN          string `json:"npsn"`
	JenjangID     *uint  `json:"jenjang_id"`
	Naungan       string `json:"naungan"`
	Alamat        string `json:"alamat"`
	Kelurahan     string `json:"kelurahan"`
	Kecamatan     string `json:"kecamatan"`
	KotaKabupaten string `json:"kota_kabupaten"`
	Provinsi      string `json:"provinsi"`
	KodePos       string `json:"kode_pos"`
	Telepon       string `json:"telepon"`
	Email         string `json:"email"`
	Website       string `json:"website"`
}

func (h *handler) GetSchoolProfile(c *gin.Context) {
	profile, err := h.repository.GetProfile()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "School profile not found"})
		return
	}
	c.JSON(http.StatusOK, profile)
}

func (h *handler) UpdateSchoolProfile(c *gin.Context) {
	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	existingProfile, err := h.repository.GetProfile()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "School profile not found"})
		return
	}

	// Update field dari input, KECUALI kepala sekolah
	existingProfile.NamaSekolah = input.NamaSekolah
	existingProfile.NPSN = input.NPSN
	existingProfile.JenjangID = input.JenjangID
	existingProfile.Naungan = input.Naungan
	existingProfile.Alamat = input.Alamat
	existingProfile.Kelurahan = input.Kelurahan
	existingProfile.Kecamatan = input.Kecamatan
	existingProfile.KotaKabupaten = input.KotaKabupaten
	existingProfile.Provinsi = input.Provinsi
	existingProfile.KodePos = input.KodePos
	existingProfile.Telepon = input.Telepon
	existingProfile.Email = input.Email
	existingProfile.Website = input.Website

	// Kosongkan relasi Jenjang untuk memastikan GORM menggunakan JenjangID
	existingProfile.Jenjang = educationlevel.EducationLevel{}

	updatedProfile, err := h.repository.UpdateProfile(existingProfile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, updatedProfile)
}
