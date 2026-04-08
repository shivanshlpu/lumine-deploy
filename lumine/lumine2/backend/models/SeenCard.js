const mongoose = require('mongoose');

const SeenCardSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true,
        index: true
    },
    laneId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 86400 // Optional: Auto-delete after 24h to save space
    }
});

module.exports = mongoose.model('SeenCard', SeenCardSchema);
