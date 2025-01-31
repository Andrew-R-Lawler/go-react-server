package main

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/static"
)

func main() {
	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("./client/dist", true)))
	r.GET("/ping", func(c *gin.Context) {
		c.String(200, "bringus brongus give us dongus")
	})

	r.Run(":8080")
}
