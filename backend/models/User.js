const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
        },
        username: {
            type: String,
            required: [true, 'Please add a username'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['student', 'faculty', 'admin'],
            default: 'student',
        },
        department: {
            type: String,
            required: function () {
                return this.role === 'student' || this.role === 'faculty';
            },
        },
        year: {
            type: Number,
            required: function () {
                return this.role === 'student';
            },
            min: 1,
            max: 4,
        },
        phone: {
            type: String,
            default: '',
        },
        profileImage: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        skills: [String],
        certifications: [String],
        socialLinks: {
            github: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            instagram: { type: String, default: '' },
            website: { type: String, default: '' },
        },

        // Student Specific
        academicInfo: {
            cgpa: { type: Number, default: 0 },
            semester: { type: Number, default: 1 },
            currentSubjects: [String],
        },
        internships: [{
            company: String,
            role: String,
            duration: String,
            description: String,
        }],

        // Faculty Specific
        facultyInfo: {
            facultyId: { type: String, default: '' },
            designation: { type: String, default: '' },
            subjects: [String],
            officeHours: { type: String, default: '' },
            experience: { type: Number, default: 0 },
        },

        // Preferences & Status
        privacy: {
            showEmail: { type: Boolean, default: true },
            showPhone: { type: Boolean, default: false },
            publicProfile: { type: Boolean, default: true },
        },
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        isSuspended: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        mustChangePassword: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Don't return password when converting to JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// No extra indexes needed as username and email are already unique
module.exports = mongoose.model('User', userSchema);
