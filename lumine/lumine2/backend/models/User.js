const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    aadhaar: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin' // or 'devotee', defaulting to admin as per user request context "admin's register page"
    },
    userHash: {
        type: String,
        unique: true
    },
    qrText: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
