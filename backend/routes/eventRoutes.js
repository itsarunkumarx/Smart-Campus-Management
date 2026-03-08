const express = require('express');
const {
    createEvent,
    getEvents,
    registerForEvent,
    getRegistrations,
    updateEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Authentication middleware is applied to specific routes


router.post('/', protect, authorizeRoles('faculty', 'admin'), createEvent);
router.get('/', getEvents);
router.post('/:id/register', protect, authorizeRoles('student'), registerForEvent);
router.get('/:id/registrations', protect, getRegistrations);
router.put('/:id', protect, authorizeRoles('faculty', 'admin'), updateEvent);

module.exports = router;
