if (process.platform === 'win32') {
    try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {}
}
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
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
const nodemailer = require('nodemailer');
require('dotenv').config();


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jaganbhakti900_db_user:shivansh900@shiva100.9apjqfr.mongodb.net/lumine?appName=shiva100';
const JWT_SECRET = process.env.JWT_SECRET || 'lumine_secure_jwt_secret_key_2026';

// ─── Email Transport Setup ───────────────────────────────────
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const TEMPLE_NAMES = {
    somnath: 'Somnath Temple',
    dwarka: 'Dwarka Temple',
    ambaji: 'Ambaji Temple',
};

const TEMPLE_IMAGES = {
    somnath: 'lumine/lumine2/somnath.jpg',
    dwarka: 'lumine/lumine2/dwarkadheesh_Temple.jpg',
    ambaji: 'lumine/lumine2/ambaji.jpg',
};

/**
 * Generate beautiful HTML email for booking confirmation
 */
const generateBookingEmail = (bookingData, member, isPrimary, allMembers) => {
    const templeId = bookingData.temple.toLowerCase();
    const templeName = TEMPLE_NAMES[templeId] || bookingData.temple;
    const bgUrl = TEMPLE_IMAGES[templeId] || 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    const dateFormatted = new Date(bookingData.date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let membersHtml = '';
    if (isPrimary && allMembers && allMembers.length > 1) {
        membersHtml = `
        <div style="margin-top: 20px; padding: 16px; background: #f8f4f0; border-radius: 12px;">
            <h3 style="color: #012a4a; font-size: 14px; margin: 0 0 12px 0; font-weight: 700;">👥 All Group Members</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="background: #012a4a; color: white;">
                    <th style="padding: 8px 12px; text-align: left; border-radius: 6px 0 0 0;">Name</th>
                    <th style="padding: 8px 12px; text-align: left;">Age</th>
                    <th style="padding: 8px 12px; text-align: left;">ID</th>
                    <th style="padding: 8px 12px; text-align: left; border-radius: 0 6px 0 0;">Aadhaar</th>
                </tr>
                ${allMembers.map((m, i) => `
                <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8f4f0'};">
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e1dc;">${m.name} ${i === 0 ? '⭐' : ''}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e1dc;">${m.age || '-'}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e1dc; font-family: monospace; font-size: 12px;">${m.login_id || '-'}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e1dc;">${m.aadhaar_mask || '-'}</td>
                </tr>
                `).join('')}
            </table>
        </div>`;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 0; background: #f5f0eb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(rgba(1, 42, 74, 0.85), rgba(1, 42, 74, 0.85)), url('${bgUrl}') center/cover; border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                <h1 style="color: #f59e0b; font-size: 28px; margin: 0; letter-spacing: 3px; font-weight: 800;">LUMINE</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 6px 0 0; letter-spacing: 2px;">SMART TEMPLE MANAGEMENT</p>
                <div style="margin-top: 20px; display: inline-block; padding: 4px 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; font-size: 12px; color: white; letter-spacing: 1px;">
                    ${templeName.toUpperCase()}
                </div>
            </div>

            <!-- Success Banner -->
            <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; text-align: center;">
                <span style="font-size: 36px;">✅</span>
                <h2 style="color: white; font-size: 22px; margin: 8px 0 4px;">Booking Confirmed!</h2>
                <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0;">Your darshan slot has been reserved</p>
            </div>

            <!-- Booking Details -->
            <div style="background: white; padding: 28px; border-left: 1px solid #e5e1dc; border-right: 1px solid #e5e1dc;">
                <div style="display: flex; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <p style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Booking ID</p>
                        <p style="color: #012a4a; font-size: 18px; font-weight: 800; margin: 0; font-family: monospace;">${bookingData.booking_id}</p>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0ec; vertical-align: top;">
                            <span style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">🛕 Temple</span><br>
                            <span style="color: #012a4a; font-size: 15px; font-weight: 600;">${templeName}</span>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0ec; vertical-align: top;">
                            <span style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">👤 Devotee</span><br>
                            <span style="color: #012a4a; font-size: 15px; font-weight: 600;">${member.name}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0ec; vertical-align: top;">
                            <span style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">📅 Date</span><br>
                            <span style="color: #012a4a; font-size: 15px; font-weight: 600;">${dateFormatted}</span>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0ec; vertical-align: top;">
                            <span style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">🕐 Time Slot</span><br>
                            <span style="color: #012a4a; font-size: 15px; font-weight: 600;">${bookingData.time_slot}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">🆔 Member ID</span><br>
                            <span style="color: #d97706; font-size: 15px; font-weight: 700; font-family: monospace;">${member.login_id || '-'}</span>
                        </td>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">🪪 Aadhaar</span><br>
                            <span style="color: #012a4a; font-size: 15px; font-weight: 600;">${member.aadhaar_mask || '-'}</span>
                        </td>
                    </tr>
                </table>

                ${membersHtml}

                <!-- QR Code using CID Attachment -->
                <div style="margin-top: 24px; padding: 20px; background: #fefcf9; border: 2px dashed #e5e1dc; border-radius: 12px; text-align: center;">
                    <p style="color: #012a4a; font-size: 13px; font-weight: 700; margin: 0 0 12px;">📱 Your Entry QR Code</p>
                    <img src="cid:qrcode-img" alt="QR Code" style="width: 180px; height: 180px; margin: 0 auto; display: block;" />
                    <p style="color: #9ca3af; font-size: 11px; margin: 12px 0 0;">Show this QR code at the temple gate for entry</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #012a4a; border-radius: 0 0 16px 16px; padding: 20px; text-align: center;">
                <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 0;">🙏 Har Har Mahadev — May your visit be blessed 🙏</p>
                <p style="color: rgba(255,255,255,0.4); font-size: 10px; margin: 8px 0 0;">Lumine Smart Temple Management System</p>
            </div>
        </div>
    </body>
    </html>`;
};

/**
 * Send booking confirmation emails to all members
 */
const sendBookingEmails = async (bookingData) => {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
        console.log('⚠️  Email not configured. Skipping email sending. Set EMAIL_USER and EMAIL_PASSWORD in .env');
        return;
    }

    const members = bookingData.members;
    const primaryMember = members[0];

    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const isPrimary = i === 0;

        if (!member.email) {
            console.log(`⚠️  No email for member: ${member.name}, skipping...`);
            continue;
        }

        try {
            // Generate unique QR code for this member
            const qrData = JSON.stringify({
                bookingId: bookingData.booking_id,
                memberId: member.login_id,
                name: member.name,
                temple: bookingData.temple,
                date: bookingData.date,
                timeSlot: bookingData.time_slot,
            });
            const qrCodeBase64 = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

            // Generate email HTML without embedding the src string
            const html = generateBookingEmail(
                bookingData,
                member,
                isPrimary,
                isPrimary ? members : null
            );

            const templeName = TEMPLE_NAMES[bookingData.temple.toLowerCase()] || bookingData.temple;
            const subject = isPrimary
                ? `✅ Booking Confirmed — ${templeName} | ${bookingData.booking_id}`
                : `🎫 Your Darshan Pass — ${templeName} | ${bookingData.booking_id}`;

            await emailTransporter.sendMail({
                from: `"Lumine Temple System" <${process.env.EMAIL_USER}>`,
                to: member.email,
                subject,
                html,
                attachments: [{
                    filename: 'qrcode.png',
                    path: qrCodeBase64,
                    cid: 'qrcode-img' // same cid value as in the HTML img src
                }]
            });

            console.log(`📧 Email sent to ${member.name} (${member.email}) — ${isPrimary ? 'PRIMARY' : 'MEMBER'}`);
        } catch (emailErr) {
            console.error(`❌ Failed to send email to ${member.email}:`, emailErr.message);
        }
    }
};


const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ─── Rate Limiting & Protection ──────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`🔔 Incoming Request: ${req.method} ${req.url}`);
    next();
});

// ─── Security Helpers ─────────────────────────────────────────
const hashPassword = async (password) => {
    if (!password) return '';
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const verifyPassword = async (inputPassword, storedPassword) => {
    if (!inputPassword || !storedPassword) return false;
    const strPassword = String(storedPassword);
    const strInput = String(inputPassword);
    if (strPassword.startsWith('$2a$') || strPassword.startsWith('$2b$') || strPassword.startsWith('$2y$')) {
        return await bcrypt.compare(strInput, strPassword);
    }
    return strInput === strPassword;
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access Denied: Authorization token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Access Denied: Invalid or expired token' });
        req.user = user;
        next();
    });
};

const seedDefaultAccounts = async () => {
    try {
        const defaultStaff = [
            { fullName: 'Somnath Mandir Admin', email: 'admin@lumine.local', username: 'admin', pass: 'admin123', phone: '9999999999', aadhaar: '123456789012', role: 'mandir_admin' },
            { fullName: 'Security Officer', email: 'guard@lumine.local', username: 'guard', pass: 'shivansh', phone: '8888888888', aadhaar: '111122223333', role: 'security_guard' },
            { fullName: 'Parking Manager', email: 'parking@lumine.local', username: 'parking', pass: 'shivansh', phone: '7777777777', aadhaar: '444455556666', role: 'parking' },
            { fullName: 'Counter Operator', email: 'counter@lumine.local', username: 'counter', pass: 'shivansh', phone: '6666666666', aadhaar: '777788889999', role: 'counter' }
        ];

        for (const staff of defaultStaff) {
            const hashedPass = await hashPassword(staff.pass);
            await User.findOneAndUpdate(
                { $or: [{ username: staff.username }, { email: staff.email }] },
                {
                    fullName: staff.fullName,
                    email: staff.email,
                    username: staff.username,
                    password: hashedPass,
                    phoneNumber: staff.phone,
                    aadhaar: staff.aadhaar,
                    role: staff.role
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        const hashedAdminPass = await hashPassword('admin123');
        await Admin.findOneAndUpdate(
            { $or: [{ username: 'admin' }, { email: 'admin@lumine.local' }] },
            {
                fullName: 'Somnath Mandir Admin',
                email: 'admin@lumine.local',
                username: 'admin',
                password: hashedAdminPass,
                phoneNumber: '9999999999',
                aadhar: '123456789012',
                aadhaar: '123456789012',
                role: 'mandir_admin',
                adminHash: 'default-admin-hash'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('🌱 Default staff and admin accounts seeded & updated successfully');
    } catch (err) {
        console.error('⚠️ Account Seeding Error:', err.message);
    }
};

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        seedDefaultAccounts();
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });


const calculateStatus = (temp, hum) => {
    if (temp > 35) return 'RED';
    if (temp > 30) return 'YELLOW';
    return 'GREEN';
};


// ─── UptimeRobot & Server Health Check Endpoints ───────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        service: 'Lumine Backend API'
    });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/', (req, res) => {
    res.send('Lumine Backend is Running');
});


// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, aadhaar, role } = req.body;
        if (!fullName || !email || !password) return res.status(400).json({ error: 'Required fields missing' });

        const userExists = await User.findOne({ $or: [{ email }, { username: email }] });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const finalRole = role || 'devotee';
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ fullName, email, username: email, password: hashedPassword, phoneNumber, aadhaar: aadhaar || 'NOT_PROVIDED', role: finalRole });
        await newUser.save();
        console.log(`👤 New User Registered: ${fullName} (${finalRole})`);
        res.json({ success: true, message: 'User registered successfully', user: { fullName, email, role: finalRole } });
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'User already exists with this email or username.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Staff Registration (Auto-generates ID & Password)
app.post('/api/auth/staff/register', async (req, res) => {
    try {
        const { fullName, phoneNumber, aadhaar, role, userId, password } = req.body;
        if (!fullName || !phoneNumber || !aadhaar || !role || !userId || !password) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const existingUser = await User.findOne({ username: userId });
        if (existingUser) {
            return res.status(400).json({ error: 'This Login ID is already taken. Please choose another.' });
        }
        
        const dummyEmail = `${userId.toLowerCase()}@lumine.local`;
        const hashedPassword = await hashPassword(password);

        const newUser = new User({ 
            fullName, 
            email: dummyEmail, 
            username: userId, 
            password: hashedPassword, 
            phoneNumber, 
            aadhaar, 
            role 
        });
        
        await newUser.save();
        console.log(`🛡️ New Staff Registered: ${fullName} (${role}) -> ID: ${userId}`);
        
        res.json({ 
            success: true, 
            message: 'Staff registered successfully'
        });
    } catch (err) {
        console.error('Staff Registration Error:', err);
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
            if (!user) {
                user = await User.findOne({ $or: [{ email: user_id }, { username: user_id }, { phoneNumber: user_id }] });
            }
        } else {
            user = await User.findOne({ $or: [{ email: user_id }, { username: user_id }, { phoneNumber: user_id }] });
            if (!user) {
                user = await Admin.findOne({ $or: [{ email: user_id }, { username: user_id }] });
            }
        }

        if (!user) return res.status(400).json({ error: 'User not found' });
        
        // Secure password comparison
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid Credentials' });

        // --- Strict Role Validation ---
        const userRole = user.role || 'devotee';
        const expectedRole = role || 'devotee';

        if (expectedRole === 'mandir_admin' && userRole !== 'mandir_admin') {
            return res.status(403).json({ error: 'Access Denied: This account does not have Admin privileges.' });
        }

        if (expectedRole !== 'mandir_admin' && userRole !== expectedRole) {
            const roleLabels = {
                devotee: 'Devotee',
                security_guard: 'Security Guard',
                parking: 'Parking Staff',
                counter: 'Counter Staff'
            };
            const foundRoleLabel = roleLabels[userRole] || userRole;
            const requestedRoleLabel = roleLabels[expectedRole] || expectedRole;

            return res.status(403).json({
                error: `Access Denied: This account is registered as ${foundRoleLabel}, not ${requestedRoleLabel}. Please select the ${foundRoleLabel} role tab.`
            });
        }

        let redirectUrl = '/dashboard';
        if (userRole === 'mandir_admin') redirectUrl = '/admin/dashboard';
        else if (userRole === 'security_guard') redirectUrl = '/guard/dashboard';
        else if (userRole === 'parking') redirectUrl = '/parking/dashboard';
        else if (userRole === 'counter') redirectUrl = '/counter/dashboard';

        // Sign JWT Token
        const jwtToken = jwt.sign(
            { id: user._id, email: user.email, role: userRole, name: user.fullName },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`✅ Login Success: ${user.fullName} (${userRole})`);
        res.json({
            success: true,
            token: jwtToken,
            redirectUrl,
            role: userRole,
            user: { fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: userRole }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error', details: String(err) });
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
        const hashedPassword = await hashPassword(password);

        const newAdmin = new Admin({ fullName, email, username: email, password: hashedPassword, phoneNumber, aadhar: aadhaar, adminHash: adminHash, qrText: qr_text, role: 'mandir_admin' });
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



// ─── Create Booking (with email) ─────────────────────────────
app.post('/api/bookings', async (req, res) => {
    try {
        const bookingData = req.body;
        if (!bookingData.booking_id || !bookingData.temple || !bookingData.members) {
            return res.status(400).json({ error: 'Missing required booking data' });
        }

        const newBooking = new Booking({
            bookingId: bookingData.booking_id,
            temple: bookingData.temple,
            date: bookingData.date,
            timeSlot: bookingData.time_slot,
            members: bookingData.members.map(m => ({
                name: m.name,
                age: m.age,
                gender: m.gender,
                mobile: m.mobile,
                email: m.email,
                aadhaar_mask: m.aadhaar_mask,
                aadhaar_full: m.aadhaar_full,
                displayId: m.login_id,
            })),
            timestamp: new Date(),
        });

        await newBooking.save();
        console.log(`✅ Booking saved: ${bookingData.booking_id}`);

        // Send emails asynchronously (don't block the response)
        sendBookingEmails(bookingData).catch(err => {
            console.error('Email batch error:', err.message);
        });

        res.json({ success: true, message: 'Booking confirmed', bookingId: bookingData.booking_id });
    } catch (err) {
        console.error('Booking Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── Booking Availability (for crowd predictions) ────────────
app.get('/api/bookings/availability', async (req, res) => {
    try {
        const { temple, date } = req.query;
        if (!temple || !date) {
            return res.status(400).json({ error: 'temple and date are required' });
        }

        // Aggregate booking counts by time slot for the given temple and date
        const pipeline = [
            { $match: { temple: temple, date: date } },
            {
                $project: {
                    timeSlot: 1,
                    memberCount: { $size: '$members' },
                }
            },
            {
                $group: {
                    _id: '$timeSlot',
                    totalMembers: { $sum: '$memberCount' },
                }
            },
        ];

        const results = await Booking.aggregate(pipeline);
        const availability = {};
        results.forEach(r => {
            availability[r._id] = r.totalMembers;
        });

        res.json(availability);
    } catch (err) {
        console.error('Availability Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ─── Get Single Booking (by bookingId, Aadhaar, or displayId) ─────
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const searchTerm = req.params.id.trim();

        // 1. Try exact bookingId match first (e.g., BK-705763 or WALKIN-xxx)
        let booking = await Booking.findOne({ bookingId: searchTerm });

        // 2. If not found, try looking up by Aadhaar number (any member)
        if (!booking) {
            booking = await Booking.findOne({ "members.aadhaar_full": searchTerm });
        }

        // 3. If not found, try looking up by displayId / login_id (any member)  
        if (!booking) {
            booking = await Booking.findOne({ "members.displayId": searchTerm });
        }

        // 4. If not found, try looking up by cardId (any member)
        if (!booking) {
            booking = await Booking.findOne({ "members.cardId": searchTerm });
        }

        if (!booking) {
            return res.status(404).json({ error: 'No booking found for this ID / Aadhaar. Please check and try again.' });
        }

        res.json(booking);
    } catch (err) {
        console.error('Booking Lookup Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Verify Member (supports single member or all members via verifyAll flag)
app.post('/api/bookings/verify-member', async (req, res) => {
    try {
        const { bookingId, memberId, cardId, aadhaar_full, verifyAll } = req.body;
        const booking = await Booking.findOne({ bookingId });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (verifyAll) {
            // Verify the primary member with Aadhaar, then mark all as verified
            const primary = booking.members.find(m => m.aadhaar_full === aadhaar_full);
            if (!primary) return res.status(400).json({ error: 'Aadhaar does not match any member in this booking' });

            // Mark all members as verified (set cardId for the primary, set verified flag for all)
            booking.members.forEach((m, idx) => {
                if (m.aadhaar_full === aadhaar_full) {
                    m.cardId = cardId || `VERIFIED-${Date.now()}`;
                } else if (!m.cardId) {
                    m.cardId = `GRP-${Date.now()}-${idx}`;
                }
            });
            await booking.save();
            return res.json({ success: true, message: `All ${booking.members.length} members verified`, booking });
        }

        // Single member verification
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

// ─── Dashboard Stats (Live Headcount, Online Booked, Counter Verified) ─────
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Today's date string YYYY-MM-DD
        const todayDateStr = new Date().toISOString().split('T')[0];

        // 1. Live Head Count from Lanes (Sum of crowdCount)
        const laneAgg = await Lane.aggregate([
            { $group: { _id: null, total: { $sum: { $ifNull: ['$crowdCount', 0] } } } }
        ]);
        const headCount = laneAgg.length > 0 ? laneAgg[0].total : 0;

        // Fetch Today's all bookings
        const todaysBookings = await Booking.find({ date: todayDateStr });

        let slotBookingPending = 0;
        let counterUserVerified = 0;

        todaysBookings.forEach(b => {
             // If walk-in, all members count towards counterUser
             if (b.timeSlot === 'WALK-IN') {
                 counterUserVerified += b.members.length;
             } else {
                 // Online Slot booking
                 b.members.forEach(m => {
                     // If member has a cardId, they're verified at the counter
                     if (m.cardId && m.cardId.trim() !== '') {
                         counterUserVerified += 1;
                     } else {
                         // Still pending online slot
                         slotBookingPending += 1;
                     }
                 });
             }
        });

        res.json({
            headCount,
            slotBooking: slotBookingPending,
            counterUser: counterUserVerified
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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


// ─── Parking Management API ──────────────────────────────────
const ParkingZone = require('./models/ParkingZone');
const ParkingNotice = require('./models/ParkingNotice');

// Seed default parking zones if none exist
const seedParkingZones = async () => {
    const count = await ParkingZone.countDocuments();
    if (count === 0) {
        const defaultZones = [
            {
                zoneId: 'A', name: 'Zone A (East Gate)', gateIds: ['gate_1'],
                temple: 'Somnath Mandir', distance: '50m from temple', capacity: 50,
                occupied: 0, carsIn: 0, carsOut: 0,
                coordinates: { lat: 20.8885, lng: 70.4005 }
            },
            {
                zoneId: 'B', name: 'Zone B (General)', gateIds: ['gate_2'],
                temple: 'Somnath Mandir', distance: '150m from temple', capacity: 200,
                occupied: 0, carsIn: 0, carsOut: 0,
                coordinates: { lat: 20.8870, lng: 70.4020 }
            },
            {
                zoneId: 'C', name: 'Zone C (Bus/Heavy)', gateIds: ['gate_3'],
                temple: 'Somnath Mandir', distance: '300m from temple', capacity: 40,
                occupied: 0, carsIn: 0, carsOut: 0,
                coordinates: { lat: 20.8890, lng: 70.4015 }
            },
            {
                zoneId: 'D', name: 'Zone D (2-Wheeler)', gateIds: [],
                temple: 'Somnath Mandir', distance: '100m from temple', capacity: 500,
                occupied: 0, carsIn: 0, carsOut: 0,
                coordinates: { lat: 20.8880, lng: 70.4010 }
            }
        ];
        await ParkingZone.insertMany(defaultZones);
        console.log('🅿️  Default parking zones seeded');
    }
};
seedParkingZones().catch(err => console.error('Parking seed error:', err));

// POST /api/parking/sync — Receives batch updates from parking_bridge.py
app.post('/api/parking/sync', async (req, res) => {
    try {
        const { zones } = req.body; // Array of { zoneId, occupied, carsIn, carsOut, events: [...] }
        if (!zones || !Array.isArray(zones)) {
            return res.status(400).json({ error: 'Invalid payload: expected { zones: [...] }' });
        }

        const updatedZones = [];

        for (const z of zones) {
            const zone = await ParkingZone.findOne({ zoneId: z.zoneId });
            if (!zone) continue;

            zone.occupied = Math.max(0, Math.min(z.occupied, zone.capacity));
            zone.carsIn = z.carsIn || zone.carsIn;
            zone.carsOut = z.carsOut || zone.carsOut;
            zone.lastUpdated = new Date();

            // Append new events
            if (z.events && Array.isArray(z.events)) {
                for (const evt of z.events) {
                    zone.recentEvents.push({
                        timestamp: evt.timestamp,
                        plateNumber: evt.plate_number || '',
                        plateConfidence: evt.plate_confidence || 0,
                        eventType: evt.event_type,
                        gateId: evt.gate_id,
                        carType: evt.car_type || 'unknown',
                        carColor: evt.car_color || 'unknown',
                        sessionId: evt.session_id || ''
                    });
                }
                zone.trimEvents();
            }

            zone.status = zone.computeStatus();
            await zone.save();
            updatedZones.push(zone);
        }

        // Emit real-time update to all connected clients
        const allZones = await ParkingZone.find().sort({ zoneId: 1 });
        io.emit('parking-update', allZones);

        res.json({ status: 'success', updated: updatedZones.length });
    } catch (err) {
        console.error('Parking sync error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/parking/zones — Get all parking zones with real-time data
app.get('/api/parking/zones', async (req, res) => {
    try {
        const zones = await ParkingZone.find().sort({ zoneId: 1 });
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/parking/zones — Admin can add/edit a zone
app.post('/api/parking/zones', async (req, res) => {
    try {
        const { zoneId, name, gateIds, temple, distance, capacity, coordinates } = req.body;
        if (!zoneId || !name || !capacity) {
            return res.status(400).json({ error: 'zoneId, name, capacity are required' });
        }

        let zone = await ParkingZone.findOne({ zoneId });
        if (zone) {
            // Update existing
            zone.name = name;
            zone.gateIds = gateIds || zone.gateIds;
            zone.temple = temple || zone.temple;
            zone.distance = distance || zone.distance;
            zone.capacity = capacity;
            if (coordinates) zone.coordinates = coordinates;
            await zone.save();
        } else {
            // Create new
            zone = new ParkingZone({
                zoneId, name, gateIds: gateIds || [], temple: temple || 'Somnath Mandir',
                distance: distance || '0m', capacity, occupied: 0, carsIn: 0, carsOut: 0,
                coordinates: coordinates || { lat: 20.888, lng: 70.401 }
            });
            await zone.save();
        }
        res.json({ success: true, zone });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/parking/zones/:id/logs — Get recent entry/exit events for a zone
app.get('/api/parking/zones/:id/logs', async (req, res) => {
    try {
        const zone = await ParkingZone.findOne({ zoneId: req.params.id });
        if (!zone) return res.status(404).json({ error: 'Zone not found' });

        // Return events sorted by most recent first
        const events = [...zone.recentEvents].reverse();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/parking/stats — Aggregate parking stats
app.get('/api/parking/stats', async (req, res) => {
    try {
        const zones = await ParkingZone.find();
        const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
        const totalOccupied = zones.reduce((sum, z) => sum + z.occupied, 0);
        const totalIn = zones.reduce((sum, z) => sum + z.carsIn, 0);
        const totalOut = zones.reduce((sum, z) => sum + z.carsOut, 0);

        // Find best zone (most percentage free)
        let bestZone = null;
        let bestPct = -1;
        zones.forEach(z => {
            const freePct = (z.capacity - z.occupied) / z.capacity;
            if (freePct > bestPct) {
                bestPct = freePct;
                bestZone = { zoneId: z.zoneId, name: z.name, available: z.capacity - z.occupied, distance: z.distance };
            }
        });

        res.json({ totalCapacity, totalOccupied, totalAvailable: totalCapacity - totalOccupied, totalIn, totalOut, bestZone, zoneCount: zones.length });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/parking/notice — Publish parking availability notice for devotees
app.post('/api/parking/notice', async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        // Deactivate all previous notices
        await ParkingNotice.updateMany({ active: true }, { active: false });

        // Get current zone data for snapshot
        const zones = await ParkingZone.find().sort({ zoneId: 1 });
        const zoneSnapshot = zones.map(z => ({
            zoneId: z.zoneId,
            name: z.name,
            available: z.capacity - z.occupied,
            distance: z.distance,
            status: z.status
        }));

        const notice = new ParkingNotice({
            noticeId: `PKN-${Date.now()}`,
            title,
            message: message || '',
            zones: zoneSnapshot,
            publishedAt: new Date()
        });
        await notice.save();

        // Emit to devotee-facing clients
        io.emit('parking-notice', notice);

        console.log(`🅿️  Parking notice published: ${notice.noticeId}`);
        res.json({ success: true, notice });
    } catch (err) {
        console.error('Parking notice error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/parking/notices/latest — Get the latest active parking notice
app.get('/api/parking/notices/latest', async (req, res) => {
    try {
        const notice = await ParkingNotice.findOne({ active: true }).sort({ publishedAt: -1 });
        if (!notice) return res.json(null);
        res.json(notice);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


io.on('connection', (socket) => {
    console.log('🔌 Client Connected:', socket.id);
    socket.on('disconnect', () => console.log('❌ Client Disconnected:', socket.id));
});

// ─── Global Error Handling & Process Crash Safety ─────────────
app.use((err, req, res, next) => {
    console.error('⚠️ Global Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: String(err), stack: err.stack });
});

process.on('uncaughtException', (err) => {
    console.error('🛡️ Process Uncaught Exception Guard:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🛡️ Process Unhandled Rejection Guard:', reason);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Network Access: http://<YOUR_IP>:${PORT}`);
});
