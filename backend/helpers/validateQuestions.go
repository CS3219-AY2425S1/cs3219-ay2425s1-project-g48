package helper

import (
	"backend/models"
	"context"

	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// Parse question object to be put in db
func ParseQuestionForDb(question *models.Question) {
	question.Complexity = strings.ToLower(question.Complexity)
	question.Title	= strings.ToLower(question.Title)
}


// Validation functions for questions
func IsQuestionFieldsEmpty(question *models.Question) bool {
	return question.Title != "" && question.Description != "" &&
		question.Categories != "" && question.Complexity != "" && question.Link != ""
}


func IsValidComplexity(question *models.Question) bool {
	complexity := question.Complexity

	complexity = strings.ToLower(complexity)

	if complexity == "easy" || complexity == "medium" || complexity == "hard" {
		return true
	}

	return false
}

func HasDuplicateTitle(question *models.Question, coll *mongo.Collection, ctx context.Context) bool {
	var db_question models.Question

	err := coll.FindOne(ctx, bson.M{"title": strings.ToLower(question.Title)}).Decode(&db_question)
	
	return err != nil 
}

