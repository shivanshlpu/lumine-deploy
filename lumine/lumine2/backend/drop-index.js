require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jaganbhakti900_db_user:shivansh900@shiva100.9apjqfr.mongodb.net/lumine?appName=shiva100';

async function dropIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('bookings');
        
        await collection.dropIndex('bookingNumber_1');
        console.log('Successfully dropped stale index bookingNumber_1');
        
        process.exit(0);
    } catch (error) {
        if (error.codeName === 'IndexNotFound') {
            console.log('Index already dropped or not found.');
        } else {
            console.error('Error dropping index:', error);
        }
        process.exit(0);
    }
}

dropIndex();
