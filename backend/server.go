package main

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/andrew-r-lawler/go-react-server/handlers"
	"github.com/stripe/stripe-go/v74"
	"gopkg.in/natefinch/lumberjack.v2"


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
	// Setup Lumberjack Log Rotation
	logWriter := &lumberjack.Logger{
		Filename:   "logs/server.log",
		MaxSize:    10, // megabytes
		MaxBackups: 3,
		MaxAge:     30,   // days
		Compress:   true, // compress disabled by default
	}
	gin.DefaultWriter = io.MultiWriter(os.Stdout, logWriter)
	log.SetOutput(io.MultiWriter(os.Stdout, logWriter))

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
			password TEXT,
			verified BOOLEAN DEFAULT FALSE,
			admin BOOLEAN DEFAULT FALSE,
			verification_token TEXT,
			token_expiration TIMESTAMP,
			auth_provider TEXT DEFAULT 'local',
			oauth_id TEXT UNIQUE,
			avatar_url TEXT
		);
	`)
	if err != nil {
		log.Fatal("Failed to create users table:", err)
	}

	// Safely alter existing table for OAuth migrations and Profile data
	_, err = db.Exec(`
		ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'local';
		ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

		-- Profile & PII Fields (At-Rest Encryption targeted)
		ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line2 TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
	`)
	if err != nil {
		log.Printf("Warning: Failed to execute alter table on users: %v", err)
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
			long_description TEXT DEFAULT '',
			ingredients TEXT DEFAULT '',
			raw_ingredients_json TEXT DEFAULT '[]',
			weight DECIMAL(10, 2) DEFAULT 0.00,
			gtin TEXT DEFAULT ''
		);
	`)
	if err != nil {
		log.Fatal("Failed to create products table:", err)
	}

	// Safely alter existing table for products
	_, err = db.Exec(`
		ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT DEFAULT '';
		ALTER TABLE products ADD COLUMN IF NOT EXISTS raw_ingredients_json TEXT DEFAULT '[]';
		ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2) DEFAULT 0.00;
		ALTER TABLE products ADD COLUMN IF NOT EXISTS gtin TEXT DEFAULT '';
	`)
	if err != nil {
		log.Printf("Warning: Failed to execute alter table on products: %v", err)
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

	_, err = db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS label_url TEXT;")
	if err != nil {
		log.Fatal("Failed to migrate orders table (label_url):", err)
	}

	handlers.InitOAuth()

	r := gin.Default()
	r.SetTrustedProxies([]string{"127.0.0.1:3000"}) // change nil to a slice of strings containing trusted proxy IPs for production

	// todoGroup := r.Group("/api/todo", func(c *gin.Context) { authMiddleware(c) })
	userGroup := r.Group("/api/user")
	shopGroup := r.Group("/api/shop")
	protectedGroup := r.Group("/api/protected", func(c *gin.Context) { authMiddleware(c) })

	userGroup.GET("/auth/:provider", handlers.OAuthLogin)
	userGroup.GET("/auth/:provider/callback", func(c *gin.Context) { handlers.OAuthCallback(c, db) })

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
	
	// User Profile
	protectedGroup.GET("/profile", func(c *gin.Context) { handlers.GetProfile(c, db) })
	protectedGroup.PUT("/profile", func(c *gin.Context) { handlers.UpdateProfile(c, db) })
	protectedGroup.DELETE("/profile", func(c *gin.Context) { handlers.DeleteProfile(c, db) })
	protectedGroup.POST("/changepassword", func(c *gin.Context) { handlers.ChangePassword(c, db) })
	protectedGroup.GET("/export", func(c *gin.Context) { handlers.ExportData(c, db) })

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
	protectedGroup.POST("/admin/orders/:id/shippo-label", func(c *gin.Context) { handlers.GenerateShippoLabel(c, db) })
	protectedGroup.POST("/admin/orders/:id/shippo-rates", func(c *gin.Context) { handlers.GetShippoRatesForOrder(c, db) })

	// Stripe
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	r.POST("/api/create-payment-intent", func(c *gin.Context) { handlers.CreatePaymentIntent(c, db) })
	r.POST("/api/calculate-tax", func(c *gin.Context) { handlers.CalculateTax(c, db) })
	r.POST("/api/confirm-order", func(c *gin.Context) { handlers.ConfirmOrder(c, db) })
	r.POST("/api/shipping-rates", func(c *gin.Context) { handlers.GetShippingRates(c, db) })

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

	// Start Server
	r.Run()
}
