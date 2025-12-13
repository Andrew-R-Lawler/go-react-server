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

func TestGetProducts(t *testing.T) {
	// Create a new mock database
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Define expected rows
	rows := sqlmock.NewRows([]string{"id", "name", "description", "image_url", "price", "stock_quantity", "featured", "on_sale", "sale_price"}).
		AddRow(1, "Product 1", "Description 1", "http://example.com/1.jpg", 10.0, 100, false, false, 0.0).
		AddRow(2, "Product 2", "Description 2", "http://example.com/2.jpg", 20.0, 200, true, true, 15.0)

	// Expect query
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, description, image_url, price, stock_quantity, featured, on_sale, sale_price FROM "products"`)).
		WillReturnRows(rows)

	// Setup Gin
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/products", func(c *gin.Context) {
		handlers.GetProducts(c, db)
	})

	// Create request
	req, err := http.NewRequest(http.MethodGet, "/api/products", nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	w := httptest.NewRecorder()

	// Serve request
	r.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Product 1")
	assert.Contains(t, w.Body.String(), "Product 2")

	// Ensure all expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
