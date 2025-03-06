package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"database/sql"
	"os"
	"log"
	"fmt"

	_ "github.com/lib/pq"
	"github.com/andrew-r-lawler/go-react-server/handlers"
	"github.com/stretchr/testify/assert"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func setupTestDatabase() (*sql.DB, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	dbuser := os.Getenv("DB_USER")
	dbpassword := os.Getenv("DB_PASSWORD")
	dbhost := os.Getenv("DB_HOST")
	dbname := os.Getenv("DB_NAME")
	connStr := fmt.Sprintf("user=%s password=%s host=%s dbname=%s sslmode=disable", dbuser, dbpassword, dbhost, dbname)
		
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
    return db, nil
}

func TestGetTodos(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, err := setupTestDatabase()
	if err != nil {
		t.Fatalf("failed to set up database: %v", err)
	}
	defer db.Close()
	r := gin.Default()
	r.GET("/api/todo/", func(c *gin.Context) {handlers.GetTodos(c, db)})
	req, err := http.NewRequest(http.MethodGet, "/api/todo/?user_id=4", nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
