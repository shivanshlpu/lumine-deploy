const mongoose = require('mongoose');

const parkingEventSchema = new mongoose.Schema({
    timestamp: { type: String, required: true },
    plateNumber: { type: String, default: '' },
    plateConfidence: { type: Number, default: 0 },
    eventType: { type: String, enum: ['entering', 'exiting'], required: true },
    gateId: { type: String, required: true },
    carType: { type: String, default: 'unknown' },
    carColor: { type: String, default: 'unknown' },
    sessionId: { type: String, default: '' }
}, { _id: false });

const parkingZoneSchema = new mongoose.Schema({
    zoneId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gateIds: [{ type: String }],
    temple: { type: String, default: 'Somnath Mandir' },
    distance: { type: String, default: '0m' },
    capacity: { type: Number, required: true },
    occupied: { type: Number, default: 0 },
    carsIn: { type: Number, default: 0 },
    carsOut: { type: Number, default: 0 },
    coordinates: {
        lat: { type: Number, default: 20.8880 },
        lng: { type: Number, default: 70.4010 }
    },
    status: {
        type: String,
        enum: ['available', 'filling', 'almost_full', 'full'],
        default: 'available'
    },
    recentEvents: {
        type: [parkingEventSchema],
        default: []
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Auto-compute status based on occupancy percentage
parkingZoneSchema.methods.computeStatus = function () {
    const pct = (this.occupied / this.capacity) * 100;
    if (pct >= 100) return 'full';
    if (pct >= 90) return 'almost_full';
    if (pct >= 50) return 'filling';
    return 'available';
};

// Keep only last 50 events
parkingZoneSchema.methods.trimEvents = function () {
    if (this.recentEvents.length > 50) {
        this.recentEvents = this.recentEvents.slice(-50);
    }
};

module.exports = mongoose.model('ParkingZone', parkingZoneSchema);
