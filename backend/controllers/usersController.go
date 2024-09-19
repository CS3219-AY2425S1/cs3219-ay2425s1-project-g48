package controllers

import (
	"backend/initialiser"
	"backend/model"
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SignUp(c *gin.Context) {
	var user model.User
	fmt.Println("Mongo", initialiser.Client)
	coll := initialiser.Client.Database("user_db").Collection("user_accounts")

	fmt.Println("coll", coll)
	// Create user object from JSON
	if err := c.BindJSON(&user); err != nil {
		return
	}

	// Insert user into database
	_, err := coll.InsertOne(context.TODO(), user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, user)
}
