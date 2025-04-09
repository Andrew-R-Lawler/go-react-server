package handlers 

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"database/sql"
	"net/http"
	"os"
	"time"
	"fmt"
	"regexp"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"github.com/dgrijalva/jwt-go"
	"github.com/wneessen/go-mail"
)

type User struct {
	Email 		string 	`json:"email"`
	Password	string	`json:"password"`
}

type Claims struct {
	ID 			int		`json:"id"`
	Email 		string 	`json:"email"`
	Verified 	bool	`json:"verified"`
	jwt.StandardClaims
}

var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
 
func SendVerificationEmail(token string, email string) {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpUser == "" || smtpPass == "" {
		log.Fatalf("SMTP user or password is missing")
	}
	body := fmt.Sprintf(`
		<html>
		<head>
			<style>
				.button {
					background-color: blue;
					border: none;
					color: white;
					padding: 10px;
					text-align: center;
					text-decoration: none;
					display: inline-block;
					font-size: 16px;
					margin: 10px 0;
					cursor: pointer;
					border-radius: 5px;
				}
			</style>
		</head>
		<body>
			<h2>Welcome to Our Service!</h2>
			<p>Thank you for registering. Please verify your email address by clicking the button below:</p>
			<a href="https://webserver.lawlerlabs.duckdns.org/api/user/verify/%s" class="button" style="color: white; text-decoration: none;">Verify Email</a>
		</body>
		</html>
	`, token)
	subject := "Verify your e-mail address!"
	to := email

	m := mail.NewMsg()
	if err := m.From(smtpUser); err != nil {
		log.Fatalf("failed to set From address: %s", err)
	}
	if err := m.To(to); err != nil {
		log.Fatalf("failed to set To address: %s", err)
	}
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)
	client, err := mail.NewClient("smtp.gmail.com", mail.WithTLSPortPolicy(mail.TLSMandatory), 
		mail.WithSMTPAuth(mail.SMTPAuthPlain), mail.WithUsername(smtpUser), mail.WithPassword(smtpPass), mail.WithPort(587))
	if err != nil {
		log.Fatalf("failed to create mail client: %s", err)
	}
	if err := client.DialAndSend(m); err != nil {
		log.Fatalf("failed to send mail: %s", err)
	}
}

func SendResetEmail(token string, email string) {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpUser == "" || smtpPass == "" {
		log.Fatalf("SMTP user or password is missing")
	}

	body := fmt.Sprintf(`
		<html>
		<head>
			<style>
				.button {
					background-color: blue;
					border: none;
					color: white;
					padding: 10px;
					text-align: center;
					text-decoration: none;
					display: inline-block;
					font-size: 16px;
					margin: 10px 0;
					cursor: pointer;
					border-radius: 5px;
				}
			</style>
		</head>
		<body>
			<h2>Password Reset Request Header</h2>
			<p>Password Reset Request Body</p>
			<a href="https://webserver.lawlerlabs.duckdns.org/password-reset/%s" class="button" style="color: white; text-decoration: none;">Reset Password</a>
		</body>
		</html>
	`, token)
	subject := "Password Reset Request"
	to := email

	m := mail.NewMsg()
	if err := m.From(smtpUser); err != nil {
		log.Fatalf("failed to set From address: %s", err)
	}
	if err := m.To(to); err != nil {
		log.Fatalf("failed to set To address: %s", err)
	}
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)
	client, err := mail.NewClient("smtp.gmail.com", mail.WithTLSPortPolicy(mail.TLSMandatory),
		mail.WithSMTPAuth(mail.SMTPAuthPlain), mail.WithUsername(smtpUser), mail.WithPassword(smtpPass), mail.WithPort(587))
	if err != nil {
		log.Fatalf("failed to create mail client: %s", err)
	}
	if err := client.DialAndSend(m); err != nil {
		log.Fatalf("failed to sennd mail: %s", err)
	}
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

func generateVerificationToken() string {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		log.Fatal(err)
	}
	return hex.EncodeToString(bytes)
}

func validatePassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	uppercasePattern := `[A-Z]`
	if !regexp.MustCompile(uppercasePattern).MatchString(password) {
		return false
	}
	digitPattern := `\d`
	if !regexp.MustCompile(digitPattern).MatchString(password) {
		return false
	}
	specialCharPattern := `[@$!%*?&]`
	if !regexp.MustCompile(specialCharPattern).MatchString(password) {
		return false
	}
	return true
}

func Register(c *gin.Context, db *sql.DB) {
	var user User
	query := "INSERT INTO users (email, password, verification_token, token_expiration, verified) VALUES ($1, $2, $3, $4, $5)"
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Input"})
		return
	}
	if !validatePassword(user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password does not meet the requirements"})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash the password"})
		return
	}
	verificationToken := generateVerificationToken()
	currentTime := time.Now().UTC()
	tokenExpiration := currentTime.Add(24 * time.Hour) 

	_, err = db.Exec(query, user.Email, hashedPassword, verificationToken, tokenExpiration, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not register user"})
		return
	}	
	SendVerificationEmail(verificationToken, user.Email)
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
	var ID int
	var Verified bool
	query := "SELECT id, verified FROM users WHERE email = $1"
	err := db.QueryRow(query, email).Scan(&ID, &Verified)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"email": email,
		"ID": ID,
		"verified": Verified,
	})

}

func Verify(c *gin.Context, db *sql.DB) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}
	query := `
		UPDATE users
		SET verified = TRUE
		WHERE verification_token = $1
			AND token_expiration > NOW()
			AND verified = FALSE;
	`
	result, err := db.Exec(query, token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update verifications status"})
		return
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get affected rows"})
		return
	}
	if rowsAffected == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "verification token not found or expired"})
		return
	}
	c.Redirect(302, "http://webserver.lawlerlabs.duckdns.org/verify")
}

func ForgotPassword(c *gin.Context, db *sql.DB) {
	var user User
	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
		return
	}	
	var userID int
	err = db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No user found with the given email."})
			return
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "An unknown error has occured."})
			return
		}
	}
	resetToken := generateVerificationToken()
	expiration := time.Now().UTC().Add(2 * time.Hour)
	query := `
		INSERT INTO password_reset (user_id, token, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err = db.Exec(query, userID, resetToken, expiration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create password reset request"})
		return
	}
	SendResetEmail(resetToken, user.Email)
	c.JSON(http.StatusAccepted, gin.H{"message": "Email sent to user!"})
}

func ResetPassword(c *gin.Context, db *sql.DB) {
	var request struct {
		Token		string	`json:"token"`
		NewPassword	string	`json:"newPassword`
	}
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Request"})
		return
	}
	if !validatePassword(request.NewPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password does not meet the requirements."})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}
	var resetToken struct {
		UserID	int	`json:"user_id"`
		TokenExpiration	time.Time `json:"expires_at`
	}
	err = db.QueryRow("SELECT user_id, expires_at FROM password_reset WHERE token = $1", request.Token).Scan(&resetToken.UserID, &resetToken.TokenExpiration)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No password reset request found with the given token."})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
	}
	if time.Now().UTC().Before(resetToken.TokenExpiration) {
		query := `UPDATE users SET password = $1 WHERE id = $2`
		_, err := db.Exec(query, hashedPassword, resetToken.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
		query = `UPDATE password_reset SET used = $1 WHERE token = $2`
		_, err = db.Exec(query, true, request.Token)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
		c.JSON(http.StatusAccepted, gin.H{"message": "Password reset successful!"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Your password reset token has expired."})
		return
	}
}
