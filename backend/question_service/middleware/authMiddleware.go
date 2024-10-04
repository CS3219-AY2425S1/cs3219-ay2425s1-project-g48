package middleware

import (
	"fmt"
	"net/http"

	helper "backend/helpers"

	"github.com/gin-gonic/gin"
)

// Authz validates token and authorizes users
func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("Authenticating")
		var clientToken string = c.Request.Header.Get("token")

		if clientToken == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("No Authorization header provided")})
			c.Abort()
			return
		}

		claims, err := helper.ValidateToken(clientToken)

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

		// Stores the user information in the context
		// c.Set("email", claims.Email)
		// c.Set("username", claims.Username)
		c.Set("uid", claims.Uid)

		c.Next()
	}
}
