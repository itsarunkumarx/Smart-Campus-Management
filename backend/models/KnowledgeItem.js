const mongoose = require('mongoose');

const knowledgeItemSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['institutional', 'academic', 'scholarship', 'financial', 'support', 'policy', 'general'],
        default: 'general'
    },
    question: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    tags: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for search optimization
knowledgeItemSchema.index({ category: 1 });
knowledgeItemSchema.index({ tags: 1 });
knowledgeItemSchema.index({ content: 'text', question: 'text' });

const KnowledgeItem = mongoose.model('KnowledgeItem', knowledgeItemSchema);

module.exports = KnowledgeItem;
