package main

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
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

func TestRegister_InvalidPassword(t *testing.T) {
	// DB not used but required for signature
	db, _, _ := sqlmock.New()
	defer db.Close()

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/user/register", func(c *gin.Context) {
		handlers.Register(c, db)
	})

	// Password too short/weak
	payload := `{"email":"test@example.com", "password":"weak"}`
	req, _ := http.NewRequest(http.MethodPost, "/api/user/register", strings.NewReader(payload))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "Password does not meet the requirements")
}

func TestLogin_UserNotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Expect query for password
	mock.ExpectQuery("SELECT password FROM users WHERE email =").
		WithArgs("nonexistent@example.com").
		WillReturnError(sql.ErrNoRows)

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/user/login", func(c *gin.Context) {
		handlers.Login(c, db)
	})

	payload := `{"email":"nonexistent@example.com", "password":"Password123!"}`
	req, _ := http.NewRequest(http.MethodPost, "/api/user/login", strings.NewReader(payload))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "Invalid email or password")

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestGetFeaturedProducts(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	rows := sqlmock.NewRows([]string{"id", "name", "description", "image_url", "price", "stock_quantity", "featured", "on_sale", "sale_price"}).
		AddRow(2, "Product 2", "Description 2", "http://example.com/2.jpg", 20.0, 200, true, true, 15.0)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, description, image_url, price, stock_quantity, featured, on_sale, sale_price FROM "products" WHERE featured = TRUE ORDER BY id;`)).
		WillReturnRows(rows)

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/featured", func(c *gin.Context) {
		handlers.GetFeaturedProducts(c, db)
	})

	req, _ := http.NewRequest(http.MethodGet, "/api/featured", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Product 2")
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestGetNewArrivals(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	rows := sqlmock.NewRows([]string{"id", "name", "description", "image_url", "price", "stock_quantity", "featured", "on_sale", "sale_price"}).
		AddRow(3, "Product 3", "Description 3", "http://example.com/3.jpg", 30.0, 300, false, false, 0.0)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, description, image_url, price, stock_quantity, featured, on_sale, sale_price FROM "products" ORDER BY id DESC LIMIT 3;`)).
		WillReturnRows(rows)

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/new-arrivals", func(c *gin.Context) {
		handlers.GetNewArrivals(c, db)
	})

	req, _ := http.NewRequest(http.MethodGet, "/api/new-arrivals", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Product 3")
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
