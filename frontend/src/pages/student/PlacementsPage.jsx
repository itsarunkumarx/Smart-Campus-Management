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
    Clock,
    UserCheck,
    AlertCircle,
    X,
    Star,
    Users,
    ChevronRight,
    Eye,
    BadgeCheck,
    Hourglass,
    ThumbsUp,
    ThumbsDown,
    Bell
} from 'lucide-react';
import { generalService, studentService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

// Helper: days remaining until deadline
const daysUntil = (deadline) => {
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Status config for placement applicant statuses
const PLACEMENT_STATUS = {
    applied: { label: 'Applied', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Hourglass },
    shortlisted: { label: 'Shortlisted', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Star },
    selected: { label: 'Selected 🎉', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: BadgeCheck },
    rejected: { label: 'Not Selected', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: ThumbsDown },
};

// Details Modal Component
const PlacementDetailsModal = ({ placement, currentUser, onClose, onApply, isApplying }) => {
    if (!placement) return null;
    const applicant = currentUser ? placement.applicants?.find(a => a.userId === currentUser?._id || a.userId?._id === currentUser?._id) : null;

    const hasApplied = !!applicant;
    const isExpired = new Date(placement.deadline) < new Date();
    const daysLeft = daysUntil(placement.deadline);
    const statusConfig = applicant ? PLACEMENT_STATUS[applicant.status] || PLACEMENT_STATUS.applied : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Gradient header */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                        <X size={18} />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Building2 size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{placement.companyName}</h2>
                            <p className="text-indigo-200 font-bold mt-1">{placement.jobRole}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-sm bg-white/10 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                                    <DollarSign size={14} /> {placement.package}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 ${isExpired ? 'bg-rose-500/30' : daysLeft <= 7 ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`}>
                                    <Calendar size={14} />
                                    {isExpired ? 'Expired' : daysLeft === 1 ? '1 day left!' : `${daysLeft} days left`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Description */}
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About the Role</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{placement.description}</p>
                    </div>

                    {/* Eligibility / Requirements */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6">
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <BadgeCheck size={14} /> Eligibility &amp; Requirements
                        </h3>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed font-medium">{placement.eligibility}</p>
                    </div>

                    {/* Application Status */}
                    {hasApplied && statusConfig && (
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${statusConfig.color}`}>
                            <statusConfig.icon size={20} />
                            <div>
                                <p className="font-black text-sm uppercase tracking-wider">Your Application: {statusConfig.label}</p>
                                <p className="text-xs opacity-70 font-medium mt-0.5">
                                    Applied on {new Date(applicant.appliedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Key Info Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <Users size={20} className="mx-auto text-indigo-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Applicants</p>
                            <p className="text-xl font-black text-gray-800 dark:text-white">{placement.applicants?.length || 0}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <DollarSign size={20} className="mx-auto text-emerald-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Package</p>
                            <p className="text-sm font-black text-gray-800 dark:text-white">{placement.package}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <Calendar size={20} className="mx-auto text-amber-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Deadline</p>
                            <p className="text-xs font-black text-gray-800 dark:text-white">{new Date(placement.deadline).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    {!currentUser ? (
                        <Link
                            to="/login/student"
                            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                        >
                            Sign In to Apply <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <>
                            {hasApplied ? (
                                <button disabled className={`w-full py-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${statusConfig?.color}`}>
                                    <statusConfig.icon size={18} /> {statusConfig.label}
                                </button>
                            ) : isExpired ? (
                                <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-sm uppercase tracking-widest">
                                    Deadline Passed
                                </button>
                            ) : (
                                <button
                                    onClick={() => onApply(placement._id)}
                                    disabled={isApplying === placement._id}
                                    className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                                >
                                    {isApplying === placement._id ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                    ) : (
                                        <> Apply Now <ArrowRight size={18} /></>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export const PlacementsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isApplying, setIsApplying] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedPlacement, setSelectedPlacement] = useState(null);

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const data = await generalService.getPlacements();
            setPlacements(data.length > 0 ? data : [
                {
                    _id: 'mock1',
                    companyName: 'Institutional Neural Grid',
                    jobRole: 'Systems Architect',
                    package: '18.5 LPA',
                    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
                    description: 'Leading the development of next-generation campus infrastructure.',
                    eligibility: 'CGPA > 8.5, Proficiency in distributed systems.',
                    applicants: []
                },
                {
                    _id: 'mock2',
                    companyName: 'Cyberdyne Operations',
                    jobRole: 'Security Researcher',
                    package: '12.0 LPA',
                    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
                    description: 'Securing the institutional perimeter against advanced persistent threats.',
                    eligibility: 'Strong background in ethical hacking and protocol analysis.',
                    applicants: []
                }
            ]);
        } catch (err) {
            // Silenced error
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (id) => {
        if (!user) {
            navigate('/login/student');
            return;
        }
        try {
            setIsApplying(id);
            await studentService.applyForPlacement(id);
            setMessage({ type: 'success', text: 'Application submitted! Track your status on this page.' });
            setSelectedPlacement(null);
            fetchPlacements();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply.' });
        } finally {
            setIsApplying(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        }
    };

    const filteredPlacements = placements.filter(p =>
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.jobRole.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Deadline urgency: expiring within 7 days and not yet expired
    const urgentPlacements = placements.filter(p => {
        const d = daysUntil(p.deadline);
        return d >= 0 && d <= 7;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Career Opportunities</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Discover and navigate institutional placement programs</p>
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

            {/* Deadline Urgency Alert */}
            <AnimatePresence>
                {urgentPlacements.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-4"
                    >
                        <div className="p-2 bg-amber-500 rounded-xl text-white flex-shrink-0">
                            <Bell size={18} />
                        </div>
                        <div>
                            <p className="font-black text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wider">⚡ Immediate Deadline Transmission</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
                                {urgentPlacements.map(p => (
                                    <span key={p._id} className="inline-block mr-3">
                                        <strong>{p.companyName}</strong> — {daysUntil(p.deadline) === 0 ? 'Cycle Ends Today!' : `${daysUntil(p.deadline)} day(s) remaining`}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Banner */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
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
                        const applicant = user ? placement.applicants?.find(a => a.userId === user?._id || a.userId?._id === user?._id) : null;

                        const hasApplied = !!applicant;
                        const isExpired = new Date(placement.deadline) < new Date();
                        const daysLeft = daysUntil(placement.deadline);
                        const statusConfig = applicant ? (PLACEMENT_STATUS[applicant.status] || PLACEMENT_STATUS.applied) : null;
                        const isUrgent = !isExpired && daysLeft <= 7;

                        return (
                            <motion.div
                                key={placement._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={`glass-card group hover:scale-[1.02] transition-all duration-300 p-0 overflow-hidden flex flex-col border-slate-100 dark:border-slate-800 ${isUrgent ? 'ring-2 ring-amber-400/50' : ''}`}
                            >
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                            <Building2 size={24} />
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${isExpired ? 'bg-rose-50 text-rose-500' : isUrgent ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {isExpired ? 'Terminal' : isUrgent ? `${daysLeft}d left!` : 'Operational'}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{placement.companyName}</h3>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{placement.jobRole}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                            <DollarSign size={14} className="text-indigo-500" />
                                            {placement.package}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                            <Calendar size={14} className="text-indigo-500" />
                                            {new Date(placement.deadline).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Eligibility snippet */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prerequisites</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 font-medium italic">{placement.eligibility}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    {/* Status badge if applied */}
                                    {hasApplied && statusConfig && (
                                        <div className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${statusConfig.color}`}>
                                            <statusConfig.icon size={14} /> {statusConfig.label}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {/* View Details button */}
                                        <button
                                            onClick={() => setSelectedPlacement(placement)}
                                            className="flex-1 py-2.5 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all font-inter"
                                        >
                                            <Eye size={14} /> Intelligence
                                        </button>

                                        {/* Apply / Status button */}
                                        {!user ? (
                                            <Link
                                                to="/login/student"
                                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                Apply <ArrowRight size={14} />
                                            </Link>
                                        ) : (
                                            <>
                                                {!hasApplied && (
                                                    isExpired ? (
                                                        <button disabled className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-xs uppercase tracking-widest cursor-not-allowed">
                                                            Locked
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApply(placement._id)}
                                                            disabled={isApplying === placement._id}
                                                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                                                        >
                                                            {isApplying === placement._id ? (
                                                                <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                                            ) : (
                                                                <> Apply <ArrowRight size={14} /></>
                                                            )}
                                                        </button>
                                                    )
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-20 glass-card">
                        <Briefcase className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest italic">No matching intelligence</h3>
                        <p className="text-gray-400 mt-2">Check back during high-frequency recruitment cycles.</p>
                    </div>
                )}
            </div>

            {/* Guidelines Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6"
            >
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/30">
                    <AlertCircle size={32} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-tight italic">Placement Directives</h4>
                    <p className="text-indigo-700/70 dark:text-indigo-400/70 text-sm mt-1">Ensure your institutional profile is calibrated before submission. Intelligence reports suggest updated portfolios increase shortlisting probability by 40%.</p>
                </div>
            </motion.div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedPlacement && (
                    <PlacementDetailsModal
                        placement={selectedPlacement}
                        currentUser={user}
                        onClose={() => setSelectedPlacement(null)}
                        onApply={handleApply}
                        isApplying={isApplying}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
