package main

import (
	"backend/controllers"
	"backend/initialiser"
	"context"

	"github.com/gin-gonic/gin"
)

func main() {
	initialiser.ConnectToDb()

	r := gin.Default()

	defer func() {
		if err := initialiser.Client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()

	r.POST("/signup", controllers.SignUp)

	r.Run(":8080")
}
