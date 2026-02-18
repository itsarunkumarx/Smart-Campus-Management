import api from './api';

export const chatService = {
    fetchChats: async () => {
        const response = await api.get('/chat');
        return response.data;
    },

    accessChat: async (userId) => {
        const response = await api.post('/chat', { userId });
        return response.data;
    },

    createGroupChat: async (chatData) => {
        const response = await api.post('/chat/group', chatData);
        return response.data;
    }
};

export const messageService = {
    getMessages: async (chatId) => {
        const response = await api.get(`/message/${chatId}`);
        return response.data;
    },

    sendMessage: async (messageData) => {
        const response = await api.post('/message', messageData);
        return response.data;
    }
};
