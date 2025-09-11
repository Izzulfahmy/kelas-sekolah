package academicyear

import "gorm.io/gorm"

// Repository mendefinisikan interface untuk operasi database pada AcademicYear
type Repository interface {
	Create(year AcademicYear) (AcademicYear, error)
	FindAll() ([]AcademicYear, error)
	FindByID(ID int) (AcademicYear, error)
	Update(year AcademicYear) (AcademicYear, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository membuat instance baru dari repository
func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

// Create menyimpan data tahun ajaran baru ke database
func (r *repository) Create(year AcademicYear) (AcademicYear, error) {
	err := r.db.Create(&year).Error
	if err != nil {
		return year, err
	}
	// Muat ulang data beserta relasi KepalaSekolah untuk dikirim sebagai respons
	err = r.db.Preload("KepalaSekolah").First(&year, year.ID).Error
	return year, err
}

// FindAll mengambil semua data tahun ajaran dengan data kepala sekolahnya
func (r *repository) FindAll() ([]AcademicYear, error) {
	var years []AcademicYear
	// Gunakan Preload untuk melakukan JOIN ke tabel 'guru'
	err := r.db.Preload("KepalaSekolah").Order("id desc").Find(&years).Error
	return years, err
}

// FindByID mencari satu tahun ajaran berdasarkan ID
func (r *repository) FindByID(ID int) (AcademicYear, error) {
	var year AcademicYear
	err := r.db.Preload("KepalaSekolah").Where("id = ?", ID).First(&year).Error
	return year, err
}

// Update memperbarui data tahun ajaran di database
func (r *repository) Update(year AcademicYear) (AcademicYear, error) {
	err := r.db.Save(&year).Error
	if err != nil {
		return year, err
	}
	// Muat ulang data beserta relasi KepalaSekolah
	err = r.db.Preload("KepalaSekolah").First(&year, year.ID).Error
	return year, err
}

// Delete menghapus data tahun ajaran dari database
func (r *repository) Delete(ID int) error {
	return r.db.Delete(&AcademicYear{}, ID).Error
}
