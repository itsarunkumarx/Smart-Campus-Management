const AILog = require('../models/AIlog');
const { findContext } = require('../utils/knowledgeBase');

/**
 * @desc    Process AI Query with Institutional Knowledge
 * @route   POST /api/ai/query
 * @access  Private
 */
const processQuery = async (req, res) => {
    try {
        const { query, mode } = req.body;
        const user = req.user;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Get context from Knowledge Base
        const context = findContext(query);

        // Generate intelligent response based on context and mode
        let response = "";

        switch (context.category) {
            case 'financial':
                response = `Regarding institutional finances: ${context.data.tuition}. For payment delays, ${context.data.lateFee}. You can visit ${context.data.contact} for specifics.`;
                break;
            case 'scholarship':
                response = `Institutional grants are managed via the Scholarship Hub. The ${context.data.merit.name} requires ${context.data.merit.eligibility}. Note: ${context.data.googleDrive}`;
                break;
            case 'academic':
                if (query.toLowerCase().includes('department')) {
                    response = `Prince College hosts the following major departments: ${context.data.departments.join(', ')}.`;
                } else {
                    response = `Academic Protocol: ${context.data.attendanceThreshold}. Internal marks are ${context.data.internalMarks}.`;
                }
                break;
            case 'support':
                response = `For assistance: ${context.data.complaints} Contact ${context.data.itSupport} for technical issues or visit the library between ${context.data.library}.`;
                break;
            case 'casual':
                if (context.type === 'greeting') {
                    const greeting = context.data.greetings[Math.floor(Math.random() * context.data.greetings.length)];
                    response = `${greeting} I am fully trained on institutional protocols and casual campus inquiries.`;
                } else if (context.type === 'joke') {
                    response = context.data.jokes;
                }
                break;
            default:
                response = `I am the Neural Assistant of ${context.data.name}. While I am still learning every aspect of the college ecosystem, I can currently help you with: \n- Fee & Payment protocols \n- Scholarship eligibility \n- Academic department info \n- Attendance & Exam cycles \n\nWhat would you like to explore?`;
        }

        // Add tone based on mode
        if (mode === 'Professional') {
            response = `[System Message]: ${response}`;
        } else if (mode === 'Casual') {
            response = `Hey ${user.name}! ${response} Hope that helps!`;
        }

        // Log the AI interaction
        await AILog.create({
            userId: user._id,
            userRole: user.role,
            query,
            response,
            category: context.category === 'general' ? 'casual' :
                context.category === 'financial' ? 'admin' :
                    context.category === 'scholarship' ? 'career' : 'academic'
        });

        res.json({ response });
    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ message: 'Neural processing failed. Please retry institutional sync.' });
    }
};

module.exports = { processQuery };
