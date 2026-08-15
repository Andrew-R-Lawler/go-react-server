package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// ShippoAddress represents address format for Shippo API
type ShippoAddress struct {
	Name    string `json:"name"`
	Company string `json:"company,omitempty"`
	Street1 string `json:"street1"`
	Street2 string `json:"street2,omitempty"`
	City    string `json:"city"`
	State   string `json:"state"`
	Zip     string `json:"zip"`
	Country string `json:"country"`
	Phone   string `json:"phone,omitempty"`
	Email   string `json:"email,omitempty"`
}

// ShippoParcel represents parcel details for Shippo API
type ShippoParcel struct {
	Length       string `json:"length"`
	Width        string `json:"width"`
	Height       string `json:"height"`
	DistanceUnit string `json:"distance_unit"`
	Weight       string `json:"weight"`
	MassUnit     string `json:"mass_unit"`
}

// ShippoShipmentRequest represents the POST payload to /shipments
type ShippoShipmentRequest struct {
	AddressFrom ShippoAddress `json:"address_from"`
	AddressTo   ShippoAddress `json:"address_to"`
	Parcels     []ShippoParcel `json:"parcels"`
	Async       bool          `json:"async"`
}

// ShippoServiceLevel represents the service level details in a rate
type ShippoServiceLevel struct {
	Name  string `json:"name"`
	Token string `json:"token"`
}

// ShippoRate represents a single rate returned by Shippo API
type ShippoRate struct {
	ObjectID     string             `json:"object_id"`
	Amount       string             `json:"amount"`
	Currency     string             `json:"currency"`
	Provider     string             `json:"provider"`
	ServiceLevel ShippoServiceLevel `json:"servicelevel"`
}

// ShippoShipmentResponse represents the response from /shipments
type ShippoShipmentResponse struct {
	ObjectID string       `json:"object_id"`
	Rates    []ShippoRate `json:"rates"`
	Status   string       `json:"status"`
}

// ShippoTransactionRequest represents the POST payload to /transactions
type ShippoTransactionRequest struct {
	Rate          string `json:"rate"`
	LabelFileType string `json:"label_file_type"`
	Async         bool   `json:"async"`
}

// ShippoTransactionResponse represents the response from /transactions
type ShippoTransactionResponse struct {
	ObjectID       string `json:"object_id"`
	Status         string `json:"status"`
	LabelURL       string `json:"label_url"`
	TrackingNumber string `json:"tracking_number"`
}

// GetShippoSenderAddress builds the sender address from environment variables or defaults
func GetShippoSenderAddress() ShippoAddress {
	getEnvDefault := func(key, defaultValue string) string {
		val := os.Getenv(key)
		if val == "" {
			return defaultValue
		}
		return val
	}

	return ShippoAddress{
		Name:    getEnvDefault("SHIPPO_SENDER_NAME", "Store Owner"),
		Company: getEnvDefault("SHIPPO_SENDER_COMPANY", "Go React Server Store"),
		Street1: getEnvDefault("SHIPPO_SENDER_STREET1", "123 Main St"),
		Street2: os.Getenv("SHIPPO_SENDER_STREET2"),
		City:    getEnvDefault("SHIPPO_SENDER_CITY", "San Francisco"),
		State:   getEnvDefault("SHIPPO_SENDER_STATE", "CA"),
		Zip:     getEnvDefault("SHIPPO_SENDER_ZIP", "94105"),
		Country: getEnvDefault("SHIPPO_SENDER_COUNTRY", "US"),
		Phone:   getEnvDefault("SHIPPO_SENDER_PHONE", "555-555-5555"),
		Email:   getEnvDefault("SHIPPO_SENDER_EMAIL", "store@example.com"),
	}
}

// callShippoAPI helper to send authenticated HTTP requests to Shippo
func callShippoAPI(method, endpoint string, payload interface{}, responseObj interface{}) error {
	apiKey := os.Getenv("SHIPPO_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("SHIPPO_API_KEY environment variable is not set")
	}

	var bodyReader io.Reader
	if payload != nil {
		jsonBytes, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("failed to marshal payload: %w", err)
		}
		bodyReader = bytes.NewBuffer(jsonBytes)
	}

	url := "https://api.goshippo.com" + endpoint
	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "ShippoToken "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("Shippo API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	if err := json.Unmarshal(respBody, responseObj); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w (body: %s)", err, string(respBody))
	}

	return nil
}

// CreateShippoShipment calls Shippo to create a shipment and return its rates
func CreateShippoShipment(toAddress ShippoAddress, totalOunces float64) (*ShippoShipmentResponse, error) {
	sender := GetShippoSenderAddress()

	// Default parcel dimensions (small package)
	parcel := ShippoParcel{
		Length:       "5",
		Width:        "5",
		Height:       "5",
		DistanceUnit: "in",
		Weight:       fmt.Sprintf("%.2f", totalOunces),
		MassUnit:     "oz",
	}

	req := ShippoShipmentRequest{
		AddressFrom: sender,
		AddressTo:   toAddress,
		Parcels:     []ShippoParcel{parcel},
		Async:       false,
	}

	var res ShippoShipmentResponse
	err := callShippoAPI("POST", "/shipments/", req, &res)
	if err != nil {
		return nil, err
	}

	return &res, nil
}

// PurchaseShippoLabel buys a shipping label using the chosen rate ID
func PurchaseShippoLabel(rateID string) (*ShippoTransactionResponse, error) {
	req := ShippoTransactionRequest{
		Rate:          rateID,
		LabelFileType: "PDF",
		Async:         false,
	}

	var res ShippoTransactionResponse
	err := callShippoAPI("POST", "/transactions/", req, &res)
	if err != nil {
		return nil, err
	}

	if res.Status != "SUCCESS" {
		return nil, fmt.Errorf("Shippo transaction failed with status: %s", res.Status)
	}

	return &res, nil
}
