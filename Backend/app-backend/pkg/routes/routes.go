package routes

import (
	"github.com/arpitgoyal442/rentwheelz-backend/pkg/controllers"
	"github.com/arpitgoyal442/rentwheelz-backend/pkg/middleware"
	"github.com/gin-gonic/gin"
)

func GetRoutes() *gin.Engine {

	router := gin.Default()

	router.Use(middleware.CORSMiddleware())

	router.GET("/user/:id", controllers.GetSingleUser)
	router.POST("/user", controllers.AddUser)
	router.PUT("/user/:id", controllers.UpdateUser)
	router.GET("/user/bookings/:userid", controllers.GetBookedBikes)
	router.GET("/user/basicinfo/:userid", controllers.GetBasicInfo)

	router.GET("/bike", controllers.AllBikes)
	router.GET("/bike/:id", controllers.SingleBike)
	router.POST("/bike", controllers.AddBike)
	router.POST("/bike/book/:bikeid", controllers.BookBike)
	router.POST("/test", controllers.Test)
	// router.GET("/bike/mail",controllers.SendMail)

	router.POST("/booking/sendbikeimages/:bikeid", controllers.AcceptBikeImages)

	return router

}
