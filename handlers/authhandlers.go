package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/wneessen/go-mail"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Verified bool   `json:"verified"`
	Admin    bool   `json:"admin"`
}

type Claims struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Verified bool   `json:"verified"`
	Admin    bool   `json:"admin"`
	jwt.StandardClaims
}

func GetJwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret == "" {
		return []byte("secret") // Default fallback or error in prod
	}
	return []byte(secret)
}

func SendVerificationEmail(token string, email string) error {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("SMTP config missing. User: '%s', Pass set: %v", smtpUser, smtpPass != "")
	}

	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}
	body := fmt.Sprintf(`
		<html>
		<body style="background-color: #1c1917; color: #e7e5e4; font-family: 'Courier New', Courier, monospace; padding: 20px;">
			<div style="max-width: 600px; margin: 0 auto; background-color: #292524; padding: 24px; border-radius: 8px; border: 1px solid #44403c;">
				<h2 style="color: #ffffff; border-bottom: 2px solid #57534e; padding-bottom: 12px;">Verify Your Email</h2>
				<p style="font-size: 16px;">Welcome!</p>
				<p style="color: #a8a29e; font-size: 14px;">Thank you for registering. Please verify your email address by clicking the button below:</p>
				
				<div style="text-align: center; margin-top: 32px;">
					<a href="%s/api/user/verify/%s" style="background-color: #57534e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
				</div>
				
				<p style="text-align: center; margin-top: 32px; font-size: 12px; color: #57534e;">
					&copy; 2025 Go React Server. All rights reserved.
				</p>
			</div>
		</body>
		</html>
	`, appURL, token)
	subject := "Verify your e-mail address!"
	to := email

	m := mail.NewMsg()
	if err := m.From(smtpUser); err != nil {
		return fmt.Errorf("failed to set From address: %s", err)
	}
	if err := m.To(to); err != nil {
		return fmt.Errorf("failed to set To address: %s", err)
	}
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)
	client, err := mail.NewClient("smtp.gmail.com", mail.WithTLSPortPolicy(mail.TLSMandatory),
		mail.WithSMTPAuth(mail.SMTPAuthPlain), mail.WithUsername(smtpUser), mail.WithPassword(smtpPass), mail.WithPort(587))
	if err != nil {
		return fmt.Errorf("failed to create mail client: %s", err)
	}
	if err := client.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send mail: %s", err)
	}
	return nil
}

func SendResetEmail(token string, email string) error {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("SMTP config missing. User: '%s', Pass set: %v", smtpUser, smtpPass != "")
	}

	// Using env var for domain
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000" // Fallback for dev
	}
	body := fmt.Sprintf(`
		<html>
		<body style="background-color: #1c1917; color: #e7e5e4; font-family: 'Courier New', Courier, monospace; padding: 20px;">
			<div style="max-width: 600px; margin: 0 auto; background-color: #292524; padding: 24px; border-radius: 8px; border: 1px solid #44403c;">
				<h2 style="color: #ffffff; border-bottom: 2px solid #57534e; padding-bottom: 12px;">Reset Password</h2>
				<p style="font-size: 16px;">We received a request to reset your password.</p>
				<p style="color: #a8a29e; font-size: 14px;">If this was you, please click the button below to proceed:</p>
				
				<div style="text-align: center; margin-top: 32px;">
					<a href="%s/password-reset/%s" style="background-color: #57534e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
				</div>
				
				<p style="text-align: center; margin-top: 32px; font-size: 12px; color: #57534e;">
					&copy; 2025 Go React Server. All rights reserved.
				</p>
			</div>
		</body>
		</html>
	`, appURL, token)
	subject := "Password Reset Request"
	to := email

	m := mail.NewMsg()
	if err := m.From(smtpUser); err != nil {
		return fmt.Errorf("failed to set From address: %s", err)
	}
	if err := m.To(to); err != nil {
		return fmt.Errorf("failed to set To address: %s", err)
	}
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)
	client, err := mail.NewClient("smtp.gmail.com", mail.WithTLSPortPolicy(mail.TLSMandatory),
		mail.WithSMTPAuth(mail.SMTPAuthPlain), mail.WithUsername(smtpUser), mail.WithPassword(smtpPass), mail.WithPort(587))
	if err != nil {
		return fmt.Errorf("failed to create mail client: %s", err)
	}
	if err := client.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to sennd mail: %s", err)
	}
	return nil
}

func SendShippingEmail(email string, orderID int, trackingNumber string) error {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("SMTP config missing")
	}

	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}

	trackingHTML := ""
	if trackingNumber != "" {
		trackingHTML = fmt.Sprintf(`
			<p style="font-size: 16px; color: #e7e5e4;">Tracking Number: <a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=%s" style="color: #3b82f6; text-decoration: none;"><strong>%s</strong></a></p>
			<p style="font-size: 14px; color: #a8a29e;">You can track your package via USPS.</p>
		`, trackingNumber, trackingNumber)
	}

	body := fmt.Sprintf(`
		<html>
		<body style="background-color: #1c1917; color: #e7e5e4; font-family: 'Courier New', Courier, monospace; padding: 20px;">
			<div style="max-width: 600px; margin: 0 auto; background-color: #292524; padding: 24px; border-radius: 8px; border: 1px solid #44403c;">
				<h2 style="color: #ffffff; border-bottom: 2px solid #57534e; padding-bottom: 12px;">Order Shipped!</h2>
				<p style="font-size: 16px;">Good news! Your order #%d has been shipped.</p>
				%s
				<div style="text-align: center; margin-top: 32px;">
					<a href="%s/orders" style="background-color: #57534e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Order</a>
				</div>
				<p style="text-align: center; margin-top: 32px; font-size: 12px; color: #57534e;">
					&copy; 2025 Go React Server. All rights reserved.
				</p>
			</div>
		</body>
		</html>
	`, orderID, trackingHTML, appURL)

	subject := fmt.Sprintf("Order #%d Confirmation", orderID)
	to := email

	m := mail.NewMsg()
	if err := m.From(smtpUser); err != nil {
		return fmt.Errorf("failed to set From address: %s", err)
	}
	if err := m.To(to); err != nil {
		return fmt.Errorf("failed to set To address: %s", err)
	}
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)
	client, err := mail.NewClient("smtp.gmail.com", mail.WithTLSPortPolicy(mail.TLSMandatory),
		mail.WithSMTPAuth(mail.SMTPAuthPlain), mail.WithUsername(smtpUser), mail.WithPassword(smtpPass), mail.WithPort(587))
	if err != nil {
		return fmt.Errorf("failed to create mail client: %s", err)
	}
	if err := client.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send mail: %s", err)
	}
	return nil
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
	if err := SendVerificationEmail(verificationToken, user.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email: " + err.Error()})
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
	query = "SELECT admin, verified, id FROM users WHERE email = $1"
	err = db.QueryRow(query, user.Email).Scan(&user.Admin, &user.Verified, &user.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}
	token, err := GenerateToken(user.Email, user.Admin, user.Verified, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	consent, err := c.Cookie("cookie_consent")
	if err == nil && consent == "true" {
		c.SetCookie(
			"auth_token", // cookie name
			token,        // value
			3600*24,      // max age in seconds
			"/",          // path
			"localhost",  // domain
			false,        // secure (true in production with HTTPS)
			true,         // HttpOnly
		)
	} else {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cookie consent required"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success",
	})
}

func Logout(c *gin.Context) {
	c.SetCookie(
		"auth_token",
		"",
		-1,
		"/",
		"localhost",
		false,
		true,
	)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func GenerateToken(email string, admin bool, verified bool, id int) (string, error) {
	claims := Claims{
		ID:       id,
		Email:    email,
		Admin:    admin,
		Verified: verified,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(), // Token expires in 24 hours
			Issuer:    "go-react-server",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(GetJwtSecret())
}

func ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return GetJwtSecret(), nil
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

func GetUser(c *gin.Context) {
	email, _ := c.Get("email")
	admin, _ := c.Get("admin")
	verified, _ := c.Get("verified")
	id, _ := c.Get("id")
	if email == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"email":    email,
		"ID":       id,
		"verified": verified,
		"admin":    admin,
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
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}
	c.Redirect(302, fmt.Sprintf("%s/verify", appURL))
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
	if err := SendResetEmail(resetToken, user.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send reset email: " + err.Error()})
		return
	}
	c.JSON(http.StatusAccepted, gin.H{"message": "Email sent to user!"})
}

func ResetPassword(c *gin.Context, db *sql.DB) {
	var request struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
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
		UserID          int       `json:"user_id"`
		TokenExpiration time.Time `json:"expires_at"`
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
