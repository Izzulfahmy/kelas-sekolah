package fase

// Fase represents the model for a curriculum phase
type Fase struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	KurikulumID int    `gorm:"column:kurikulum_id;not null" json:"kurikulum_id"`
	NamaFase    string `gorm:"column:nama_fase;not null" json:"nama_fase"`
	Deskripsi   string `gorm:"column:deskripsi" json:"deskripsi"`
}

// TableName specifies the table name for the Fase model
func (Fase) TableName() string {
	return "fase"
}
