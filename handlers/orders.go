package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type OrderResponse struct {
	ID             int           `json:"id"`
	Amount         int64         `json:"amount"` // Stored in cents
	Status         string        `json:"status"`
	Items          []PaymentItem `json:"items"`
	ShippingMethod string        `json:"shipping_method"`
	CreatedAt      time.Time     `json:"created_at"`
}

func GetOrders(c *gin.Context, db *sql.DB) {
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userEmail, ok := email.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid email in context"})
		return
	}

	rows, err := db.Query(`
		SELECT id, amount, status, items, shipping_method, created_at 
		FROM orders 
		WHERE receipt_email = $1 
		ORDER BY created_at DESC
	`, userEmail)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error fetching orders"})
		return
	}
	defer rows.Close()

	var orders []OrderResponse
	for rows.Next() {
		var o OrderResponse
		var itemsJSON []byte

		if err := rows.Scan(&o.ID, &o.Amount, &o.Status, &itemsJSON, &o.ShippingMethod, &o.CreatedAt); err != nil {
			continue // Skip invalid rows
		}

		if err := json.Unmarshal(itemsJSON, &o.Items); err != nil {
			o.Items = []PaymentItem{} // Handle unmarshal error gracefully
		}

		orders = append(orders, o)
	}

	if orders == nil {
		orders = []OrderResponse{} // Return empty array instead of null
	}

	c.JSON(http.StatusOK, orders)
}
