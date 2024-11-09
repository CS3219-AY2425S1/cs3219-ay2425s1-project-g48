package main

import (
	"os"

	routes "backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	// frontend := os.Getenv("FRONTEND_URL")
	// match := os.Getenv("MATCH_URL")

	if port == "" {
		port = "3002"
	}

	router := gin.New()
	router.Use(gin.Logger())

	// Apply CORS middleware with custom configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Ensure it matches your frontend port
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	// get page for route /
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to Question Service blah blah",
		})
	})

	//router.Use(middleware.Authentication())
	routes.QuestionRoutes(router) // Creates Question api routes
	router.Run(":" + port)
}
