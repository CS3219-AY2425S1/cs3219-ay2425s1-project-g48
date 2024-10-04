package controllers

import (
	"context"
	"fmt"
	"log"
	"os"

	"net/http"
	"net/smtp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"backend/database"

	helper "backend/helpers"
	models "backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user_db", "user_accounts")
var validate = validator.New()

// HashPassword is used to encrypt the password before it is stored in the DB
func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Panic(err)
	}

	return string(bytes)
}

// VerifyPassword checks the input password while verifying it with the passward in the DB.
func VerifyPassword(userPassword string, providedPassword string) (bool, string) {
	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
	check := true
	msg := ""

	if err != nil {
		msg = fmt.Sprintf("Password is incorrect")
		check = false
	}

	return check, msg
}

// UpdatePasswordInDatabase updates the password to new password in database
func UpdatePasswordInDatabase(userID string, newPassword string) error {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userID}
	update := bson.D{
		{"$set", bson.D{{"password", newPassword}, {"updated_at", time.Now()}}},
	}

	_, err := userCollection.UpdateOne(ctx, filter, update)
	return err
}

// to send the reset email (Replace this with real email service)
func SendResetEmail(email string, token string) {
	resetLink := "http://localhost:8080/v1/verify-reset?token=" + token

	// Replace with your SMTP settings (this is just an example using a basic SMTP server)
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	authEmail := "noreply.peerprep@gmail.com"
	authPassword := "aezo ivmc mihq wqii"

	// Email message body
	subject := "Subject: Password Reset Request\n"
	body := "To reset your password, please click the following link: " + resetLink + "\n"
	msg := subject + "\n" + body

	// Set up authentication information.
	auth := smtp.PlainAuth("", authEmail, authPassword, smtpHost)

	// Send the email
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, authEmail, []string{email}, []byte(msg))
	if err != nil {
		fmt.Println("Failed to send email:", err)
	} else {
		fmt.Println("Reset email sent to:", email)
	}
}

// CreateUser is the api used to tget a single user
func SignUp() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var user models.User

		defer cancel()

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email}) // checks for duplicate emails
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occured while checking for the email"})
			return
		}

		password := HashPassword(user.Password)
		user.Password = password

		if count > 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "this email already exists"})
			return
		}

		user.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.ID = primitive.NewObjectID()
		user.User_id = user.ID.Hex()
		token, refreshToken, _ := helper.GenerateAllTokens(user.Email, user.Username, user.User_id)
		// user.Token = token
		user.Refresh_token = refreshToken

		_, insertErr := userCollection.InsertOne(ctx, user)
		if insertErr != nil {
			msg := fmt.Sprintf("User item was not created")
			c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
			return
		}
		defer cancel()

		// send a message to user, successfully created user
		c.JSON(http.StatusOK, gin.H{"message": "User: " + user.Username + " created successfully", "token": token})

	}
}

// Login is the api used to get a single user
func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var user models.User
		var foundUser models.User

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser) // finds user with corresponding email from coll

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Email not found"})
			return
		}

		passwordIsValid, msg := VerifyPassword(user.Password, foundUser.Password)

		if !passwordIsValid {
			c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
			return
		}

		// Generates a new token and refresh token each time on login
		token, refreshToken, _ := helper.GenerateAllTokens(foundUser.Email, foundUser.Username, foundUser.User_id)

		c.Set("uid", foundUser.User_id)

		helper.UpdateAllTokens(token, refreshToken, foundUser.User_id)

		c.JSON(http.StatusOK, gin.H{"message": "User logged in successfully", "token": token, "refreshToken": refreshToken})
	}
}

func Logout() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		userId, exists := c.Get("uid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID not found"})
			return
		}

		userIdStr, ok := userId.(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID type"})
			return
		}

		var targetUser models.User
		err := userCollection.FindOne(ctx, bson.M{"user_id": userIdStr}).Decode(&targetUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding user"})
			return
		}

		if targetUser.Refresh_token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User is already logged out"})
			return
		}

		_, err = userCollection.UpdateOne(
			ctx,
			bson.M{"user_id": userIdStr},
			bson.M{"$set": bson.M{"refresh_token": ""}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error logging out"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
  }
}

// Email verification is the api that handles user email confirmation
func EmailVerification() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req helper.EmailVerificationRequest

		// Bind the request body
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
			return
		}

		// Check if the email exists in the database
		var user models.User
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		err := userCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
		if err != nil {
			// Return success even if the email isn't found (to prevent enumeration attacks)
			log.Print("email not found")
			c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a reset link will be sent"})
			return
		}

		// Generate a reset token (short expiration time)
		resetToken, err := helper.GenerateResetTokens(user.Email, user.Username, user.User_id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating reset token"})
			return
		}

		// Save the token to MongoDB with an expiration time (1 hour)
		//helper.UpdateAllTokens(token, refreshToken, user.User_id)

		SendResetEmail(user.Email, resetToken)

		c.JSON(http.StatusOK, gin.H{"message": "Reset link sent successfully"})
	}
}

func VerifyResetToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from query parameters
		var token string = c.Query("token")

		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No token provided"})
			c.Abort()
			return
		}

		claims, err := helper.ValidateToken(token)

		if err != "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			c.Abort()
			return
		}

		if claims == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			c.Abort()
			return
		}

		redirect_url := os.Getenv("FRONTEND_URL") + "/reset-password?token=" + token

		log.Print("Redirecting to: ", redirect_url)

		// Reroute to the frontend page
		c.Redirect(http.StatusFound, redirect_url)
	}
}

// Reset password is the api to update new password
func ResetPassword() gin.HandlerFunc {
	return func(c *gin.Context) {

		user, exists := c.Get("uid")

		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
			return
		}

		uid := user.(string)

		// Bind the new password from JSON body
		var req struct {
			NewPassword string `json:"new_password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		// Hash the new password
		hashedPassword := HashPassword(req.NewPassword)

		fmt.Println("Error in cursor.All: ", uid)
		// Update user password and updated_at fields
		if err := UpdatePasswordInDatabase(uid, hashedPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Password update failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
	}
}

func RefreshToken(c *gin.Context) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	var refreshToken string = c.Request.Header.Get("refresh_token")
	var targetUser models.User

	if refreshToken == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No refresh token provided"})
	}

	refreshClaims, err := helper.ParseToken(refreshToken)

	fmt.Println("refreshClaims", refreshClaims.Uid)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	// Check if refresh token has expired
	if refreshClaims.ExpiresAt.Time.Before(time.Now()) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Refresh token has expired"})
		return
	}

	// Validate refresh token with backend
	err = userCollection.FindOne(ctx, bson.M{"user_id": refreshClaims.Uid}).Decode(&targetUser) // finds user with corresponding email from coll

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	if refreshToken != targetUser.Refresh_token {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid refresh token"})
		return
	}

	token, _, err := helper.GenerateAllTokens(targetUser.Email, targetUser.Username, targetUser.User_id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Generated new access token", "token": token})
}
