package educationlevel

type EducationLevel struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	NamaJenjang string `gorm:"column:nama_jenjang;unique;not null" json:"nama_jenjang"`
}

func (EducationLevel) TableName() string {
	return "jenjang_pendidikan"
}
