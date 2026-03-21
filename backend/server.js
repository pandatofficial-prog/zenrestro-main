const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware (first)
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// CORS (after security)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'https://zenrestro-web.onrender.com'],
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ZenRestro API is running' });
});

// Seed endpoint (for deployment)
app.post('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Restaurant = require('./models/Restaurant');
    const MenuCategory = require('./models/MenuCategory');
    const MenuItem = require('./models/MenuItem');
    const Inventory = require('./models/Inventory');

    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});
    await Inventory.deleteMany({});

    const restaurant = await Restaurant.create({
      name: 'Demo Restaurant',
      address: '123 Main Street, City',
      phone: '+91 9876543210',
      email: 'demo@restaurant.com',
      taxRate: 18,
      isActive: true,
    });

    await User.create({
      email: 'admin@demo.com',
      password: 'demo123',
      name: 'Admin',
      role: 'admin',
      restaurantId: restaurant._id,
      phone: '+91 9876543210',
    });

    await User.create({
      email: 'superadmin@aapkirasoi.com',
      password: 'demo123',
      name: 'Super Admin',
      role: 'superadmin',
      phone: '+91 9876543210',
    });

    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'production' ? {} : { error: err.message })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
