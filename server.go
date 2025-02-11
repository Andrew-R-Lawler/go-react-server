package main

import (
	"log"
	"fmt"
	"database/sql"
	"os"

	_ "github.com/lib/pq"
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
	// define connection string variables
	dbuser := os.Getenv("DB_USER")
	dbpassword := os.Getenv("DB_PASSWORD")
	dbhost := os.Getenv("DB_HOST")
	dbname := os.Getenv("DB_NAME")

	// define connection string
	connStr := fmt.Sprintf("user=%s password=%s host=%s dbname=%s sslmode=disable", dbuser, dbpassword, dbhost, dbname)
		
	// open the connection
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
	fmt.Println("Successfully connected to the database")
	

	// gin router defined
	r := gin.Default()
	r.SetTrustedProxies(nil) // change this to a slice of strings containing trusted proxy IPs for production
	r.Use(static.Serve("/", static.LocalFile("./client/dist", true)))
	r.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
		log.Println("GET /ping called")
	})

	// run gin server
	r.Run()
}
