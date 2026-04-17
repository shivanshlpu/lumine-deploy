const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');
mongoose.connect('mongodb+srv://jaganbhakti900_db_user:shivansh900@shiva100.9apjqfr.mongodb.net/lumine?appName=shiva100').then(async () => {
    const admins = await Admin.find({}, 'fullName email password role');
    console.log('Admins:', admins);
    const users = await User.find({}, 'fullName email password role phoneNumber');
    console.log('Users:', users);
    mongoose.disconnect();
}).catch(console.error);
