package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"regexp"
	"strconv"

	_ "github.com/lib/pq"
	"github.com/andrew-r-lawler/go-react-server/handlers"
	"github.com/stretchr/testify/assert"
	"github.com/gin-gonic/gin"
	"github.com/DATA-DOG/go-sqlmock"
)

func TestGetTodos(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Error creating mock database: %v", err)
	}
	rows := sqlmock.NewRows([]string{"id", "name", "created_at", "completed", "editable", "user_id"}).AddRow(64, "test", "2025-03-05T23:30:40.449529Z", false, false, 4)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "todos" WHERE user_id = $1 ORDER BY id;`)).WithArgs(strconv.Itoa(4)).WillReturnRows(rows)

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/todo/", func(c *gin.Context) {handlers.GetTodos(c, db)})

	req, err := http.NewRequest(http.MethodGet, "/api/todo/?user_id=4", nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	expectedString := `[{"id":64,"name":"test","created_at":"2025-03-05T23:30:40.449529Z","completed":false,"editable":false,"user_id":4}]`
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, expectedString, w.Body.String())
}

func TestDeleteTodo(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Error creating mock database: %v", err)
	}

	mock.ExpectExec(regexp.QuoteMeta("DELETE FROM todos WHERE id = $1")).WithArgs(strconv.Itoa(1)).WillReturnResult(sqlmock.NewResult(1, 1))
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.DELETE("/api/todo/:id", func(c *gin.Context) {handlers.DeleteTodo(c, db)})
	req, err := http.NewRequest(http.MethodDelete, "/api/todo/1", nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
