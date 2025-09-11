// kelas-sekolah/backend/internal/academicyear/repository.go

package academicyear

import (
	"gorm.io/gorm"
)

// Repository mendefinisikan interface untuk operasi database pada AcademicYear
type Repository interface {
	Create(year AcademicYear) (AcademicYear, error)
	FindAll() ([]AcademicYear, error)
	FindByID(ID int) (AcademicYear, error)
	// --- PERUBAHAN TANDA TANGAN FUNGSI ---
	Update(id int, input AcademicYearInput) (AcademicYear, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository membuat instance baru dari repository
func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(year AcademicYear) (AcademicYear, error) {
	err := r.db.Create(&year).Error
	if err != nil {
		return year, err
	}
	err = r.db.Preload("KepalaSekolah").First(&year, year.ID).Error
	return year, err
}

func (r *repository) FindAll() ([]AcademicYear, error) {
	var years []AcademicYear
	err := r.db.Preload("KepalaSekolah").Order("id desc").Find(&years).Error
	return years, err
}

func (r *repository) FindByID(ID int) (AcademicYear, error) {
	var year AcademicYear
	err := r.db.Preload("KepalaSekolah").Where("id = ?", ID).First(&year).Error
	return year, err
}

// --- FUNGSI UPDATE YANG SEPENUHNYA DITULIS ULANG ---
func (r *repository) Update(id int, input AcademicYearInput) (AcademicYear, error) {
	var year AcademicYear

	// 1. Buat map untuk menampung data update secara eksplisit
	updateData := map[string]interface{}{
		"nama_tahun_ajaran": input.NamaTahunAjaran,
		"semester":          input.Semester,
		"status":            input.Status,
		"metode_absensi":    input.MetodeAbsensi,
		"kepala_sekolah_id": input.KepalaSekolahID,
	}

	// 2. Lakukan update menggunakan map tersebut
	// Ini adalah cara paling direct dan anti-gagal untuk update di GORM
	err := r.db.Model(&AcademicYear{}).Where("id = ?", id).Updates(updateData).Error
	if err != nil {
		return year, err
	}

	// 3. Muat ulang data yang sudah diupdate untuk dikirim sebagai respons
	err = r.db.Preload("KepalaSekolah").First(&year, id).Error
	return year, err
}

func (r *repository) Delete(ID int) error {
	return r.db.Delete(&AcademicYear{}, ID).Error
}
