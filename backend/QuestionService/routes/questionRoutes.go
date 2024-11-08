package routes

import (
	controller "backend/controllers"

	"github.com/gin-gonic/gin"
)

// UserRoutes function
func QuestionRoutes(incomingRoutes *gin.Engine) {
	routerGroup := incomingRoutes.Group("/question")
	routerGroup.GET("/questions", controller.GetQuestions)
	routerGroup.GET("/questions/topics", controller.GetTopics)
	routerGroup.GET("/questionsById", controller.GetQuestionsById)
	routerGroup.PUT("/questions", controller.UpdateQuestion)
	routerGroup.DELETE("/questions", controller.DeleteQuestion)
	routerGroup.POST("/questions", controller.AddQuestionToDb())
	routerGroup.POST("/questions/leetcode", controller.AddLeetCodeQuestionToDb())
	routerGroup.POST("/questions/matching", controller.AssignQuestion)

	// incomingRoutes.GET("/questions", controller.GetQuestions)
	// incomingRoutes.GET("/questions/topics", controller.GetTopics)
	// incomingRoutes.GET("/questionsById", controller.GetQuestionsById)
	// incomingRoutes.PUT("/questions", controller.UpdateQuestion)
	// incomingRoutes.DELETE("/questions", controller.DeleteQuestion)
	// incomingRoutes.POST("/questions", controller.AddQuestionToDb())
	// incomingRoutes.POST("/questions/leetcode", controller.AddLeetCodeQuestionToDb())
	// incomingRoutes.POST("/questions/matching", controller.AssignQuestion)
}
