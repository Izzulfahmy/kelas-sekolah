package main

import (
	"fmt"
	"kelas-sekolah/backend/config"
	"kelas-sekolah/backend/internal/academicyear"
	"kelas-sekolah/backend/internal/auth"
	"kelas-sekolah/backend/internal/curriculum"
	"kelas-sekolah/backend/internal/educationlevel"
	"kelas-sekolah/backend/internal/extracurricular"
	"kelas-sekolah/backend/internal/fase"
	"kelas-sekolah/backend/internal/kelas" // <-- Import package baru
	"kelas-sekolah/backend/internal/matapelajaran"
	"kelas-sekolah/backend/internal/middleware"
	"kelas-sekolah/backend/internal/pemetaan_fase"
	"kelas-sekolah/backend/internal/position"
	"kelas-sekolah/backend/internal/profile"
	"kelas-sekolah/backend/internal/school"
	"kelas-sekolah/backend/internal/student"
	"kelas-sekolah/backend/internal/teacher"
	"kelas-sekolah/backend/internal/tingkatan"
	"kelas-sekolah/backend/internal/user"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDB()
	db := config.DB

	// Inisialisasi Repository
	userRepository := user.NewRepository(db)
	schoolRepository := school.NewRepository(db)
	teacherRepository := teacher.NewRepository(db)
	studentRepository := student.NewRepository(db)
	educationLevelRepository := educationlevel.NewRepository(db)
	positionRepository := position.NewRepository(db)
	curriculumRepository := curriculum.NewRepository(db)
	faseRepository := fase.NewRepository(db)
	tingkatanRepository := tingkatan.NewRepository(db)
	pemetaanFaseRepository := pemetaan_fase.NewRepository(db)
	matapelajaranRepository := matapelajaran.NewRepository(db)
	extracurricularRepository := extracurricular.NewRepository(db)
	academicYearRepository := academicyear.NewRepository(db)
	kelasRepository := kelas.NewRepository(db) // <-- Inisialisasi repo baru

	// Inisialisasi Service
	authService := auth.NewService(userRepository, teacherRepository, studentRepository)

	// Inisialisasi Handler
	authHandler := auth.NewHandler(authService)
	userHandler := user.NewHandler(userRepository)
	schoolHandler := school.NewHandler(schoolRepository)
	teacherHandler := teacher.NewHandler(teacherRepository, userRepository)
	studentHandler := student.NewHandler(studentRepository, userRepository)
	educationLevelHandler := educationlevel.NewHandler(educationLevelRepository)
	positionHandler := position.NewHandler(positionRepository)
	curriculumHandler := curriculum.NewHandler(curriculumRepository)
	faseHandler := fase.NewHandler(faseRepository)
	tingkatanHandler := tingkatan.NewHandler(tingkatanRepository)
	pemetaanFaseHandler := pemetaan_fase.NewHandler(pemetaanFaseRepository)
	matapelajaranHandler := matapelajaran.NewHandler(matapelajaranRepository)
	extracurricularHandler := extracurricular.NewHandler(extracurricularRepository)
	academicYearHandler := academicyear.NewHandler(academicYearRepository)
	profileHandler := profile.NewHandler(userRepository)
	kelasHandler := kelas.NewHandler(kelasRepository) // <-- Inisialisasi handler baru

	r := gin.Default()
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))

	api := r.Group("/api")
	{
		api.POST("/register", authHandler.RegisterUser)
		api.POST("/login", authHandler.Login)
	}

	adminApi := r.Group("/api")
	adminApi.Use(middleware.AuthMiddleware("admin"))
	{
		adminApi.GET("/profile/me", profileHandler.GetMyProfile)
		adminApi.GET("/school-profile", schoolHandler.GetSchoolProfile)
		adminApi.PUT("/school-profile", schoolHandler.UpdateSchoolProfile)

		adminApi.GET("/users", userHandler.GetUsersByRole)
		adminApi.POST("/users", userHandler.CreateUser)
		adminApi.PUT("/users/:id", userHandler.UpdateUser)
		adminApi.DELETE("/users/:id", userHandler.DeleteUser)
		adminApi.PUT("/users/:id/reset-password", userHandler.ResetPassword)
		adminApi.GET("/teachers", teacherHandler.GetAllTeachers)
		adminApi.POST("/teachers", teacherHandler.CreateTeacher)
		adminApi.PUT("/teachers/:id", teacherHandler.UpdateTeacher)
		adminApi.DELETE("/teachers/:id", teacherHandler.DeleteTeacher)
		adminApi.GET("/students", studentHandler.GetAllStudents)
		adminApi.POST("/students", studentHandler.CreateStudent)
		adminApi.PUT("/students/:id", studentHandler.UpdateStudent)
		adminApi.DELETE("/students/:id", studentHandler.DeleteStudent)
		adminApi.GET("/education-levels", educationLevelHandler.GetAllEducationLevels)
		adminApi.POST("/education-levels", educationLevelHandler.CreateEducationLevel)
		adminApi.PUT("/education-levels/:id", educationLevelHandler.UpdateEducationLevel)
		adminApi.DELETE("/education-levels/:id", educationLevelHandler.DeleteEducationLevel)
		adminApi.GET("/positions", positionHandler.GetAllPositions)
		adminApi.POST("/positions", positionHandler.CreatePosition)
		adminApi.PUT("/positions/:id", positionHandler.UpdatePosition)
		adminApi.DELETE("/positions/:id", positionHandler.DeletePosition)
		adminApi.GET("/curriculums", curriculumHandler.GetAllCurriculums)
		adminApi.POST("/curriculums", curriculumHandler.CreateCurriculum)
		adminApi.PUT("/curriculums/:id", curriculumHandler.UpdateCurriculum)
		adminApi.DELETE("/curriculums/:id", curriculumHandler.DeleteCurriculum)
		adminApi.POST("/fases", faseHandler.CreateFase)
		adminApi.PUT("/fases/:id", faseHandler.UpdateFase)
		adminApi.DELETE("/fases/:id", faseHandler.DeleteFase)
		adminApi.GET("/mata-pelajaran", matapelajaranHandler.GetAllMataPelajaran)
		adminApi.POST("/mata-pelajaran", matapelajaranHandler.CreateMataPelajaran)
		adminApi.PUT("/mata-pelajaran/:id", matapelajaranHandler.UpdateMataPelajaran)
		adminApi.DELETE("/mata-pelajaran/:id", matapelajaranHandler.DeleteMataPelajaran)
		adminApi.GET("/extracurriculars", extracurricularHandler.GetAllExtracurriculars)
		adminApi.POST("/extracurriculars", extracurricularHandler.CreateExtracurricular)
		adminApi.PUT("/extracurriculars/:id", extracurricularHandler.UpdateExtracurricular)
		adminApi.DELETE("/extracurriculars/:id", extracurricularHandler.DeleteExtracurricular)
		adminApi.GET("/academic-years", academicYearHandler.GetAllAcademicYears)
		adminApi.POST("/academic-years", academicYearHandler.CreateAcademicYear)
		adminApi.PUT("/academic-years/:id", academicYearHandler.UpdateAcademicYear)
		adminApi.DELETE("/academic-years/:id", academicYearHandler.DeleteAcademicYear)

		adminApi.GET("/tingkatans", tingkatanHandler.GetAllTingkatans)
		adminApi.POST("/tingkatans", tingkatanHandler.CreateTingkatan)
		adminApi.PUT("/tingkatans/:id", tingkatanHandler.UpdateTingkatan)
		adminApi.DELETE("/tingkatans/:id", tingkatanHandler.DeleteTingkatan)

		adminApi.PUT("/fases/:id/mappings", pemetaanFaseHandler.UpdateMappingsByFaseID)

		// --- Rute Baru untuk Manajemen Kelas ---
		adminApi.GET("/kelas", kelasHandler.GetAllKelas)
		adminApi.GET("/kelas/:id", kelasHandler.GetKelasByID)
		adminApi.POST("/kelas", kelasHandler.CreateKelas)
		adminApi.PUT("/kelas/:id", kelasHandler.UpdateKelas)
		adminApi.DELETE("/kelas/:id", kelasHandler.DeleteKelas)
		adminApi.PUT("/kelas/:id/anggota", kelasHandler.UpdateAnggotaKelas)
		adminApi.POST("/kelas/:id/pengajar", kelasHandler.AddPengajarKelas)
		adminApi.DELETE("/kelas/:id/pengajar/:pengajarId", kelasHandler.RemovePengajarKelas)
	}

	CreateAdminIfNeeded(userRepository, teacherRepository, studentRepository)
	r.Run(":8080")
}

func CreateAdminIfNeeded(userRepo user.Repository, teacherRepo teacher.Repository, studentRepo student.Repository) {
	_, err := userRepo.FindByUsername("admin")
	if err != nil {
		tempAuthService := auth.NewService(userRepo, teacherRepo, studentRepo)
		registerInput := auth.RegisterInput{
			Nama:     "Admin Utama",
			Username: "admin",
			Password: "adminpassword",
			Role:     "admin",
		}
		adminUser, _ := tempAuthService.RegisterUser(registerInput)
		if adminUser.ID != 0 {
			fmt.Println("Admin user created successfully!")
		}
	}
}
