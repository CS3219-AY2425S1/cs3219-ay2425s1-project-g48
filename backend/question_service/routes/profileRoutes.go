package routes

import (
	controller "backend/controllers"

	"github.com/gin-gonic/gin"
)

func ProfileRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.GET("/v1/profile", controller.GetUserProfile)
	incomingRoutes.POST("/v1/edituser", controller.EditUsername)
	incomingRoutes.POST("/v1/editquestions", controller.AddQuestionsToProfile)
}
