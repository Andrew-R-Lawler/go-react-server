package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/facebook"
	"github.com/markbates/goth/providers/google"
)

// InitOAuth configures Goth providers. Must be called early in the app lifecycle.
func InitOAuth() {
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:8080"
	}

	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	facebookClientID := os.Getenv("FACEBOOK_CLIENT_ID")
	facebookClientSecret := os.Getenv("FACEBOOK_CLIENT_SECRET")

	var providers []goth.Provider

	if googleClientID != "" && googleClientSecret != "" {
		providers = append(providers, google.New(googleClientID, googleClientSecret, fmt.Sprintf("%s/api/user/auth/google/callback", appURL)))
	}

	if facebookClientID != "" && facebookClientSecret != "" {
		providers = append(providers, facebook.New(facebookClientID, facebookClientSecret, fmt.Sprintf("%s/api/user/auth/facebook/callback", appURL)))
	}

	if len(providers) > 0 {
		goth.UseProviders(providers...)
	}
}

// OAuthLogin initiates the OAuth flow
func OAuthLogin(c *gin.Context) {
	provider := c.Param("provider")
	q := c.Request.URL.Query()
	q.Add("provider", provider)
	c.Request.URL.RawQuery = q.Encode()

	// Use Gothic to begin the auth flow
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

// OAuthCallback handles the return from the provider
func OAuthCallback(c *gin.Context, db *sql.DB) {
	provider := c.Param("provider")
	q := c.Request.URL.Query()
	q.Add("provider", provider)
	c.Request.URL.RawQuery = q.Encode()

	// Completes auth and gets user profile
	gothUser, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OAuth authentication failed: " + err.Error()})
		return
	}

	// We got the external profile. Link or create in database.
	var user User
	var oauthID sql.NullString

	// Attempt to find by OAuth ID and Provider first
	query := "SELECT id, email, admin, verified, oauth_id FROM users WHERE oauth_id = $1 AND auth_provider = $2"
	err = db.QueryRow(query, gothUser.UserID, provider).Scan(&user.ID, &user.Email, &user.Admin, &user.Verified, &oauthID)

	if err != nil {
		if err == sql.ErrNoRows {
			// Account not found by OAuth ID. Check if the email exists already via standard signup.
			errEmail := db.QueryRow("SELECT id, admin, verified FROM users WHERE email = $1", gothUser.Email).Scan(&user.ID, &user.Admin, &user.Verified)
			if errEmail == nil {
				// Email exists. Let's securely link it.
				updateQuery := "UPDATE users SET oauth_id = $1, auth_provider = $2, avatar_url = $3, verified = TRUE WHERE email = $4"
				_, errUpdate := db.Exec(updateQuery, gothUser.UserID, provider, gothUser.AvatarURL, gothUser.Email)
				if errUpdate != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link OAuth account"})
					return
				}
				user.Email = gothUser.Email
				user.Verified = true // OAuth inherently verifies emails
			} else {
				// Completely new user. Create them.
				insertQuery := "INSERT INTO users (email, auth_provider, oauth_id, avatar_url, verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id"
				errInsert := db.QueryRow(insertQuery, gothUser.Email, provider, gothUser.UserID, gothUser.AvatarURL).Scan(&user.ID)
				if errInsert != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create User"})
					return
				}
				user.Email = gothUser.Email
				user.Verified = true
				user.Admin = false
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking OAuth"})
			return
		}
	}

	// Account is confirmed. Generate JWT.
	token, err := GenerateToken(user.Email, user.Admin, user.Verified, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Notice we bypass the 'cookie_consent' check for OAuth routes as logging in natively assumes consent.
	// We'll set the token and redirect.
	c.SetCookie(
		"auth_token",
		token,
		3600*24,
		"/",
		os.Getenv("COOKIE_DOMAIN"),
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)
	c.SetSameSite(http.SameSiteLaxMode)

	// Redirect securely back to the frontend homepage
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:8080"
	}
	c.Redirect(http.StatusFound, appURL+"/")
}
