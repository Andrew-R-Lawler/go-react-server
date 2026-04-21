package handlers

import (
	"database/sql"
	"net/http"

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
