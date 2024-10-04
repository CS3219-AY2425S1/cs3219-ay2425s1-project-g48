package routes

import (
	controller "backend/controllers"

	"github.com/gin-gonic/gin"
)

// UserRoutes function
func QuestionRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.GET("/v1/questions", controller.GetQuestions())
	// incomingRoutes.GET("/v1/questionsById", controller.GetQuestionsById)
	incomingRoutes.PUT("/v1/questionsById", controller.UpdateQuestion)
	incomingRoutes.DELETE("/v1/questionsById", controller.DeleteQuestion)
	incomingRoutes.POST("/v1/createQuestion", controller.AddQuestionToDb())
}
