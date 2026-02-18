import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';
import { toast } from 'react-hot-toast';

export const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const data = await authService.updateProfile({ password: formData.password });
            updateUser(data);
            toast.success('Password updated successfully!');

            // Redirect based on role
            switch (user.role) {
                case 'student': navigate('/student/dashboard'); break;
                case 'faculty': navigate('/faculty/dashboard'); break;
                case 'admin': navigate('/admin/dashboard'); break;
                default: navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 transition-colors duration-500">
            <div className="max-w-md w-full">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white dark:border-slate-800">
                    <div className="text-center mb-10">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-sky-500 to-indigo-700 rounded-[2rem] flex items-center justify-center text-4xl mb-6 mx-auto shadow-2xl animate-pulse ring-4 ring-indigo-500/20">
                                🛡️
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold-metallic rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                ✨
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                            Identity <span className="text-indigo-600 dark:text-sky-400">Shield</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-4 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3">
                            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                            Credential Sovereignty
                            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">New Password</label>
                            <input
                                type="password"
                                className="input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="Min 6 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Confirm New Password</label>
                            <input
                                type="password"
                                className="input"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                placeholder="Repeat new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-4 text-lg font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                        >
                            {loading ? 'Securing Account...' : 'Update & Continue'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                        Smart Campus Security Protocol active
                    </p>
                </div>
            </div>
        </div>
    );
};
