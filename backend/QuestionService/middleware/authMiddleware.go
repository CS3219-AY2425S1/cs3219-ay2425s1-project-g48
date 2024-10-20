package middleware

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)


type Response struct {
	Message string `json:"message"`
}

// Authz validates token and authorizes users
func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		AUTH_URL := os.Getenv("AUTH_URL");

		clientToken := c.Request.Header.Get("Authorization")
		strArr := strings.Split(clientToken, "Bearer ")

		if clientToken == "" || len(strArr) < 2 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{ "message": "No token found" }})
			c.Abort()
			return
		}

		bearer := "Bearer " + strArr[1]

		req, err := http.NewRequest("GET", AUTH_URL, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{ "message": err.Error() }})
			c.Abort()
			return
		}

		req.Header.Add("Authorization", bearer)

		client := &http.Client{}
		resp, err := client.Do(req)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{ "message": err.Error() }})
			c.Abort()
			return
		}

		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {	
			respBytes, _ := io.ReadAll(resp.Body)
			var response Response
			err := json.Unmarshal(respBytes, &response)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{ "message": err.Error() }})
				c.Abort()
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{ "message": response.Message }})	
			c.Abort()
		}

		c.Next()
	}	
}
