import api from './api';

export const systemService = {
    getSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (settingsData) => {
        const response = await api.put('/admin/settings', settingsData);
        return response.data;
    },

    importKnowledge: async (items) => {
        const response = await api.post('/admin/ai/knowledge/import', { items });
        return response.data;
    },

    getKnowledge: async () => {
        const response = await api.get('/admin/ai/knowledge');
        return response.data;
    },

    deleteKnowledge: async (id) => {
        const response = await api.delete(`/admin/ai/knowledge/${id}`);
        return response.data;
    },

    updateKnowledge: async (id, itemData) => {
        const response = await api.put(`/admin/ai/knowledge/${id}`, itemData);
        return response.data;
    }
};
