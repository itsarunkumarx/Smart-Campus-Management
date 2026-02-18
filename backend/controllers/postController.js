const Post = require('../models/Post');
const { createNotification } = require('../utils/notificationUtils');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content, media, tags, visibility } = req.body;

        const post = await Post.create({
            userId: req.user._id,
            content,
            media: media || [],
            tags: tags || [],
            visibility: visibility || 'public',
        });

        const populatedPost = await Post.findById(post._id).populate('userId', 'name profileImage role department');

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('userId', 'name profileImage role department year')
            .populate('comments.userId', 'name profileImage');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all posts (with filtering)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Build filter based on user role
        let filter = { isRemoved: false };

        // Students see: public posts + department posts + year posts
        if (req.user.role === 'student') {
            filter.$or = [
                { visibility: 'public' },
                { visibility: 'department', 'userId.department': req.user.department },
                { visibility: 'year', 'userId.year': req.user.year },
            ];
        }

        const posts = await Post.find(filter)
            .populate('userId', 'name profileImage role department year')
            .populate('comments.userId', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Post.countDocuments(filter);

        res.json({
            posts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like/unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.user._id);

            // Notify author if it's not their own post
            if (post.userId.toString() !== req.user._id.toString()) {
                await createNotification({
                    title: 'New Manifest Interaction',
                    message: `${req.user.name} liked your manifest`,
                    type: 'like',
                    recipient: post.userId,
                    link: `/post/${post._id}`,
                    createdBy: req.user._id
                });
            }
        }

        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            userId: req.user._id,
            text,
        });

        await post.save();

        // Notify author if it's not their own post
        if (post.userId.toString() !== req.user._id.toString()) {
            await createNotification({
                title: 'Manifest Discourse',
                message: `${req.user.name} commented on your manifest`,
                type: 'comment',
                recipient: post.userId,
                link: `/post/${post._id}`,
                createdBy: req.user._id
            });
        }

        const populatedPost = await Post.findById(post._id)
            .populate('userId', 'name profileImage')
            .populate('comments.userId', 'name profileImage');

        res.json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report a post
// @route   PUT /api/posts/:id/report
// @access  Private
const reportPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.isReported = true;
        await post.save();

        res.json({ message: 'Post reported successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a post (own post or admin)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Only author or admin can delete
        if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPost,
    getPosts,
    toggleLike,
    addComment,
    reportPost,
    deletePost,
    getPostById,
};
