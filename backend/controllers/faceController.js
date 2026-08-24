const FaceProfile = require('../models/FaceProfile');
const SecurityEvent = require('../models/SecurityEvent');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const generateToken = require('../utils/generateToken');
const { validateEmbedding, findBestMatch } = require('../utils/faceUtils');

/**
 * @desc    Register user face
 * @route   POST /api/face/register
 * @access  Private
 */
const registerFace = async (req, res) => {
  try {
    const { embedding, embeddings } = req.body;
    
    // Primary embedding validation
    const primaryEmbedding = (Array.isArray(embeddings) && embeddings.length > 0) ? embeddings[0] : embedding;
    const validation = validateEmbedding(primaryEmbedding);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error, code: 'INVALID_EMBEDDING' });
    }

    // Load ALL active face profiles from OTHER users
    const otherFaceProfiles = await FaceProfile.find({
      userId: { $ne: req.user._id },
      isActive: true
    }).select('+embedding +embeddings').populate('userId', 'name username email');

    // Check if candidate face matches any existing user profile
    const candidateArray = (Array.isArray(embeddings) && embeddings.length > 0) ? embeddings : [primaryEmbedding];
    for (const candVector of candidateArray) {
      const existingMatch = findBestMatch(candVector, otherFaceProfiles);
      if (existingMatch) {
        const existingUser = existingMatch.userId;
        const maskedEmail = existingUser?.email 
          ? existingUser.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length))
          : 'another account';

        await SecurityEvent.create({
          userId: req.user._id,
          eventType: 'anomaly_detected',
          details: `Attempted to register face already associated with user ${existingUser?._id} (${existingUser?.username})`,
          ipAddress: req.ip
        });

        return res.status(409).json({
          success: false,
          code: 'FACE_ALREADY_REGISTERED',
          message: `This face is already registered to another account (${maskedEmail}). Each person can only link their face to one account.`
        });
      }
    }

    let profile = await FaceProfile.findOne({ userId: req.user._id });
    
    if (profile) {
      profile.embedding = primaryEmbedding;
      if (Array.isArray(embeddings) && embeddings.length > 0) {
        profile.embeddings = embeddings;
      }
      profile.isActive = true;
      await profile.save();
    } else {
      profile = await FaceProfile.create({
        userId: req.user._id,
        embedding: primaryEmbedding,
        embeddings: Array.isArray(embeddings) ? embeddings : [primaryEmbedding]
      });
    }

    await SecurityEvent.create({
      userId: req.user._id,
      eventType: 'face_register',
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Face registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Recognize face
 * @route   POST /api/face/recognize
 * @access  Private
 */
const recognizeFace = async (req, res) => {
  try {
    const { embedding } = req.body;
    
    const validation = validateEmbedding(embedding);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error, code: 'INVALID_EMBEDDING' });
    }

    const faceProfiles = await FaceProfile.find({ isActive: true }).select('+embedding').populate('userId', 'name');
    const result = findBestMatch(embedding, faceProfiles);

    if (result) {
      return res.status(200).json({
        success: true,
        recognized: true,
        userId: result.userId._id,
        name: result.userId.name,
        confidence: result.similarity
      });
    }

    res.status(200).json({ success: true, recognized: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Login with face
 * @route   POST /api/face/login
 * @access  Public
 */
const faceLogin = async (req, res) => {
  try {
    const { embedding, livenessScore } = req.body;
    
    const validation = validateEmbedding(embedding);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error, code: 'INVALID_EMBEDDING' });
    }

    const minLiveness = parseFloat(process.env.LIVENESS_MIN_SCORE) || 0.70;
    if (livenessScore === undefined || livenessScore < minLiveness) {
      await SecurityEvent.create({
        eventType: 'liveness_failure',
        livenessScore: livenessScore || 0,
        ipAddress: req.ip
      });
      return res.status(401).json({ success: false, code: 'LIVENESS_FAILED', message: 'Liveness check failed. Static photos/videos are prohibited.' });
    }

    const faceProfiles = await FaceProfile.find({ isActive: true }).select('+embedding +embeddings');
    const result = findBestMatch(embedding, faceProfiles);

    if (!result) {
      await SecurityEvent.create({
        eventType: 'face_login_failed',
        ipAddress: req.ip
      });
      return res.status(401).json({
        success: false,
        code: 'FACE_NOT_REGISTERED',
        message: 'This face is not registered in the Smart Campus system. Please register your face first or use password login.'
      });
    }

    const user = await User.findById(result.userId);
    if (!user || !user.isActive || user.isSuspended) {
      return res.status(401).json({ success: false, code: 'ACCOUNT_UNAVAILABLE', message: 'Account is inactive or suspended' });
    }

    user.lastLogin = Date.now();
    await user.save();

    generateToken(res, user._id);

    await SecurityEvent.create({
      userId: user._id,
      eventType: 'face_login_success',
      confidence: result.similarity,
      livenessScore: livenessScore || 0,
      ipAddress: req.ip
    });

    const token = generateToken(res, user._id);

    res.status(200).json({
      success: true,
      token,
      confidencePercent: result.confidencePercent,
      confidence: result.similarity,
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Get user's face profile status
 * @route   GET /api/face/profile
 * @access  Private
 */
const getFaceProfile = async (req, res) => {
  try {
    const profile = await FaceProfile.findOne({ userId: req.user._id });
    if (profile) {
      res.status(200).json({
        success: true,
        registered: true,
        isActive: profile.isActive,
        modelVersion: profile.modelVersion,
        updatedAt: profile.updatedAt
      });
    } else {
      res.status(200).json({ success: true, registered: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Update face profile
 * @route   PUT /api/face/profile
 * @access  Private
 */
const updateFace = async (req, res) => {
  // Essentially the same logic as registerFace for updates
  return registerFace(req, res);
};

/**
 * @desc    Delete face profile
 * @route   DELETE /api/face/profile
 * @access  Private
 */
const deleteFace = async (req, res) => {
  try {
    const profile = await FaceProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Face profile not found', code: 'NOT_FOUND' });
    }
    
    profile.isActive = false;
    await profile.save();

    await SecurityEvent.create({
      userId: req.user._id,
      eventType: 'anomaly_detected', // Using this as placeholder for generic update/delete tracking if needed or create specific one
      details: 'Face profile deactivated',
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Face profile deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Mark attendance via face recognition
 * @route   POST /api/face/attendance
 * @access  Private/Faculty
 */
const faceAttendance = async (req, res) => {
  try {
    const { embeddings, subject, date, livenessScores } = req.body;
    
    if (!Array.isArray(embeddings) || !subject || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields', code: 'INVALID_DATA' });
    }

    const faceProfiles = await FaceProfile.find({ isActive: true }).select('+embedding');
    
    const recognized = [];
    let unrecognizedCount = 0;
    const duplicates = [];
    let markedCount = 0;

    for (let i = 0; i < embeddings.length; i++) {
      const emb = embeddings[i];
      const valid = validateEmbedding(emb);
      if (!valid.valid) {
        unrecognizedCount++;
        continue;
      }
      
      const match = findBestMatch(emb, faceProfiles);
      if (match) {
        const student = await User.findById(match.userId);
        
        if (student && student.role === 'student' && student.department === req.user.department) {
          // Check for duplicate attendance
          const existing = await Attendance.findOne({
            studentId: student._id,
            subject,
            date: new Date(date)
          });

          if (existing) {
            duplicates.push(student._id);
          } else {
            await Attendance.create({
              studentId: student._id,
              subject,
              date: new Date(date),
              status: 'present',
              markedBy: req.user._id
            });
            
            await SecurityEvent.create({
              userId: student._id,
              eventType: 'face_attendance',
              confidence: match.similarity,
              location: req.body.location || 'Classroom',
              ipAddress: req.ip
            });

            recognized.push(student._id);
            markedCount++;
          }
        } else {
          unrecognizedCount++;
        }
      } else {
        unrecognizedCount++;
      }
    }

    res.status(200).json({
      success: true,
      recognized,
      unrecognized: unrecognizedCount,
      duplicates,
      marked: markedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

/**
 * @desc    Admin view all face profiles
 * @route   GET /api/face/profiles
 * @access  Private/Admin
 */
const adminGetFaceProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const profiles = await FaceProfile.find()
      .populate('userId', 'name username role department')
      .skip(skip)
      .limit(limit);

    const total = await FaceProfile.countDocuments();

    res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: profiles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, code: 'SERVER_ERROR' });
  }
};

module.exports = {
  registerFace,
  recognizeFace,
  faceLogin,
  getFaceProfile,
  updateFace,
  deleteFace,
  faceAttendance,
  adminGetFaceProfiles
};
