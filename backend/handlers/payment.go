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
	"github.com/stripe/stripe-go/v74/tax/calculation"
	"github.com/wneessen/go-mail"
)

type PaymentItem struct {
	ID       int    `json:"id"`
	Quantity int    `json:"quantity"`
	Name     string `json:"name,omitempty"`
}

type EmailItem struct {
	Name     string
	Quantity int
	Price    float64
	Total    float64
}

type Address struct {
	Line1      string `json:"line1"`
	Line2      string `json:"line2,omitempty"`
	City       string `json:"city"`
	State      string `json:"state"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
}

type PaymentRequest struct {
	Items      []PaymentItem `json:"items"`
	ShippingID string        `json:"shipping_id"`
	Address    *Address      `json:"address,omitempty"`
}

type TaxRequest struct {
	Items      []PaymentItem `json:"items"`
	ShippingID string        `json:"shipping_id"`
	Address    Address       `json:"address"`
}

func calculateShippingCost(items []PaymentItem, shippingID string, address *Address, db *sql.DB) int64 {
	// Standard/express fallback if shippingID is standard/express or blank
	if shippingID == "standard" || shippingID == "" {
		return 500
	}
	if shippingID == "express" {
		return 1000
	}

	// Dynamic USPS Calculation
	var totalOunces float64
	for _, item := range items {
		var weight float64
		err := db.QueryRow("SELECT COALESCE(weight, 0.00) FROM products WHERE id = $1", item.ID).Scan(&weight)
		if err != nil {
			weight = 4.0 // fallback default weight (ounces)
		}
		if weight <= 0 {
			weight = 4.0
		}
		totalOunces += weight * float64(item.Quantity)
	}

	// Map shippingID to fallback rates
	var fallbackBase float64
	var fallbackMultiplier float64
	switch shippingID {
	case "usps_ground_advantage":
		fallbackBase = 4.50
		fallbackMultiplier = 0.50
	case "usps_priority_mail":
		fallbackBase = 8.50
		fallbackMultiplier = 1.00
	case "usps_priority_mail_express":
		fallbackBase = 25.50
		fallbackMultiplier = 2.50
	default:
		// Unknown shipping method, fallback to standard $5.00
		return 500
	}

	// Try querying Shippo API if credentials are set
	shippoKey := os.Getenv("SHIPPO_API_KEY")
	if shippoKey != "" && address != nil && address.PostalCode != "" && address.Country != "" {
		toAddr := ShippoAddress{
			Name:    "Customer",
			Street1: address.Line1,
			Street2: address.Line2,
			City:    address.City,
			State:   address.State,
			Zip:     address.PostalCode,
			Country: address.Country,
		}

		shipment, err := CreateShippoShipment(toAddr, totalOunces)
		if err == nil && len(shipment.Rates) > 0 {
			var targetToken string
			switch shippingID {
			case "usps_ground_advantage":
				targetToken = "usps_ground_advantage"
			case "usps_priority_mail":
				targetToken = "usps_priority"
			case "usps_priority_mail_express":
				targetToken = "usps_priority_express"
			default:
				if shippingID == "express" {
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

			if matchedRate == nil {
				for _, r := range shipment.Rates {
					if r.Provider == "USPS" {
						matchedRate = &r
						break
					}
				}
			}

			if matchedRate != nil {
				var rateFloat float64
				if _, err := fmt.Sscanf(matchedRate.Amount, "%f", &rateFloat); err == nil && rateFloat > 0 {
					return int64(rateFloat * 100)
				}
			}
		}
	}


	// Fallback/Mock USPS Rates Calculation
	totalLbs := totalOunces / 16.0
	cost := fallbackBase + (totalLbs * fallbackMultiplier)
	return int64(cost * 100)
}

type ShippingRatesRequest struct {
	Items   []PaymentItem `json:"items"`
	Address Address       `json:"address"`
}

type ShippingOption struct {
	ID    string  `json:"id"`
	Label string  `json:"label"`
	Price float64 `json:"price"`
}

func GetShippingRates(c *gin.Context, db *sql.DB) {
	var req ShippingRatesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Calculate total ounces
	var totalOunces float64
	for _, item := range req.Items {
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

	shippoKey := os.Getenv("SHIPPO_API_KEY")
	if shippoKey != "" && req.Address.PostalCode != "" && req.Address.Country != "" {
		toAddr := ShippoAddress{
			Name:    "Customer",
			Street1: req.Address.Line1,
			Street2: req.Address.Line2,
			City:    req.Address.City,
			State:   req.Address.State,
			Zip:     req.Address.PostalCode,
			Country: req.Address.Country,
		}

		shipment, err := CreateShippoShipment(toAddr, totalOunces)
		if err == nil && len(shipment.Rates) > 0 {
			var options []ShippingOption
			tokenToID := map[string]string{
				"usps_ground_advantage": "usps_ground_advantage",
				"usps_priority":         "usps_priority_mail",
				"usps_priority_express": "usps_priority_mail_express",
			}
			idToLabel := map[string]string{
				"usps_ground_advantage":      "USPS Ground Advantage (2-5 business days)",
				"usps_priority_mail":         "USPS Priority Mail (1-3 business days)",
				"usps_priority_mail_express": "USPS Priority Mail Express (Next-Day)",
			}

			populated := make(map[string]bool)

			for _, r := range shipment.Rates {
				if r.Provider == "USPS" {
					if optID, ok := tokenToID[r.ServiceLevel.Token]; ok {
						var rateFloat float64
						if _, err := fmt.Sscanf(r.Amount, "%f", &rateFloat); err == nil {
							options = append(options, ShippingOption{
								ID:    optID,
								Label: idToLabel[optID],
								Price: rateFloat,
							})
							populated[optID] = true
						}
					}
				}
			}

			for optID, label := range idToLabel {
				if !populated[optID] {
					price := float64(calculateShippingCost(req.Items, optID, &req.Address, db)) / 100.0
					options = append(options, ShippingOption{
						ID:    optID,
						Label: label,
						Price: price,
					})
				}
			}

			c.JSON(http.StatusOK, options)
			return
		}
	}

	// Fallback to standard USPS/mock calculation
	options := []ShippingOption{
		{
			ID:    "usps_ground_advantage",
			Label: "USPS Ground Advantage (2-5 business days)",
			Price: float64(calculateShippingCost(req.Items, "usps_ground_advantage", &req.Address, db)) / 100.0,
		},
		{
			ID:    "usps_priority_mail",
			Label: "USPS Priority Mail (1-3 business days)",
			Price: float64(calculateShippingCost(req.Items, "usps_priority_mail", &req.Address, db)) / 100.0,
		},
		{
			ID:    "usps_priority_mail_express",
			Label: "USPS Priority Mail Express (Next-Day)",
			Price: float64(calculateShippingCost(req.Items, "usps_priority_mail_express", &req.Address, db)) / 100.0,
		},
	}

	c.JSON(http.StatusOK, options)
}

func calculateTaxAmount(items []PaymentItem, shippingID string, address Address, db *sql.DB) int64 {
	var lineItems []*stripe.TaxCalculationLineItemParams
	for _, item := range items {
		var price float64
		if err := db.QueryRow("SELECT price FROM products WHERE id = $1", item.ID).Scan(&price); err == nil {
			lineItems = append(lineItems, &stripe.TaxCalculationLineItemParams{
				Amount:    stripe.Int64(int64(price * float64(item.Quantity) * 100)),
				Reference: stripe.String(fmt.Sprintf("item_%d", item.ID)),
			})
		}
	}

	shippingCost := calculateShippingCost(items, shippingID, &address, db)
	lineItems = append(lineItems, &stripe.TaxCalculationLineItemParams{
		Amount:    stripe.Int64(shippingCost),
		Reference: stripe.String("shipping"),
	})

	calcParams := &stripe.TaxCalculationParams{
		Currency: stripe.String("usd"),
		CustomerDetails: &stripe.TaxCalculationCustomerDetailsParams{
			Address: &stripe.AddressParams{
				Line1:      stripe.String(address.Line1),
				Line2:      stripe.String(address.Line2),
				City:       stripe.String(address.City),
				State:      stripe.String(address.State),
				PostalCode: stripe.String(address.PostalCode),
				Country:    stripe.String(address.Country),
			},
			AddressSource: stripe.String("shipping"),
		},
		LineItems: lineItems,
	}

	calc, err := calculation.New(calcParams)
	if err != nil {
		return 0
	}
	return calc.TaxAmountExclusive
}

func CalculateTax(c *gin.Context, db *sql.DB) {
	var req TaxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	tax := calculateTaxAmount(req.Items, req.ShippingID, req.Address, db)
	c.JSON(http.StatusOK, gin.H{"taxAmount": tax})
}

func CreatePaymentIntent(c *gin.Context, db *sql.DB) {
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Calculate base total
	total := calculateOrderAmount(req.Items, req.ShippingID, req.Address, db)

	// Calculate tax if address provided
	var tax int64 = 0
	if req.Address != nil && req.Address.Country != "" {
		tax = calculateTaxAmount(req.Items, req.ShippingID, *req.Address, db)
		total += tax
	}

	// Serialize items to JSON
	itemsJSON, err := json.Marshal(req.Items)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process items"})
		return
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(total),
		Currency: stripe.String(string(stripe.CurrencyUSD)),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
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
		"taxAmount":    tax,
	})
}

// calculateOrderAmount returns the total amount in cents
func calculateOrderAmount(items []PaymentItem, shippingID string, address *Address, db *sql.DB) int64 {
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
	shippingCost := calculateShippingCost(items, shippingID, address, db)

	totalAmountCents := int64(totalAmount * 100)
	return totalAmountCents + shippingCost
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
	fromAddress := os.Getenv("SMTP_FROM")
	if fromAddress == "" {
		fromAddress = smtpUser
	}
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName != "" {
		if err := m.FromFormat(fromName, fromAddress); err != nil {
			return err
		}
	} else {
		if err := m.From(fromAddress); err != nil {
			return err
		}
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
