# Lorem Ipsum Store

A modern, full-stack e-commerce application built with **Go** (Golang) and **React**. This project demonstrates a complete online store with features like user authentication, product management, shopping cart, and Stripe payment integration.

![Project Banner](client/src/assets/home_showcase.png)

## 🚀 Tech Stack

### Backend
- **Language:** [Go](https://go.dev/)
- **Framework:** [Gin Web Framework](https://gin-gonic.com/)
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Payment Processing:** Stripe API

### Frontend
- **Framework:** [React](https://react.dev/) (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI (Radix Primitives)
- **State Management:** React Context API

## ✨ Features

- **Storefront**: Browse products, view details, "New Arrivals", and "Featured" collections.
- **Shopping Cart**: Add/remove items, adjust quantities.
- **Checkout**: Integrated Stripe payment flow.
- **User Accounts**:
  - Secure Registration & Login
  - Email Verification
  - Password Reset (Forgot Password flow)
  - Order History
- **Admin Dashboard**:
  - Add, Edit, and Delete products
  - Manage "On Sale" status and Sale Pricing
  - Mark products as "Featured"
- **Cookie Consent**: GDPR/CCPA compliant consent blocking with "Access Denied" fallback.

## �️ Getting Started

### Prerequisites

Ensure you have the following installed:
- [Go](https://go.dev/dl/) (v1.20+)
- [Node.js](https://nodejs.org/) & npm
- [PostgreSQL](https://www.postgresql.org/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lorem-ipsum-store.git
    cd lorem-ipsum-store
    ```

2.  **Database Setup:**
    - Create a PostgreSQL database (e.g., `go_react_store`).
    - The server will automatically migrate tables on startup.

3.  **Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=go_react_store
    JWT_SECRET=your_jwt_secret_key
    STRIPE_SECRET_KEY=your_stripe_secret_key
    SMTP_USER=your_email@example.com
    SMTP_PASS=your_email_password
    VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
    ```

4.  **Backend Setup:**
    ```bash
    go mod download
    ```

5.  **Frontend Setup:**
    ```bash
    cd client
    npm install
    npm run build
    cd ..
    ```

### Running the Application

1.  **Start the Go Server:**
    The server hosts both the API and the React static files.
    ```bash
    go run server.go
    ```
    
2.  **Access the App:**
    Open your browser and navigate to `http://localhost:3000`.

## 📂 Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components & Pages
│   │   ├── context/        # React Context (Auth, Cart, Cookies)
│   │   └── assets/         # Images & Styles
│   └── dist/               # Built static files (served by Go)
├── handlers/               # Go Route Handlers
│   ├── authhandlers.go     # Auth logic (Login, Register, etc.)
│   ├── shophandlers.go     # Product & Shop logic
│   ├── payment.go          # Stripe integration
│   └── orders.go           # Order management
├── server.go               # Main entry point & Route definitions
├── go.mod                  # Go dependencies
└── .env                    # Environment configuration
```

## � API Endpoints

### Shop
- `GET /api/shop/products` - List all products
- `GET /api/shop/featured` - List featured products
- `GET /api/shop/new-arrivals` - List 3 newest products

### Auth
- `POST /api/user/register` - Create account
- `POST /api/user/login` - Login & receive HttpOnly cookie

### Protected (Requires Auth)
- `POST /api/protected/products` - Add Product (Admin)
- `PUT /api/protected/editproduct/:id` - Edit Product (Admin)
- `DELETE /api/protected/deleteproduct/:id` - Delete Product (Admin)
- `GET /api/protected/orders` - View user orders

## ☁️ Deployment

You can easily deploy this application on a Linux server (Ubuntu/Debian recommended) using the included deployment script. This script handles:
- Environment variable configuration
- Downloading the latest release
- Setting up a `systemd` service for background execution

Run the following command on your server:

```bash
curl -s https://raw.githubusercontent.com/Andrew-R-Lawler/go-react-server/refs/heads/main/scripts/deployment.sh | bash
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
