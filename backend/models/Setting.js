const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'ZenRestro',
  },
  supportEmail: {
    type: String,
    default: 'support@zenrestro.com',
  },
  supportPhone: {
    type: String,
    default: '+91-XXXXXXXXXX',
  },
  defaultTaxRate: {
    type: Number,
    default: 18,
  },
  platformCharge: {
    type: Number,
    default: 2.5,
  },
  minOrderValue: {
    type: Number,
    default: 100,
  },
  maxOrderValue: {
    type: Number,
    default: 10000,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  smsNotifications: {
    type: Boolean,
    default: false,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  platformGSTIN: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Setting', settingSchema);
