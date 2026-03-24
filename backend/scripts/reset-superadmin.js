const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenrestro';

const resetSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'pandat.official@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Superadmin user not found. Creating new one...');
      await User.create({
        email,
        password: 'pandat@280899',
        name: 'Super Admin',
        role: 'superadmin',
        phone: '+91 9876543210'
      });
      console.log('Created superadmin: ' + email + ' / pandat@280899');
    } else {
      console.log('Found superadmin. Resetting password...');
      user.password = 'pandat@280899';
      await user.save();
      console.log('Password reset successfully to: pandat@280899');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetSuperAdmin();
