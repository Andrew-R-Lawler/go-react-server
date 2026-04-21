# go-react-server (Lorem Ipsum Store)

A modern, full-stack e-commerce application built with **Go** (Golang) and **React (Vite)**. The architecture has been completely decoupled and Dockerized to provide an enterprise-grade standalone backend and a blazing fast Nginx-proxied frontend. 

![Project Banner](frontend/public/assets/home_showcase.png)

## 🚀 Tech Stack

### Backend
- **Language:** [Go 1.20+](https://go.dev/)
- **Framework:** [Gin Web Framework](https://gin-gonic.com/)
- **Database:** PostgreSQL (Dockerized instances)
- **Authentication:** JWT (JSON Web Tokens) with HttpOnly secure cookies
- **Payment Processing:** Stripe API integration

### Frontend
- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Shadcn/UI
- **State Management:** React Context API
- **Web Server & Proxy:** Nginx (Serves React files and reverse-proxies all API traffic)

---

## ✨ Core Features

- **Dynamic Storefront**: Browse products, view detailed pages, "New Arrivals", "Featured" collections, and core informational pages.
- **Advanced Shopping Cart**: Add/remove items with a sleek sliding sidebar cart and quantity management.
- **Checkout Processing**: Robust Stripe payment flow.
- **User Accounts & Security**:
  - Secure Registration & Login
  - Database-backed Email Verification
  - Secure Password Reset flow (Forgot Password)
  - Detailed Order History
- **Admin Dashboard**:
  - Add, Edit, and Delete products securely
  - Manage "On Sale" status and Sale Pricing overrides
  - Mark products as "Featured" globally
- **GDPR Cookie Consent**: Embedded consent controls with fallback mechanisms for blocked access.

---

## 🛠️ Installation & Getting Started

### Prerequisites

Ensure you have the following installed on your machine or server:
- [Docker Engine](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### 1. Environment variables
Create a `.env` file in the root directory. Both the frontend and backend pull critical configuration from this single source of truth.

```env
# Backend Ports
PORT=3000

# PostgreSQL Configuration
DB_HOST=db
DB_USER=andrew
DB_PASSWORD=YourPassword!
DB_NAME=Ecotheory_DB

# Security Keys
JWT_SECRET_KEY=your_jwt_secret_key

# Stripe Processing Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Core App Mailing Setup
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password

# Contact Page Mailing
CONTACT_SMTP_HOST=smtp.gmail.com
CONTACT_SMTP_USER=your_email@example.com
CONTACT_SMTP_PASS=your_email_password

# Deployment Domain & Security Config
# NOTE: If deploying over a raw IP (e.g. Unraid network), leave COOKIE_DOMAIN entirely empty!
COOKIE_DOMAIN=
COOKIE_SECURE=false
APP_URL=http://your-server-ip:8080
```

### 2. Spinning up the Containers
To launch the application into a local development environment using the latest source code, use the standard `docker-compose.yml`:

```bash
docker compose up -d --build
```
This automatically boots a clean PostgreSQL instance, builds your Go backend binary, and bundles your React frontend before launching it behind an Nginx reverse proxy. 

### 3. Accessing the Application
Once the containers are successfully running, the full application is unified securely and accessible at:
👉 **`http://localhost:8080`**

*(Note: Never navigate to the raw port 3000 manually natively in the browser, Nginx proxies your API traffic instantly from 8080 automatically).*

---

## ☁️ Deployment (Unraid & Prebuilt Hosts)

If you are deploying to a remote host (like Unraid), we've included a production-ready template that skips compiling code and strictly pulls the latest automated release images from Docker Hub.

1. Create a persistent app data directory for your server.
2. Provide your `.env` configuration file in the directory.
3. Bring in the Unraid-specific compose template:
   ```bash
   docker compose -f docker-compose.unraid.yml up -d
   ```
*(Unraid users can also implement this template natively inside of the Unraid Docker Compose Manager UI plugin).*

---

## 📂 Project Architecture

```text
├── frontend/               # React Codebase
│   ├── src/
│   │   ├── components/     # Primary UI Components & React Pages
│   │   ├── context/        # React Context logic (Auth, Cart, Cookies)
│   │   └── assets/         # Images, SVG data, and CSS
│   ├── nginx.conf          # Nginx Reverse Proxy routing config
│   └── Dockerfile          # Multi-stage Vite+Bun environment -> Nginx server
│
├── backend/                # Go Codebase
│   ├── handlers/           # Route logic (Auth, Shop, Product, Payment)
│   ├── server.go           # Gin Server Setup & Database Table Initialization
│   └── Dockerfile          # Extremely lightweight Alpine Go deployment
│
├── docker-compose.yml      # Standard development compose stack
├── docker-compose.unraid.yml # Pre-built registry image stack for deployments
└── .env                    # Shared application configuration  (See template above)
```

## 🧪 Testing

Both environments include robust testing suites.

**Backend Tests:**
```bash
cd backend
go test ./... -v
```

**Frontend Tests:**
```bash
cd frontend
bun run test
```

## 📄 License
This project is open source and strictly available under the MIT License.
