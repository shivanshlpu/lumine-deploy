const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    alertId: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // e.g., 'sos', 'crowd', 'lost_child'
    senderId: { type: String }, // Device ID sending the alert
    receiverId: { type: String }, // Receiver ID where alert was picked up
    location: {
        lat: Number,
        lng: Number
    },
    timestamp: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['new', 'acknowledged', 'assigned', 'resolved'],
        default: 'new'
    },
    assignedTo: { type: String }, // Guard ID
    assignedToName: { type: String }, // Guard Name
    instruction: { type: String }, // Instruction for the guard
    reason: { type: String },
    payload: { type: Object } // Store full raw payload if needed
});

module.exports = mongoose.model('Alert', AlertSchema);
