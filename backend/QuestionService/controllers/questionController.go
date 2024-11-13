package controllers

import (
	"backend/database"
	helper "backend/helpers"
	"backend/models"
	"log"

	"context"
	"encoding/json"
	"fmt"
	"net/http"
	// "strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// var database.Coll *mongo.Collection = database.OpenCollection(database.Client, "question_db", "questions")

func GetQuestions(c *gin.Context) {

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)

	defer cancel()

	fmt.Println("database: ", database.Coll)

	// Retrieve documents
	cursor, err := database.Coll.Find(ctx, bson.M{})
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

func GetQuestionsById(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
    defer cancel()

    idsParam := c.Query("id")
    if idsParam == "" {
        c.JSON(http.StatusBadRequest, gin.H{"message": "ID parameter is required"})
        return
    }

    id, err := primitive.ObjectIDFromHex(idsParam)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid question id; should be a valid ObjectID"})
        return
    }

    filter := bson.M{"_id": id}
    curr, err := database.Coll.Find(ctx, filter)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    var results []models.Question
    for curr.Next(ctx) {
        var question models.Question
        if err := curr.Decode(&question); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        results = append(results, question)
    }

    if len(results) == 0 {
        c.JSON(http.StatusNotFound, gin.H{"message": "No question found with the provided ID"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Questions retrieved successfully", "questions": results})
}

func AddQuestionToDb() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var question models.Question

		if err := c.ShouldBindJSON(&question); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		question.ID = primitive.NewObjectID()

		// Validate required fields
		if !helper.IsQuestionFieldsEmpty(&question) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
			return
		}

		if !helper.IsValidComplexity(&question) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Complexity should be either easy, medium or hard"})
			return
		}

		if !helper.HasDuplicateTitle(&question, database.Coll, ctx) {
			c.JSON(http.StatusConflict, gin.H{"error": "Question with the same title already exists"})
			return
		}

		helper.ParseQuestionForDb(&question)
		// helper.CreateUniqueIdQuestion(&question)

		_, err := database.Coll.InsertOne(ctx, question)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add question to the database"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Question added successfully",
		})
	}
}

func AddLeetCodeQuestionToDb() gin.HandlerFunc {
    return func(c *gin.Context) {
        var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
        defer cancel()

        var LeetCodeAPIRequest models.LeetCodeAPIRequest

        // Bind incoming JSON request
        if err := c.ShouldBindJSON(&LeetCodeAPIRequest); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
            return
        }

        titleSlug := strings.ToLower(strings.ReplaceAll(LeetCodeAPIRequest.Title, " ", "-"))

        // Fetch question from the API
        apiUrl := fmt.Sprintf("https://alfa-leetcode-api.onrender.com/select?titleSlug=%s", titleSlug)
        resp, err := http.Get(apiUrl)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch question from API"})
            return
        }
        defer resp.Body.Close()

        // Define a map to parse the API response
        var apiResponse map[string]interface{}
        if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse API response"})
            return
        }

        // Extract the "question" field from the API response
        questionDescription, ok := apiResponse["question"].(string)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract question description"})
            return
        }

        // Extract and concatenate the categories from "topicTags"
        topicTags, ok := apiResponse["topicTags"].([]interface{})
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract topic tags"})
            return
        }

        var categories []string
        for _, tag := range topicTags {
            tagMap, ok := tag.(map[string]interface{})
            if ok {
                if name, found := tagMap["name"].(string); found {
                    categories = append(categories, name)
                }
            }
        }

        // Extract "difficulty" for Complexity
        difficulty, ok := apiResponse["difficulty"].(string)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract difficulty"})
            return
        }

        // Extract the link
        link, ok := apiResponse["link"].(string)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract question link"})
            return
        }

        // Create the question object
        question := models.Question{
            ID:          primitive.NewObjectID(),
            Title:       LeetCodeAPIRequest.Title,
            Description: questionDescription,
            Categories:  categories,
            Complexity:  difficulty,
            Link:        link,
        }

        // Check for duplicate title
        if !helper.HasDuplicateTitle(&question, database.Coll, ctx) {
			c.JSON(http.StatusConflict, gin.H{"error": "Question with the same title already exists"})
			return
		}

        // Parse question before inserting into the database
        helper.ParseQuestionForDb(&question)

        // Insert the question into the database
        _, err = database.Coll.InsertOne(ctx, question)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add question to the database"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Question added successfully", "question": question})
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

	log.Printf("Updated Question: %+v\n", updatedQuestion)

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

	result, err := database.Coll.UpdateOne(ctx, filter, update)
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

func GetTopics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	// Aggregation pipeline to get unique topics with unique difficulties
	pipeline := mongo.Pipeline{
		{{"$unwind", bson.D{{"path", "$categories"}}}},
		{{"$group", bson.D{
			{"_id", "$categories"},
			{"difficulties", bson.D{{"$addToSet", "$complexity"}}},
		}}},
	}

	// Execute the aggregation
	cursor, err := database.Coll.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch topics", "details": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	// Process results into a response structure
	var topics []bson.M
	if err = cursor.All(ctx, &topics); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse topics", "details": err.Error()})
		return
	}

	if len(topics) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No topics found", "topics": []gin.H{}})
		return
	}

	// Format the result for JSON response
	var response []gin.H
	for _, topic := range topics {
		response = append(response, gin.H{
			"topic":       topic["_id"],
			"difficulties": topic["difficulties"],
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "Topics retrieved successfully", "topics": response})
}

func DeleteQuestion(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	id := c.Query("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}
	
	objectId, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid question id"})
		return
	}

	filter := bson.M{"_id": objectId}
	result, err := database.Coll.DeleteOne(ctx, filter)

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


func AssignQuestion(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	type AssignRequest struct {
		Category   string `json:"category"`
		Complexity string `json:"complexity"`
	}

	var assignRequest AssignRequest

	if err := c.ShouldBindJSON(&assignRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	filter := bson.M{"$and": []bson.M{
		{"complexity": strings.ToLower(assignRequest.Complexity)},
		{"categories": bson.M{"$in": []string{strings.ToLower(assignRequest.Category)}}},
	}}

	cursor, err := database.Coll.Find(ctx, filter)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var questionIDs []primitive.ObjectID

	for cursor.Next(ctx) {
		var question struct {
			ID primitive.ObjectID `bson:"_id"`
		}
		if err := cursor.Decode(&question); err == nil {
			questionIDs = append(questionIDs, question.ID)
		}
	}

	if len(questionIDs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No matching questions found"})
		return
	}

	ind := helper.GenerateRandomIndex(len(questionIDs))

	log.Println("ind", ind)
	c.JSON(http.StatusOK, gin.H{"message": "Question assigned successfully", "question_id": questionIDs[ind]})
}