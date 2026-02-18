const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const Complaint = require('../models/Complaint');
const { createNotification } = require('../utils/notificationUtils');

// @desc    Get faculty dashboard data
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty)
const getDashboard = async (req, res) => {
    try {
        const facultyDept = req.user.department;

        // Count students in department
        const studentCount = await User.countDocuments({
            role: 'student',
            department: facultyDept,
        });

        // Get pending complaints
        const pendingComplaints = await Complaint.countDocuments({
            status: 'pending',
        });

        // Get upcoming events created by this faculty
        const upcomingEvents = await Event.find({
            createdBy: req.user._id,
            status: 'upcoming',
        })
            .sort({ date: 1 })
            .limit(5);

        res.json({
            studentCount,
            pendingComplaints,
            upcomingEvents,
            department: facultyDept,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create announcement (saved as notification)
// @route   POST /api/faculty/announcement
// @access  Private (Faculty)
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, targetRole } = req.body;

        const notification = await createNotification({
            title,
            message,
            type: 'info',
            targetRole: targetRole || 'student',
            createdBy: req.user._id,
        });

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark attendance for students
// @route   POST /api/faculty/attendance
// @access  Private (Faculty)
const markAttendance = async (req, res) => {
    try {
        const { studentId, subject, status, date } = req.body;

        const attendance = await Attendance.create({
            studentId,
            subject,
            status,
            date: date || new Date(),
            markedBy: req.user._id,
        });

        // Notify student of attendance mark
        await createNotification({
            title: 'Attendance Institutional Update',
            message: `You were marked ${status} for ${subject} on ${new Date(date || Date.now()).toLocaleDateString()}`,
            type: status === 'present' ? 'success' : 'warning',
            recipient: studentId,
            link: '/student/attendance',
            createdBy: req.user._id
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark bulk attendance for multiple students
// @route   POST /api/faculty/attendance/bulk
// @access  Private (Faculty)
const markBulkAttendance = async (req, res) => {
    try {
        const { attendanceData, subject, date } = req.body;

        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: 'Invalid attendance data format' });
        }

        const attendancePromises = attendanceData.map(async (record) => {
            const { studentId, status } = record;

            const attendance = await Attendance.create({
                studentId,
                subject,
                status,
                date: date || new Date(),
                markedBy: req.user._id,
            });

            // Notify student (maybe optional for bulk to avoid spamming? No, students need to know)
            await createNotification({
                title: 'Attendance Institutional Update',
                message: `You were marked ${status} for ${subject} on ${new Date(date || Date.now()).toLocaleDateString()}`,
                type: status === 'present' ? 'success' : 'warning',
                recipient: studentId,
                link: '/student/attendance',
                createdBy: req.user._id
            });

            return attendance;
        });

        const results = await Promise.all(attendancePromises);
        res.status(201).json({ message: `Successfully recorded ${results.length} records`, count: results.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students in department
// @route   GET /api/faculty/students
// @access  Private (Faculty)
const getStudents = async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            department: req.user.department,
        }).select('-password');

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    createAnnouncement,
    markAttendance,
    markBulkAttendance,
    getStudents,
};
