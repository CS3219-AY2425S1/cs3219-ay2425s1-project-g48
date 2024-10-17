package main

import (
	"os"

	routes "backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	frontend := os.Getenv("FRONTEND_URL")

	if port == "" {
		port = "3002"
	}

	router := gin.New()
	router.Use(gin.Logger())

	// Apply CORS middleware with custom configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontend}, // Ensure it matches your frontend port
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	//router.Use(middleware.Authentication())
	routes.QuestionRoutes(router) // Creates Question api routes
	router.Run(":" + port)
}
