package kelas

import (
	"gorm.io/gorm"
)

type Repository interface {
	FindAllByTahunAjaran(tahunAjaranID int) ([]Kelas, error)
	FindByID(ID int) (Kelas, error)
	Create(kelas Kelas) (Kelas, error)
	Update(kelas Kelas) (Kelas, error)
	Delete(ID int) error
	UpdateAnggota(kelasID int, siswaIDs []uint) error
	AddPengajar(pengajar PengajarKelas) (PengajarKelas, error)
	RemovePengajar(ID int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *repository {
	return &repository{db}
}

// FindAllByTahunAjaran mengambil semua kelas untuk tahun ajaran tertentu
func (r *repository) FindAllByTahunAjaran(tahunAjaranID int) ([]Kelas, error) {
	var k []Kelas
	// PERBAIKAN: Menambahkan Preload untuk memuat data relasi yang dibutuhkan di daftar
	err := r.db.
		Preload("TahunAjaran").
		Preload("Tingkatan").
		Preload("WaliKelas").
		Where("tahun_ajaran_id = ?", tahunAjaranID).
		Order("nama_kelas asc").
		Find(&k).Error

	if err != nil {
		return k, err
	}

	// Menghitung jumlah siswa untuk setiap kelas secara terpisah
	for i := range k {
		var count int64
		r.db.Model(&AnggotaKelas{}).Where("kelas_id = ?", k[i].ID).Count(&count)
		k[i].JumlahSiswa = uint(count)
	}

	return k, nil
}

// FindByID mengambil satu kelas dengan semua relasi detailnya
func (r *repository) FindByID(ID int) (Kelas, error) {
	var k Kelas
	err := r.db.
		Preload("TahunAjaran").
		Preload("Tingkatan").
		Preload("WaliKelas").
		Preload("AnggotaKelas.Siswa"). // ✅ sekarang valid, karena AnggotaKelas punya field Siswa
		Preload("PengajarKelas.Guru").
		Preload("PengajarKelas.MataPelajaran").
		First(&k, ID).Error
	return k, err
}

func (r *repository) Create(kelas Kelas) (Kelas, error) {
	err := r.db.Create(&kelas).Error
	if err != nil {
		return kelas, err
	}
	// Muat ulang untuk mendapatkan data relasi
	return r.FindByID(int(kelas.ID))
}

func (r *repository) Update(kelas Kelas) (Kelas, error) {
	// Omit relasi agar tidak terupdate secara tidak sengaja
	err := r.db.Omit("AnggotaKelas", "PengajarKelas").Save(&kelas).Error
	if err != nil {
		return kelas, err
	}
	return r.FindByID(int(kelas.ID))
}

func (r *repository) Delete(ID int) error {
	return r.db.Delete(&Kelas{}, ID).Error
}

func (r *repository) UpdateAnggota(kelasID int, siswaIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("kelas_id = ?", kelasID).Delete(&AnggotaKelas{}).Error; err != nil {
			return err
		}
		if len(siswaIDs) > 0 {
			var newAnggota []AnggotaKelas
			for _, siswaID := range siswaIDs {
				newAnggota = append(newAnggota, AnggotaKelas{KelasID: uint(kelasID), SiswaID: siswaID})
			}
			if err := tx.Create(&newAnggota).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *repository) AddPengajar(pengajar PengajarKelas) (PengajarKelas, error) {
	err := r.db.Create(&pengajar).Error
	if err != nil {
		return pengajar, err
	}
	err = r.db.Preload("Guru").Preload("MataPelajaran").First(&pengajar, pengajar.ID).Error
	return pengajar, err
}

func (r *repository) RemovePengajar(ID int) error {
	return r.db.Delete(&PengajarKelas{}, ID).Error
}
