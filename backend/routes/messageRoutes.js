const express = require('express');
const router = express.Router();
const {
    allMessages,
    sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/:chatId').get(allMessages);
router.route('/').post(sendMessage);

module.exports = router;
