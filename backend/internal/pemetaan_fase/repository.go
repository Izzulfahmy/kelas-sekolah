package pemetaan_fase

import (
	"kelas-sekolah/backend/internal/fase"
	"kelas-sekolah/backend/internal/tingkatan"

	"gorm.io/gorm"
)

type Repository interface {
	FindTingkatansByFaseID(faseID int) ([]tingkatan.Tingkatan, error)
	UpdateMappingsByFaseID(faseID int, tingkatanIDs []uint) error
}
type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository { return &repository{db} }

func (r *repository) FindTingkatansByFaseID(faseID int) ([]tingkatan.Tingkatan, error) {
	var tingkatans []tingkatan.Tingkatan
	// Query ini tetap valid karena hanya mengambil tingkatan berdasarkan fase_id
	err := r.db.
		Joins("JOIN pemetaan_fase_kurikulum pfk ON pfk.tingkatan_id = tingkatan.id").
		Where("pfk.fase_id = ?", faseID).
		Order("tingkatan.urutan asc").
		Find(&tingkatans).Error
	return tingkatans, err
}

// UpdateMappingsByFaseID sekarang mengimplementasikan logika yang benar
func (r *repository) UpdateMappingsByFaseID(faseID int, tingkatanIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Langkah 1: Ambil data Fase untuk mendapatkan kurikulum_id terkait.
		var existingFase fase.Fase
		if err := tx.First(&existingFase, faseID).Error; err != nil {
			// Jika fase tidak ditemukan, batalkan transaksi.
			return err
		}
		kurikulumID := existingFase.KurikulumID

		// Langkah 2: Hapus semua pemetaan lama yang terkait dengan kurikulum DAN tingkatan yang ada di fase ini.
		// Ini lebih aman daripada hanya menghapus berdasarkan fase_id.
		var oldTingkatanIDs []uint
		tx.Model(&PemetaanFaseKurikulum{}).Where("fase_id = ?", faseID).Pluck("tingkatan_id", &oldTingkatanIDs)
		if len(oldTingkatanIDs) > 0 {
			if err := tx.Where("kurikulum_id = ? AND tingkatan_id IN ?", kurikulumID, oldTingkatanIDs).Delete(&PemetaanFaseKurikulum{}).Error; err != nil {
				return err
			}
		}

		// Langkah 3: Jika ada tingkatan baru yang dikirim, buat data pemetaan yang baru.
		if len(tingkatanIDs) > 0 {
			var newMappings []PemetaanFaseKurikulum
			for _, tID := range tingkatanIDs {
				newMappings = append(newMappings, PemetaanFaseKurikulum{
					KurikulumID: uint(kurikulumID),
					TingkatanID: tID,
					FaseID:      uint(faseID),
				})
			}

			// Langkah 4: Masukkan semua data pemetaan baru ke dalam database.
			if err := tx.Create(&newMappings).Error; err != nil {
				return err
			}
		}

		// Jika semua langkah berhasil, commit transaksi.
		return nil
	})
}
