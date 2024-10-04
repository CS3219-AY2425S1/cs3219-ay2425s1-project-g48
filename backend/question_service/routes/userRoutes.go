package routes

import (
	controller "backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

// UserRoutes function
func UserRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.POST("/v1/signup", controller.SignUp())
	incomingRoutes.POST("/v1/login", controller.Login())
	incomingRoutes.GET("/v1/verify-reset", controller.VerifyResetToken())
	incomingRoutes.POST("/v1/email-verification", controller.EmailVerification())
	incomingRoutes.POST("/v1/refresh", controller.RefreshToken)

	// Protected routes
	incomingRoutes.POST("/v1/reset-password", middleware.Authentication(), controller.ResetPassword())
	incomingRoutes.POST("/v1/logout", middleware.Authentication(), controller.Logout())
}
