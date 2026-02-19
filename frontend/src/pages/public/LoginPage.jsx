import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';

export const LoginPage = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login({ ...formData, role });

            if (data.mustChangePassword) {
                navigate('/change-password');
                return;
            }

            // Redirect based on role
            switch (data.role) {
                case 'student':
                    navigate('/student/dashboard');
                    break;
                case 'faculty':
                    navigate('/faculty/dashboard');
                    break;
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRoleDisplay = () => {
        switch (role) {
            case 'student':
                return { title: 'Student', icon: '👨‍🎓', color: 'gold' };
            case 'faculty':
                return { title: 'Faculty', icon: '👩‍🏫', color: 'gold' };
            case 'admin':
                return { title: 'Administrator', icon: '👨‍💼', color: 'gold' };
            default:
                return { title: 'User', icon: '👤', color: 'gold' };
        }
    };

    const roleInfo = getRoleDisplay();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 transition-colors duration-500 relative overflow-hidden">
            {/* Background blur elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-metallic/5 dark:bg-gold-metallic/10 rounded-full filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-amber-500/10 rounded-full filter blur-[120px] animate-pulse animation-delay-2000"></div>

            <div className="max-w-md w-full mx-4 relative">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white dark:border-slate-800 transition-colors duration-500">
                    <div className="text-center mb-8">
                        <div className="text-7xl mb-6 drop-shadow-xl">{roleInfo.icon}</div>
                        <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic">
                            {roleInfo.title} <span className="text-gold-metallic">Portal</span>
                        </h2>
                        <p className="text-slate-600 dark:text-amber-100/60 mt-2 font-medium">Initialize institutional access protocol</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                className="input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Access Portal</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>

                        <div className="relative flex items-center justify-center py-2">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            <div className="absolute bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-500">
                                or
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        setLoading(true);
                                        const data = await googleLogin(credentialResponse.credential);

                                        if (data.mustChangePassword) {
                                            navigate('/change-password');
                                            return;
                                        }

                                        // Redirect based on role
                                        switch (data.role) {
                                            case 'student': navigate('/student/dashboard'); break;
                                            case 'faculty': navigate('/faculty/dashboard'); break;
                                            case 'admin': navigate('/admin/dashboard'); break;
                                            default: navigate('/');
                                        }
                                    } catch (err) {
                                        const errorMsg = err.response?.data?.details
                                            ? `Google Auth Error: ${err.response.data.details}`
                                            : (err.response?.data?.message || 'Google Login failed. Please try again.');
                                        setError(errorMsg);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                onError={() => {
                                    setError('Institutional Google Login initiation failed.');
                                }}
                                useOneTap
                                theme="filled_blue"
                                shape="pill"
                                size="large"
                            />
                        </div>
                    </form>

                    <div className="mt-8 text-center space-y-3">
                        {role === 'student' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                    Register here
                                </Link>
                            </p>
                        )}
                        <Link
                            to="/role-selection"
                            className="inline-block text-sm font-bold text-slate-500 dark:text-amber-100/40 hover:text-gold-metallic dark:hover:text-gold-metallic transition-all uppercase tracking-widest"
                        >
                            ← Switch Access Point
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
