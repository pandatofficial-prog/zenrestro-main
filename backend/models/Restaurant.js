const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  logo: {
    type: String,
  },
  taxRate: {
    type: Number,
    default: 18, // GST 18%
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100'],
  },
  currency: {
    type: String,
    default: '₹',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscriptionPlan: {
    type: String,
    enum: ['Free Trial', 'Basic', 'Premium'],
    default: 'Free Trial',
  },
  billingCycle: {
    type: String,
    enum: ['none', 'monthly', 'half-yearly', 'annual'],
    default: 'none',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'trialing', 'expired'],
    default: 'trialing',
  },
  subscriptionExpires: {
    type: Date,
    default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
  },
  gstin: {
    type: String,
    trim: true,
  },
  isGstVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
