package matapelajaran

type MataPelajaran struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	SekolahID int    `gorm:"column:sekolah_id" json:"sekolah_id"`
	KodeMapel string `gorm:"column:kode_mapel;unique;not null" json:"kode_mapel"`
	NamaMapel string `gorm:"column:nama_mapel;not null" json:"nama_mapel"`
}

func (MataPelajaran) TableName() string { return "mata_pelajaran" }
