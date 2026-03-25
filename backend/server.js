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
connectDB().then(async () => {
  try {
    const mongoose = require('mongoose');
    // Drop the old global unique index on billNumber if it exists
    // This is necessary because Mongoose doesn't drop indexes automatically when unique:true is removed.
    await mongoose.connection.collection('bills').dropIndex('billNumber_1');
    console.log('✅ Legacy billNumber_1 index dropped successfully');
  } catch (err) {
    if (err.code !== 27) { // IndexNotFound
      console.log('ℹ️ Legacy index cleanup:', err.message);
    }
  }
});

const app = express();

// Security middleware (first)
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for testing/subagents
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// CORS (after security)
app.use(cors({
  origin: '*', // Temporarily more permissive for cross-subdomain testing
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
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/trial-request', require('./routes/trialRequests'));
// Tables API removed

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
      password: 'Admin@123',
      name: 'Admin',
      role: 'admin',
      restaurantId: restaurant._id,
      phone: '+91 9876543210',
    });

    await User.create({
      email: 'pandat.official@gmail.com',
      password: 'pandat@280899',
      name: 'Super Admin',
      role: 'superadmin',
      phone: '+91 9876543210',
    });

    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API Routes 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API Route not found' });
});

// Root 404 handler (for non-API routes on the backend URL)
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
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
