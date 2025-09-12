package pemetaan_fase

// PemetaanFaseKurikulum merepresentasikan tabel penghubung (junction table).
// Struct ini sekarang mencerminkan desain database yang benar.
type PemetaanFaseKurikulum struct {
	KurikulumID uint `gorm:"primaryKey"`
	TingkatanID uint `gorm:"primaryKey"`
	FaseID      uint `gorm:"not null"`
}

// TableName menentukan nama tabel.
func (PemetaanFaseKurikulum) TableName() string {
	return "pemetaan_fase_kurikulum"
}
