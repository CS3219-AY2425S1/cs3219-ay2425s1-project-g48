package routes

import (
	controller "backend/controllers"

	"github.com/gin-gonic/gin"
)

// UserRoutes function
func QuestionRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.GET("/questions", controller.GetQuestions)
	incomingRoutes.GET("/questions/topics", controller.GetTopics)
	incomingRoutes.GET("/questionsById", controller.GetQuestionsById)
	incomingRoutes.PUT("/questions", controller.UpdateQuestion)
	incomingRoutes.DELETE("/questions", controller.DeleteQuestion)
	incomingRoutes.POST("/questions", controller.AddQuestionToDb())
	incomingRoutes.POST("/questions/leetcode", controller.AddLeetCodeQuestionToDb())
	incomingRoutes.POST("/questions/matching", controller.AssignQuestion)
}
