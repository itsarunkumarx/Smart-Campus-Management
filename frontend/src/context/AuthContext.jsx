import { createContext, useState, useEffect } from 'react';
import { authService } from '../services';
import faceService from '../services/faceService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const data = await authService.getMe();
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        if (data && data.token) {
            localStorage.setItem('token', data.token);
        }
        setUser(data);
        return data;
    };

    const googleLogin = async (token) => {
        const data = await authService.googleLogin(token);
        if (data && data.token) {
            localStorage.setItem('token', data.token);
        }
        setUser(data);
        return data;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            // Ignore logout network errors
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const updateUser = (updatedData) => {
        setUser({ ...user, ...updatedData });
    };

    const updateProfile = async (profileData) => {
        const data = await authService.updateProfile(profileData);
        setUser(data);
        return data;
    };

    const faceLogin = async (embedding, livenessScore) => {
        const data = await faceService.faceLogin(embedding, livenessScore);
        const userData = data.user || data;
        if (data && data.token) {
            localStorage.setItem('token', data.token);
        }
        setUser(userData);
        return userData;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, updateProfile, checkAuth, googleLogin, faceLogin }}>
            {children}
        </AuthContext.Provider>
    );
};
