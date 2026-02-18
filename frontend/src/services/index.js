import api from './api';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    checkUsernameAvailability: async (username) => {
        const response = await api.get(`/auth/check-username/${username}`);
        return response.data;
    },

    googleLogin: async (token) => {
        const response = await api.post('/auth/google', { token });
        return response.data;
    },

    deactivateAccount: async () => {
        const response = await api.post('/auth/deactivate');
        return response.data;
    },

    deleteAccount: async () => {
        const response = await api.delete('/auth/delete');
        return response.data;
    },
};

export const studentService = {
    getDashboard: async () => {
        const response = await api.get('/student/dashboard');
        return response.data;
    },

    getAttendance: async () => {
        const response = await api.get('/student/attendance');
        return response.data;
    },

    applyForPlacement: async (id) => {
        const response = await api.post(`/student/placement/${id}/apply`);
        return response.data;
    },

    applyForScholarship: async (id, documents) => {
        const response = await api.post(`/student/scholarship/${id}/apply`, { documents });
        return response.data;
    },
};

export const facultyService = {
    getDashboard: async () => {
        const response = await api.get('/faculty/dashboard');
        return response.data;
    },

    createAnnouncement: async (data) => {
        const response = await api.post('/faculty/announcement', data);
        return response.data;
    },

    markAttendance: async (data) => {
        const response = await api.post('/faculty/attendance', data);
        return response.data;
    },

    markBulkAttendance: async (data) => {
        const response = await api.post('/faculty/attendance/bulk', data);
        return response.data;
    },

    getStudents: async () => {
        const response = await api.get('/faculty/students');
        return response.data;
    },
};

export const adminService = {
    getDashboard: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    getUsers: async (role) => {
        const response = await api.get('/admin/users', { params: { role } });
        return response.data;
    },

    toggleSuspendUser: async (id) => {
        const response = await api.put(`/admin/user/${id}/suspend`);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/admin/user/${id}`);
        return response.data;
    },

    createPlacement: async (data) => {
        const response = await api.post('/admin/placement', data);
        return response.data;
    },

    createScholarship: async (data) => {
        const response = await api.post('/admin/scholarship', data);
        return response.data;
    },

    createAnnouncement: async (data) => {
        const response = await api.post('/admin/announcement', data);
        return response.data;
    },

    getComplaints: async () => {
        const response = await api.get('/admin/complaints');
        return response.data;
    },

    updateComplaint: async (id, data) => {
        const response = await api.put(`/admin/complaint/${id}`, data);
        return response.data;
    },

    addFaculty: async (facultyData) => {
        const response = await api.post('/admin/faculty/add', facultyData);
        return response.data;
    },

    updateScholarshipApplicant: async (scholarshipId, applicantId, status) => {
        const response = await api.put(`/admin/scholarship/${scholarshipId}/applicant/${applicantId}`, { status });
        return response.data;
    },

    getAISummary: async () => {
        const response = await api.get('/admin/ai-summary');
        return response.data;
    },
};

export const postService = {
    getPosts: async (page = 1) => {
        const response = await api.get('/posts', { params: { page } });
        return response.data;
    },

    getPostById: async (id) => {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    },

    createPost: async (data) => {
        const response = await api.post('/posts', data);
        return response.data;
    },

    toggleLike: async (id) => {
        const response = await api.put(`/posts/${id}/like`);
        return response.data;
    },

    addComment: async (id, text) => {
        const response = await api.post(`/posts/${id}/comment`, { text });
        return response.data;
    },

    reportPost: async (id) => {
        const response = await api.put(`/posts/${id}/report`);
        return response.data;
    },

    deletePost: async (id) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    },
};

export const eventService = {
    getEvents: async (params) => {
        const response = await api.get('/events', { params });
        return response.data;
    },

    createEvent: async (data) => {
        const response = await api.post('/events', data);
        return response.data;
    },

    registerForEvent: async (id) => {
        const response = await api.post(`/events/${id}/register`);
        return response.data;
    },
};

export const complaintService = {
    getComplaints: async () => {
        const response = await api.get('/complaints');
        return response.data;
    },

    createComplaint: async (data) => {
        const response = await api.post('/complaints', data);
        return response.data;
    },
};

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },
};

export const generalService = {
    getPlacements: async () => {
        const response = await api.get('/placements');
        return response.data;
    },

    getScholarships: async () => {
        const response = await api.get('/scholarships');
        return response.data;
    },
};
