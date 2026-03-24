const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const SubscriptionPayment = require('../models/SubscriptionPayment');
const { protect, superadmin } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aapkirasoi2024', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Superadmin can specify role and existing restaurant)
// @access  Private/Superadmin
router.post('/register', protect, superadmin, async (req, res) => {
  try {
    const { email, password, name, role, restaurantId, restaurantName, phone, address, isActive } = req.body;

    // Validate inputs
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let finalRestaurantId = restaurantId === '' ? undefined : restaurantId;

    // If no restaurantId is provided and it's an admin role, create a new restaurant
    if (!finalRestaurantId && role === 'admin' && restaurantName) {
      const restaurant = await Restaurant.create({
        name: restaurantName || name + "'s Restaurant",
        phone,
        address,
      });
      finalRestaurantId = restaurant._id;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'admin',
      restaurantId: finalRestaurantId,
      phone,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.name === 'ValidationError' ? Object.values(error.errors).map(val => val.message).join(', ') : (error.message || 'Server error') 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    if (user.isActive === false) {
      return res.status(401).json({ message: 'Your account is inactive. Please contact your administrator.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    let restaurant = null;
    if (user.restaurantId) {
      try {
        restaurant = await Restaurant.findById(user.restaurantId);
        
        // Requirement: Auto-start 7-day trial on first login
        if (restaurant && !restaurant.trialStartDate && user.role === 'admin') {
          const trialDate = new Date();
          const expiryDate = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000);
          
          restaurant.trialStartDate = trialDate;
          restaurant.trialExpiryDate = expiryDate;
          restaurant.subscriptionStatus = 'trial';
          await restaurant.save();

          // Log the trial start in SubscriptionPayment
          await SubscriptionPayment.create({
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            ownerName: user.name,
            phoneNumber: user.phone || restaurant.phone || 'N/A',
            amount: 0,
            planName: 'Free Trial',
            expiryDate: expiryDate,
            status: 'active'
          });
          
          console.log(`Auto-started trial for restaurant: ${restaurant.name}`);
        }
      } catch (err) {
        console.error('Restaurant fetch/trial error during login:', err.message);
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurant: restaurant,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let restaurant = null;
    if (user.restaurantId) {
      try {
        restaurant = await Restaurant.findById(user.restaurantId);
      } catch (err) {
        console.error('Restaurant fetch error during profile fetch:', err.message);
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurant: restaurant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.gstin = req.body.gstin || user.gstin;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/all-users
// @desc    Get all users
// @access  Private/Superadmin
router.get('/all-users', protect, superadmin, async (req, res) => {
  try {
    // Migration: Ensure all existing users are marked as active by default
    await User.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update any user
// @access  Private/Superadmin
router.put('/users/:id', protect, superadmin, async (req, res) => {
  try {
    const { name, email, role, restaurantId, password, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.restaurantId = restaurantId === '' ? null : (restaurantId || user.restaurantId);
    if (isActive !== undefined) user.isActive = isActive;
    
    if (password) {
      user.password = password;
    }

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ 
      message: error.name === 'ValidationError' ? Object.values(error.errors).map(val => val.message).join(', ') : (error.message || 'Server error') 
    });
  }
});

// @route   PUT /api/auth/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private/Superadmin
router.put('/users/:id/toggle-status', protect, superadmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`, isActive: user.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user
// @access  Private/Superadmin
router.delete('/users/:id', protect, superadmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // In a real app, send email with token. Here we just return it for demo.
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'aapkirasoi2024', {
      expiresIn: '10m',
    });

    res.json({ 
      message: 'Reset link generated (Demo: Token provided below)',
      resetToken: resetToken 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.put('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aapkirasoi2024');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    res.status(500).json({ message: 'Invalid or expired token' });
  }
});

// @route   GET /api/auth/recover-superadmin
// @desc    Emergency Superadmin Recovery Endpoint
// @access  Public
router.get('/recover-superadmin', async (req, res) => {
  try {
    const email = 'superadmin@aapkirasoi.com';
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        password: 'Admin@123',
        name: 'Super Admin',
        role: 'superadmin',
        phone: '+91 9876543210'
      });
      return res.json({ message: 'Superadmin created successfully', email: email, password: 'Admin@123' });
    }

    user.password = 'Admin@123';
    await user.save();
    res.json({ message: 'Superadmin password reset successfully', email: email, password: 'Admin@123' });
  } catch (error) {
    console.error('Recovery Error:', error);
    res.status(500).json({ message: 'Error recovering superadmin account', error: error.message });
  }
});

// @route   GET /api/auth/recover-admin
// @desc    Emergency Admin Recovery Endpoint
// @access  Public
router.get('/recover-admin', async (req, res) => {
  try {
    const email = 'admin@demo.com';
    let user = await User.findOne({ email });

    if (!user) {
      // Create admin if completely missing
      const restaurant = await Restaurant.findOne(); // Grab first restaurant
      user = await User.create({
        email,
        password: 'Admin@123',
        name: 'Restaurant Admin',
        role: 'admin',
        restaurantId: restaurant ? restaurant._id : null,
        phone: '+91 9876543210'
      });
      return res.json({ message: 'Admin created successfully', email: email, password: 'Admin@123' });
    }

    user.password = 'Admin@123';
    await user.save();
    res.json({ message: 'Admin password reset successfully', email: email, password: 'Admin@123' });
  } catch (error) {
    console.error('Recovery Error:', error);
    res.status(500).json({ message: 'Error recovering admin account', error: error.message });
  }
});

module.exports = router;
