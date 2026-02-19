import { createContext, useState, useEffect } from 'react';
import { authService } from '../services';

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
        setUser(data);
        return data;
    };

    const googleLogin = async (token) => {
        const data = await authService.googleLogin(token);
        setUser(data);
        return data;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateUser = (updatedData) => {
        setUser({ ...user, ...updatedData });
    };

    const updateProfile = async (profileData) => {
        const data = await authService.updateProfile(profileData);
        setUser(data);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, updateProfile, checkAuth, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};
