const express = require('express');
const { processQuery } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route for AI interactions
// Protected route for AI interactions
router.post('/query', protect, processQuery);

module.exports = router;
