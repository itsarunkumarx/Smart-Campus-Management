const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
require('dotenv').config();

const seedPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for Post Seeding');

        // Clear existing posts
        await Post.deleteMany({});
        console.log('Institutional signals cleared.');

        const student = await User.findOne({ role: 'student' });
        const faculty = await User.findOne({ role: 'faculty' });
        const admin = await User.findOne({ role: 'admin' });

        if (!student || !faculty || !admin) {
            console.error('Missing core user identities for broadcast seeding.');
            process.exit(1);
        }

        const posts = [
            {
                userId: student._id,
                content: "Just finalized my implementation of the neural interface for the Prince College project! Any feedback on the glassmorphism aesthetics? ✨",
                tags: ['neural', 'design', 'studentlife'],
                visibility: 'public',
                likes: [faculty._id, admin._id]
            },
            {
                userId: faculty._id,
                content: "Important update for the Computer Science department: The upcoming Symposium on Artificial General Intelligence has been moved to Auditorium B. 🎓",
                tags: ['cs', 'symposium', 'academic'],
                visibility: 'department',
                likes: [student._id]
            },
            {
                userId: admin._id,
                content: "PRINCE COLLEGE ALERT: New institutional security protocols are now active. Please update your manifest profile for full synchronization. 🛡️",
                tags: ['security', 'admin', 'update'],
                visibility: 'public',
                likes: [faculty._id, student._id],
                comments: [
                    {
                        userId: student._id,
                        text: "Acknowledged. Updating my identity manifest now."
                    }
                ]
            }
        ];

        await Post.insertMany(posts);
        console.log('Institutional social feed populated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Broadcast seeding failed:', error);
        process.exit(1);
    }
};

seedPosts();
