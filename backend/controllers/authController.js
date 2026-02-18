const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { createNotification } = require('../utils/notificationUtils');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, username, email, password, department, year } = req.body;

        // Check if user exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create student user
        const user = await User.create({
            name,
            username,
            email,
            password, // Will be hashed by pre-save hook
            role: 'student',
            department,
            year,
        });

        if (user) {
            generateToken(res, user._id);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department,
                year: user.year,
                profileImage: user.profileImage,
                isProfileComplete: user.isProfileComplete,
                academicInfo: user.academicInfo,
                facultyInfo: user.facultyInfo,
                privacy: user.privacy,
                mustChangePassword: user.mustChangePassword,
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const identifier = username.toLowerCase();

        // Find user by username OR email and include password for comparison
        const user = await User.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        }).select('+password');

        if (!user) {
            console.log(`❌ Login failed: User not found [${identifier}]`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if role matches
        if (user.role !== role) {
            console.log(`❌ Login failed: Role mismatch. User.role: ${user.role}, Requested: ${role}`);
            return res.status(403).json({ message: `Please login using ${user.role} portal` });
        }

        // Check if user is suspended
        if (user.isSuspended) {
            return res.status(403).json({ message: 'Your account has been suspended' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log(`❌ Login failed: Password mismatch for ${identifier}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            year: user.year,
            profileImage: user.profileImage,
            isProfileComplete: user.isProfileComplete,
            academicInfo: user.academicInfo,
            facultyInfo: user.facultyInfo,
            privacy: user.privacy,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            year: user.year,
            profileImage: user.profileImage,
            bio: user.bio,
            skills: user.skills,
            socialLinks: user.socialLinks,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle username change specifically
        if (req.body.username && req.body.username !== user.username) {
            const usernameExists = await User.findOne({
                username: req.body.username.toLowerCase(),
                _id: { $ne: user._id }
            });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = req.body.username.toLowerCase();
        }

        // Update other fields
        user.name = req.body.name || user.name;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
        user.phone = req.body.phone || user.phone;
        user.skills = req.body.skills || user.skills;
        user.certifications = req.body.certifications || user.certifications;
        user.profileImage = req.body.profileImage || user.profileImage;
        user.department = req.body.department || user.department;
        user.year = req.body.year || user.year;

        // Academic Info (Student)
        if (req.body.academicInfo) {
            user.academicInfo = {
                ...user.academicInfo,
                ...req.body.academicInfo
            };
        }

        // Faculty Info
        if (req.body.facultyInfo) {
            user.facultyInfo = {
                ...user.facultyInfo,
                ...req.body.facultyInfo
            };
        }

        // Privacy Settins
        if (req.body.privacy) {
            user.privacy = {
                ...user.privacy,
                ...req.body.privacy
            };
        }

        // Social Links
        if (req.body.socialLinks) {
            user.socialLinks = {
                ...user.socialLinks,
                ...req.body.socialLinks
            };
        }

        // Auto-mark profile as complete if basic info is filled
        if (user.bio && user.profileImage && user.phone) {
            user.isProfileComplete = true;
        }

        // Update password if provided
        if (req.body.password) {
            user.password = req.body.password;
            user.mustChangePassword = false;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            year: updatedUser.year,
            profileImage: updatedUser.profileImage,
            bio: updatedUser.bio,
            phone: updatedUser.phone,
            skills: updatedUser.skills,
            certifications: updatedUser.certifications,
            isProfileComplete: updatedUser.isProfileComplete,
            academicInfo: updatedUser.academicInfo,
            facultyInfo: updatedUser.facultyInfo,
            privacy: updatedUser.privacy,
            socialLinks: updatedUser.socialLinks,
            mustChangePassword: updatedUser.mustChangePassword,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if username exists
// @route   GET /api/auth/check-username/:username
// @access  Public
const checkUsername = async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const user = await User.findOne({ username });
        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search users by name, username, or department
// @route   GET /api/auth/search?search=...
// @access  Private
const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { username: { $regex: req.query.search, $options: 'i' } },
                    { department: { $regex: req.query.search, $options: 'i' } },
                ],
            }
            : {};

        const users = await User.find(keyword)
            .find({ _id: { $ne: req.user._id } }) // Exclude current user
            .select('name username profileImage department role');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Follow a user
// @route   POST /api/auth/follow/:id
// @access  Private
const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentUser.following.includes(req.params.id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        await userToFollow.updateOne({ $push: { followers: req.user._id } });
        await currentUser.updateOne({ $push: { following: req.params.id } });

        // Notify the user being followed
        await createNotification({
            title: 'New Institutional Connection',
            message: `${req.user.name} is now following you`,
            type: 'follow',
            recipient: req.params.id,
            link: `/profile/${req.user._id}`,
            createdBy: req.user._id
        });

        res.json({ message: 'Followed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unfollow a user
// @route   POST /api/auth/unfollow/:id
// @access  Private
const unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userToUnfollow.updateOne({ $pull: { followers: req.user._id } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });

        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/auth/user/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'name profileImage')
            .populate('following', 'name profileImage');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Apply privacy filters
        const profile = user.toObject();
        if (!user.privacy?.showEmail) delete profile.email;
        if (!user.privacy?.showPhone) delete profile.phone;

        res.json(profile);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google Login Simulation
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id')) {
            return res.status(400).json({
                message: 'Institutional Google Login requires a valid Client ID in .env for token verification.'
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Auto-generate username from email
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            let username = baseUsername;
            let userExists = await User.findOne({ username });

            // Handle username collisions
            let counter = 1;
            while (userExists) {
                username = `${baseUsername}${counter}`;
                userExists = await User.findOne({ username });
                counter++;
            }

            // Create new student by default for Google login
            user = await User.create({
                name,
                username,
                email,
                password: Math.random().toString(36).slice(-12), // Secure random password
                role: 'student',
                profileImage: picture,
                isProfileComplete: false,
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({ message: 'Your account has been suspended' });
        }

        // Generate institutional session token
        generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            year: user.year,
            profileImage: user.profileImage,
            isProfileComplete: user.isProfileComplete,
            socialLinks: user.socialLinks,
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Institutional Google authentication failed' });
    }
};

// @desc    Deactivate user account
// @route   POST /api/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.user._id);

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    checkUsername,
    searchUsers,
    followUser,
    unfollowUser,
    getUserById,
    googleLogin,
    deactivateAccount,
    deleteAccount,
};
