package extracurricular

type Extracurricular struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	SekolahID int    `gorm:"column:sekolah_id" json:"sekolah_id"`
	NamaEskul string `gorm:"column:nama_eskul;not null" json:"nama_eskul"`
	Kategori  string `gorm:"column:kategori" json:"kategori"`
	Deskripsi string `gorm:"column:deskripsi" json:"deskripsi"`
}

func (Extracurricular) TableName() string { return "eskul" }
