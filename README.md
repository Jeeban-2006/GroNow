# GroNow - India's Last Minute App

GroNow is a Blinkit-style hyper-local 15-minute grocery delivery platform optimized for real-time tracking, seamless customer experiences, and efficient store-to-driver routing.

## 🚀 Features

- **Progressive Web App (PWA)**: Installable on mobile devices with a native app-like experience.
- **Real-Time GPS Tracking**: Web Geolocation API streams driver coordinates directly to the customer in real-time.
- **Algorithmic Routing**: Intelligent matching of drivers, stores, and customers based on location and inventory.
- **Role-Based Portals**:
  - **Customer App**: Shop items, view cart, place orders, real-time tracking, order history, and notifications hub.
  - **Store Manager**: Accept orders, pack items, and dispatch.
  - **Delivery Partner (Driver)**: Receive delivery payloads, accept trips, get directions, and update delivery status.
  - **Admin Dashboard**: Manage inventory, stores, drivers, and platform analytics.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, PostgreSQL
- **Real-time**: Custom HTTP Polling with optimized backend UPSERTs for sub-second telemetry
- **Authentication**: JWT & bcrypt

## 📦 Project Structure

- `/frontend` - Next.js application containing all 4 role-based portals.
- `/backend` - Express REST API and PostgreSQL database controllers.
- `/database` - SQL schemas and seed data.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Database Setup
```bash
# Create a PostgreSQL database named 'gronow'
# Run the SQL scripts in the /database directory to seed schemas and data
```

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env file with DATABASE_URL, JWT_SECRET, PORT
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure your .env.local with NEXT_PUBLIC_API_URL
npm run dev
```

## 📱 PWA & Mobile UI
GroNow is built with a mobile-first philosophy. The Customer Portal includes a fixed Bottom Navigation Bar, responsive grids, and standard PWA `manifest.json` capabilities allowing users to add it directly to their home screens.

## 📄 License
This project is licensed under the MIT License.
