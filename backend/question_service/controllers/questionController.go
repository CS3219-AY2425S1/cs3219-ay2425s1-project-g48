package controllers

import (
	"backend/database"
	helper "backend/helpers"
	"backend/models"

	"context"
	"fmt"

	// "log"
	"strconv"
	"strings"

	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var coll *mongo.Collection = database.OpenCollection(database.Client, "question_db", "questions")

func GetQuestions() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)

		defer cancel()

		fmt.Println(coll)

		// Retrieve documents
		cursor, err := coll.Find(ctx, bson.M{})
		if err != nil {
			fmt.Println("Error in Find: ", err.Error())
			panic(err)
		}

		// Unpack the cursor into slice
		var questions []models.Question
		if err = cursor.All(context.Background(), &questions); err != nil {
			fmt.Println("Error in cursor.All: ", err.Error())
			panic(err)
		}

		if questions == nil {
			questions = []models.Question{}
		}

		c.JSON(http.StatusOK, questions)
	}
}

func GetQuestionsById(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	idsParam := c.Query("id")
	idsString := strings.Split(idsParam, ",")

	if len(idsString) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Need to have at least one question id in params"})
	}

	// Convert string ids to int
	ids := make([]int, len(idsString))

	for i, idstr := range idsString {
		id, err := strconv.Atoi(idstr)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid question id should be only be integers"})
			return
		}

		ids[i] = id
	}

	// var questions []models.Question

	filter := bson.M{"_id": bson.M{"$in": ids}}

	curr, err := coll.Find(ctx, filter)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	 var results []map[string]interface{}
    
    for curr.Next(context.TODO()) {
        var question models.Question
        err := curr.Decode(&question)
        if err != nil {
            return
        }
        
        // Convert ObjectID to string
        result := map[string]interface{}{
            "ID":          question.ID.Hex(),  // Convert ObjectID to string
            "Title":       question.Title,
            "Description": question.Description,
            "Categories":  question.Categories,
            "Complexity":  question.Complexity,
            "Link":        question.Link,
        }
        
        results = append(results, result)
    }

	// curr.All(ctx, &questions)
	c.JSON(http.StatusOK, gin.H{"message": "Questions retrieve successfully", "questions": results})
}

func AddQuestionToDb() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var QuestionRequest models.QuestionRequest

		if err := c.ShouldBindJSON(&QuestionRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		var question models.Question = models.Question{
			ID:          primitive.NewObjectID(),
			Title:       QuestionRequest.Title,
			Description: QuestionRequest.Description,
			Categories:  QuestionRequest.Categories,
			Complexity:  QuestionRequest.Complexity,
			Link:        QuestionRequest.Link,
		}

		// Validate required fields
		if !helper.IsQuestionFieldsEmpty(&question) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
			return
		}

		if !helper.IsValidComplexity(&question) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Complexity should be either easy, medium or hard"})
			return
		}

		if !helper.HasDuplicateTitle(&question, coll, ctx) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Question with the same title already exists"})
			return
		}

		helper.ParseQuestionForDb(&question)
		// helper.CreateUniqueIdQuestion(&question)

		_, err := coll.InsertOne(ctx, question)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add question to the database"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Question added successfully",
		})
	}
}

func UpdateQuestion(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var updatedQuestion models.Question
	if err := c.ShouldBindJSON(&updatedQuestion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	fmt.Printf("Updated Question: %+v\n", updatedQuestion)

	filter := bson.M{"_id": updatedQuestion.ID}
	update := bson.M{
		"$set": bson.M{
			"title":       updatedQuestion.Title,
			"description": updatedQuestion.Description,
			"categories":  updatedQuestion.Categories,
			"complexity":  updatedQuestion.Complexity,
			"link":        updatedQuestion.Link,
		},
	}

	result, err := coll.UpdateOne(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating question", "error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question updated successfully"})
}

func DeleteQuestion(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	// var jsonBody map[string]string
	// if err := c.ShouldBindJSON(&jsonBody); err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
	// 	return
	// }

	id := c.Query("id")

	if id == "" {
 		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	// id, exists := jsonBody["_id"]
	// if !exists {
	// 	c.JSON(http.StatusBadRequest, gin.H{"message": "Missing '_id' field in request body"})
	// 	return
	// }

	objectId, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid question id"})
		return
	} 

	filter := bson.M{"_id": objectId}
	result, err := coll.DeleteOne(ctx, filter)

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Question not found"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting question", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question deleted successfully"})
}
