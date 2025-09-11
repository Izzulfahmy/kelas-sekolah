package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func AuthMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is missing"})
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Failed to parse claims"})
			return
		}

		// --- PERUBAHAN 1: Simpan User ID ke context ---
		// Kita ubah user_id dari float64 (default JSON) ke int
		userID := int(claims["user_id"].(float64))
		c.Set("userID", userID)

		// --- PERUBAHAN 2: Logika Pengecekan Role ---
		// Jika allowedRoles tidak kosong, lakukan pengecekan role
		if len(allowedRoles) > 0 {
			role, ok := claims["role"].(string)
			if !ok {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Role not found in token"})
				return
			}

			isAllowed := false
			for _, allowedRole := range allowedRoles {
				if role == allowedRole {
					isAllowed = true
					break
				}
			}

			if !isAllowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "You are not authorized to access this resource"})
				return
			}
		}

		c.Next()
	}
}
