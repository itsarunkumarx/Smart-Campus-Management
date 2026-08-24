const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
  registerFace,
  recognizeFace,
  faceLogin,
  getFaceProfile,
  updateFace,
  deleteFace,
  faceAttendance,
  adminGetFaceProfiles
} = require('../controllers/faceController');

router.post('/login', faceLogin); // Public route

router.post('/register', protect, registerFace);
router.post('/recognize', protect, recognizeFace);
router.route('/profile')
  .get(protect, getFaceProfile)
  .put(protect, updateFace)
  .delete(protect, deleteFace);

router.post('/attendance', protect, authorizeRoles('faculty'), faceAttendance);
router.get('/profiles', protect, authorizeRoles('admin'), adminGetFaceProfiles);

module.exports = router;
