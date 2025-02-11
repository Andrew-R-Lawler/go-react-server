package main

import (
	"log"
	"fmt"
	"database/sql"
	"os"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	// load environment variables from .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	// define connection string variables
	dbuser := os.Getenv("DB_USER")
	dbpassword := os.Getenv("DB_PASSWORD")
	dbhost := os.Getenv("DB_HOST")
	dbname := os.Getenv("DB_NAME")

	// define connection string
	connStr := fmt.Sprintf("user=%s password=%s host=%s dbname=%s sslmode=disable", dbuser, dbpassword, dbhost, dbname)
		
	// open connection to postgres database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// test the connection
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	// gin router defined
	r := gin.Default()

	// set trusted proxies
	r.SetTrustedProxies(nil) // change nil to a slice of strings containing trusted proxy IPs for production

	// serve the static webpage located in the client directory
	r.Use(static.Serve("/", static.LocalFile("./client/dist", true)))

	// create api router group
	apiGroup := r.Group("/api")

	// define routes for api group
	apiGroup.GET("/todo", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "List of Todos"})
	})
	apiGroup.POST("/todo", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Todo Created"})
	})

	// run gin server
	r.Run()
}
