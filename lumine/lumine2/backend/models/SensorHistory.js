const mongoose = require('mongoose');

const SensorHistorySchema = new mongoose.Schema({
    laneId: {
        type: String,
        required: true,
        index: true // Index for faster queries
    },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    heatIndex: { type: Number, required: true },
    count: { type: Number, required: true }, // Mapped from 'count' in payload
    cardId: { type: String }, // Optional: ID of the card seen
    status: {
        type: String,
        enum: ['GREEN', 'YELLOW', 'RED'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // Index for time-based queries
    }
});

module.exports = mongoose.model('SensorHistory', SensorHistorySchema);
