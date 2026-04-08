const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    temple: String,
    date: String,
    timeSlot: String,
    members: [{
        name: String,
        age: String,
        gender: String,
        mobile: String,
        email: String,
        aadhaar_mask: String,
        aadhaar_full: String, // Storing full if needed for search, or just rely on mask if that's what was planned. Plan said "Search by Aadhaar".
        // To search by full Aadhaar, we need to save it. The frontend hook had "aadhaar" in state.
        cardId: String, // Mapped from login_id
        displayId: String, // The human readable ID
        disability: String // For special assistance
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for fast searching
BookingSchema.index({ "members.aadhaar_full": 1 });
BookingSchema.index({ "members.cardId": 1 });

module.exports = mongoose.model('Booking', BookingSchema);
