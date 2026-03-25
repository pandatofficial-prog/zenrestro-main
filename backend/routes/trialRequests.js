const express = require('express');
const router = express.Router();
const TrialRequest = require('../models/TrialRequest');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { protect, superadmin } = require('../middleware/auth');

// @route   POST /api/trial-requests
// @desc    Submit a new trial request
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { restaurantName, ownerName, phone, email, city, businessType } = req.body;

    // 1. Basic Server Side Validation
    if (!restaurantName || !ownerName || !phone || !email || !city || !businessType) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // 2. Prevent Duplicate Phone (Unique Check)
    const existingByPhone = await TrialRequest.findOne({ phone });
    if (existingByPhone) {
      return res.status(400).json({ success: false, message: 'A request with this phone number already exists' });
    }

    // 3. Create Request
    const request = await TrialRequest.create({
      restaurantName,
      ownerName,
      phone,
      email,
      city,
      businessType,
      status: 'pending' // default
    });

    res.status(201).json({ 
      success: true, 
      message: 'Request submitted successfully. Our team will contact you shortly.',
      data: request 
    });
  } catch (error) {
    console.error('Trial Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// @route   GET /api/trial-requests
// @desc    Get all requests for Admin
// @access  Private/Superadmin
router.get('/', protect, superadmin, async (req, res) => {
  try {
    // Sort by newest
    const requests = await TrialRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
});

// @route   PUT /api/trial-requests/:id/approve
// @desc    Approve a request and provision account
// @access  Private/Superadmin
router.put('/:id/approve', protect, superadmin, async (req, res) => {
  try {
    const request = await TrialRequest.findById(req.params.id);
    const sendEmail = require('../utils/sendEmail');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: `Request is already ${request.status}` });

    // 1. Create Restaurant
    const restaurant = await Restaurant.create({
      name: request.restaurantName,
      phone: request.phone,
      address: request.city,
      subscriptionStatus: 'trial',
      trialStartDate: new Date(),
      trialExpiryDate: new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
    });

    // 2. Create User
    const user = await User.create({
      email: request.email,
      password: 'Restro@123',
      name: request.ownerName,
      role: 'admin',
      restaurantId: restaurant._id,
      phone: request.phone,
      isActive: true
    });

    // 3. Notify
    try {
      await sendEmail({
        email: request.email,
        ownerName: request.ownerName,
        restaurantName: request.restaurantName,
        subject: 'ZenRestro - Free Trial Approved'
      });
    } catch (e) {
      console.warn('Email notify failed');
    }

    // 4. Update Status
    request.status = 'approved';
    await request.save();

    res.json({ success: true, message: 'Trial approved and account created.' });
  } catch (error) {
    console.error('Approval Error:', error);
    res.status(500).json({ success: false, message: 'Approval failed' });
  }
});

// @route   PUT /api/trial-requests/:id/reject
// @desc    Reject a request
// @access  Private/Superadmin
router.put('/:id/reject', protect, superadmin, async (req, res) => {
  try {
    const request = await TrialRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Request rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Rejection failed' });
  }
});

module.exports = router;
