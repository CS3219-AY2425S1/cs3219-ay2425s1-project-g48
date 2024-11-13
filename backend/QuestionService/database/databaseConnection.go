package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DBinstance func
func DBinstance() *mongo.Client {
	err := godotenv.Load(".env") // Load .env file
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	
	env := os.Getenv("ENV")
	var uri string; 
	if env == "PROD" {
		uri = os.Getenv("MONGODB_CLOUD_URI")
	} else {
		uri = os.Getenv("MONGODB_LOCAL_URI") 
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second) // timeout if does not connect within 10 seconds

	client, err := mongo.Connect(ctx, options.Client().
		ApplyURI(uri))

	defer cancel()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to MongoDB!")

	return client
}

// Client Database instance
var client *mongo.Client = DBinstance()

var Coll *mongo.Collection = client.Database("question_db").Collection("questions") 

