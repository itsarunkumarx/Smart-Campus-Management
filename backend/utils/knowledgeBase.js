/**
 * Prince College Institutional Knowledge Base
 * This serves as the "Training Set" for the Neural Assistant.
 * It contains high-accuracy facts about college protocols, fees, and departments.
 */

const knowledgeBase = {
    institutional: {
        name: "Prince College of Engineering and Technology",
        location: "Institutional Hub, Smart Campus",
        founded: "2006",
        motto: "Excellence through Innovation",
        vision: "To be a global leader in AI-driven education."
    },
    academic: {
        departments: [
            "Computer Science and Engineering (CSE)",
            "Artificial Intelligence and Data Science (AI&DS)",
            "Information Technology (IT)",
            "Electronics and Communication Engineering (ECE)",
            "Mechanical Engineering (ME)"
        ],
        attendanceThreshold: "75% mandatory for exam eligibility",
        internalMarks: "Based on 3 internal assessments (60%) and assignments/attendance (40%)",
        examCycle: "Semester-wise (Nov/Dec for odd, April/May for even semesters)"
    },
    scholarships: {
        merit: {
            name: "Founder's Merit Grant",
            eligibility: "GPA 3.8+ or Top 5% of department",
            benefit: "50% tuition waiver"
        },
        sports: {
            name: "Athletic Excellence Award",
            eligibility: "State/National level representation",
            benefit: "Hostel fee waiver"
        },
        googleDrive: "Submission requires a public/institution-shared Google Drive URL for verification."
    },
    fees: {
        tuition: "Payable via the Institutional Portal annually/semester-wise",
        lateFee: "Institutional protocol mandates a 2% penalty after 15 days of deadline",
        contact: "Accounts department Office (Block A, Floor 1)"
    },
    support: {
        complaints: "Raised via the 'Grievance' portal. Resolved within 48 institutional hours.",
        itSupport: "tech-support@princecollege.edu",
        library: "Open 8:00 AM - 8:00 PM (Monday to Saturday)"
    },
    casual: {
        greetings: ["Hello!", "Greetings, scholar!", "Neural link established. How can I help?", "Welcome back to the portal."],
        jokes: "Why did the student bring a ladder to Prince College? Because they heard the education was high-level!",
        weather: "The current campus climate is perpetually optimized for intellectual growth."
    }
};

/**
 * Heuristic search to find the best context for a query
 */
const findContext = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('fee') || lowerQuery.includes('payment') || lowerQuery.includes('tuition')) {
        return { category: 'financial', data: knowledgeBase.fees };
    }
    if (lowerQuery.includes('scholarship') || lowerQuery.includes('grant')) {
        return { category: 'scholarship', data: knowledgeBase.scholarships };
    }
    if (lowerQuery.includes('department') || lowerQuery.includes('course') || lowerQuery.includes('syllabus')) {
        return { category: 'academic', data: knowledgeBase.academic };
    }
    if (lowerQuery.includes('attendance') || lowerQuery.includes('exam') || lowerQuery.includes('marks')) {
        return { category: 'academic', data: knowledgeBase.academic };
    }
    if (lowerQuery.includes('help') || lowerQuery.includes('complaint') || lowerQuery.includes('support')) {
        return { category: 'support', data: knowledgeBase.support };
    }
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
        return { category: 'casual', data: knowledgeBase.casual, type: 'greeting' };
    }
    if (lowerQuery.includes('joke')) {
        return { category: 'casual', data: knowledgeBase.casual, type: 'joke' };
    }

    return { category: 'general', data: knowledgeBase.institutional };
};

module.exports = { knowledgeBase, findContext };
