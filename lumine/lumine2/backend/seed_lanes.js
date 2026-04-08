const mongoose = require('mongoose');
const Lane = require('./models/Lane');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jaganbhakti900_db_user:shivansh900@shiva100.9apjqfr.mongodb.net/lumine?appName=shiva100';

const lanesToSeed = [
    { laneId: '1', displayId: 'LANE_01', location: { lat: 20.8882, lng: 70.4012 } },
    { laneId: '2', displayId: 'LANE_02', location: { lat: 20.8880, lng: 70.4010 } }
];

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        for (const lane of lanesToSeed) {
            // Check if exists using either normalized ID '1' or string 'LANE_01'
            // The system seems to use normalized '1', '2' etc mostly, but let's check.
            // Server.js creates '1', '2'.

            const exists = await Lane.findOne({ laneId: lane.laneId });
            if (!exists) {
                await Lane.create({
                    laneId: lane.laneId,
                    status: 'GREEN',
                    gateStatus: 'OPEN',
                    location: lane.location,
                    temperature: 28,
                    humidity: 50
                });
                console.log(`✅ Created Lane ${lane.laneId}`);
            } else {
                console.log(`ℹ️ Lane ${lane.laneId} already exists`);
            }
        }

        console.log('🎉 Seeding Complete. You can now control both lanes.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
