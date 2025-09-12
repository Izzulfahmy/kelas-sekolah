package tingkatan

// Tingkatan represents the model for a school grade level.
type Tingkatan struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	SekolahID     int    `gorm:"column:sekolah_id" json:"sekolah_id"`
	NamaTingkatan string `gorm:"column:nama_tingkatan;not null" json:"nama_tingkatan"`
	Urutan        int    `gorm:"column:urutan" json:"urutan"`
}

func (Tingkatan) TableName() string {
	return "tingkatan"
}
