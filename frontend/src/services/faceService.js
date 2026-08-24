import api from './api';

const faceService = {
    registerFace: async (embedding) => {
        const response = await api.post('/face/register', { embedding }, { noCache: true });
        return response.data;
    },
    recognizeFace: async (embedding) => {
        const response = await api.post('/face/recognize', { embedding }, { noCache: true });
        return response.data;
    },
    faceLogin: async (embedding, livenessScore) => {
        const response = await api.post('/auth/face-login', { embedding, livenessScore }, { noCache: true });
        return response.data;
    },
    getFaceProfile: async () => {
        const response = await api.get('/face/profile', { noCache: true });
        return response.data;
    },
    updateFace: async (embedding) => {
        const response = await api.put('/face/profile', { embedding });
        return response.data;
    },
    deleteFace: async () => {
        const response = await api.delete('/face/profile');
        return response.data;
    },
    faceAttendance: async (data) => {
        const response = await api.post('/face/attendance', data, { noCache: true });
        return response.data;
    },
    verifyAccess: async (data) => {
        const response = await api.post('/access/verify', data, { noCache: true });
        return response.data;
    },
    getAccessLogs: async (params) => {
        const response = await api.get('/access/logs', { params });
        return response.data;
    },
    getMyAccessLogs: async () => {
        const response = await api.get('/access/my-logs');
        return response.data;
    },
    getSecurityEvents: async (params) => {
        const response = await api.get('/security/events', { params });
        return response.data;
    },
    getSecurityStats: async () => {
        const response = await api.get('/security/stats');
        return response.data;
    },
    getAnomalies: async () => {
        const response = await api.get('/security/anomalies');
        return response.data;
    },
    getAttendanceAnalytics: async (params) => {
        const response = await api.get('/analytics/attendance', { params });
        return response.data;
    },
    getSecurityAnalytics: async (params) => {
        const response = await api.get('/analytics/security', { params });
        return response.data;
    },
    getAdminFaceProfiles: async (params) => {
        const response = await api.get('/face/profiles', { params });
        return response.data;
    },
};

export default faceService;
