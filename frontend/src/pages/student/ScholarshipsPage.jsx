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
    ShieldCheck
} from 'lucide-react';
import { generalService, studentService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

export const ScholarshipsPage = () => {
    const { user } = useAuth();
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

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

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('media', file);

        try {
            // Re-using the same upload endpoint
            const response = await studentService.api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${response.data.url}`;
            setDocumentUrl(fullUrl);
            setMessage({ type: 'success', text: 'Document archived and synced successfully!' });
        } catch (error) {
            console.error('Upload failed:', error);
            setMessage({ type: 'error', text: 'Security protocol: Asset archiving failed.' });
        } finally {
            setUploading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            setIsApplying(selectedScholarship._id);
            // studentService.api.post is used inside applyForScholarship
            await studentService.applyForScholarship(selectedScholarship._id, [documentUrl]);
            setMessage({ type: 'success', text: 'Scholarship application submitted for review!' });
            fetchScholarships();
            setSelectedScholarship(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Application failed.' });
        } finally {
            setIsApplying(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

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

            {/* Notification Banner */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-24 right-8 z-[100] p-4 rounded-2xl flex items-center shadow-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scholarships Feed */}
            <div className="space-y-6">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="glass-card h-48 animate-pulse rounded-3xl" />)
                ) : scholarships.length > 0 ? (
                    scholarships.map((scholarship, idx) => {
                        const hasApplied = scholarship.applicants?.some(a => a.userId === user?._id || a.userId?._id === user?._id);
                        const isExpired = new Date(scholarship.deadline) < new Date();

                        return (
                            <motion.div
                                key={scholarship._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card group overflow-hidden border-slate-100 dark:border-slate-800 p-0 flex flex-col lg:flex-row"
                            >
                                <div className="p-8 flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">
                                                <Award size={14} />
                                                Financial Aid
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{scholarship.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{scholarship.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GRANT AMOUNT</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Details</label>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{scholarship.description}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                    <Calendar size={14} className="text-indigo-400" />
                                                    Ends {new Date(scholarship.deadline).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                    <TrendingUp size={14} className="text-indigo-400" />
                                                    {scholarship.totalSlots} Slots Available
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Eligibility Criteria</label>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                                                {scholarship.eligibility}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-64 bg-slate-50/80 dark:bg-slate-800/50 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 p-8 flex flex-col justify-center items-center text-center gap-4">
                                    {hasApplied ? (
                                        <div className="space-y-3">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mx-auto">
                                                <GraduationCap size={32} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Application Under Review</p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-bold">Documents verified</p>
                                            </div>
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
                                                onClick={() => openApplicationModal(scholarship)}
                                                disabled={isApplying === scholarship._id}
                                                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all font-black text-xs uppercase tracking-widest"
                                            >
                                                {isApplying === scholarship._id ? (
                                                    <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                                ) : (
                                                    <>
                                                        Submit Entry
                                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[10px] text-gray-400 font-bold">* Requires Official Certification</p>
                                        </>
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


            {/* Application Modal */}
            <AnimatePresence>
                {selectedScholarship && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500 animate-gradient-x"></div>

                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic">Institutional Entry</h3>
                            <p className="text-xs text-gray-500 font-bold mb-8 uppercase tracking-widest">
                                ARCHIVE SUPPORTING DOCUMENTATION FOR {selectedScholarship.name}
                            </p>

                            <form onSubmit={handleApply} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const simulatedUrl = `https://drive.google.com/file/d/${Math.random().toString(36).slice(2, 12)}/view?usp=sharing`;
                                                setDocumentUrl(simulatedUrl);
                                                setMessage({ type: 'success', text: 'Cloud Link Synced!' });
                                                setTimeout(() => setMessage({ type: '', text: '' }), 2000);
                                            }}
                                            className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 hover:border-indigo-400 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-indigo-500" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7.74 3.522l3.737 6.402-4.94 8.554-3.737-6.402 4.94-8.554zm5.748 0h6.612l3.395 5.86-6.612 11.417h-6.612l3.395-5.86 3.222-11.417z" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] font-black uppercase">Sync Drive</span>
                                        </button>

                                        <label className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 hover:border-sky-400 transition-all group cursor-pointer">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <FileText className="text-sky-500" size={24} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase">{uploading ? 'Archiving...' : 'Local Asset'}</span>
                                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.doc,.docx,image/*" />
                                        </label>
                                    </div>

                                    {documentUrl && (
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                        <ShieldCheck className="text-indigo-600" size={16} />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 truncate tracking-tighter">
                                                        {documentUrl}
                                                    </p>
                                                </div>
                                                <button type="button" onClick={() => setDocumentUrl('')} className="text-rose-500 hover:text-rose-600">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Manual Manifest Link</label>
                                        <input
                                            type="url"
                                            value={documentUrl}
                                            onChange={(e) => setDocumentUrl(e.target.value)}
                                            className="input w-full bg-slate-50 dark:bg-slate-900 transition-all font-medium"
                                            placeholder="https://institutional-archive.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedScholarship(null)}
                                        className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!documentUrl || isApplying}
                                        className="btn btn-primary px-12 py-4 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {isApplying ? 'Processing Entry...' : 'Submit Final Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};
