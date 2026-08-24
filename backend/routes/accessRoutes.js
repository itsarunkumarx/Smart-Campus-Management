const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
  verifyAccess,
  getAccessLogs,
  getMyAccessLogs
} = require('../controllers/accessController');

router.post('/verify', protect, verifyAccess);
router.get('/logs', protect, authorizeRoles('admin'), getAccessLogs);
router.get('/my-logs', protect, getMyAccessLogs);

module.exports = router;
