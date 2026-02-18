import api from './api';

export const userService = {
    searchUsers: async (query) => {
        const response = await api.get(`/auth/search?search=${query}`);
        return response.data;
    },

    followUser: async (userId) => {
        const response = await api.post(`/auth/follow/${userId}`);
        return response.data;
    },

    unfollowUser: async (id) => {
        const response = await api.post(`/auth/unfollow/${id}`);
        return response.data;
    },

    getUserById: async (id) => {
        const response = await api.get(`/auth/user/${id}`);
        return response.data;
    }
};
