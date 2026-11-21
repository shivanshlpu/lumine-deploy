const mongoose = require('mongoose');

const AiCameraSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        default: 'AI Camera'
    },
    lat: {
        type: Number,
        default: 20.8880
    },
    lon: {
        type: Number,
        default: 70.4010
    },
    angle: {
        type: Number,
        default: 0
    },
    fov: {
        type: Number,
        default: 60
    },
    source: {
        type: String,
        default: '0'
    },
    height: {
        type: Number,
        default: 3.0
    },
    tilt: {
        type: Number,
        default: 20.0
    },
    status: {
        type: String,
        enum: ['Online', 'Offline', 'Connecting'],
        default: 'Connecting'
    },
    lastFeedTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('AiCamera', AiCameraSchema);
