const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const SubscriptionPayment = require('../models/SubscriptionPayment');
const { protect, admin, superadmin } = require('../middleware/auth');

// @route   GET /api/subscription/status
// @desc    Get current subscription status
// @access  Private/Admin
router.get('/status', protect, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Auto-start trial if not started
    if (!restaurant.trialStartDate) {
      restaurant.trialStartDate = new Date();
      restaurant.trialExpiryDate = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000);
      restaurant.subscriptionStatus = 'trial';
      await restaurant.save();

      // Create initial trial record
      await SubscriptionPayment.create({
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        ownerName: req.user.name,
        phoneNumber: req.user.phone || restaurant.phone || 'N/A',
        amount: 0,
        planName: 'Free Trial',
        expiryDate: restaurant.trialExpiryDate,
        status: 'active'
      });
    }

    // Check if trial/plan is expired
    let status = restaurant.subscriptionStatus;
    const now = new Date();

    if (status === 'trial' && new Date(restaurant.trialExpiryDate) < now) {
      status = 'expired';
    } else if (status === 'active' && new Date(restaurant.planExpiryDate) < now) {
      status = 'expired';
    }

    if (status !== restaurant.subscriptionStatus) {
      restaurant.subscriptionStatus = status;
      await restaurant.save();
    }

    res.json({
      plan: restaurant.subscriptionPlan,
      status: restaurant.subscriptionStatus,
      trialStartDate: restaurant.trialStartDate,
      trialExpiryDate: restaurant.trialExpiryDate,
      planExpiryDate: restaurant.planExpiryDate,
      daysLeft: Math.ceil((new Date(status === 'active' ? restaurant.planExpiryDate : restaurant.trialExpiryDate) - now) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscription/upgrade
// @desc    Upgrade to ZenRestro Plan (₹4999 for 15 months)
// @access  Private/Admin
router.post('/upgrade', protect, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Set expiry to 15 months from now
    const now = new Date();
    const expiryDate = new Date(now.setMonth(now.getMonth() + 15));

    restaurant.subscriptionPlan = 'ZenRestro Plan';
    restaurant.subscriptionStatus = 'active';
    restaurant.planExpiryDate = expiryDate;
    restaurant.billingCycle = 'annual'; // 12 + 3 free
    
    await restaurant.save();

    // Create payment record
    await SubscriptionPayment.create({
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      ownerName: req.user.name,
      phoneNumber: req.user.phone || restaurant.phone || 'N/A',
      amount: 4999,
      planName: 'ZenRestro Plan',
      expiryDate: expiryDate,
      status: 'active'
    });

    res.json({
      message: 'Successfully upgraded to ZenRestro Plan!',
      plan: restaurant.subscriptionPlan,
      status: restaurant.subscriptionStatus,
      planExpiryDate: restaurant.planExpiryDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscription/admin/all
// @desc    Get all subscription records (Super Admin only)
// @access  Private/SuperAdmin
router.get('/admin/all', protect, superadmin, async (req, res) => {
  try {
    const subscriptions = await SubscriptionPayment.find()
      .sort({ expiryDate: 1 }) // Closest to expiry first
      .populate('restaurantId', 'name email');
    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
