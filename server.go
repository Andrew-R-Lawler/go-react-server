package main

import (
	"log"
	"fmt"
	"database/sql"
	"os"
	"net/http"
	"io"

	_ "github.com/lib/pq"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
			todos = append(todos, todo)
		}
		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while iterating todos"})
		}
		c.JSON(http.StatusOK, todos)
	})
	
	apiGroup.DELETE("/todo/:id", func(c *gin.Context) {
		todoId := c.Param("id")
		query := "DELETE FROM todos WHERE id = $1"
		_, err := db.Exec(query, todoId)
		if err != nil {
			log.Fatal(err)
		}
		return
	})

	apiGroup.POST("/todo", func(c *gin.Context) {
		query := `INSERT INTO "todos" ("name", "created_at", "completed")
VALUES ($1, now(), $2) RETURNING id`
		b, err := io.ReadAll(c.Request.Body)
		body := string(b)
		f := 0
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
			return
		}
		var newID int
		err = db.QueryRow(query, body, f).Scan(&newID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		}
		c.JSON(http.StatusCreated, gin.H{
			"id":       newID,
			"name":    body,
			"completed": f,
		})
	})

	// run gin server
	r.Run()
}
