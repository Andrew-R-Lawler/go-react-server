package main

import (
	"log"
	"fmt"
	"database/sql"
	"os"
	"github.com/andrew-r-lawler/go-react-server/handlers"

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
	dbuser := os.Getenv("DB_USER")
	dbpassword := os.Getenv("DB_PASSWORD")
	dbhost := os.Getenv("DB_HOST")
	dbname := os.Getenv("DB_NAME")
	connStr := fmt.Sprintf("user=%s password=%s host=%s dbname=%s sslmode=disable", dbuser, dbpassword, dbhost, dbname)
		
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()
	r.SetTrustedProxies(nil) // change nil to a slice of strings containing trusted proxy IPs for production
	r.Use(static.Serve("/", static.LocalFile("./client/dist", true)))

	todoGroup := r.Group("/api/todo")
	userGroup := r.Group("/api/user")

	todoGroup.GET("/", func(c *gin.Context) {handlers.GetTodos(c, db)})
	todoGroup.DELETE("/:id", func(c *gin.Context) {handlers.DeleteTodo(c, db)})
	todoGroup.POST("/", func(c *gin.Context) {handlers.PostTodo(c, db)})
	todoGroup.PUT("/:id", func(c *gin.Context) {handlers.UpdateTodo(c, db)})
	todoGroup.PUT("/completed/:id", func(c *gin.Context) {handlers.CompleteTodo(c, db)})

	userGroup.POST("/register", func(c *gin.Context) {handlers.Register(c, db)})
	userGroup.POST("/login", func(c *gin.Context) {handlers.Login(c, db)})

	r.Run()
}
