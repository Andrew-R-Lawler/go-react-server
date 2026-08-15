package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/paymentintent"
)

type OrderResponse struct {
	ID             int           `json:"id"`
	Amount         int64         `json:"amount"` // Stored in cents
	Status         string        `json:"status"`
	Items          []PaymentItem `json:"items"`
	ShippingMethod string        `json:"shipping_method"`
	CreatedAt      time.Time     `json:"created_at"`
	TrackingNumber string        `json:"tracking_number"`
	LabelURL       string        `json:"label_url"`
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
		SELECT id, amount, status, items, shipping_method, created_at, COALESCE(tracking_number, ''), COALESCE(label_url, '')
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

		if err := rows.Scan(&o.ID, &o.Amount, &o.Status, &itemsJSON, &o.ShippingMethod, &o.CreatedAt, &o.TrackingNumber, &o.LabelURL); err != nil {
			continue // Skip invalid rows
		}

		if err := json.Unmarshal(itemsJSON, &o.Items); err != nil {
			o.Items = []PaymentItem{} // Handle unmarshal error gracefully
		}

		// Hydrate product names
		for i := range o.Items {
			var name string
			err := db.QueryRow("SELECT name FROM products WHERE id = $1", o.Items[i].ID).Scan(&name)
			if err != nil {
				// If product deleted or not found, fall back to "Product #ID"
				o.Items[i].Name = fmt.Sprintf("Product #%d", o.Items[i].ID)
			} else {
				o.Items[i].Name = name
			}
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
		SELECT id, amount, status, items, shipping_method, created_at, receipt_email, COALESCE(tracking_number, ''), COALESCE(label_url, '')
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

		if err := rows.Scan(&o.ID, &o.Amount, &o.Status, &itemsJSON, &o.ShippingMethod, &o.CreatedAt, &o.ReceiptEmail, &o.TrackingNumber, &o.LabelURL); err != nil {
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

func GenerateShippoLabel(c *gin.Context, db *sql.DB) {
	// Verify admin status
	isAdmin, exists := c.Get("admin")
	if !exists || !isAdmin.(bool) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	idStr := c.Param("id")

	// 1. Fetch order details from database
	var paymentIntentID string
	var shippingMethod string
	var itemsJSON []byte
	var receiptEmail string
	err := db.QueryRow("SELECT payment_intent_id, shipping_method, items, receipt_email FROM orders WHERE id = $1", idStr).Scan(&paymentIntentID, &shippingMethod, &itemsJSON, &receiptEmail)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// 2. Retrieve PaymentIntent from Stripe to get shipping address
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	pi, err := paymentintent.Get(paymentIntentID, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve payment intent from Stripe: " + err.Error()})
		return
	}

	if pi.Shipping == nil || pi.Shipping.Address == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order has no shipping details in Stripe"})
		return
	}

	// 3. Parse items and calculate total weight in ounces
	var items []PaymentItem
	if err := json.Unmarshal(itemsJSON, &items); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse order items"})
		return
	}

	var totalOunces float64
	for _, item := range items {
		var weight float64
		err := db.QueryRow("SELECT COALESCE(weight, 0.00) FROM products WHERE id = $1", item.ID).Scan(&weight)
		if err != nil {
			weight = 4.0
		}
		if weight <= 0 {
			weight = 4.0
		}
		totalOunces += weight * float64(item.Quantity)
	}

	// 4. Create toAddress for Shippo
	toAddr := ShippoAddress{
		Name:    pi.Shipping.Name,
		Street1: pi.Shipping.Address.Line1,
		Street2: pi.Shipping.Address.Line2,
		City:    pi.Shipping.Address.City,
		State:   pi.Shipping.Address.State,
		Zip:     pi.Shipping.Address.PostalCode,
		Country: pi.Shipping.Address.Country,
		Phone:   pi.Shipping.Phone,
		Email:   receiptEmail,
	}

	// 5. Create Shippo shipment and fetch rates
	shipment, err := CreateShippoShipment(toAddr, totalOunces)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Shippo shipment: " + err.Error()})
		return
	}

	if len(shipment.Rates) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No shipping rates returned by Shippo"})
		return
	}

	// 6. Find matching rate for selected shipping method
	var targetToken string
	switch shippingMethod {
	case "usps_ground_advantage":
		targetToken = "usps_ground_advantage"
	case "usps_priority_mail":
		targetToken = "usps_priority"
	case "usps_priority_mail_express":
		targetToken = "usps_priority_express"
	default:
		if shippingMethod == "express" {
			targetToken = "usps_priority"
		} else {
			targetToken = "usps_ground_advantage"
		}
	}

	var matchedRate *ShippoRate
	for _, r := range shipment.Rates {
		if r.ServiceLevel.Token == targetToken {
			matchedRate = &r
			break
		}
	}

	// Fallback to any USPS rate if exact token doesn't match
	if matchedRate == nil {
		for _, r := range shipment.Rates {
			if r.Provider == "USPS" {
				matchedRate = &r
				break
			}
		}
	}

	// Double fallback to first rate if no USPS rate found
	if matchedRate == nil {
		matchedRate = &shipment.Rates[0]
	}

	// 7. Purchase Shippo label
	txResp, err := PurchaseShippoLabel(matchedRate.ObjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to purchase Shippo label: " + err.Error()})
		return
	}

	// 8. Update DB with status, tracking number, and label URL
	_, err = db.Exec("UPDATE orders SET status = $1, tracking_number = $2, label_url = $3 WHERE id = $4", "shipped", txResp.TrackingNumber, txResp.LabelURL, idStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order database with label details: " + err.Error()})
		return
	}

	// 9. Send email notification asynchronously
	orderID := 0
	fmt.Sscanf(idStr, "%d", &orderID)
	go SendShippingEmail(receiptEmail, orderID, txResp.TrackingNumber)

	c.JSON(http.StatusOK, gin.H{
		"message":         "Label purchased and order marked as shipped",
		"label_url":       txResp.LabelURL,
		"tracking_number": txResp.TrackingNumber,
	})
}
