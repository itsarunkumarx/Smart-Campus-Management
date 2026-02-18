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

// All routes require authentication
router.use(protect);

router.post('/', authorizeRoles('faculty', 'admin'), createEvent);
router.get('/', getEvents);
router.post('/:id/register', authorizeRoles('student'), registerForEvent);
router.get('/:id/registrations', getRegistrations);
router.put('/:id', authorizeRoles('faculty', 'admin'), updateEvent);

module.exports = router;
