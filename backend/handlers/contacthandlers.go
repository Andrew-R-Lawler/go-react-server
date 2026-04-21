package handlers

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/wneessen/go-mail"
)

type ContactRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Subject   string `json:"subject"`
	Message   string `json:"message"`
}

func SubmitContactForm(c *gin.Context) {
	var req ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request parameters"})
		return
	}

	smtpUser := os.Getenv("CONTACT_SMTP_USER")
	smtpPass := os.Getenv("CONTACT_SMTP_PASS")
	smtpHost := os.Getenv("CONTACT_SMTP_HOST")

	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}

	if smtpUser == "" || smtpPass == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Contact email service not configured"})
		return
	}

	// Email body
	body := fmt.Sprintf(`
		<html>
		<body style="font-family: Arial, sans-serif;">
			<h2>New Contact Form Submission</h2>
			<p><strong>Name:</strong> %s %s</p>
			<p><strong>Email:</strong> %s</p>
			<p><strong>Subject:</strong> %s</p>
			<hr/>
			<p><strong>Message:</strong></p>
			<p style="white-space: pre-wrap;">%s</p>
		</body>
		</html>
	`, req.FirstName, req.LastName, req.Email, req.Subject, req.Message)

	m := mail.NewMsg()
	// Send TO the support email (which is smtpUser here)
	if err := m.To(smtpUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set To address"})
		return
	}
	// Send FROM the support email (to avoid spoofing checks)
	if err := m.From(smtpUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set From address"})
		return
	}
	// Set Reply-To as the user's email
	if err := m.ReplyTo(req.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set Reply-To address"})
		return
	}

	m.Subject(fmt.Sprintf("Contact Form: %s", req.Subject))
	m.SetBodyString(mail.TypeTextHTML, body)

	client, err := mail.NewClient(smtpHost,
		mail.WithTLSPortPolicy(mail.TLSMandatory),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(smtpUser),
		mail.WithPassword(smtpPass),
		mail.WithPort(587),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create mail client"})
		return
	}

	if err := client.DialAndSend(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message sent successfully"})
}
