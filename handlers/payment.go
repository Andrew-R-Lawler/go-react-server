package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/paymentintent"
	"github.com/wneessen/go-mail"
)

type PaymentItem struct {
	ID       int `json:"id"`
	Quantity int `json:"quantity"`
}

type EmailItem struct {
	Name     string
	Quantity int
	Price    float64
	Total    float64
}

type PaymentRequest struct {
	Items      []PaymentItem `json:"items"`
	ShippingID string        `json:"shipping_id"`
}

func CreatePaymentIntent(c *gin.Context, db *sql.DB) {
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Calculate total amount on the server
	total := calculateOrderAmount(req.Items, req.ShippingID, db)

	// Serialize items to JSON
	itemsJSON, err := json.Marshal(req.Items)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process items"})
		return
	}

	// Create a PaymentIntent with the order amount and currency
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(total),
		Currency: stripe.String(string(stripe.CurrencyUSD)),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
		// PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
	}
	params.AddMetadata("shipping_id", req.ShippingID)
	params.AddMetadata("items_json", string(itemsJSON))

	pi, err := paymentintent.New(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"clientSecret": pi.ClientSecret,
	})
}

// calculateOrderAmount returns the total amount in cents
func calculateOrderAmount(items []PaymentItem, shippingID string, db *sql.DB) int64 {
	var totalAmount float64

	for _, item := range items {
		var price float64
		err := db.QueryRow("SELECT price FROM products WHERE id = $1", item.ID).Scan(&price)
		if err != nil {
			// If product not found or error, skip it (or handle error more gracefully)
			continue
		}
		totalAmount += price * float64(item.Quantity)
	}

	// Shipping Cost Logic
	// standard = $5.00
	// express = $10.00
	var shippingCost float64 = 5.00 // Default to standard

	if shippingID == "express" {
		shippingCost = 10.00
	} else {
		shippingCost = 5.00
	}

	totalAmount += shippingCost

	// Convert to cents
	return int64(totalAmount * 100)
}

// ConfirmOrder handles the stock deduction after a successful payment
func ConfirmOrder(c *gin.Context, db *sql.DB) {
	var req struct {
		PaymentIntentID string `json:"payment_intent_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 1. Retrieve PaymentIntent
	pi, err := paymentintent.Get(req.PaymentIntentID, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve payment intent"})
		return
	}

	// 2. Verify Status
	if pi.Status != stripe.PaymentIntentStatusSucceeded {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment not succeeded"})
		return
	}

	// 3. Idempotency Check
	if pi.Metadata["stock_updated"] == "true" {
		c.JSON(http.StatusOK, gin.H{"message": "Order already confirmed"})
		return
	}

	// 4. Parse Items
	var items []PaymentItem
	if err := json.Unmarshal([]byte(pi.Metadata["items_json"]), &items); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse order items"})
		return
	}

	// 5. Update Stock (Transaction) & Create Order Record
	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer tx.Rollback()

	// 5a. Decrement Stock
	for _, item := range items {
		_, err := tx.Exec("UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2", item.Quantity, item.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
			return
		}
	}

	// 5b. Insert Order
	_, err = tx.Exec(`
		INSERT INTO orders (payment_intent_id, amount, currency, status, items, shipping_method, receipt_email)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, pi.ID, pi.Amount, pi.Currency, pi.Status, pi.Metadata["items_json"], pi.Metadata["shipping_id"], pi.ReceiptEmail)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order record"})
		// Transaction will rollback stock changes too
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// 6. Update PaymentIntent Metadata (Mark as updated)
	params := &stripe.PaymentIntentParams{}
	params.AddMetadata("stock_updated", "true")
	_, err = paymentintent.Update(req.PaymentIntentID, params)
	if err != nil {
		// Log this... it's a non-critical error since stock IS updated, but idempotency might fail next time
		// We can return success though
	}

	// 7. Send Confirmation Email
	// We do this asynchronously or just let it run, logging errors if it fails, but not failing the request
	if pi.ReceiptEmail != "" {
		// Fetch product details for email
		var emailItems []EmailItem
		for _, item := range items {
			var name string
			var price float64
			err := db.QueryRow("SELECT name, price FROM products WHERE id = $1", item.ID).Scan(&name, &price)
			if err != nil {
				log.Printf("Failed to fetch product for email: %v", err)
				name = fmt.Sprintf("Product #%d", item.ID) // Fallback
				price = 0
			}
			emailItems = append(emailItems, EmailItem{
				Name:     name,
				Quantity: item.Quantity,
				Price:    price,
				Total:    price * float64(item.Quantity),
			})
		}

		go func() {
			err := SendOrderConfirmationEmail(pi.ReceiptEmail, pi.ID, emailItems, pi.Amount, pi.Metadata["shipping_id"])
			if err != nil {
				log.Printf("Failed to send order confirmation email: %v", err)
			}
		}()
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order confirmed and stock updated"})
}

func SendOrderConfirmationEmail(email string, orderID string, items []EmailItem, amount int64, shippingMethod string) error {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("SMTP config missing")
	}

	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}

	// Build Item List HTML with Styling
	itemsHTML := ""
	for _, item := range items {
		itemsHTML += fmt.Sprintf(`
			<tr style="border-bottom: 1px solid #44403c;">
				<td style="padding: 12px; color: #e7e5e4;">%s</td>
				<td style="padding: 12px; color: #a8a29e; text-align: center;">%d</td>
				<td style="padding: 12px; color: #e7e5e4; text-align: right;">$%.2f</td>
			</tr>
		`, item.Name, item.Quantity, item.Total)
	}

	body := fmt.Sprintf(`
		<html>
		<body style="background-color: #1c1917; color: #e7e5e4; font-family: 'Courier New', Courier, monospace; padding: 20px;">
			<div style="max-width: 600px; margin: 0 auto; background-color: #292524; padding: 24px; border-radius: 8px; border: 1px solid #44403c;">
				<h2 style="color: #ffffff; border-bottom: 2px solid #57534e; padding-bottom: 12px;">Order Confirmed</h2>
				<p style="font-size: 16px;">Thank you for your purchase.</p>
				<p style="color: #a8a29e; font-size: 14px;">Order ID: <span style="color: #e7e5e4;">%s</span></p>
				
				<table style="width: 100%%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
					<thead>
						<tr style="border-bottom: 2px solid #44403c; text-align: left;">
							<th style="padding: 12px; color: #fafaf9;">Item</th>
							<th style="padding: 12px; color: #fafaf9; text-align: center;">Qty</th>
							<th style="padding: 12px; color: #fafaf9; text-align: right;">Total</th>
						</tr>
					</thead>
					<tbody>
						%s
					</tbody>
				</table>

				<div style="margin-top: 20px; border-top: 2px solid #44403c; padding-top: 16px;">
					<p style="display: flex; justify-content: space-between; margin: 4px 0;">
						<span style="color: #a8a29e;">Shipping (%s):</span>
						<span>Included</span>
					</p>
					<p style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 18px; font-weight: bold; color: #e7e5e4;">
						<span>Total Paid:</span>
						<span>$%.2f</span>
					</p>
				</div>

				<div style="text-align: center; margin-top: 32px;">
					<a href="%s" style="background-color: #57534e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Return to Store</a>
				</div>
				
				<p style="text-align: center; margin-top: 32px; font-size: 12px; color: #57534e;">
					&copy; 2025 Go React Server. All rights reserved.
				</p>
			</div>
		</body>
		</html>
	`, orderID, itemsHTML, shippingMethod, float64(amount)/100.0, appURL)

	m := mail.NewMsg()
	if err := m.From(smtpUser); err != nil {
		return err
	}
	if err := m.To(email); err != nil {
		return err
	}
	m.Subject("Order Confirmation - " + orderID)
	m.SetBodyString(mail.TypeTextHTML, body)

	client, err := mail.NewClient("smtp.gmail.com", mail.WithTLSPortPolicy(mail.TLSMandatory),
		mail.WithSMTPAuth(mail.SMTPAuthPlain), mail.WithUsername(smtpUser), mail.WithPassword(smtpPass), mail.WithPort(587))
	if err != nil {
		return err
	}
	if err := client.DialAndSend(m); err != nil {
		return err
	}
	return nil
}
