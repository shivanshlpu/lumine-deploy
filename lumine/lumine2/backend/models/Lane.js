const mongoose = require('mongoose');

const LaneSchema = new mongoose.Schema({
    laneId: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        lat: Number,
        lng: Number
    },
    temperature: Number,
    humidity: Number,
    heatIndex: Number,
    crowdCount: Number,
    status: {
        type: String,
        enum: ['GREEN', 'YELLOW', 'RED', 'unplaced'], // Added 'unplaced'
        default: 'unplaced'
    },
    gateStatus: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    isSos: { type: Boolean, default: false },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lane', LaneSchema);
