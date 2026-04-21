package handlers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"io"
	"log"
	"os"
)

// getEncryptionKey forcefully derives a valid 32-byte AES-256 key from environment variables.
func getEncryptionKey() []byte {
	key := os.Getenv("ENCRYPTION_KEY")
	if key == "" {
		key = "EcotheoryDefaultEncryptionKeyXYZ1" // 32 chars long exactly
	}
	// Verify length is 32 bytes, pad or truncate if user mess-up
	keyBytes := []byte(key)
	if len(keyBytes) < 32 {
		padding := make([]byte, 32-len(keyBytes))
		keyBytes = append(keyBytes, padding...)
	} else if len(keyBytes) > 32 {
		keyBytes = keyBytes[:32]
	}
	return keyBytes
}

// EncryptPII securely encrypts plain text string data to AES-256 GCM Base64 at rest.
func EncryptPII(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil // Don't encrypt empty fields
	}

	key := getEncryptionKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptPII safely decrypts an AES-256 GCM ciphertext payload back into plain text.
func DecryptPII(encryptedText string) (string, error) {
	if encryptedText == "" {
		return "", nil
	}

	encData, err := base64.StdEncoding.DecodeString(encryptedText)
	if err != nil {
		// Possibly old Unencrypted data or malformed base64. 
		// We can return the raw string as fallback for backwards compatibility, or error.
		return encryptedText, nil
	}

	key := getEncryptionKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	if len(encData) < nonceSize {
		// Too short, treat as unencrypted legacy data
		return encryptedText, nil
	}

	nonce, ciphertext := encData[:nonceSize], encData[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		// Decryption failed. Potentially bad key or unencrypted legacy data.
		log.Printf("Warning: Decryption failed for PII payload. Returning raw data. Error: %v", err)
		return encryptedText, nil
	}

	return string(plaintext), nil
}
