const mongoose = require('mongoose');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Inventory = require('../models/Inventory');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenrestro';

const clearTransactions = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');

        const orderCount = await Order.countDocuments();
        const billCount = await Bill.countDocuments();

        console.log(`Clearing ${orderCount} orders and ${billCount} bills...`);

        await Order.deleteMany({});
        await Bill.deleteMany({});

        // Optional: Reset inventory counts to original seed levels if needed
        // For now, just clear transactions
        
        console.log('✅ Transactional data cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearTransactions();
