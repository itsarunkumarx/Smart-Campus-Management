import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Building2,
    DollarSign,
    Calendar,
    CheckCircle2,
    ArrowRight,
    Search,
    Filter,
    Clock,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import { generalService, studentService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

export const PlacementsPage = () => {
    const { user } = useAuth();
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isApplying, setIsApplying] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const data = await generalService.getPlacements();
            setPlacements(data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load placement opportunities.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (id) => {
        try {
            setIsApplying(id);
            await studentService.applyForPlacement(id);
            setMessage({ type: 'success', text: 'Application submitted successfully! Check dashboard for status updates.' });
            // Refresh placements to update application status
            fetchPlacements();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply.' });
        } finally {
            setIsApplying(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const filteredPlacements = placements.filter(p =>
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.jobRole.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Career Opportunities</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Discover and apply for leading campus placements</p>
                </div>
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search company or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 py-2.5 text-sm bg-white dark:bg-slate-800 shadow-sm border-gray-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse rounded-2xl" />)
                ) : filteredPlacements.length > 0 ? (
                    filteredPlacements.map((placement, idx) => {
                        const hasApplied = placement.applicants?.some(a => a.userId === user?._id || a.userId?._id === user?._id);
                        const isExpired = new Date(placement.deadline) < new Date();

                        return (
                            <motion.div
                                key={placement._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card group hover:scale-[1.02] transition-all duration-300 p-0 overflow-hidden flex flex-col border-slate-100 dark:border-slate-800"
                            >
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                            <Building2 size={24} />
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${isExpired ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                            }`}>
                                            {isExpired ? 'Expired' : 'Active'}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{placement.companyName}</h3>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{placement.jobRole}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                            <DollarSign size={14} className="text-indigo-500" />
                                            {placement.package}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                            <Calendar size={14} className="text-indigo-500" />
                                            {new Date(placement.deadline).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-xs text-gray-400 line-clamp-2 italic">{placement.description}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                                    {hasApplied ? (
                                        <button className="w-full py-2.5 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2" disabled>
                                            <UserCheck size={16} />
                                            Already Applied
                                        </button>
                                    ) : isExpired ? (
                                        <button className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-xs uppercase tracking-widest cursor-not-allowed" disabled>
                                            Deadline Passed
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(placement._id)}
                                            disabled={isApplying === placement._id}
                                            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30"
                                        >
                                            {isApplying === placement._id ? (
                                                <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                            ) : (
                                                <>
                                                    Apply Now
                                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-20 glass-card">
                        <Briefcase className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No matching opportunities</h3>
                        <p className="text-gray-400 mt-2">Check back later for new career listings.</p>
                    </div>
                )}
            </div>

            {/* Pro-tip Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6"
            >
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/30">
                    <AlertCircle size={32} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-tight">Placement Guidelines</h4>
                    <p className="text-indigo-700/70 dark:text-indigo-400/70 text-sm mt-1">Ensure your profile bio and portfolio are up to date before applying. Most companies review these details during the initial shortlisting phase.</p>
                </div>
            </motion.div>
        </div>
    );
};
