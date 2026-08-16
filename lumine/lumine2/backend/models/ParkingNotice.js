const mongoose = require('mongoose');

const parkingNoticeZoneSchema = new mongoose.Schema({
    zoneId: String,
    name: String,
    available: Number,
    distance: String,
    status: String
}, { _id: false });

const parkingNoticeSchema = new mongoose.Schema({
    noticeId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    zones: [parkingNoticeZoneSchema],
    publishedBy: { type: String, default: 'Parking Admin' },
    publishedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('ParkingNotice', parkingNoticeSchema);
