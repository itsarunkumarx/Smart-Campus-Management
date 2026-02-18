const express = require('express');
const { createComplaint, getComplaints } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createComplaint);
router.get('/', getComplaints);

module.exports = router;
