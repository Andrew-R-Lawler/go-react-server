package handlers 

import (
	"database/sql"
	"net/http"
	"os"
	"time"
	"fmt"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"github.com/dgrijalva/jwt-go"
)

type User struct {
	Email 		string 	`json:"email"`
	Password	string	`json:"password"`
}

type NewUser struct {
	Email 		string 	`json:"email"`
	Password	string	`json:"password"`
}

type Claims struct {
	ID 		int		`json:"id"`
	Email 	string 	`json:"email"`
	jwt.StandardClaims
}

var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
 
func GenerateToken(email string) (string, error) {
	claims := Claims{
		Email: email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(), // Token expires in 24 hours
			Issuer:    "to-do app",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

func Register(c *gin.Context, db *sql.DB) {
	var user User
	query := "INSERT INTO users (email, password) VALUES ($1, $2)"
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Input"})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash the password"})
		return
	}
	_, err = db.Exec(query, user.Email, hashedPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not register user"})
		return
	}	
	c.JSON(http.StatusOK, gin.H{
		"message": "User registered successfully",
	})
}

func Login(c *gin.Context, db *sql.DB) {
	var user User 
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var storedPassword string
	query := "SELECT password FROM users WHERE email = $1"
	err := db.QueryRow(query, user.Email).Scan(&storedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})	
		return
	}
	token, err := GenerateToken(user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful", 
		"token": token,
	})
}

func GetUser(c *gin.Context, db *sql.DB) {
	email, _ := c.Get("email")
	if email == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"email": email,
	})

}

func GetUserId(c *gin.Context, db *sql.DB) {
	email, _ := c.Get("email")
	if email == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	var ID int
	query := "SELECT id FROM users WHERE email = $1"
	err := db.QueryRow(query, email).Scan(&ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"ID": ID,
	})

}
