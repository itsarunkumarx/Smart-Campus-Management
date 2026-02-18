const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Private
const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name profileImage email')
            .populate('chat');
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/message
// @access  Private
const sendMessage = async (req, res) => {
    const { content, chatId, fileUrl, fileType } = req.body;

    if (!chatId || (!content && !fileUrl)) {
        return res.status(400).json({ message: 'Invalid data passed into request' });
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        fileUrl: fileUrl,
        fileType: fileType,
        readBy: [req.user._id],
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name profileImage');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name profileImage email',
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    allMessages,
    sendMessage,
};
