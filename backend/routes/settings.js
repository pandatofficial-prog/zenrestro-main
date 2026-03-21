const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, superadmin } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get platform settings
// @access  Private/Superadmin
router.get('/', protect, superadmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings
// @desc    Update platform settings
// @access  Private/Superadmin
router.put('/', protect, superadmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    if (settings) {
      settings = await Setting.findByIdAndUpdate(
        settings._id,
        req.body,
        { new: true }
      );
    } else {
      settings = await Setting.create(req.body);
    }
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
