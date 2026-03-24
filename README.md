# ZenRestro - Restaurant Management SaaS

A comprehensive restaurant management system with full backend logic, built with Node.js, Express, MongoDB, and React.

## Features Implemented

### 1. User System ✅
- Admin login with JWT authentication
- Role-based access control (Admin, Super Admin, Staff)
- Secure password hashing with bcrypt

### 2. Menu Management ✅
- Add/Edit/Delete food items
- Categories (Starters, Main Course, Beverages, etc.)
- Price, image, availability toggle
- Tax rate configuration

### 3. Order System ✅
- Customer order placement
- Unique Order ID generation
- Order status tracking: Pending → Preparing → Ready → Delivered
- Dine-in, Take-away, and Delivery options
- Table number assignment

### 4. Billing System ✅
- Auto-calculate totals
- Tax/GST calculation
- Payment method tracking
- Bill history
- WhatsApp bill sharing

### 5. Admin Dashboard ✅
- Today's order statistics
- Revenue summary
- Filter by order status
- Daily reports

### 8. API Structure ✅
- RESTful APIs
- Proper routes:
  - `/api/auth` - Authentication
  - `/api/menu` - Menu management
  - `/api/orders` - Order management
  - `/api/bills` - Billing
  - `/api/tables` - Table & Booking management
  - `/api/inventory` - Inventory tracking
  - `/api/reports` - Reports & analytics

- User
- Restaurant
- MenuItem
- MenuCategory
- Order
- Bill
- Inventory
- Subscription

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React, Vite, Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB (Local or Atlas)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (Local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   MONGODB_URI=mongodb://localhost:27017/zenrestro
   PORT=5000
   JWT_SECRET=your-secret-key
   ALLOWED_ORIGINS=http://localhost:3000
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Backend (Terminal 1)**
```bash
cd backend
npm start
```
Server runs on http://localhost:5000

**Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:3000

### Seeding the Database**

```bash
curl -X POST http://localhost:5000/api/seed
```

Default admin credentials:
- Email: `pandat.official@gmail.com`
- Password: `pandat@280899`

## Docker Deployment

For containerized deployment using Docker:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 3000

## Project Structure

```
zenrestro-main/
├── backend/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── bills.js
│   │   └── ...
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Bills.jsx
│   │   │   ├── Menu.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menu/categories` - Get categories
- `POST /api/menu/categories` - Create category
- `GET /api/menu/items` - Get menu items
- `POST /api/menu/items` - Create item
- `PUT /api/menu/items/:id` - Update item
- `DELETE /api/menu/items/:id` - Delete item

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/today` - Today's statistics

// Tables & Bookings removed

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create bill
- `GET /api/bills/:id` - Get bill details

## Production Deployment

### Render.com (Already Configured)
The project includes `render.yaml` for easy deployment to Render.

1. Push code to GitHub
2. Connect GitHub repo to Render
3. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret
   - `ALLOWED_ORIGINS`: Your frontend URL

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/zenrestro
PORT=5000
JWT_SECRET=<strong-random-string>
ALLOWED_ORIGINS=https://your-domain.com
```

## License

This project is proprietary software. All rights reserved.
