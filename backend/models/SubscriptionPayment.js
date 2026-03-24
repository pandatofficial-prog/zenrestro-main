const mongoose = require('mongoose');

const subscriptionPaymentSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'trial'],
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SubscriptionPayment', subscriptionPaymentSchema);
