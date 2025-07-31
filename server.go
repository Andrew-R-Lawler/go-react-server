package main

import (
	"database/sql"
	"fmt"
	"github.com/andrew-r-lawler/go-react-server/handlers"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
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

	r := gin.Default()
	r.SetTrustedProxies([]string{"127.0.0.1:3000"}) // change nil to a slice of strings containing trusted proxy IPs for production
	r.Use(static.Serve("/", static.LocalFile("./client/dist", true)))
	r.NoRoute(func(c *gin.Context) {
		c.File(filepath.Join("./client/dist", "index.html"))
	})

	todoGroup := r.Group("/api/todo", func(c *gin.Context) { authMiddleware(c) })
	userGroup := r.Group("/api/user")
	shopGroup := r.Group("/api/shop")
	protectedGroup := r.Group("/api/protected", func(c *gin.Context) { authMiddleware(c) })

	todoGroup.GET("/", func(c *gin.Context) { handlers.GetTodos(c, db) })
	todoGroup.DELETE("/:id", func(c *gin.Context) { handlers.DeleteTodo(c, db) })
	todoGroup.POST("/", func(c *gin.Context) { handlers.PostTodo(c, db) })
	todoGroup.PUT("/:id", func(c *gin.Context) { handlers.UpdateTodo(c, db) })
	todoGroup.PUT("/completed/:id", func(c *gin.Context) { handlers.CompleteTodo(c, db) })

	userGroup.POST("/register", func(c *gin.Context) { handlers.Register(c, db) })
	userGroup.POST("/login", func(c *gin.Context) { handlers.Login(c, db) })
	userGroup.GET("/verify/:token", func(c *gin.Context) { handlers.Verify(c, db) })
	userGroup.POST("/forgotpassword", func(c *gin.Context) { handlers.ForgotPassword(c, db) })
	userGroup.POST("/resetpassword", func(c *gin.Context) { handlers.ResetPassword(c, db) })

	shopGroup.GET("/products", func(c *gin.Context) { handlers.GetProducts(c, db) })

	protectedGroup.GET("/user", func(c *gin.Context) { handlers.GetUser(c) })
	protectedGroup.POST("/logout", func(c *gin.Context) { handlers.Logout(c) })
	protectedGroup.POST("/products", func(c *gin.Context) { handlers.AddProduct(c, db) })
	protectedGroup.DELETE("/deleteproduct/:id", func(c *gin.Context) { handlers.DeleteProduct(c, db) })
	protectedGroup.PUT("/editproduct/:id", func(c *gin.Context) { handlers.EditProduct(c, db) })

	r.Run()
}
