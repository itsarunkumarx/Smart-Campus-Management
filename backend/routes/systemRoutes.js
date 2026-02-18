const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/systemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.route('/')
    .get(getSettings)
    .put(updateSettings);

module.exports = router;
