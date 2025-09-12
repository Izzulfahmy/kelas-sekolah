package fase

import "kelas-sekolah/backend/internal/tingkatan"

// Fase merepresentasikan model untuk fase kurikulum
type Fase struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	KurikulumID int    `gorm:"column:kurikulum_id;not null" json:"kurikulum_id"`
	NamaFase    string `gorm:"column:nama_fase;not null" json:"nama_fase"`
	Deskripsi   string `gorm:"column:deskripsi" json:"deskripsi"`
	// Definisikan relasi Many-to-Many ke Tingkatan
	Tingkatans []tingkatan.Tingkatan `gorm:"many2many:pemetaan_fase_kurikulum;joinForeignKey:FaseID;joinReferences:TingkatanID" json:"tingkatans,omitempty"`
}

// TableName menentukan nama tabel untuk model Fase
func (Fase) TableName() string {
	return "fase"
}
