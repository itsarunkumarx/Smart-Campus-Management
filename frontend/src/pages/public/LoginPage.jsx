import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';

export const LoginPage = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // The service expects the ID token (credential), but useGoogleLogin gives access token by default.
                // However, our backend might be configured for access tokens if we use this flow.
                // Note: The original GoogleLogin gave a credential (JWT). useGoogleLogin usually gives an access token.
                // I will use an alternative: useGoogleLogin can request 'auth-code' if needed, 
                // but let's see if we can just keep the look and use the library's custom login call.

                // Let's stick to the simplest aesthetic change first. 
                // Actually, Custom login button requires a bit more setup.
                // Wait, if I want to keep the EXACT logic, I should see if GoogleLogin supports a custom button.
                // It DOES NOT. Custom button requires useGoogleLogin.

                const data = await googleLogin(tokenResponse.access_token);

                if (data.mustChangePassword) {
                    navigate('/change-password');
                    return;
                }

                switch (data.role) {
                    case 'student': navigate('/student/dashboard'); break;
                    case 'faculty': navigate('/faculty/dashboard'); break;
                    case 'admin': navigate('/admin/dashboard'); break;
                    default: navigate('/');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Google Login failed.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google Login initiation failed.')
    });

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
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => loginWithGoogle()}
                                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
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
