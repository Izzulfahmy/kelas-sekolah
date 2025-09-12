package curriculum

import "kelas-sekolah/backend/internal/fase"

// Curriculum represents the model for a curriculum.
type Curriculum struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	SekolahID     int         `gorm:"column:sekolah_id" json:"sekolah_id"`
	NamaKurikulum string      `gorm:"column:nama_kurikulum;unique;not null" json:"nama_kurikulum"`
	Deskripsi     string      `gorm:"column:deskripsi" json:"deskripsi"`
	Fases         []fase.Fase `gorm:"foreignKey:KurikulumID" json:"fases,omitempty"` // Tambahkan ini
}

// TableName specifies the table name for the Curriculum model.
func (Curriculum) TableName() string {
	return "kurikulum"
}
