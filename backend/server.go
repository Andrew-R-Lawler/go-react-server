package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"


	"github.com/andrew-r-lawler/go-react-server/handlers"
	"github.com/stripe/stripe-go/v74"


	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}
}

func authMiddleware(c *gin.Context) {
	tokenStr, err := c.Cookie("auth_token")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No token"})
		return
	}
	claims, err := handlers.ValidateToken(tokenStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}
	c.Set("email", claims.Email)
	c.Set("admin", claims.Admin)
	c.Set("verified", claims.Verified)
	c.Set("id", claims.ID)
	c.Next()
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

	// Create Users Table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			verified BOOLEAN DEFAULT FALSE,
			admin BOOLEAN DEFAULT FALSE,
			verification_token TEXT,
			token_expiration TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Failed to create users table:", err)
	}

	// Create Products Table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS products (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			images TEXT[],
			price DECIMAL(10, 2) NOT NULL,
			stock_quantity INTEGER NOT NULL,
			featured BOOLEAN DEFAULT FALSE,
			on_sale BOOLEAN DEFAULT FALSE,
			sale_price DECIMAL(10, 2) DEFAULT 0.00,
			long_description TEXT DEFAULT ''
		);
	`)
	if err != nil {
		log.Fatal("Failed to create products table:", err)
	}

	// Create Product SKUs Table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS product_skus (
			id SERIAL PRIMARY KEY,
			product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
			sku TEXT NOT NULL,
			variant_name TEXT,
			stock_quantity INTEGER NOT NULL
		);
	`)
	if err != nil {
		log.Fatal("Failed to create product_skus table:", err)
	}

	// Create Password Reset Table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS password_reset (
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token TEXT NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			used BOOLEAN DEFAULT FALSE
		);
	`)
	if err != nil {
		log.Fatal("Failed to create password_reset table:", err)
	}

	// Create Orders Table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS orders (
			id SERIAL PRIMARY KEY,
			payment_intent_id TEXT UNIQUE NOT NULL,
			amount BIGINT NOT NULL,
			currency TEXT NOT NULL,
			status TEXT NOT NULL,
			items JSONB NOT NULL,
			shipping_method TEXT,
			receipt_email TEXT NOT NULL,
			tracking_number TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Failed to create orders table:", err)
	}

	r := gin.Default()
	r.SetTrustedProxies([]string{"127.0.0.1:3000"}) // change nil to a slice of strings containing trusted proxy IPs for production



	// todoGroup := r.Group("/api/todo", func(c *gin.Context) { authMiddleware(c) })
	userGroup := r.Group("/api/user")
	shopGroup := r.Group("/api/shop")
	protectedGroup := r.Group("/api/protected", func(c *gin.Context) { authMiddleware(c) })

	// todoGroup.GET("/", func(c *gin.Context) { handlers.GetTodos(c, db) })
	// todoGroup.DELETE("/:id", func(c *gin.Context) { handlers.DeleteTodo(c, db) })
	// todoGroup.POST("/", func(c *gin.Context) { handlers.PostTodo(c, db) })
	// todoGroup.PUT("/:id", func(c *gin.Context) { handlers.UpdateTodo(c, db) })
	// todoGroup.PUT("/completed/:id", func(c *gin.Context) { handlers.CompleteTodo(c, db) })

	userGroup.POST("/register", func(c *gin.Context) { handlers.Register(c, db) })
	userGroup.POST("/login", func(c *gin.Context) { handlers.Login(c, db) })
	userGroup.GET("/verify/:token", func(c *gin.Context) { handlers.Verify(c, db) })
	userGroup.POST("/forgotpassword", func(c *gin.Context) { handlers.ForgotPassword(c, db) })

	userGroup.POST("/resetpassword", func(c *gin.Context) { handlers.ResetPassword(c, db) })

	r.POST("/api/contact", handlers.SubmitContactForm)

	shopGroup.GET("/products", func(c *gin.Context) { handlers.GetProducts(c, db) })
	shopGroup.GET("/featured", func(c *gin.Context) { handlers.GetFeaturedProducts(c, db) })
	shopGroup.GET("/new-arrivals", func(c *gin.Context) { handlers.GetNewArrivals(c, db) })
	shopGroup.GET("/product/:id", func(c *gin.Context) { handlers.GetProduct(c, db) })

	protectedGroup.GET("/user", func(c *gin.Context) { handlers.GetUser(c) })
	protectedGroup.POST("/logout", func(c *gin.Context) { handlers.Logout(c) })
	protectedGroup.POST("/products", func(c *gin.Context) { handlers.AddProduct(c, db) })
	protectedGroup.DELETE("/products/:id", func(c *gin.Context) {
		handlers.DeleteProduct(c, db)
	})

	// Asset Management Routes
	protectedGroup.GET("/assets", handlers.ListAssets)
	protectedGroup.POST("/assets/upload", handlers.UploadAsset)
	protectedGroup.DELETE("/assets/:filename", handlers.DeleteAsset)
	protectedGroup.PUT("/editproduct/:id", func(c *gin.Context) { handlers.EditProduct(c, db) })
	protectedGroup.GET("/orders", func(c *gin.Context) { handlers.GetOrders(c, db) })
	protectedGroup.GET("/admin/orders", func(c *gin.Context) { handlers.GetAllOrders(c, db) })
	protectedGroup.PUT("/admin/orders/:id/status", func(c *gin.Context) { handlers.UpdateOrderStatus(c, db) })

	// Stripe
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	r.POST("/api/create-payment-intent", func(c *gin.Context) { handlers.CreatePaymentIntent(c, db) })
	r.POST("/api/confirm-order", func(c *gin.Context) { handlers.ConfirmOrder(c, db) })

	// Public Config
	r.GET("/api/config", func(c *gin.Context) {
		key := os.Getenv("VITE_STRIPE_PUBLISHABLE_KEY")
		if key == "" {
			log.Println("WARNING: VITE_STRIPE_PUBLISHABLE_KEY is empty")
		}
		c.JSON(http.StatusOK, gin.H{
			"stripePublishableKey": key,
		})
	})

	r.Run()
}
