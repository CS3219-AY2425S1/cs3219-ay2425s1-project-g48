package controllers

import (
	"backend/models"
	"context"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetUserProfile(c *gin.Context) {
	user_id, exists := c.Get("uid")
	user := models.User{}

	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	err := userCollection.FindOne(context.TODO(), bson.M{"user_id": user_id}).Decode(&user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userToReturn := models.VisibleUser{
		Username:       user.Username,
		Email:          user.Email,
		User_id:        user.User_id,
		Questions_done: user.Questions_done,
	}

	c.JSON(http.StatusOK, userToReturn)
}

func EditUsername(c *gin.Context) {
	user_id, exists := c.Get("uid")

	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	var new_username struct {
		Username string `json:"username" binding:"required"`
	}

	err := c.BindJSON(&new_username)

	if err != nil {
		if new_username.Username == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username cannot be empty"})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	filter := bson.M{"user_id": user_id}
	update := bson.M{"$set": new_username}

	result, err := userCollection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update user information", "error": err.Error()})
		return
	}

	log.Printf("Updated %v Documents!\n", result.ModifiedCount)
	c.JSON(http.StatusOK, gin.H{"message": "Username updated successfully"})
}

func AddQuestionsToProfile(c *gin.Context) {
	user_id, exists := c.Get("uid")

	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	var questions struct {
		Questions []int `json:"questions" binding:"required"`
	}

	err := c.BindJSON(&questions)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	filter := bson.M{"user_id": user_id}
	update := bson.M{"$push": bson.M{"questions_done": bson.M{"$each": questions.Questions}}}

	result, err := userCollection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update user information", "error": err.Error()})
		return
	}

	log.Printf("Updated %v Documents!\n", result.ModifiedCount)
	c.JSON(http.StatusOK, gin.H{"message": "Questions updated successfully"})
}
