const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Adjust path since this is inside backend/
const User = require('../models/User');

dotenv.config();

const migrateUsers = async () => {
  try {
    // Try to find the .env file in the current or parent directory
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenrestro'; 
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(`Successfully updated ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();
