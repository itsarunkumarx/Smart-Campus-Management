const AccessLog = require('../models/AccessLog');
const SecurityEvent = require('../models/SecurityEvent');
const FaceProfile = require('../models/FaceProfile');
const User = require('../models/User');
const { validateEmbedding, findBestMatch, ACCESS_PERMISSIONS } = require('../utils/faceUtils');

/**
 * @desc    Verify access using face
 * @route   POST /api/access/verify
 * @access  Private
 */
const verifyAccess = async (req, res) => {
  try {
    const { embedding, location, livenessScore } = req.body;

    if (!location) {
      return res.status(400).json({ success: false, message: 'Location is required', code: 'MISSING_LOCATION' });
    }

    const validation = validateEmbedding(embedding);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error, code: 'INVALID_EMBEDDING' });
    }

    const faceProfiles = await FaceProfile.find({ isActive: true }).select('+embedding');
    const match = findBestMatch(embedding, faceProfiles);

    if (!match) {
      await AccessLog.create({
        userId: req.user._id, // Assume generic or unknown logic if needed, but per requirements we know the user trying, or fallback
        location,
        result: 'denied',
        reason: 'Face not recognized'
      });
      
      await SecurityEvent.create({
        eventType: 'access_denied',
        location,
        details: 'Face not recognized',
        ipAddress: req.ip
      });

      return res.status(403).json({ success: false, result: 'denied', reason: 'Face not recognized', location });
    }

    const user = await User.findById(match.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const allowedRoles = ACCESS_PERMISSIONS[location] || ['admin']; // Default to admin only if unknown location
    const isAllowed = allowedRoles.includes(user.role);

    if (isAllowed) {
      await AccessLog.create({
        userId: user._id,
        location,
        result: 'granted',
        confidence: match.similarity,
        livenessResult: (livenessScore > 0.5)
      });

      await SecurityEvent.create({
        userId: user._id,
        eventType: 'access_granted',
        location,
        confidence: match.similarity,
        livenessScore: livenessScore || 0,
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        result: 'granted',
        user: { name: user.name, role: user.role },
        location,
        confidence: match.similarity
      });
    } else {
      await AccessLog.create({
        userId: user._id,
        location,
        result: 'denied',
        reason: 'Insufficient permissions',
        confidence: match.similarity
      });

      await SecurityEvent.create({
        userId: user._id,
        eventType: 'access_denied',
        location,
        details: 'Insufficient permissions',
        ipAddress: req.ip
      });

      return res.status(403).json({ success: false, result: 'denied', reason: 'Insufficient permissions', location });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Get access logs (Admin)
 * @route   GET /api/access/logs
 * @access  Private/Admin
 */
const getAccessLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, location, result, startDate, endDate } = req.query;
    
    const query = {};
    if (userId) query.userId = userId;
    if (location) query.location = location;
    if (result) query.result = result;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const logs = await AccessLog.find(query)
      .populate('userId', 'name username role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AccessLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Get user's own access logs
 * @route   GET /api/access/my-logs
 * @access  Private
 */
const getMyAccessLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

module.exports = {
  verifyAccess,
  getAccessLogs,
  getMyAccessLogs
};
