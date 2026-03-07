import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award,
    GraduationCap,
    DollarSign,
    Calendar,
    CheckCircle2,
    AlertCircle,
    FileText,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    X,
    Eye,
    BadgeCheck,
    Hourglass,
    ThumbsDown,
    Bell,
    Users,
    Clock
} from 'lucide-react';
import { generalService, studentService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

const daysUntil = (deadline) => {
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const SCHOLARSHIP_STATUS = {
    pending: { label: 'Under Review', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Hourglass },
    approved: { label: 'Approved 🎉', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: BadgeCheck },
    rejected: { label: 'Not Approved', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: ThumbsDown },
};

// Details Modal
const ScholarshipDetailsModal = ({ scholarship, currentUser, onClose, onApply }) => {
    if (!scholarship) return null;
    const applicant = scholarship.applicants?.find(a => a.userId === currentUser?._id || a.userId?._id === currentUser?._id);
    const hasApplied = !!applicant;
    const isExpired = new Date(scholarship.deadline) < new Date();
    const daysLeft = daysUntil(scholarship.deadline);
    const statusConfig = applicant ? (SCHOLARSHIP_STATUS[applicant.status] || SCHOLARSHIP_STATUS.pending) : null;
    const slotsUsed = scholarship.applicants?.length || 0;
    const slotsLeft = (scholarship.totalSlots || 0) - slotsUsed;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                        <X size={18} />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Award size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{scholarship.name}</h2>
                            <p className="text-emerald-200 font-black text-3xl mt-1">₹{scholarship.amount?.toLocaleString()}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`text-sm px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 ${isExpired ? 'bg-rose-500/30' : daysLeft <= 7 ? 'bg-amber-500/30' : 'bg-white/10'}`}>
                                    <Calendar size={14} />
                                    {isExpired ? 'Deadline Passed' : daysLeft === 1 ? '1 day left!' : `${daysLeft} days left`}
                                </span>
                                <span className="text-sm px-3 py-1 rounded-lg font-bold bg-white/10 flex items-center gap-1.5">
                                    <Users size={14} /> {slotsLeft > 0 ? `${slotsLeft} slots open` : 'Slots full'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Description */}
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About This Scholarship</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{scholarship.description}</p>
                    </div>

                    {/* Eligibility */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-6">
                        <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <BadgeCheck size={14} /> Eligibility &amp; Requirements
                        </h3>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">{scholarship.eligibility}</p>
                    </div>

                    {/* Application Status */}
                    {hasApplied && statusConfig && (
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${statusConfig.color}`}>
                            <statusConfig.icon size={20} />
                            <div>
                                <p className="font-black text-sm uppercase tracking-wider">Status: {statusConfig.label}</p>
                                <p className="text-xs opacity-70 font-medium mt-0.5">
                                    Applied on {new Date(applicant.appliedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <DollarSign size={20} className="mx-auto text-emerald-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Grant</p>
                            <p className="text-sm font-black text-gray-800 dark:text-white">₹{scholarship.amount?.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <Users size={20} className="mx-auto text-indigo-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Slots</p>
                            <p className="text-xl font-black text-gray-800 dark:text-white">{slotsLeft > 0 ? slotsLeft : '—'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <Calendar size={20} className="mx-auto text-amber-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Deadline</p>
                            <p className="text-xs font-black text-gray-800 dark:text-white">{new Date(scholarship.deadline).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    {hasApplied ? (
                        <div className={`w-full py-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${statusConfig?.color}`}>
                            <statusConfig.icon size={18} /> {statusConfig?.label}
                        </div>
                    ) : isExpired ? (
                        <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-sm uppercase tracking-widest">
                            Applications Closed
                        </button>
                    ) : (
                        <button
                            onClick={() => onApply(scholarship)}
                            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
                        >
                            Apply Now <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// Application Form Modal
const ApplicationFormModal = ({ scholarship, onClose, onSubmit, isApplying, documentUrl, setDocumentUrl, uploading, handleFileUpload }) => {
    if (!scholarship) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <X size={18} />
                </button>

                <h3 className="text-2xl font-black uppercase tracking-tight mb-1 italic">Submit Application</h3>
                <p className="text-xs text-gray-500 font-bold mb-8 uppercase tracking-widest">
                    For: {scholarship.name}
                </p>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                const simulatedUrl = `https://drive.google.com/file/d/${Math.random().toString(36).slice(2, 12)}/view`;
                                setDocumentUrl(simulatedUrl);
                            }}
                            className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 hover:border-emerald-400 transition-all group"
                        >
                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-emerald-500" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.74 3.522l3.737 6.402-4.94 8.554-3.737-6.402 4.94-8.554zm5.748 0h6.612l3.395 5.86-6.612 11.417h-6.612l3.395-5.86 3.222-11.417z" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-black uppercase">Sync Drive</span>
                        </button>

                        <label className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 hover:border-teal-400 transition-all group cursor-pointer">
                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <FileText className="text-teal-500" size={22} />
                            </div>
                            <span className="text-[10px] font-black uppercase">{uploading ? 'Uploading...' : 'Upload Doc'}</span>
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.doc,.docx,image/*" />
                        </label>
                    </div>

                    {documentUrl && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <ShieldCheck className="text-emerald-600 flex-shrink-0" size={16} />
                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 truncate">{documentUrl}</p>
                            </div>
                            <button type="button" onClick={() => setDocumentUrl('')} className="text-rose-500 hover:text-rose-600 flex-shrink-0">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Or paste document link</label>
                        <input
                            type="url"
                            value={documentUrl}
                            onChange={(e) => setDocumentUrl(e.target.value)}
                            className="input w-full bg-slate-50 dark:bg-slate-900 font-medium"
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!documentUrl || isApplying}
                            className="btn btn-primary px-10 py-4 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            {isApplying ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export const ScholarshipsPage = () => {
    const { user } = useAuth();
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [detailScholarship, setDetailScholarship] = useState(null);
    const [applyScholarship, setApplyScholarship] = useState(null);
    const [documentUrl, setDocumentUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchScholarships();
    }, []);

    const fetchScholarships = async () => {
        try {
            setLoading(true);
            const data = await generalService.getScholarships();
            setScholarships(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('media', file);
        try {
            const response = await studentService.api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${response.data.url}`;
            setDocumentUrl(fullUrl);
            setMessage({ type: 'success', text: 'Document uploaded successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Upload failed. Try a Drive link instead.' });
        } finally {
            setUploading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const openApplyModal = (scholarship) => {
        setDetailScholarship(null);
        setDocumentUrl('');
        setApplyScholarship(scholarship);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            setIsApplying(applyScholarship._id);
            await studentService.applyForScholarship(applyScholarship._id, [documentUrl]);
            setMessage({ type: 'success', text: 'Application submitted! Pending review by admin.' });
            fetchScholarships();
            setApplyScholarship(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Application failed.' });
        } finally {
            setIsApplying(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        }
    };

    const urgentScholarships = scholarships.filter(s => {
        const d = daysUntil(s.deadline);
        return d >= 0 && d <= 7;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Academic Funding</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Explore merit and need-based financial assistance</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Verified Program</span>
                </div>
            </div>

            {/* Deadline Urgency Alert */}
            <AnimatePresence>
                {urgentScholarships.length > 0 && (
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
                            <p className="font-black text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wider">⚡ Scholarship Deadline Alert</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
                                {urgentScholarships.map(s => (
                                    <span key={s._id} className="inline-block mr-3">
                                        <strong>{s.name}</strong> — {daysUntil(s.deadline) === 0 ? 'Today!' : `${daysUntil(s.deadline)} day(s) left`}
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
                        className={`fixed top-24 right-8 z-[100] p-4 rounded-2xl flex items-center shadow-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scholarships List */}
            <div className="space-y-6">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="glass-card h-48 animate-pulse rounded-3xl" />)
                ) : scholarships.length > 0 ? (
                    scholarships.map((scholarship, idx) => {
                        const applicant = scholarship.applicants?.find(a => a.userId === user?._id || a.userId?._id === user?._id);
                        const hasApplied = !!applicant;
                        const isExpired = new Date(scholarship.deadline) < new Date();
                        const daysLeft = daysUntil(scholarship.deadline);
                        const isUrgent = !isExpired && daysLeft <= 7;
                        const statusConfig = applicant ? (SCHOLARSHIP_STATUS[applicant.status] || SCHOLARSHIP_STATUS.pending) : null;
                        const slotsUsed = scholarship.applicants?.length || 0;
                        const slotsLeft = (scholarship.totalSlots || 0) - slotsUsed;

                        return (
                            <motion.div
                                key={scholarship._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`glass-card group overflow-hidden border-slate-100 dark:border-slate-800 p-0 flex flex-col lg:flex-row ${isUrgent ? 'ring-2 ring-amber-400/50' : ''}`}
                            >
                                {/* Main Info */}
                                <div className="p-8 flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">
                                                <Award size={14} />
                                                Financial Aid
                                                {isUrgent && (
                                                    <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[9px] font-black">
                                                        ⚡ {daysLeft}d left!
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{scholarship.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{scholarship.amount?.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grant Amount</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{scholarship.description}</p>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                    <Calendar size={14} className="text-indigo-400" />
                                                    Ends {new Date(scholarship.deadline).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                    <TrendingUp size={14} className="text-indigo-400" />
                                                    {slotsLeft > 0 ? `${slotsLeft} of ${scholarship.totalSlots} slots open` : 'All slots filled'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Eligibility Panel */}
                                        <div className="bg-emerald-50/60 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                                                <BadgeCheck size={12} /> Requirements &amp; Eligibility
                                            </label>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed border-l-2 border-emerald-500/40 pl-3">
                                                {scholarship.eligibility}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Panel */}
                                <div className="lg:w-60 bg-slate-50/80 dark:bg-slate-800/50 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-center items-center text-center gap-3">
                                    {/* Status Badge */}
                                    {hasApplied && statusConfig ? (
                                        <div className="space-y-3 w-full">
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mx-auto">
                                                <GraduationCap size={28} />
                                            </div>
                                            <div className={`px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider ${statusConfig.color} flex items-center justify-center gap-2 w-full`}>
                                                <statusConfig.icon size={14} /> {statusConfig.label}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold">
                                                Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : isExpired ? (
                                        <div className="text-gray-400 py-4 font-black text-xs uppercase tracking-widest">
                                            <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                                            Applications Closed
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Action Required</p>
                                            <button
                                                onClick={() => setDetailScholarship(scholarship)}
                                                className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                                            >
                                                <Eye size={14} /> View Details
                                            </button>
                                            <button
                                                onClick={() => openApplyModal(scholarship)}
                                                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
                                            >
                                                Apply Now <ArrowRight size={14} />
                                            </button>
                                        </>
                                    )}

                                    {/* View Details always visible */}
                                    {(hasApplied || isExpired) && (
                                        <button
                                            onClick={() => setDetailScholarship(scholarship)}
                                            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-gray-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mt-1"
                                        >
                                            <Eye size={14} /> View Details
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 glass-card">
                        <DollarSign className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No active funding programs</h3>
                        <p className="text-gray-400 mt-2">Check back during the scholarship window opening next month.</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {detailScholarship && (
                    <ScholarshipDetailsModal
                        scholarship={detailScholarship}
                        currentUser={user}
                        onClose={() => setDetailScholarship(null)}
                        onApply={openApplyModal}
                    />
                )}
            </AnimatePresence>

            {/* Application Form Modal */}
            <AnimatePresence>
                {applyScholarship && (
                    <ApplicationFormModal
                        scholarship={applyScholarship}
                        onClose={() => setApplyScholarship(null)}
                        onSubmit={handleApply}
                        isApplying={isApplying}
                        documentUrl={documentUrl}
                        setDocumentUrl={setDocumentUrl}
                        uploading={uploading}
                        handleFileUpload={handleFileUpload}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
