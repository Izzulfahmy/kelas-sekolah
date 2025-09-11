package position

type Position struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	SekolahID   int    `gorm:"column:sekolah_id" json:"sekolah_id"`
	NamaJabatan string `gorm:"column:nama_jabatan;unique;not null" json:"nama_jabatan"`
}

func (Position) TableName() string {
	return "jabatan"
}
