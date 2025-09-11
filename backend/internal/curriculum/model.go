package curriculum

type Curriculum struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	SekolahID     int    `gorm:"column:sekolah_id" json:"sekolah_id"`
	NamaKurikulum string `gorm:"column:nama_kurikulum;unique;not null" json:"nama_kurikulum"`
	Deskripsi     string `gorm:"column:deskripsi" json:"deskripsi"`
}

func (Curriculum) TableName() string { return "kurikulum" }
