package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

type UserProfile struct {
	FirstName    *string `json:"first_name"`
	LastName     *string `json:"last_name"`
	Phone        *string `json:"phone"`
	AddressLine1 *string `json:"address_line1"`
	AddressLine2 *string `json:"address_line2"`
	City         *string `json:"city"`
	State        *string `json:"state"`
	PostalCode   *string `json:"postal_code"`
	Country      *string `json:"country"`
}

func GetProfile(c *gin.Context, db *sql.DB) {
	userID, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var p UserProfile
	query := `
		SELECT first_name, last_name, phone, address_line1, address_line2, city, state, postal_code, country
		FROM users WHERE id = $1
	`
	err := db.QueryRow(query, userID).Scan(
		&p.FirstName, &p.LastName, &p.Phone, &p.AddressLine1, &p.AddressLine2,
		&p.City, &p.State, &p.PostalCode, &p.Country,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Decrypt PII Fields
	if p.Phone != nil {
		dec, _ := DecryptPII(*p.Phone)
		p.Phone = &dec
	}
	if p.AddressLine1 != nil {
		dec, _ := DecryptPII(*p.AddressLine1)
		p.AddressLine1 = &dec
	}
	if p.AddressLine2 != nil {
		dec, _ := DecryptPII(*p.AddressLine2)
		p.AddressLine2 = &dec
	}

	c.JSON(http.StatusOK, p)
}

func UpdateProfile(c *gin.Context, db *sql.DB) {
	userID, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var p UserProfile
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Encrypt PII Fields
	if p.Phone != nil {
		enc, _ := EncryptPII(*p.Phone)
		p.Phone = &enc
	}
	if p.AddressLine1 != nil {
		enc, _ := EncryptPII(*p.AddressLine1)
		p.AddressLine1 = &enc
	}
	if p.AddressLine2 != nil {
		enc, _ := EncryptPII(*p.AddressLine2)
		p.AddressLine2 = &enc
	}

	query := `
		UPDATE users 
		SET first_name = $1, last_name = $2, phone = $3, address_line1 = $4, address_line2 = $5,
		    city = $6, state = $7, postal_code = $8, country = $9
		WHERE id = $10
	`
	_, err := db.Exec(query,
		p.FirstName, p.LastName, p.Phone, p.AddressLine1, p.AddressLine2,
		p.City, p.State, p.PostalCode, p.Country, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

func DeleteProfile(c *gin.Context, db *sql.DB) {
	userID, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var email string
	db.QueryRow(`SELECT email FROM users WHERE id = $1`, userID).Scan(&email)

	query := `DELETE FROM users WHERE id = $1`
	_, err := db.Exec(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete account"})
		return
	}

	// Async wipe Matomo data
	go anonymizeMatomoUser(email, userID.(int))
	
	// Async wipe Stripe PaymentIntents PII
	go anonymizeStripeData(email, db)

	c.SetCookie(
		"auth_token",
		"",
		-1,
		"/",
		os.Getenv("COOKIE_DOMAIN"),
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)
	c.SetSameSite(http.SameSiteLaxMode)

	c.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
}

func anonymizeMatomoUser(email string, userID int) {
	matomoURL := os.Getenv("MATOMO_URL")
	matomoToken := os.Getenv("MATOMO_TOKEN")
	siteID := os.Getenv("MATOMO_SITE_ID")
	if siteID == "" {
		siteID = "1"
	}
	if matomoURL == "" || matomoToken == "" {
		return
	}

	// Search visits by email or numeric ID
	segment := fmt.Sprintf("userId==%s,userId==%d", url.QueryEscape(email), userID)
	apiURL := fmt.Sprintf("%s/index.php?module=API&method=Live.getLastVisitsDetails&idSite=%s&format=JSON&token_auth=%s&segment=%s",
		matomoURL, siteID, matomoToken, segment)

	resp, err := http.Get(apiURL)
	if err != nil {
		log.Println("Matomo API error:", err)
		return
	}
	defer resp.Body.Close()

	var visits []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&visits); err != nil {
		return
	}

	if len(visits) == 0 {
		return
	}

	deleteURL := fmt.Sprintf("%s/index.php", matomoURL)
	data := url.Values{}
	data.Set("module", "API")
	data.Set("method", "PrivacyManager.deleteDataSubjects")
	data.Set("token_auth", matomoToken)

	for i, v := range visits {
		if idv, ok := v["idvisit"]; ok {
			data.Set(fmt.Sprintf("visits[%d][idsite]", i), siteID)
			data.Set(fmt.Sprintf("visits[%d][idvisit]", i), fmt.Sprintf("%v", idv))
		}
	}

	_, err = http.PostForm(deleteURL, data)
	if err != nil {
		log.Println("Matomo deleteDataSubjects error:", err)
	}
}

func anonymizeStripeData(email string, db *sql.DB) {
	if stripe.Key == "" {
		stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	}

	rows, err := db.Query("SELECT payment_intent_id FROM orders WHERE receipt_email = $1", email)
	if err != nil {
		log.Println("Database error fetching orders for Stripe cleanup:", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var piID string
		if err := rows.Scan(&piID); err == nil {
			params := &stripe.PaymentIntentParams{
				ReceiptEmail: stripe.String(""), // Clear email
			}
			// Clear custom PII from metadata
			params.AddMetadata("items_json", "deleted")
			params.AddMetadata("shipping_id", "deleted")
			params.AddMetadata("customer_deleted", "true")

			_, err := paymentintent.Update(piID, params)
			if err != nil {
				log.Printf("Note: Failed to completely anonymize Stripe PI %s (may be locked): %v", piID, err)
			}
		}
	}
}

func ExportData(c *gin.Context, db *sql.DB) {
	userID, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var p UserProfile
	var email string
	var verified bool
	var authProvider sql.NullString

	query := `
		SELECT email, verified, auth_provider, first_name, last_name, phone, address_line1, address_line2, city, state, postal_code, country
		FROM users WHERE id = $1
	`
	err := db.QueryRow(query, userID).Scan(
		&email, &verified, &authProvider, &p.FirstName, &p.LastName, &p.Phone, &p.AddressLine1, &p.AddressLine2,
		&p.City, &p.State, &p.PostalCode, &p.Country,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if p.Phone != nil {
		dec, _ := DecryptPII(*p.Phone)
		p.Phone = &dec
	}
	if p.AddressLine1 != nil {
		dec, _ := DecryptPII(*p.AddressLine1)
		p.AddressLine1 = &dec
	}
	if p.AddressLine2 != nil {
		dec, _ := DecryptPII(*p.AddressLine2)
		p.AddressLine2 = &dec
	}

	type Order struct {
		ID             int             `json:"id"`
		Amount         int64           `json:"amount"`
		Currency       string          `json:"currency"`
		Status         string          `json:"status"`
		Items          json.RawMessage `json:"items"`
		ShippingMethod *string         `json:"shipping_method"`
		TrackingNumber *string         `json:"tracking_number"`
		CreatedAt      string          `json:"created_at"`
	}

	var orders []Order
	rows, err := db.Query(`SELECT id, amount, currency, status, items, shipping_method, tracking_number, created_at FROM orders WHERE receipt_email = $1`, email)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var o Order
			rows.Scan(&o.ID, &o.Amount, &o.Currency, &o.Status, &o.Items, &o.ShippingMethod, &o.TrackingNumber, &o.CreatedAt)
			orders = append(orders, o)
		}
	}

	exportData := gin.H{
		"account": gin.H{
			"email":         email,
			"verified":      verified,
			"auth_provider": authProvider.String,
		},
		"profile": p,
		"orders":  orders,
	}

	b, err := json.MarshalIndent(exportData, "", "  ")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate export"})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=user_data_export.json")
	c.Data(http.StatusOK, "application/json", b)
}
