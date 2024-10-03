package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Question struct {
	ID          primitive.ObjectID `bson:"_id"`
	Title       string   `bson:"title"`
	Description string   `bson:"description"`
	Categories  string   `bson:"categories"`
	Complexity  string   `bson:"complexity"`
	Link        string   `bson:"link"`
}


type QuestionRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Categories  string   `json:"categories"`
	Complexity  string   `json:"complexity"`
	Link        string   `json:"link"`
}
