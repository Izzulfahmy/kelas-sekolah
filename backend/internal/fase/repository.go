package fase

import "gorm.io/gorm"

// Repository defines the interface for phase data operations
type Repository interface {
	Create(fase Fase) (Fase, error)
	FindByCurriculumID(kurikulumID int) ([]Fase, error)
	FindByID(ID int) (Fase, error)
	Update(fase Fase) (Fase, error)
	Delete(ID int) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new instance of the repository
func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

func (r *repository) Create(fase Fase) (Fase, error) {
	err := r.db.Create(&fase).Error
	return fase, err
}

func (r *repository) FindByCurriculumID(kurikulumID int) ([]Fase, error) {
	var fases []Fase
	err := r.db.Where("kurikulum_id = ?", kurikulumID).Order("id asc").Find(&fases).Error
	return fases, err
}

func (r *repository) FindByID(ID int) (Fase, error) {
	var fase Fase
	err := r.db.First(&fase, ID).Error
	return fase, err
}

func (r *repository) Update(fase Fase) (Fase, error) {
	err := r.db.Save(&fase).Error
	return fase, err
}

func (r *repository) Delete(ID int) error {
	return r.db.Delete(&Fase{}, ID).Error
}
