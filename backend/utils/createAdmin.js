require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const adminData = {
            name: 'Arun Kumar',
            username: 'admin_arun',
            email: 'arunkumarpalani428@gmail.com',
            password: 'Arunkumar@2006',
            role: 'admin'
        };

        // Check if admin already exists
        const adminExists = await User.findOne({ email: adminData.email });

        if (adminExists) {
            console.log('ℹ️ Admin user already exists. Updating password...');
            adminExists.password = adminData.password;
            await adminExists.save();
            console.log('✅ Admin password updated successfully');
        } else {
            const admin = await User.create(adminData);
            console.log('✅ Admin user created successfully:', admin.email);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
