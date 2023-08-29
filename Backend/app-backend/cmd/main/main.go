package main

import (
	"fmt"
	"log"
	"path/filepath"
	"github.com/joho/godotenv"

	"github.com/arpitgoyal442/rentwheelz-backend/pkg/config"

	"github.com/arpitgoyal442/rentwheelz-backend/pkg/routes"
)

func main(){

	err := godotenv.Load(filepath.Join("D:/NextProject/rentwheelz/Backend/app-backend", ".env"))
	if err != nil {
	  log.Fatal("Error loading .env file")
	}

	fmt.Println("Hello World")

	config.ConnectDb()

	
	
	router:=routes.GetRoutes()

	// router.Use(middleware.CORSMiddleware())

	 router.Run(":8080")
	 
}