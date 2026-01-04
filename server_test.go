package main

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/andrew-r-lawler/go-react-server/handlers"
	"github.com/gin-gonic/gin"
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
	rows := sqlmock.NewRows([]string{"id", "name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description"}).
		AddRow(1, "Product 1", "Description 1", "{http://example.com/1.jpg}", 10.0, 100, false, false, 0.0, "").
		AddRow(2, "Product 2", "Description 2", "{http://example.com/2.jpg}", 20.0, 200, true, true, 15.0, "")

	// Expect query
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" ORDER BY id;`)).
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
	// Ensure all expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestGetProduct(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Define expected rows
	rows := sqlmock.NewRows([]string{"id", "name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description"}).
		AddRow(1, "Product 1", "Description 1", "{http://example.com/1.jpg}", 10.0, 100, false, false, 0.0, "")

	// Expect query
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" WHERE id = $1`)).
		WithArgs("1").
		WillReturnRows(rows)

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/products/:id", func(c *gin.Context) {
		handlers.GetProduct(c, db)
	})

	req, err := http.NewRequest(http.MethodGet, "/api/products/1", nil)
	if err != nil {
		t.Fatalf("could not create request: %v", err)
	}
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Product 1")

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

	rows := sqlmock.NewRows([]string{"id", "name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description"}).
		AddRow(2, "Product 2", "Description 2", "{http://example.com/2.jpg}", 20.0, 200, true, true, 15.0, "")

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" WHERE featured = TRUE ORDER BY id;`)).
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

	rows := sqlmock.NewRows([]string{"id", "name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description"}).
		AddRow(3, "Product 3", "Description 3", "{http://example.com/3.jpg}", 30.0, 300, false, false, 0.0, "")

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" ORDER BY id DESC LIMIT 6;`)).
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

func TestAddProduct_Admin(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO products ("name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`)).
		WithArgs("New Product", "Description", sqlmock.AnyArg(), 10.0, 50, false, false, 0.0, "").
		WillReturnResult(sqlmock.NewResult(1, 1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/products", func(c *gin.Context) {
		// Mock Admin Middleware
		c.Set("admin", true)
		handlers.AddProduct(c, db)
	})

	payload := `{"name":"New Product", "description":"Description", "images":["http://image.com/1.jpg"], "price":10.0, "stock_quantity":50, "featured":false, "on_sale":false, "sale_price":0.0}`
	req, _ := http.NewRequest(http.MethodPost, "/api/products", strings.NewReader(payload))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestDeleteProduct_Admin(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM products WHERE id = $1`)).
		WithArgs("1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.DELETE("/api/products/:id", func(c *gin.Context) {
		c.Set("admin", true)
		handlers.DeleteProduct(c, db)
	})

	req, _ := http.NewRequest(http.MethodDelete, "/api/products/1", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestEditProduct_Admin(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "products" SET name = $1, description = $2, images = $3, price = $4, stock_quantity = $5, featured = $6, on_sale = $7, sale_price = $8, long_description = $9 WHERE id = $10`)).
		WithArgs("Updated Product", "Desc", sqlmock.AnyArg(), 20.0, 10, true, true, 15.0, "", "1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.PUT("/api/products/:id", func(c *gin.Context) {
		c.Set("admin", true)
		handlers.EditProduct(c, db)
	})

	payload := `{"name":"Updated Product", "description":"Desc", "images":["img"], "price":20.0, "stock_quantity":10, "featured":true, "on_sale":true, "sale_price":15.0}`
	req, _ := http.NewRequest(http.MethodPut, "/api/products/1", strings.NewReader(payload))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestGetAllOrders_Admin(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Use time.Time for created_at to avoid scan errors
	createdAt := time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)
	rows := sqlmock.NewRows([]string{"id", "amount", "status", "items", "shipping_method", "created_at", "receipt_email", "tracking_number"}).
		AddRow(1, 1000, "paid", []byte("[]"), "standard", createdAt, "user@example.com", "TRACK123")

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, amount, status, items, shipping_method, created_at, receipt_email, COALESCE(tracking_number, '') FROM orders ORDER BY created_at DESC`)).
		WillReturnRows(rows)

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/admin/orders", func(c *gin.Context) {
		c.Set("admin", true)
		handlers.GetAllOrders(c, db)
	})

	req, _ := http.NewRequest(http.MethodGet, "/api/admin/orders", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "user@example.com")
	assert.Contains(t, w.Body.String(), "TRACK123")
}

func TestGetAllOrders_NonAdmin(t *testing.T) {
	db, _, _ := sqlmock.New()
	defer db.Close()

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/admin/orders", func(c *gin.Context) {
		// No admin claim or admin=false
		handlers.GetAllOrders(c, db)
	})

	req, _ := http.NewRequest(http.MethodGet, "/api/admin/orders", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

func TestUpdateOrderStatus_Admin(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Expect receipt email lookup
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT receipt_email FROM orders WHERE id = $1`)).
		WithArgs("1").
		WillReturnRows(sqlmock.NewRows([]string{"receipt_email"}).AddRow("customer@example.com"))

	// Expect update with tracking number
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE orders SET status = $1, tracking_number = $2 WHERE id = $3`)).
		WithArgs("shipped", "TRACK123", "1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.PUT("/api/admin/orders/:id/status", func(c *gin.Context) {
		c.Set("admin", true)
		handlers.UpdateOrderStatus(c, db)
	})

	payload := `{"status": "shipped", "tracking_number": "TRACK123"}`
	req, _ := http.NewRequest(http.MethodPut, "/api/admin/orders/1/status", strings.NewReader(payload))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAddProduct_LongDescription_Admin(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO products ("name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`)).
		WithArgs("Long Desc Product", "Short", sqlmock.AnyArg(), 10.0, 50, false, false, 0.0, "This is a long description.").
		WillReturnResult(sqlmock.NewResult(1, 1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/products", func(c *gin.Context) {
		c.Set("admin", true)
		handlers.AddProduct(c, db)
	})

	payload := `{"name":"Long Desc Product", "description":"Short", "images":["http://image.com"], "price":10.0, "stock_quantity":50, "featured":false, "on_sale":false, "sale_price":0.0, "long_description":"This is a long description."}`
	req, _ := http.NewRequest(http.MethodPost, "/api/products", strings.NewReader(payload))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
