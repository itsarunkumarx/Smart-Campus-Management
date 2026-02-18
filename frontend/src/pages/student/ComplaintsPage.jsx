import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    MessageSquare,
    User,
    ShieldAlert,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
    Send
} from 'lucide-react';
import { complaintService } from '../../services';

export const ComplaintsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        against: '',
        roleType: 'faculty',
        description: '',
        evidence: []
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedId, setExpandedId] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('media', file);

        try {
            const response = await complaintService.api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${response.data.url}`;
            setFormData(prev => ({
                ...prev,
                evidence: [...prev.evidence, fullUrl]
            }));
            setMessage({ type: 'success', text: 'Evidence archived successfully.' });
        } catch (error) {
            console.error('Upload failed:', error);
            setMessage({ type: 'error', text: 'Security protocol: Asset archiving failed.' });
        } finally {
            setUploading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const removeEvidence = (index) => {
        setFormData(prev => ({
            ...prev,
            evidence: prev.evidence.filter((_, i) => i !== index)
        }));
    };

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const data = await complaintService.getComplaints();
            setComplaints(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description.trim()) return;

        try {
            setIsSubmitting(true);
            const newComplaint = await complaintService.createComplaint(formData);
            setComplaints([newComplaint, ...complaints]);
            setFormData({ title: '', against: '', roleType: 'faculty', description: '', evidence: [] });
            setShowForm(false);
            setMessage({ type: 'success', text: 'Complaint submitted anonymously and recorded.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to submit complaint.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Support & Grievance</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Raise concerns securely and track resolution progress</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary shadow-indigo-500/20"
                >
                    {showForm ? 'Cancel Report' : 'New Complaint'}
                </button>
            </div>

            {/* Submission Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-6 border-indigo-100 dark:border-indigo-900/30">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Subject / Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="input py-2 text-sm"
                                        placeholder="Brief summary of the issue"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Against Whom / What</label>
                                        <input
                                            type="text"
                                            value={formData.against}
                                            onChange={(e) => setFormData({ ...formData, against: e.target.value })}
                                            className="input py-2 text-sm"
                                            placeholder="Name of person or department"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Entity Type</label>
                                        <select
                                            value={formData.roleType}
                                            onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                                            className="input py-2 text-sm"
                                        >
                                            <option value="faculty">Faculty</option>
                                            <option value="staff">Non-Teaching Staff</option>
                                            <option value="student">Student</option>
                                            <option value="other">Institutional/Facility</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Description of Issue</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input min-h-[120px] py-3 text-sm"
                                        placeholder="Provide clear details regarding your concern..."
                                        required
                                    />
                                </div>

                                {/* Evidence Upload Section */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Evidence / Attachments</label>
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {formData.evidence.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-500">
                                                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                        <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileText size={24} />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEvidence(index)}
                                                    className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group">
                                            {uploading ? (
                                                <div className="animate-spin w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full" />
                                            ) : (
                                                <>
                                                    <ImageIcon size={20} className="text-slate-400 group-hover:text-indigo-500" />
                                                    <span className="text-[8px] font-black uppercase text-slate-400">Add</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic">Attach images or PDF documents for verification (Max 5MB per asset)</p>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || uploading}
                                        className="btn btn-primary px-8 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Send size={16} />}
                                        Submit Grievance
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Banner */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-xl flex items-center shadow-lg border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <ShieldAlert size={20} className="mr-3" />
                        <p className="font-medium text-sm">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Complaints List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center">
                    <Clock className="mr-2" size={18} />
                    Resolution History
                </h2>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="glass-card h-24 animate-pulse" />)}
                    </div>
                ) : complaints.length > 0 ? (
                    complaints.map((complaint) => (
                        <div
                            key={complaint._id}
                            className="glass-card p-0 overflow-hidden border-slate-100 dark:border-slate-800"
                        >
                            <div
                                onClick={() => setExpandedId(expandedId === complaint._id ? null : complaint._id)}
                                className="p-5 cursor-pointer flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${complaint.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                        complaint.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                            'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                                        }`}>
                                        {complaint.status === 'pending' ? <Clock size={20} /> :
                                            complaint.status === 'resolved' ? <CheckCircle2 size={20} /> :
                                                <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Against: {complaint.against}</h4>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">
                                            {complaint.roleType} · {new Date(complaint.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${complaint.status === 'pending' ? 'border-amber-200 text-amber-600' :
                                        complaint.status === 'resolved' ? 'border-emerald-200 text-emerald-600' :
                                            'border-rose-200 text-rose-600'
                                        }`}>
                                        {complaint.status}
                                    </span>
                                    {expandedId === complaint._id ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedId === complaint._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-5 pb-5 border-t border-slate-50 dark:border-slate-800/50"
                                    >
                                        <div className="pt-4 space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Original Grievance</label>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                                                    "{complaint.description}"
                                                </p>
                                            </div>
                                            {complaint.adminResponse && (
                                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2 flex items-center">
                                                        <ShieldAlert size={12} className="mr-1" /> Admin Official Response
                                                    </label>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                                        {complaint.adminResponse}
                                                    </p>
                                                    {complaint.handledBy && (
                                                        <p className="text-[10px] text-indigo-400 mt-2 font-bold">— Handled by {complaint.handledBy.name}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 glass-card border-dashed">
                        <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
                        <h3 className="text-gray-500 font-bold">No grievances recorded</h3>
                        <p className="text-sm text-gray-400">Everything seems to be working smoothly!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
