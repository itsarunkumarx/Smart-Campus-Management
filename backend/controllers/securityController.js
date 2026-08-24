const SecurityEvent = require('../models/SecurityEvent');
const User = require('../models/User');

/**
 * @desc    Get security events (Admin)
 * @route   GET /api/security/events
 * @access  Private/Admin
 */
const getSecurityEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, eventType, userId, startDate, endDate } = req.query;
    
    const query = {};
    if (eventType) query.eventType = eventType;
    if (userId) query.userId = userId;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const events = await SecurityEvent.find(query)
      .populate('userId', 'name username role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SecurityEvent.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Get security stats (Admin)
 * @route   GET /api/security/stats
 * @access  Private/Admin
 */
const getSecurityStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const byEventType = await SecurityEvent.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);

    const countToday = await SecurityEvent.countDocuments({ createdAt: { $gte: today } });
    const countThisWeek = await SecurityEvent.countDocuments({ createdAt: { $gte: weekAgo } });

    res.status(200).json({
      success: true,
      data: {
        byEventType,
        countToday,
        countThisWeek
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Get anomalies (Admin)
 * @route   GET /api/security/anomalies
 * @access  Private/Admin
 */
const getAnomalies = async (req, res) => {
  try {
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const past1h = new Date(Date.now() - 60 * 60 * 1000);
    
    const anomalies = [];

    // a. Users with repeated face_login_failed (>= 3 in last 24h)
    const loginFails = await SecurityEvent.aggregate([
      { $match: { eventType: 'face_login_failed', createdAt: { $gte: past24h }, userId: { $ne: null } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } }
    ]);

    for (const fail of loginFails) {
      const user = await User.findById(fail._id).select('name');
      anomalies.push({
        userId: fail._id,
        userName: user ? user.name : 'Unknown',
        anomalyType: 'Repeated Login Failures',
        details: `${fail.count} failed face login attempts in the last 24h`,
        severity: 'medium',
        timestamp: new Date()
      });
    }

    // b. Access attempts at unusual hours (before 6 AM or after 10 PM)
    // Checking recent events within last 24h just as an example
    const unusualHoursEvents = await SecurityEvent.find({
      eventType: { $in: ['access_granted', 'access_denied'] },
      createdAt: { $gte: past24h }
    }).populate('userId', 'name');

    unusualHoursEvents.forEach(event => {
      const hour = event.createdAt.getHours();
      if (hour < 6 || hour > 22) {
        anomalies.push({
          userId: event.userId ? event.userId._id : null,
          userName: event.userId ? event.userId.name : 'Unknown',
          anomalyType: 'Unusual Access Hours',
          details: `Access attempted at ${event.createdAt.toLocaleTimeString()}`,
          severity: 'low',
          timestamp: event.createdAt
        });
      }
    });

    // c. Users with access_denied events (>= 2 in last 24h)
    const accessDenied = await SecurityEvent.aggregate([
      { $match: { eventType: 'access_denied', createdAt: { $gte: past24h }, userId: { $ne: null } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } }
    ]);

    for (const denied of accessDenied) {
      const user = await User.findById(denied._id).select('name');
      anomalies.push({
        userId: denied._id,
        userName: user ? user.name : 'Unknown',
        anomalyType: 'Repeated Access Denials',
        details: `${denied.count} denied access attempts in the last 24h`,
        severity: 'high',
        timestamp: new Date()
      });
    }

    // d. Users with rapid successive access attempts (>= 5 in last hour)
    const rapidAccess = await SecurityEvent.aggregate([
      { $match: { eventType: { $in: ['access_granted', 'access_denied'] }, createdAt: { $gte: past1h }, userId: { $ne: null } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } }
    ]);

    for (const rapid of rapidAccess) {
      const user = await User.findById(rapid._id).select('name');
      anomalies.push({
        userId: rapid._id,
        userName: user ? user.name : 'Unknown',
        anomalyType: 'Rapid Access Attempts',
        details: `${rapid.count} access attempts in the last hour`,
        severity: 'high',
        timestamp: new Date()
      });
    }

    res.status(200).json({ success: true, data: anomalies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

module.exports = {
  getSecurityEvents,
  getSecurityStats,
  getAnomalies
};
