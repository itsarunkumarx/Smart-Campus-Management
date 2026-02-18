const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Placement = require('../models/Placement');
const Scholarship = require('../models/Scholarship');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboard = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Get attendance summary
        const attendanceRecords = await Attendance.find({ studentId }).limit(50);
        const attendancePercentage =
            attendanceRecords.length > 0
                ? (
                    (attendanceRecords.filter((r) => r.status === 'present' || r.status === 'late')
                        .length /
                        attendanceRecords.length) *
                    100
                ).toFixed(2)
                : 0;

        // Get upcoming events
        const upcomingEvents = await Event.find({
            date: { $gte: new Date() },
            status: 'upcoming',
        })
            .sort({ date: 1 })
            .limit(5)
            .populate('createdBy', 'name');

        // Get recent notifications
        const notifications = await Notification.find({
            $or: [
                { targetRole: 'all' },
                { targetRole: 'student' },
                { recipient: studentId }
            ],
        })
            .sort({ createdAt: -1 })
            .limit(5);

        const unreadCount = notifications.filter((n) => !n.readBy.includes(studentId)).length;

        res.json({
            attendancePercentage,
            upcomingEvents,
            notifications,
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student attendance
// @route   GET /api/student/attendance
// @access  Private (Student)
const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ studentId: req.user._id })
            .sort({ date: -1 })
            .populate('markedBy', 'name');

        // Group by subject
        const groupedBySubject = {};
        attendance.forEach((record) => {
            if (!groupedBySubject[record.subject]) {
                groupedBySubject[record.subject] = [];
            }
            groupedBySubject[record.subject].push(record);
        });

        // Calculate percentage for each subject
        const attendanceSummary = Object.keys(groupedBySubject).map((subject) => {
            const records = groupedBySubject[subject];
            const total = records.length;
            const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

            return {
                subject,
                total,
                present,
                percentage,
                records: records.slice(0, 10), // Latest 10 records
            };
        });

        res.json(attendanceSummary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply for placement
// @route   POST /api/student/placement/:id/apply
// @access  Private (Student)
const applyForPlacement = async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({ message: 'Placement not found' });
        }

        // Check if already applied
        const alreadyApplied = placement.applicants.some(
            (app) => app.userId.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied for this placement' });
        }

        // Check deadline
        if (new Date() > placement.deadline) {
            return res.status(400).json({ message: 'Application deadline has passed' });
        }

        // Add applicant
        placement.applicants.push({
            userId: req.user._id,
            status: 'applied',
        });

        await placement.save();

        res.json({ message: 'Applied successfully', placement });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply for scholarship
// @route   POST /api/student/scholarship/:id/apply
// @access  Private (Student)
const applyForScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findById(req.params.id);

        if (!scholarship) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }

        // Check if already applied
        const alreadyApplied = scholarship.applicants.some(
            (app) => app.userId.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied for this scholarship' });
        }

        // Check deadline
        if (new Date() > scholarship.deadline) {
            return res.status(400).json({ message: 'Application deadline has passed' });
        }

        // Add applicant
        scholarship.applicants.push({
            userId: req.user._id,
            documents: req.body.documents || [],
            status: 'pending',
        });

        await scholarship.save();

        res.json({ message: 'Applied successfully', scholarship });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    getAttendance,
    applyForPlacement,
    applyForScholarship,
};
