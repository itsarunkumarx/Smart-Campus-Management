const express = require('express');
const router = express.Router();
const {
    accessChat,
    fetchChats,
    createGroupChat,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(accessChat).get(fetchChats);
router.route('/group').post(createGroupChat);

module.exports = router;
