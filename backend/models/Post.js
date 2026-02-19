const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            maxlength: 2000,
        },
        media: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ['image', 'video'], default: 'image' },
            }
        ],
        authorDepartment: String,
        authorYear: Number,
        tags: [String],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                    maxlength: 500,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        visibility: {
            type: String,
            enum: ['public', 'department', 'year'],
            default: 'public',
        },
        isReported: {
            type: Boolean,
            default: false,
        },
        isRemoved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ isRemoved: 1 });

module.exports = mongoose.model('Post', postSchema);
