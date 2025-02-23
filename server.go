package main

import (
	"log"
	"fmt"
	"database/sql"
	"os"
	"net/http"
	"io"
	"github.com/andrew-r-lawler/go-react-server/handlers"

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
	Editable	bool	`json:"editable"`	
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

	todoGroup := r.Group("/api/todo")

	todoGroup.GET("/", func(c *gin.Context) {
		handlers.GetTodos(c, db)
	})
	
	todoGroup.DELETE("/:id", func(c *gin.Context) {
		todoId := c.Param("id")
		query := "DELETE FROM todos WHERE id = $1"
		_, err := db.Exec(query, todoId)
		if err != nil {
			log.Fatal(err)
		}
		return
	})

	todoGroup.POST("/", func(c *gin.Context) {
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

	todoGroup.PUT("/:id", func(c *gin.Context) {
		query := `UPDATE "todos"
		SET name = $1
		WHERE id = $2`
		todoId := c.Param("id")
		b, err := io.ReadAll(c.Request.Body)
		body := string(b)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
			return
		}
		result, err := db.Exec(query, body, todoId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update todo"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": 	"todo updated successfully",
			"id":		todoId,
			"name":		body,
			"result": 	result,
		})
	})

	todoGroup.PUT("/completed/:id", func(c *gin.Context) {
		query := `UPDATE "todos"
		SET completed = $1
		WHERE id = $2`
		todoId := c.Param("id")
		body, err := io.ReadAll(c.Request.Body)
		b := string(body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
			return
		}
		result, err := db.Exec(query, b, todoId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update todo"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": 		"todo updated successfully",
			"id": 			todoId,
			"completed":	body,
			"result":		result,
		})
	})

	// run gin server
	r.Run()
}
