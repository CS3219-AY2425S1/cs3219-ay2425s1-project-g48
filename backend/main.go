package main

import (
    "os"

    middleware "backend/middleware"
    routes "backend/routes"

    "github.com/gin-gonic/gin"
)

func main() {
    port := os.Getenv("PORT")

    if port == "" {
        port = "8000"
    }

    router := gin.New()
    router.Use(gin.Logger())
    routes.UserRoutes(router)

    router.Use(middleware.Authentication())


	// defer func() {
	// 	if err := database.Client.Disconnect(context.TODO()); err != nil {
	// 		panic(err)
	// 	}
	// }()

    // API-1
    router.GET("/api-2", func(c *gin.Context) {
        c.JSON(200, gin.H{"success": "Access granted for api-2"})
    })

    router.Run(":" + port)
}