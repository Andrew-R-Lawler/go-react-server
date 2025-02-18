package main

import (
	"log"
	"fmt"
	"database/sql"
	"os"
	"net/http"
	"time"

	_ "github.com/lib/pq"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/itsjamie/gin-cors"
)

type Todo struct {
	Id			int		`json:"id"`
	Name		string	`json:"name"`
	Created_at	string	`json:"created_at"`
	Completed	bool	`json:"completed"`
}

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

	// cors configuration
	r.Use(cors.Middleware(cors.Config{
		Origins:        "*",
		Methods:        "GET, PUT, POST, DELETE, OPTIONS",
		RequestHeaders: "Origin, Authorization, Content-Type",
		ExposedHeaders: "",
		MaxAge: 50 * time.Second,
		Credentials: false,
		ValidateHeaders: false,
	}))
	// set trusted proxies
	r.SetTrustedProxies(nil) // change nil to a slice of strings containing trusted proxy IPs for production

	// serve the static webpage located in the client directory
	r.Use(static.Serve("/", static.LocalFile("./client/dist", true)))

	apiGroup := r.Group("/api")
	// define routes for api group
	apiGroup.GET("/todo", func(c *gin.Context) {
		rows, err := db.Query(`SELECT * FROM "todos" LIMIT 50`)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		
		var todos []Todo

		for rows.Next() {
			var todo Todo
			if err := rows.Scan(&todo.Id, &todo.Name, &todo.Created_at, &todo.Completed); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read todo"})
				return
			}
			log.Printf("todo: %v", todo)
			todos = append(todos, todo)
		}
		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while iterating todos"})
		}
		c.JSON(http.StatusOK, todos)
	})
	
	r.POST("/todo", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Todo Created"})
	})

	// run gin server
	r.Run()
}
