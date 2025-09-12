package main

import (
	"fmt"
	"kelas-sekolah/backend/config"
	"kelas-sekolah/backend/internal/academicyear"
	"kelas-sekolah/backend/internal/auth"
	"kelas-sekolah/backend/internal/curriculum"
	"kelas-sekolah/backend/internal/educationlevel"
	"kelas-sekolah/backend/internal/extracurricular"
	"kelas-sekolah/backend/internal/fase" // <-- IMPORT BARU
	"kelas-sekolah/backend/internal/matapelajaran"
	"kelas-sekolah/backend/internal/middleware"
	"kelas-sekolah/backend/internal/position"
	"kelas-sekolah/backend/internal/profile"
	"kelas-sekolah/backend/internal/school"
	"kelas-sekolah/backend/internal/student"
	"kelas-sekolah/backend/internal/teacher"
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
	faseRepository := fase.NewRepository(db) // <-- REPO BARU
	matapelajaranRepository := matapelajaran.NewRepository(db)
	extracurricularRepository := extracurricular.NewRepository(db)
	academicYearRepository := academicyear.NewRepository(db)

	// Inisialisasi Service
	authService := auth.NewService(userRepository, teacherRepository, studentRepository)

	// Inisialisasi Handler
	userHandler := user.NewHandler(userRepository)
	teacherHandler := teacher.NewHandler(teacherRepository, userRepository)
	studentHandler := student.NewHandler(studentRepository, userRepository)
	educationLevelHandler := educationlevel.NewHandler(educationLevelRepository)
	positionHandler := position.NewHandler(positionRepository)
	curriculumHandler := curriculum.NewHandler(curriculumRepository)
	faseHandler := fase.NewHandler(faseRepository) // <-- HANDLER BARU
	matapelajaranHandler := matapelajaran.NewHandler(matapelajaranRepository)
	extracurricularHandler := extracurricular.NewHandler(extracurricularRepository)
	academicYearHandler := academicyear.NewHandler(academicYearRepository)
	authHandler := auth.NewHandler(authService)
	profileHandler := profile.NewHandler(userRepository)
	schoolHandler := school.NewHandler(schoolRepository)

	r := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))

	// Rute API Publik
	api := r.Group("/api")
	{
		api.POST("/register", authHandler.RegisterUser)
		api.POST("/login", authHandler.Login)
	}

	// Rute API Terproteksi (Untuk Semua Role yang Login)
	authenticatedApi := r.Group("/api")
	authenticatedApi.Use(middleware.AuthMiddleware())
	{
		authenticatedApi.GET("/profile/me", profileHandler.GetMyProfile)
		authenticatedApi.GET("/school-profile", schoolHandler.GetSchoolProfile)
	}

	// Rute API Terproteksi (Khusus Admin)
	adminApi := r.Group("/api")
	adminApi.Use(middleware.AuthMiddleware("admin"))
	{
		// Manajemen user
		adminApi.GET("/users", userHandler.GetUsersByRole)
		adminApi.POST("/users", userHandler.CreateUser)
		adminApi.PUT("/users/:id", userHandler.UpdateUser)
		adminApi.DELETE("/users/:id", userHandler.DeleteUser)
		adminApi.PUT("/users/:id/reset-password", userHandler.ResetPassword)

		// Manajemen profil sekolah
		adminApi.PUT("/school-profile", schoolHandler.UpdateSchoolProfile)

		// Manajemen guru
		adminApi.GET("/teachers", teacherHandler.GetAllTeachers)
		adminApi.POST("/teachers", teacherHandler.CreateTeacher)
		adminApi.PUT("/teachers/:id", teacherHandler.UpdateTeacher)
		adminApi.DELETE("/teachers/:id", teacherHandler.DeleteTeacher)

		// Manajemen siswa
		adminApi.GET("/students", studentHandler.GetAllStudents)
		adminApi.POST("/students", studentHandler.CreateStudent)
		adminApi.PUT("/students/:id", studentHandler.UpdateStudent)
		adminApi.DELETE("/students/:id", studentHandler.DeleteStudent)

		// Jenjang pendidikan
		adminApi.GET("/education-levels", educationLevelHandler.GetAllEducationLevels)
		adminApi.POST("/education-levels", educationLevelHandler.CreateEducationLevel)
		adminApi.PUT("/education-levels/:id", educationLevelHandler.UpdateEducationLevel)
		adminApi.DELETE("/education-levels/:id", educationLevelHandler.DeleteEducationLevel)

		// Jabatan
		adminApi.GET("/positions", positionHandler.GetAllPositions)
		adminApi.POST("/positions", positionHandler.CreatePosition)
		adminApi.PUT("/positions/:id", positionHandler.UpdatePosition)
		adminApi.DELETE("/positions/:id", positionHandler.DeletePosition)

		// --- RUTE MANAJEMEN AKADEMIK ---
		// Kurikulum
		adminApi.GET("/curriculums", curriculumHandler.GetAllCurriculums)
		adminApi.POST("/curriculums", curriculumHandler.CreateCurriculum)
		adminApi.PUT("/curriculums/:id", curriculumHandler.UpdateCurriculum)
		adminApi.DELETE("/curriculums/:id", curriculumHandler.DeleteCurriculum)

		// Fase (terikat pada kurikulum) <-- RUTE BARU
		adminApi.GET("/curriculums/:kurikulumID/fases", faseHandler.GetFasesByCurriculumID)
		adminApi.POST("/fases", faseHandler.CreateFase)
		adminApi.PUT("/fases/:id", faseHandler.UpdateFase)
		adminApi.DELETE("/fases/:id", faseHandler.DeleteFase)

		// Mata Pelajaran
		adminApi.GET("/mata-pelajaran", matapelajaranHandler.GetAllMataPelajaran)
		adminApi.POST("/mata-pelajaran", matapelajaranHandler.CreateMataPelajaran)
		adminApi.PUT("/mata-pelajaran/:id", matapelajaranHandler.UpdateMataPelajaran)
		adminApi.DELETE("/mata-pelajaran/:id", matapelajaranHandler.DeleteMataPelajaran)

		// Ekstrakurikuler
		adminApi.GET("/extracurriculars", extracurricularHandler.GetAllExtracurriculars)
		adminApi.POST("/extracurriculars", extracurricularHandler.CreateExtracurricular)
		adminApi.PUT("/extracurriculars/:id", extracurricularHandler.UpdateExtracurricular)
		adminApi.DELETE("/extracurriculars/:id", extracurricularHandler.DeleteExtracurricular)

		// Tahun Ajaran (Academic Year)
		adminApi.GET("/academic-years", academicYearHandler.GetAllAcademicYears)
		adminApi.POST("/academic-years", academicYearHandler.CreateAcademicYear)
		adminApi.PUT("/academic-years/:id", academicYearHandler.UpdateAcademicYear)
		adminApi.DELETE("/academic-years/:id", academicYearHandler.DeleteAcademicYear)
	}

	// Buat admin default jika belum ada
	CreateAdminIfNeeded(userRepository, teacherRepository, studentRepository)

	r.Run(":8080")
}

// Buat admin default jika belum ada
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
