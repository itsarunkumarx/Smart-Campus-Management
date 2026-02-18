const User = require('../models/User');
const Complaint = require('../models/Complaint');
const AILog = require('../models/AIlog');
const Placement = require('../models/Placement');
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const { createNotification } = require('../utils/notificationUtils');

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
        const totalAIQueries = await AILog.countDocuments();

        res.json({
            totalUsers,
            totalStudents,
            totalFaculty,
            pendingComplaints,
            totalAIQueries,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (with role filter)
// @route   GET /api/admin/users?role=student
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suspend/unsuspend user
// @route   PUT /api/admin/user/:id/suspend
// @access  Private (Admin)
const toggleSuspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isSuspended = !user.isSuspended;
        await user.save();

        res.json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create placement
// @route   POST /api/admin/placement
// @access  Private (Admin)
const createPlacement = async (req, res) => {
    try {
        const { companyName, description, jobRole, package, eligibility, deadline } = req.body;

        const placement = await Placement.create({
            companyName,
            description,
            jobRole,
            package,
            eligibility,
            deadline,
            createdBy: req.user._id,
        });

        // Notify all students
        await createNotification({
            title: 'New Institutional Opportunity',
            message: `New placement drive: ${companyName} for ${jobRole}`,
            type: 'urgent',
            targetRole: 'student',
            link: '/student/placements',
            createdBy: req.user._id
        });

        res.status(201).json(placement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create scholarship
// @route   POST /api/admin/scholarship
// @access  Private (Admin)
const createScholarship = async (req, res) => {
    try {
        const { name, description, amount, eligibility, deadline, totalSlots } = req.body;

        const scholarship = await Scholarship.create({
            name,
            description,
            amount,
            eligibility,
            deadline,
            totalSlots,
        });

        // Notify all students
        await createNotification({
            title: 'Institutional Financial Aid',
            message: `New scholarship opportunity: ${name}`,
            type: 'success',
            targetRole: 'student',
            link: '/student/scholarships',
            createdBy: req.user._id
        });

        res.status(201).json(scholarship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update scholarship applicant status
// @route   PUT /api/admin/scholarship/:scholarshipId/applicant/:applicantId
// @access  Private (Admin)
const updateScholarshipApplicant = async (req, res) => {
    try {
        const { scholarshipId, applicantId } = req.params;
        const { status } = req.body; // 'pending', 'approved', 'rejected'

        const scholarship = await Scholarship.findById(scholarshipId);

        if (!scholarship) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }

        const applicant = scholarship.applicants.id(applicantId);

        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        applicant.status = status;

        // If approved, add to approved list
        if (status === 'approved' && !scholarship.approvedStudents.includes(applicant.userId)) {
            scholarship.approvedStudents.push(applicant.userId);
        }

        await scholarship.save();

        res.json({ message: 'Applicant status updated', scholarship });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create global announcement
// @route   POST /api/admin/announcement
// @access  Private (Admin)
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, targetRole, type, priority } = req.body;

        const notification = await createNotification({
            title,
            message,
            type: type || 'info',
            targetRole: targetRole || 'all',
            createdBy: req.user._id,
        });

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private (Admin)
const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('raisedBy', 'name email role')
            .populate('handledBy', 'name')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaint/:id
// @access  Private (Admin)
const updateComplaint = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status || complaint.status;
        complaint.adminResponse = adminResponse || complaint.adminResponse;
        complaint.handledBy = req.user._id;

        await complaint.save();

        // Notify user about complaint update
        await createNotification({
            title: 'Institutional Resolution Update',
            message: `Your complaint has been marked as ${status}`,
            type: status === 'resolved' ? 'success' : 'info',
            recipient: complaint.raisedBy,
            link: req.user.role === 'student' ? '/student/complaints' : '/admin/complaints', // Rough link
            createdBy: req.user._id
        });

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove post
// @route   DELETE /api/admin/post/:id
// @access  Private (Admin)
const removePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.isRemoved = true;
        await post.save();

        res.json({ message: 'Post removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new faculty user
// @route   POST /api/admin/faculty/add
// @access  Private (Admin)
const addFaculty = async (req, res) => {
    try {
        const { name, email, department, facultyId, designation } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create username from name (simple version)
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_fac';

        const faculty = await User.create({
            name,
            email: email.toLowerCase(),
            username,
            password: 'faculty123', // Default password
            role: 'faculty',
            department,
            facultyInfo: {
                facultyId: facultyId || '',
                designation: designation || 'Assistant Professor',
            },
            mustChangePassword: true, // Force change on first login
        });

        // Notify faculty about their account creation
        await createNotification({
            title: 'Welcome to Smart Campus',
            message: `Your faculty account has been created. Login with password: faculty123`,
            type: 'info',
            recipient: faculty._id,
            link: '/login/faculty',
            createdBy: req.user._id
        });

        res.status(201).json({
            message: 'Faculty added successfully',
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                username: faculty.username,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI-powered system summary
// @route   GET /api/admin/ai-summary
// @access  Private (Admin)
const getAISummary = async (req, res) => {
    try {
        // Collect data points for "AI" analysis
        const complaints = await Complaint.countDocuments();
        const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
        const recentPosts = await Post.countDocuments({ createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        const flaggedPosts = await Post.countDocuments({ isReported: true });

        // Simple "AI" logic to generate insights
        const resolutionRate = complaints > 0 ? (resolvedComplaints / complaints) * 100 : 0;

        let insight = "System performance is stable. Student engagement is optimal.";
        if (resolutionRate < 50) {
            insight = "Resolution rate is low. Consider prioritizing pending complaints.";
        } else if (flaggedPosts > 5) {
            insight = "Moderation alert: Increased number of reported posts detected.";
        } else if (recentPosts > 50) {
            insight = "Campus activity is high this week. Pulse is positive.";
        }

        res.json({
            summary: `Currently tracking ${complaints} complaints with a ${resolutionRate.toFixed(1)}% resolution rate. ${recentPosts} manifests (posts) were created this week.`,
            insight,
            metrics: {
                resolutionRate,
                engagementScore: Math.min(100, (recentPosts / 100) * 100),
                securityHealth: 100 - Math.min(100, (flaggedPosts / 10) * 100)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    getUsers,
    toggleSuspendUser,
    deleteUser,
    createPlacement,
    createScholarship,
    updateScholarshipApplicant,
    createAnnouncement,
    getComplaints,
    updateComplaint,
    removePost,
    addFaculty,
    getAISummary,
};
