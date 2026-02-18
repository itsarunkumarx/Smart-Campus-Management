const express = require('express');
const {
    getDashboard,
    getAttendance,
    applyForPlacement,
    applyForScholarship,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes are protected and student-only
router.use(protect, authorizeRoles('student'));

router.get('/dashboard', getDashboard);
router.get('/attendance', getAttendance);
router.post('/placement/:id/apply', applyForPlacement);
router.post('/scholarship/:id/apply', applyForScholarship);

module.exports = router;
