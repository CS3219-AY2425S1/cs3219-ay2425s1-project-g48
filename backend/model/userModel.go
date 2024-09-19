package model

type User struct {
	Email    string `bson:"email,omitempty"`
	Password string `bson:"password,omitempty"`
}
