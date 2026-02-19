const AILog = require('../models/AIlog');
const KnowledgeItem = require('../models/KnowledgeItem');
const SystemSettings = require('../models/SystemSettings');
const { findContext } = require('../utils/knowledgeBase');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * @desc    Process AI Query with Institutional Knowledge
 * @route   POST /api/ai/query
 * @access  Private
 */
const processQuery = async (req, res) => {
    try {
        const { query, mode } = req.body;
        const user = req.user;

        // Check global AI status
        const settings = await SystemSettings.findOne();
        if (settings && settings.ai && !settings.ai.isEnabled) {
            return res.status(503).json({
                message: 'Neural core suspended. Institutional protocol: AI services are currently inactive.',
                isAIActive: false
            });
        }

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Fetch relevant dynamic knowledge from database
        const dynamicKnowledge = await KnowledgeItem.find({
            isActive: true,
            $text: { $search: query }
        }).limit(5);

        const dynamicContext = dynamicKnowledge.map(item => `- ${item.category.toUpperCase()}: ${item.content}`).join('\n');

        // Generate intelligent response using Real AI API
        const systemPrompt = `
You are the Prince College Neural Assistant, an intelligent AI trained on the institutional knowledge of Prince College of Engineering and Technology.
Your goal is to assist students, faculty, and staff with academic, administrative, and campus-related queries.

INSTITUTIONAL KNOWLEDGE:
${dynamicContext || 'Consult institutional protocols for high-accuracy facts.'}

CORE PROTOCOLS:
- Name: Prince College of Engineering and Technology
- Founded: 2006
- Departments: CSE, AI&DS, IT, ECE, ME
- Attendance: 75% mandatory for exam eligibility.
- Internal Marks: 60% from assessments, 40% from assignments/attendance.
- Support: Grievances resolved within 48 hours.

TONE GUIDELINES:
- Professional Mode: Authoritative, clear, and concise. Prefix responses with [System Message].
- Casual Mode: Friendly, helpful, and use the user's name (${user.name}).
- Academic Mode: Informative, scholarly, and focused on educational guidance.

Current Mode: ${mode}
User Query: ${query}
`;

        const apiResponse = await fetch(process.env.AI_BASE_URL || 'https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5000', // Required by OpenRouter
                'X-Title': 'Prince College Neural Assistant' // Optional but good for OpenRouter
            },
            body: JSON.stringify({
                model: process.env.AI_MODEL || 'meta-llama/Llama-3-70b-chat-hf',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                max_tokens: 512,
                temperature: 0.7
            })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error('AI API Error:', data);
            throw new Error('AI Gateway communication failure');
        }

        let response = data.choices[0].message.content;

        // Final formatting based on mode if needed (though the prompt handles it)
        if (mode === 'Professional' && !response.startsWith('[System Message]')) {
            response = `[System Message]: ${response}`;
        }

        // Log the AI interaction
        await AILog.create({
            userId: user._id,
            userRole: user.role,
            query,
            response,
            category: 'academic' // Default to academic for real AI
        });

        res.json({ response });
    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ message: 'Neural processing failed. Please retry institutional sync.' });
    }
};

module.exports = { processQuery };
