const express = require('express');
const router = express.Router();
const TrialRequest = require('../models/TrialRequest');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { protect, superadmin } = require('../middleware/auth');

// @route   POST /api/trial-requests
// @desc    Submit a new free trial request
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { restaurantName, ownerName, phone, email, city, businessType } = req.body;

    // Validate
    if (!phone || !restaurantName || !ownerName || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for duplicate request with same phone/email
    const existing = await TrialRequest.findOne({ $or: [{ phone }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'Request already exists for this phone or email' });
    }

    const request = await TrialRequest.create({
      restaurantName,
      ownerName,
      phone,
      email,
      city,
      businessType,
    });

    res.status(201).json({ 
      message: 'Request submitted. Our team will contact you shortly.',
      id: request._id 
    });
  } catch (error) {
    console.error('Trial request error:', error);
    res.status(500).json({ message: 'Server error while submitting request' });
  }
});

// @route   GET /api/trial-requests
// @desc    Get all trial requests
// @access  Private/Superadmin
router.get('/', protect, superadmin, async (req, res) => {
  try {
    const requests = await TrialRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// @route   PUT /api/trial-requests/:id/approve
// @desc    Approve request and create user/restaurant
// @access  Private/Superadmin
router.put('/:id/approve', protect, superadmin, async (req, res) => {
  try {
    const request = await TrialRequest.findById(req.params.id);
    const sendEmail = require('../utils/sendEmail');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    // 1. Create Restaurant
    const trialDate = new Date();
    const expiryDate = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000); // 7 day trial

    const restaurant = await Restaurant.create({
      name: request.restaurantName,
      phone: request.phone,
      address: request.city,
      trialStartDate: trialDate,
      trialExpiryDate: expiryDate,
      subscriptionStatus: 'trial',
    });

    // 2. Create Admin User
    const user = await User.create({
      email: request.email,
      password: 'Restro@123', // Demo temporary password
      name: request.ownerName,
      role: 'admin',
      restaurantId: restaurant._id,
      phone: request.phone,
      isActive: true,
    });

    // 3. Send Notification Email
    try {
      await sendEmail({
        email: request.email,
        ownerName: request.ownerName,
        restaurantName: request.restaurantName,
        subject: 'Trial Approved - Login to ZenRestro Dashboard',
      });
    } catch (emailErr) {
      console.warn('Email sending failed during approval:', emailErr.message);
      // Don't fail the whole request just because email failed
    }

    // 4. Mark request approved
    request.status = 'approved';
    await request.save();

    res.json({ message: 'Request approved. Account created & Email Sent.', userEmail: request.email });
  } catch (error) {
    console.error('Approval Error:', error);
    res.status(500).json({ message: 'Approval failed' });
  }
});

// @route   PUT /api/trial-requests/:id/reject
// @desc    Reject request
// @access  Private/Superadmin
router.put('/:id/reject', protect, superadmin, async (req, res) => {
  try {
    const request = await TrialRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Rejection failed' });
  }
});

module.exports = router;
