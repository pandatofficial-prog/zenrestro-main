const mongoose = require('mongoose');

const trialRequestSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  businessType: {
    type: String,
    enum: ['Cafe', 'Restaurant', 'Cloud Kitchen'],
    required: [true, 'Business type is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TrialRequest', trialRequestSchema);
