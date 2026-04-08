const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Lane = require('./models/Lane');
const SensorHistory = require('./models/SensorHistory');
const Alert = require('./models/Alert');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Admin = require('./models/Admin');
const SeenCard = require('./models/SeenCard'); // Added
const { keccak256, toUtf8Bytes } = require("ethers");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jaganbhakti900_db_user:shivansh900@shiva100.9apjqfr.mongodb.net/lumine?appName=shiva100';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    console.log(`🔔 Incoming Request: ${req.method} ${req.url}`);
    next();
});


mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });


const calculateStatus = (temp, hum) => {
    if (temp > 35) return 'RED';
    if (temp > 30) return 'YELLOW';
    return 'GREEN';
};




app.get('/', (req, res) => {
    res.send('Lumine Backend is Running');
});



// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, aadhaar } = req.body;
        if (!fullName || !email || !password) return res.status(400).json({ error: 'Required fields missing' });

        const userExists = await User.findOne({ $or: [{ email }, { username: email }] });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const newUser = new User({ fullName, email, username: email, password, phoneNumber, aadhaar: aadhaar || 'NOT_PROVIDED', role: 'devotee' });
        await newUser.save();
        console.log(`👤 New User Registered: ${fullName}`);
        res.json({ success: true, message: 'User registered successfully', user: { fullName, email, role: 'devotee' } });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { user_id, password, role } = req.body;
        if (!user_id || !password) return res.status(400).json({ error: 'User ID and Password are required' });

        let user = null;
        if (role === 'mandir_admin') {
            user = await Admin.findOne({ $or: [{ email: user_id }, { username: user_id }] });
        } else {
            user = await User.findOne({ $or: [{ email: user_id }, { username: user_id }, { phoneNumber: user_id }] });
        }

        if (!user) return res.status(400).json({ error: 'User not found' });
        if (user.password !== password) return res.status(401).json({ error: 'Invalid Credentials' });

        let redirectUrl = '/dashboard';
        if (user.role === 'mandir_admin' || role === 'mandir_admin') redirectUrl = '/admin/dashboard';
        else if (user.role === 'security_guard') redirectUrl = '/guard/dashboard';
        else if (user.role === 'parking') redirectUrl = '/parking/dashboard';
        else if (user.role === 'counter') redirectUrl = '/counter/dashboard';

        console.log(`✅ Login Success: ${user.fullName} (${user.role})`);
        res.json({ success: true, token: 'mock-jwt-token-' + Date.now(), redirectUrl, role: user.role, user: { fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: user.role } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Admin Register (Blockchain)
app.post('/api/auth/admin/register', async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, aadhaar } = req.body;
        if (!fullName || !email || !password || !phoneNumber || !aadhaar) return res.status(400).json({ error: 'All fields are required' });

        const adminExists = await Admin.findOne({ email });
        if (adminExists) return res.status(400).json({ error: 'Admin email already registered' });

        const timestamp = new Date().toISOString();
        const phoneHash = keccak256(toUtf8Bytes(phoneNumber));
        const aadhaarHash = keccak256(toUtf8Bytes(aadhaar));
        const qr_text = "Lumine Admin Pass\n" + "Admin: " + fullName + "\n" + "MobileHash: " + phoneHash + "\n" + "AadhaarHash: " + aadhaarHash + "\n" + "Timestamp: " + timestamp + "\n";
        const adminHash = keccak256(toUtf8Bytes(qr_text));

        const newAdmin = new Admin({ fullName, email, username: email, password, phoneNumber, aadhar: aadhaar, adminHash: adminHash, qrText: qr_text, role: 'mandir_admin' });
        await newAdmin.save();
        const qrCodeImage = await QRCode.toDataURL(qr_text);
        console.log(`🔗 New Blockchain Admin Registered: ${fullName} (Hash: ${adminHash})`);

        // Blockchain Scripts
        const { exec } = require('child_process');
        const path = require('path');
        const scriptDir = path.join(__dirname, '../block/temple_pass');
        const command1 = `node make_pass.js "${phoneNumber}" "${aadhaar}" "${timestamp}"`;
        exec(command1, { cwd: scriptDir }, (error1, stdout1) => {
            if (!error1) {
                exec('node check_pass.js', { cwd: scriptDir }, (error2, stdout2) => {
                    if (!error2 && !stdout2.includes('true')) {
                        exec('node store_pass.js', { cwd: scriptDir }, () => { });
                    }
                });
            }
        });

        res.json({ success: true, message: 'Admin registered.', user: { fullName, email, userHash: adminHash, qrCode: qrCodeImage, role: 'mandir_admin' } });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Admin Verify Identity (2FA)
app.post('/api/auth/admin/verify-identity', async (req, res) => {
    try {
        const { email, identifier, value } = req.body;
        if (!email || !identifier || !value) return res.status(400).json({ error: 'Missing details' });

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: 'Admin not found' });

        let isValid = (identifier === 'mobile' && admin.phoneNumber === value) || (identifier === 'aadhaar' && admin.aadhar === value);
        if (!isValid) return res.status(400).json({ error: 'Identity mismatch.' });

        // Hash Check Logic (Simplified for integration)
        const timestampMatch = admin.qrText.match(/Timestamp: (.*)/);
        const originalTimestamp = timestampMatch ? timestampMatch[1].trim() : '';
        const reconstructedHash = keccak256(toUtf8Bytes("Lumine Admin Pass\n" + "Admin: " + admin.fullName + "\n" + "MobileHash: " + keccak256(toUtf8Bytes(admin.phoneNumber)) + "\n" + "AadhaarHash: " + keccak256(toUtf8Bytes(admin.aadhar)) + "\n" + "Timestamp: " + originalTimestamp + "\n"));

        if (reconstructedHash !== admin.adminHash) return res.status(500).json({ error: 'Security Warning: Hash Mismatch' });

        res.json({ success: true, message: 'Identity Verified' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});






const handleSensorUpdate = async (req, res) => {
    try {
        console.log('📥 Received Data:', JSON.stringify(req.body));

        let { laneId, temperature, humidity, heatIndex, status, count, cardId, sos, isSos, issos, receiver_coord, sender_id, lastCardId, seenCards } = req.body;

        if (issos === true || isSos === true) sos = true;
        if (sender_id && !cardId) cardId = sender_id;
        if (!cardId && lastCardId) cardId = lastCardId;
        if (!cardId && seenCards && Array.isArray(seenCards) && seenCards.length > 0) {
            cardId = seenCards[0];
        }

        let normalizedLaneId = laneId;
        if (typeof laneId === 'string') {
            const numMatch = laneId.match(/\d+/);
            if (numMatch) normalizedLaneId = parseInt(numMatch[0], 10);
        }


        if (cardId) {
            let formattedCardId = cardId.includes('card_node_') ? cardId.replace('card_node_', 'card_') : cardId;
            try {
                const seenCard = new SeenCard({ cardId: formattedCardId, laneId: String(normalizedLaneId) });
                await seenCard.save();
                console.log(`👀 Card Seen Saved: ${formattedCardId} at Lane ${normalizedLaneId}`);
            } catch (cardErr) { console.error('Error saving SeenCard:', cardErr); }
        }


        let laneDoc = await Lane.findOne({ laneId: String(normalizedLaneId) });
        if (!laneDoc) {
            console.log(`🆕 New Lane Detected: ${normalizedLaneId}`);
            let defaultLocation = null;
            if (['2', '3', '4'].includes(String(normalizedLaneId))) defaultLocation = { lat: 20.8880, lng: 70.4010 }; // Main Gate
            else if (String(normalizedLaneId) === '1') defaultLocation = { lat: 20.8882, lng: 70.4012 }; // Lane 1

            laneDoc = new Lane({ laneId: String(normalizedLaneId), status: 'unplaced', location: receiver_coord ? { lat: receiver_coord.x, lng: receiver_coord.y } : defaultLocation });
            await laneDoc.save();

            io.emit('receiver_added', { receiver_id: String(normalizedLaneId), label: `lane_${normalizedLaneId}`, x: laneDoc.location?.lat, y: laneDoc.location?.lng, device_type: 'hardware_sensor' });
        }


        if (sos === true || req.body.type === 'sos') {
            console.log(`🚨 SOS TRIGGERED!`);
            const existingAlert = await Alert.findOne({ receiverId: String(normalizedLaneId), status: { $ne: 'resolved' } });

            if (!existingAlert) {
                const alertId = `A${Date.now()}`;
                const laneNum = parseInt(normalizedLaneId, 10);
                let alertLocation = (laneNum === 1) ? { lat: 20.8882, lng: 70.4012 } : (laneNum === 2 ? { lat: 20.8880, lng: 70.4010 } : (receiver_coord ? { lat: receiver_coord.x, lng: receiver_coord.y } : laneDoc.location));

                const newAlert = new Alert({ alertId, type: 'sos', senderId: cardId || 'Unknown', receiverId: String(normalizedLaneId), location: alertLocation, reason: req.body.sos_reason || 'Emergency', payload: req.body });
                await newAlert.save();

                io.emit('alert', { type: 'alert', alert_id: alertId, alert_type: 'sos', x: newAlert.location?.lat, y: newAlert.location?.lng, sender_id: newAlert.senderId, reason: newAlert.reason });
                console.log(`🚨 SOS ALERT CREATED: ${alertId}`);
            }
        }


        if (temperature !== undefined && humidity !== undefined) {
            if (!status && temperature) status = calculateStatus(temperature, humidity);

            // Using passed heatIndex/count or defaults to pass validation
            const hIndex = heatIndex !== undefined ? heatIndex : (temperature + (humidity * 0.1));
            const cCount = count !== undefined ? count : 0;

            const newHistory = new SensorHistory({ laneId: String(normalizedLaneId), temperature, humidity, heatIndex: hIndex, status, count: cCount, cardId });
            await newHistory.save();

            const updateData = { temperature, humidity, heatIndex: hIndex, crowdCount: cCount, status, lastUpdated: new Date() };
            if (status === 'RED') updateData.gateStatus = 'CLOSED';
            if (receiver_coord) updateData.location = { lat: receiver_coord.x, lng: receiver_coord.y };

            const updatedLane = await Lane.findOneAndUpdate({ laneId: String(normalizedLaneId) }, updateData, { new: true });
            io.emit('lane-update', updatedLane);
            return res.json({ success: true, data: updatedLane });
        }
        res.json({ success: true, message: 'Event processed' });

    } catch (err) {
        console.error('🔥 SERVER ERROR in /update-sensor:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

app.post('/api/lanes/update-sensor', handleSensorUpdate);
app.post('/api/sensor-data', handleSensorUpdate);
app.post('/api/v1/detections', handleSensorUpdate);
app.post('/api/v1/alerts', handleSensorUpdate);



app.get('/api/lanes', async (req, res) => {
    try {
        const lanes = await Lane.find().sort({ laneId: 1 });
        res.json(lanes);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.get('/api/lane-status', async (req, res) => {
    try {
        const lanes = await Lane.find({}, { laneId: 1, status: 1, gateStatus: 1, temperature: 1, humidity: 1, lastUpdated: 1 }).sort({ laneId: 1 });
        res.json(lanes);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.get('/api/heatmap-data', async (req, res) => {
    try {
        const lanes = await Lane.find().sort({ laneId: 1 });
        res.json(lanes);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.get('/api/heatmap/aggregated', async (req, res) => {
    try {
        const pipeline = [{ $sort: { timestamp: -1 } }, { $group: { _id: "$laneId", latestReport: { $first: "$$ROOT" } } }, { $replaceRoot: { newRoot: "$latestReport" } }];
        const aggregatedData = await SensorHistory.aggregate(pipeline);
        res.json(aggregatedData);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

// Toggle Gate
app.post('/api/lanes/:id/gate', async (req, res) => {
    try {
        const { action } = req.body;
        if (!['OPEN', 'CLOSED'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
        const lane = await Lane.findOneAndUpdate({ laneId: req.params.id }, { gateStatus: action }, { new: true });
        if (lane) { io.emit('lane-update', lane); res.json(lane); } else { res.status(404).json({ error: 'Lane not found' }); }
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});



app.get('/api/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find({ status: { $ne: 'resolved' } }).sort({ timestamp: -1 });
        res.json(alerts);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.post('/api/alerts/:id/ack', async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate({ alertId: req.params.id }, { status: 'acknowledged' }, { new: true });
        if (alert) { io.emit('alert_status', { alert_id: alert.alertId, status: 'acknowledged' }); res.json(alert); }
        else { res.status(404).json({ error: 'Alert not found' }); }
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.get('/api/alerts/:id/assign', async (req, res) => {
    try {
        const alert = await Alert.findOne({ alertId: req.params.id });
        if (alert) res.json({ alertId: alert.alertId, status: alert.status, assignedTo: alert.assignedTo, assignedToName: alert.assignedToName, instruction: alert.instruction, location: alert.location, type: alert.type, reason: alert.reason });
        else res.status(404).json({ error: 'Alert not found' });
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.post('/api/alerts/:id/assign', async (req, res) => {
    try {
        const { guardId, guardName, instruction } = req.body;
        const alert = await Alert.findOneAndUpdate({ alertId: req.params.id }, { status: 'assigned', assignedTo: guardId, assignedToName: guardName, instruction: instruction }, { new: true });
        if (alert) {
            io.emit('alert_status', { alert_id: alert.alertId, status: 'assigned', guardId });
            io.emit('task_assigned', { id: alert.alertId, type: alert.type, title: `${alert.type.toUpperCase()} Alert`, location: `${alert.location.lat}, ${alert.location.lng}`, desc: alert.reason, instruction: instruction || 'Proceed to location immediately.', status: 'assigned', guardId: guardId });
            res.json(alert);
        } else { res.status(404).json({ error: 'Alert not found' }); }
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.post('/api/tasks/assign', async (req, res) => {
    try {
        const { guardId, guardName, jobType, instruction, location, locationText } = req.body;
        const taskId = `T${Date.now()}`;
        io.emit('task_assigned', { id: taskId, type: 'manual_task', title: jobType, location: locationText || (location ? `${location[0]}, ${location[1]}` : 'Assigned Sector'), desc: `Manual assignment: ${jobType}`, instruction: instruction || 'Execute assigned task.', status: 'assigned', guardId: guardId });
        console.log(`📋 Manual Task Assigned to ${guardName}`);
        res.json({ success: true, taskId, message: 'Task assigned successfully' });
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

app.post('/api/alerts/:id/resolve', async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate({ alertId: req.params.id }, { status: 'resolved' }, { new: true });
        if (alert) { io.emit('alert_status', { alert_id: alert.alertId, status: 'resolved' }); res.json(alert); }
        else res.status(404).json({ error: 'Alert not found' });
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});




// Verify Member
app.post('/api/bookings/verify-member', async (req, res) => {
    try {
        const { bookingId, memberId, cardId, aadhaar_full } = req.body;
        const booking = await Booking.findOne({ bookingId });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        const member = booking.members.id(memberId) || booking.members.find(m => m.aadhaar_full === aadhaar_full);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        member.cardId = cardId;
        await booking.save();
        res.json({ success: true, message: 'Member verified success', booking });
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

// Walkin
app.post('/api/bookings/walkin', async (req, res) => {
    try {
        const { name, age, gender, disability, email, aadhaar_full, cardId, mobile } = req.body;
        const bookingId = `WALKIN-${Date.now()}`;
        const newBooking = new Booking({ bookingId, temple: 'Somnath', date: new Date().toISOString().split('T')[0], timeSlot: 'WALK-IN', members: [{ name, age, gender, mobile, email, aadhaar_full, cardId, displayId: bookingId, disability }], timestamp: new Date() });
        await newBooking.save();
        res.json({ success: true, message: 'Walk-in registered', booking: newBooking });
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

// List Bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const { type } = req.query;
        let filter = {};
        if (type === 'walkin') filter.timeSlot = 'WALK-IN';
        else if (type === 'online') filter.timeSlot = { $ne: 'WALK-IN' };
        const bookings = await Booking.find(filter).sort({ timestamp: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

// Lost Child
app.get('/api/search/lost-child', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query required' });

        let member = null;
        let booking = await Booking.findOne({ "members.cardId": q });

        if (booking) {
            member = booking.members.find(m => m.cardId === q);
        }

        // If no member found, check if we have seen this card
        const lastSeen = await SeenCard.findOne({ cardId: q }).sort({ timestamp: -1 });

        if (!member && !lastSeen) {
            return res.status(404).json({ error: 'Card not found (No Booking & No History)' });
        }

        // If seen but no member, create a dummy member object to allow frontend display
        if (!member && lastSeen) {
            member = {
                name: 'Unregistered Card',
                age: 'N/A',
                gender: 'N/A',
                parentMobile: 'Unknown',
                cardId: q
            };
        }

        let currentStatus = null;
        if (lastSeen) {
            const lane = await Lane.findOne({ laneId: lastSeen.laneId });
            if (lane) currentStatus = { laneId: lane.laneId, location: lane.location, status: lane.status, gateStatus: lane.gateStatus };
        }

        res.json({ found: true, member, lastSeen, currentExistance: currentStatus });
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});


app.get('/api/parking/zones', (req, res) => {

    res.json([
        { id: '1', name: 'Main Gate Zone', capacity: 500, occupied: 120 },
        { id: '2', name: 'Temple West Zone', capacity: 500, occupied: 340 }
    ]);
});
app.get('/api/parking/zones/:id/logs', (req, res) => { res.json([]) });


io.on('connection', (socket) => {
    console.log('🔌 Client Connected:', socket.id);
    socket.on('disconnect', () => console.log('❌ Client Disconnected:', socket.id));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Network Access: http://<YOUR_IP>:${PORT}`);
});
