import api from './api';

export const systemService = {
    getSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (settingsData) => {
        const response = await api.put('/admin/settings', settingsData);
        return response.data;
    }
};
