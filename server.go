package main

import (
	"log"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	r := gin.Default()
	r.Use(static.Serve("/", static.LocalFile("./client/dist", true)))
	r.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
		log.Println("GET /ping called")
	})
	r.GET("/pong", func(c *gin.Context) {
		c.String(200, "new POST who dis")
		log.Println("POST /pong called")
	})

	r.Run()
}
