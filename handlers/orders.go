package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
	TrackingNumber string        `json:"tracking_number"`
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
		SELECT id, amount, status, items, shipping_method, created_at, COALESCE(tracking_number, '')
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

		if err := rows.Scan(&o.ID, &o.Amount, &o.Status, &itemsJSON, &o.ShippingMethod, &o.CreatedAt, &o.TrackingNumber); err != nil {
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

func GetAllOrders(c *gin.Context, db *sql.DB) {
	// Verify admin status
	isAdmin, exists := c.Get("admin")
	if !exists || !isAdmin.(bool) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	rows, err := db.Query(`
		SELECT id, amount, status, items, shipping_method, created_at, receipt_email, COALESCE(tracking_number, '')
		FROM orders 
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error fetching orders"})
		return
	}
	defer rows.Close()

	type AdminOrderResponse struct {
		OrderResponse
		ReceiptEmail string `json:"receipt_email"`
	}

	var orders []AdminOrderResponse
	for rows.Next() {
		var o AdminOrderResponse
		var itemsJSON []byte

		if err := rows.Scan(&o.ID, &o.Amount, &o.Status, &itemsJSON, &o.ShippingMethod, &o.CreatedAt, &o.ReceiptEmail, &o.TrackingNumber); err != nil {
			continue
		}

		if err := json.Unmarshal(itemsJSON, &o.Items); err != nil {
			o.Items = []PaymentItem{}
		}

		orders = append(orders, o)
	}

	if orders == nil {
		orders = []AdminOrderResponse{}
	}

	c.JSON(http.StatusOK, orders)
}

func UpdateOrderStatus(c *gin.Context, db *sql.DB) {
	// Verify admin status
	isAdmin, exists := c.Get("admin")
	if !exists || !isAdmin.(bool) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	idStr := c.Param("id")
	var input struct {
		Status         string `json:"status"`
		TrackingNumber string `json:"tracking_number"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Fetch customer email to send notification
	var receiptEmail string
	err := db.QueryRow("SELECT receipt_email FROM orders WHERE id = $1", idStr).Scan(&receiptEmail)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Update status and tracking number
	_, err = db.Exec("UPDATE orders SET status = $1, tracking_number = $2 WHERE id = $3", input.Status, input.TrackingNumber, idStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	// Send email if status is "shipped"
	if input.Status == "shipped" {
		orderID := 0
		fmt.Sscanf(idStr, "%d", &orderID)
		go SendShippingEmail(receiptEmail, orderID, input.TrackingNumber)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated"})
}
