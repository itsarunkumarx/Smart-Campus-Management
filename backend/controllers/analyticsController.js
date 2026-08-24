const Attendance = require('../models/Attendance');
const SecurityEvent = require('../models/SecurityEvent');
const User = require('../models/User');

/**
 * @desc    Get attendance analytics
 * @route   GET /api/analytics/attendance
 * @access  Private/(Admin|Faculty)
 */
const getAttendanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // a. Overall stats
    const totalRecords = await Attendance.countDocuments(matchStage);
    const presentCount = await Attendance.countDocuments({ ...matchStage, status: 'present' });
    const absentCount = await Attendance.countDocuments({ ...matchStage, status: 'absent' });
    const lateCount = await Attendance.countDocuments({ ...matchStage, status: 'late' });

    // b. By subject
    const bySubject = await Attendance.aggregate([
      { $match: matchStage },
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    // c. By department
    // To do this, we need to join with User
    const byDepartment = await Attendance.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $group: { _id: '$student.department', count: { $sum: 1 } } }
    ]);

    // d. Trend
    const trend = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // e. Face vs manual (using SecurityEvent face_attendance vs overall)
    // Approximate method by checking security events
    const faceAttendanceCount = await SecurityEvent.countDocuments({ eventType: 'face_attendance' });
    
    res.status(200).json({
      success: true,
      data: {
        overall: {
          total: totalRecords,
          presentPercent: totalRecords ? (presentCount / totalRecords) * 100 : 0,
          absentPercent: totalRecords ? (absentCount / totalRecords) * 100 : 0,
          latePercent: totalRecords ? (lateCount / totalRecords) * 100 : 0
        },
        bySubject,
        byDepartment,
        trend,
        method: {
          face: faceAttendanceCount,
          manual: Math.max(0, totalRecords - faceAttendanceCount) // Rough approx
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Get security analytics
 * @route   GET /api/analytics/security
 * @access  Private/Admin
 */
const getSecurityAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      matchStage.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }; // default 30 days
    }

    // a. Events by type
    const eventsByType = await SecurityEvent.aggregate([
      { $match: matchStage },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);

    // b. Daily event count trend
    const trend = await SecurityEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // c. Top locations
    const topLocations = await SecurityEvent.aggregate([
      { $match: { ...matchStage, location: { $exists: true, $ne: '' } } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // d. Success/failure ratio for face logins
    const loginSuccess = await SecurityEvent.countDocuments({ ...matchStage, eventType: 'face_login_success' });
    const loginFailure = await SecurityEvent.countDocuments({ ...matchStage, eventType: 'face_login_failed' });
    const totalLogins = loginSuccess + loginFailure;

    res.status(200).json({
      success: true,
      data: {
        eventsByType,
        trend,
        topLocations,
        loginStats: {
          success: loginSuccess,
          failure: loginFailure,
          successRate: totalLogins ? (loginSuccess / totalLogins) * 100 : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

module.exports = {
  getAttendanceAnalytics,
  getSecurityAnalytics
};
