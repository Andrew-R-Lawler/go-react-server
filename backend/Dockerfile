# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the executable
RUN CGO_ENABLED=0 GOOS=linux go build -o gin-server ./server.go

# Production stage
FROM alpine:latest

WORKDIR /app

# Certificates for HTTPS requests (like Stripe, SMTP, etc)
RUN apk --no-cache add ca-certificates

# Copy from builder
COPY --from=builder /app/gin-server .

# Expose port (default in deployment scripts was 3000 or 8080)
EXPOSE 3000

# Start binary
CMD ["./gin-server"]
