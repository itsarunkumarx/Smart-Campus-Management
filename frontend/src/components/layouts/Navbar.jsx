import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ThemeToggle';
import NotificationBell from './NotificationBell';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        switch (user?.role) {
            case 'student':
                return '/student/dashboard';
            case 'faculty':
                return '/faculty/dashboard';
            case 'admin':
                return '/admin/dashboard';
            default:
                return '/';
        }
    };

    return (
        <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-gold-metallic via-amber-600 to-gold-dark rounded-lg flex items-center justify-center shadow-lg shadow-gold-metallic/20 transform group-hover:rotate-12 transition-transform duration-500">
                                <span className="text-white font-bold text-xl drop-shadow-md">SC</span>
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Smart <span className="text-gold-metallic">Campus</span></span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            {user && <NotificationBell />}
                        </div>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center space-x-2 text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden md:block">{user.name}</span>
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl py-2 border border-gray-100 dark:border-slate-700">
                                        <Link
                                            to={user?.role === 'admin' ? '/admin/dashboard' : `/${user?.role}/profile`}
                                            className="block px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    );
};
