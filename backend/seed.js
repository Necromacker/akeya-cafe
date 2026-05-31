const mongoose = require('mongoose');
require('dotenv').config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB. No products to seed as per new configuration.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
