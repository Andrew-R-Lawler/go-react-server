package main

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/andrew-r-lawler/go-react-server/handlers"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

type Todo struct {
	Name string `json:"name"`
		WithArgs("1", 4).
		WillReturnResult(sqlmock.NewResult(1, 1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.DELETE("/api/todo/:id", func(c *gin.Context) {
		// Mock Auth Context
		c.Set("id", 4)
		c.Set("admin", false)
		handlers.DeleteTodo(c, db)
	})
	req, err := http.NewRequest(http.MethodDelete, "/api/todo/1", nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	expectedString := `{"message":"todo successfully deleted"}`
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, expectedString, w.Body.String())
}
