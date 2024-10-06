package routes

import (
	controller "backend/controllers"

	"github.com/gin-gonic/gin"
)

// UserRoutes function
func QuestionRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.GET("/questions", controller.GetQuestions)
	//incomingRoutes.GET("/v1/questionsById", controller.GetQuestionsById)
	incomingRoutes.PUT("/questions", controller.UpdateQuestion)
	incomingRoutes.DELETE("/questions", controller.DeleteQuestion)
	incomingRoutes.POST("/questions", controller.AddQuestionToDb())
}
