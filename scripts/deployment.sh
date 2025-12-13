#!/bin/bash
set -e

# Function to print colored output
print_info() {
    echo -e "\e[34m[INFO]\e[0m $1"
}

print_success() {
    echo -e "\e[32m[SUCCESS]\e[0m $1"
}

print_error() {
    echo -e "\e[31m[ERROR]\e[0m $1"
}

# Ensure /dev/tty is available
if [ ! -t 0 ] && [ ! -e /dev/tty ]; then
    print_error "Interactive terminal required. Cannot read from /dev/tty."
    exit 1
fi

# Open /dev/tty on FD 3
exec 3< /dev/tty

# Check for required tools
for cmd in wget unzip; do
    if ! command -v $cmd &> /dev/null; then
        print_error "$cmd is not installed. Please install it first."
        exit 1
    fi
done

clear
print_info "Starting Deployment Setup..."

# --- Environment Variables Setup ---

ask_var() {
    local var_name=$1
    local prompt_text=$2
    local is_secret=$3
    
    echo -e "\n$prompt_text"
    echo -e "\n$prompt_text"
    read -u 3 input_val
    
    if [ -z "$input_val" ]; then
        print_error "$var_name cannot be empty."
        exit 1
    fi
    echo "$var_name=$input_val" >> "$ENV_FILE"
}

ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    print_info "Found existing .env file. Backing it up to .env.bak"
    mv "$ENV_FILE" ".env.bak"
fi

touch "$ENV_FILE"

print_info "Configuring Environment Variables:"

ask_var "PORT" "Enter the PORT to run the server on (e.g., 8080):" "false"
ask_var "DB_HOST" "Enter DB_HOST (e.g., localhost):" "false"
ask_var "DB_NAME" "Enter DB_NAME:" "false"
ask_var "DB_USER" "Enter DB_USER:" "false"
ask_var "DB_PASSWORD" "Enter DB_PASSWORD:" "true"
ask_var "JWT_SECRET" "Enter JWT_SECRET (for session signing):" "true"
ask_var "SMTP_USER" "Enter SMTP_USER (Email):" "false"
ask_var "SMTP_PASS" "Enter SMTP_PASS (Email Password):" "true"
ask_var "STRIPE_SECRET_KEY" "Enter STRIPE_SECRET_KEY:" "true"

print_success ".env file created successfully."

# --- Application Download ---

print_info "Downloading latest release..."
# Remove old zip if exists
rm -f gin-server.zip

if wget -q "https://github.com/Andrew-R-Lawler/go-react-server/releases/latest/download/gin-server.zip"; then
    print_success "Download complete."
else
    print_error "Failed to download release. Check your internet connection or URL."
    exit 1
fi

print_info "Extracting files..."
unzip -o -q gin-server.zip
rm gin-server.zip
print_success "Extraction complete."

BINARY_PATH="./client/dist/binary/gin-server"
if [ ! -f "$BINARY_PATH" ]; then
    print_error "Binary not found at $BINARY_PATH. Deployment failed."
    exit 1
fi

chmod +x "$BINARY_PATH"

# --- Systemd Service Setup (Optional) ---

echo -e "\nWould you like to set up a Systemd service to keep the app running in the background? (y/n)"
read -u 3 setup_service

if [[ "$setup_service" =~ ^[Yy]$ ]]; then
    SERVICE_NAME="go-react-server"
    WORK_DIR=$(pwd)
    USER_NAME=$(whoami)
    
    SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
    
    print_info "Creating systemd service configuration..."
    
    # We need sudo for this
    if ! command -v sudo &> /dev/null; then
        print_error "sudo is required to set up systemd service."
    else
        cat <<EOF | sudo tee $SERVICE_FILE > /dev/null
[Unit]
Description=Go React Server
After=network.target

[Service]
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$WORK_DIR
ExecStart=$WORK_DIR/$BINARY_PATH
Restart=always
EnvironmentFile=$WORK_DIR/.env

[Install]
WantedBy=multi-user.target
EOF
        
        print_info "Reloading systemd daemon..."
        sudo systemctl daemon-reload
        sudo systemctl enable $SERVICE_NAME
        print_info "Starting service..."
        sudo systemctl restart $SERVICE_NAME
        
        print_success "Service started! Check status with: sudo systemctl status $SERVICE_NAME"
        exit 0
    fi
fi

# --- Manual Start ---

print_info "Starting server manually..."
$BINARY_PATH
