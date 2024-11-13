package helper

import (
	"math/rand"
	"time"
)
var r = rand.New(rand.NewSource(time.Now().UnixNano()))

func GenerateRandomIndex(size int) int{
	// Generate random index 
	return r.Intn(size)
}  
