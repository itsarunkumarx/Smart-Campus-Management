const mongoose = require('mongoose');
const Placement = require('./backend/models/Placement');
const Scholarship = require('./backend/models/Scholarship');
const Event = require('./backend/models/Event');
const Post = require('./backend/models/Post');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

const checkStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const counts = {
            users: await User.countDocuments(),
            placements: await Placement.countDocuments(),
            scholarships: await Scholarship.countDocuments(),
            events: await Event.countDocuments(),
            posts: await Post.countDocuments()
        };

        console.log('Collection counts:', counts);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkStats();
