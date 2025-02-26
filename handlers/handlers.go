package handlers 

import (
	"database/sql"
	"log"
	"net/http"
	"io"
	"os"
	"time"
	"fmt"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"github.com/dgrijalva/jwt-go"
)

type Todo struct {
	Id			int		`json:"id"`
	Name		string	`json:"name"`
	Created_at	string	`json:"created_at"`
	Completed	bool	`json:"completed"`
	Editable	bool	`json:"editable"`	
	User_id		int		`json:"user_id"`
}

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
 
func GetTodos(c *gin.Context, db *sql.DB) {
		userId := c.DefaultQuery("user_id", "")
		if userId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
			return
		}
		
		rows, err := db.Query(`SELECT * FROM "todos" WHERE user_id = $1 ORDER BY id;`, userId)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		var todos []Todo
		for rows.Next() {
			var todo Todo
			if err := rows.Scan(&todo.Id, &todo.Name, &todo.Created_at, &todo.Completed, &todo.Editable, &todo.User_id); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read todo"})
				return
			}
			todos = append(todos, todo)
		}
		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while iterating todos"})
		}
		c.JSON(http.StatusOK, todos)
	}

func DeleteTodo(c *gin.Context, db *sql.DB) {
		todoId := c.Param("id")
		query := "DELETE FROM todos WHERE id = $1"
		_, err := db.Exec(query, todoId)
		if err != nil {
			log.Fatal(err)
		}
		return
	}


func PostTodo(c *gin.Context, db *sql.DB) {
		query := `INSERT INTO "todos" ("name", "created_at", "completed", "user_id")
		VALUES ($1, now(), $2, $3) RETURNING id`
		userId := c.DefaultQuery("user_id", "")
		if userId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		}
		b, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
			return
		}
		body := string(b)
		f := 0
		var newID int
		err = db.QueryRow(query, body, f, userId).Scan(&newID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		}
		c.JSON(http.StatusCreated, gin.H{
			"id":       newID,
			"name":    body,
			"completed": f,
		})
	}

func UpdateTodo(c *gin.Context, db *sql.DB) {
		query := `UPDATE "todos"
		SET name = $1
		WHERE id = $2`
		todoId := c.Param("id")
		b, err := io.ReadAll(c.Request.Body)
		body := string(b)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
			return
		}
		result, err := db.Exec(query, body, todoId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update todo"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": 	"todo updated successfully",
			"id":		todoId,
			"name":		body,
			"result": 	result,
		})
	}

func CompleteTodo(c *gin.Context, db *sql.DB) {
		query := `UPDATE "todos"
		SET completed = $1
		WHERE id = $2`
		todoId := c.Param("id")
		body, err := io.ReadAll(c.Request.Body)
		b := string(body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
			return
		}
		result, err := db.Exec(query, b, todoId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update todo"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": 		"todo updated successfully",
			"id": 			todoId,
			"completed":	body,
			"result":		result,
		})
	}

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
