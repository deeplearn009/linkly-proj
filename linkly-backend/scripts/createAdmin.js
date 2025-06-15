require('dotenv').config();
const { connect } = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Admin user details
        const adminData = {
            fullName: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123', // You should change this password
            role: 'admin'
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create admin user
        const admin = await User.create({
            ...adminData,
            password: hashedPassword
        });

        console.log('Admin user created successfully:', {
            id: admin._id,
            email: admin.email,
            role: admin.role
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();