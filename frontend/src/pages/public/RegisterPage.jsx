import { authService } from '../../services';
import { GoogleLogin } from '@react-oauth/google';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        department: '',
        year: 1,
    });
    const [suggestions, setSuggestions] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const generateSuggestions = async (name) => {
        if (!name || name.length < 3) {
            setSuggestions([]);
            return;
        }

        const base = name.toLowerCase().replace(/\s+/g, '');
        const baseWithDot = name.toLowerCase().replace(/\s+/g, '.');
        const baseWithUnderscore = name.toLowerCase().replace(/\s+/g, '_');

        const potential = [
            base,
            baseWithDot,
            baseWithUnderscore,
            `${base}${Math.floor(Math.random() * 1000)}`,
            `${base}21`,
            `${base}_royal`
        ];

        const uniquePotential = [...new Set(potential)].slice(0, 6);
        setIsChecking(true);

        try {
            const availabilityResults = await Promise.all(
                uniquePotential.map(async (u) => {
                    const res = await authService.checkUsernameAvailability(u);
                    return res.available ? u : null;
                })
            );

            const available = availabilityResults.filter(u => u !== null);
            setSuggestions(available.slice(0, 4));
        } catch (err) {
            console.error('Availability check failed', err);
            // Fallback to basic generation if service fails
            setSuggestions(uniquePotential.slice(0, 3));
        } finally {
            setIsChecking(false);
        }
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setFormData({ ...formData, name: newName });
        generateSuggestions(newName);
    };

    const selectUsername = (username) => {
        setFormData({ ...formData, username });
        setSuggestions([]);
    };

    const departments = [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Mechanical',
        'Civil',
        'Chemical',
        'Electrical',
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.register(formData);
            navigate('/login/student', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            console.error('Registration Error:', err);
            if (!err.response) {
                setError('Unable to connect to the server. Please check your internet connection and try again.');
            } else {
                setError(err.response?.data?.message || `Registration failed (Error: ${err.response.status}). Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const data = await authService.googleLogin(credentialResponse.credential);

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
            setError(err.response?.data?.message || 'Google Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-500 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-metallic/5 dark:bg-gold-metallic/10 rounded-full filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-amber-500/10 rounded-full filter blur-[120px] animate-pulse animation-delay-2000"></div>

            <div className="relative max-w-2xl mx-auto px-4">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white dark:border-slate-800 transition-colors duration-500">
                    <div className="text-center mb-8">
                        <div className="text-7xl mb-6 drop-shadow-xl">👨‍🎓</div>
                        <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic">
                            Student <span className="text-gold-metallic">Registration</span>
                        </h2>
                        <p className="text-slate-600 dark:text-amber-100/60 mt-2 font-medium">Create your institutional credentials</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                                    required
                                    placeholder="johndoe"
                                />
                                {suggestions.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested for you</p>
                                            {isChecking && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Syncing...</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => selectUsername(s)}
                                                    className="bg-gold-metallic/5 dark:bg-gold-metallic/10 text-gold-metallic dark:text-gold-light px-3 py-1.5 rounded-xl text-xs font-bold border border-gold-metallic/10 dark:border-gold-metallic/20 hover:bg-gold-metallic hover:text-white transition-all transform active:scale-95"
                                                >
                                                    @{s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="john@example.com"
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
                                minLength="6"
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department</label>
                                <select
                                    className="input appearance-none bg-slate-50 dark:bg-slate-800"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Year</label>
                                <select
                                    className="input appearance-none bg-slate-50 dark:bg-slate-800"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                                    required
                                >
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Initializing Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Finalize Registration</span>
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
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Registration initiation failed.')}
                                useOneTap
                                theme="filled_blue"
                                shape="pill"
                                size="large"
                                width="100%"
                            />
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login/student" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
