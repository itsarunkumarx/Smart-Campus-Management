import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    MessageSquare,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    User,
    ChevronRight,
    Send,
    AlertCircle,
    FileText,
    History
} from 'lucide-react';
import { adminService } from '../../services';

export const ComplaintManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const data = await adminService.getComplaints();
            setComplaints(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setIsUpdating(true);
            const result = await adminService.updateComplaint(id, { status, adminResponse });
            setComplaints(complaints.map(c => c._id === id ? result : c));
            setSelectedComplaint(result);
            setMessage({ type: 'success', text: `Grievance status updated to: ${status.toUpperCase()}` });
        } catch (err) {
            setMessage({ type: 'error', text: 'Resolution update failed. Check authority node.' });
        } finally {
            setIsUpdating(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const filteredComplaints = complaints.filter(c =>
        (statusFilter === 'all' || c.status === statusFilter) &&
        ((c.title?.toLowerCase() || c.against?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pendingCount = complaints.filter(c => c.status === 'pending').length;

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-rose-600" size={32} />
                        Grievance Resolution
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold italic border-l-2 border-rose-200 pl-3 ml-1">
                        Centralized oversight of campus disputes and official mediation
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-rose-50 dark:bg-rose-900/10 px-4 py-2 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
                        <Clock className="text-rose-500 animate-pulse" size={20} />
                        <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">{pendingCount} PENDING DISPUTES</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Complaints List Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search grievances..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-12 py-3 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl text-sm"
                            />
                        </div>
                        <div className="flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800">
                            {['all', 'pending', 'resolved'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === status
                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-premium">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="glass-card h-32 animate-pulse rounded-3xl" />)
                        ) : filteredComplaints.length > 0 ? (
                            filteredComplaints.map((c) => (
                                <motion.div
                                    key={c._id}
                                    layoutId={c._id}
                                    onClick={() => {
                                        setSelectedComplaint(c);
                                        setAdminResponse(c.adminResponse || '');
                                    }}
                                    className={`glass-card p-5 cursor-pointer transition-all border-l-4 group ${selectedComplaint?._id === c._id ? 'border-rose-600 ring-4 ring-rose-500/5 translate-x-1' : 'border-slate-100 dark:border-slate-800 hover:border-rose-300'
                                        } ${c.status === 'resolved' ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${c.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {c.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm line-clamp-1 group-hover:text-rose-600 transition-colors">
                                        {c.title || `Issue: ${c.against}`}
                                    </h4>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-rose-600 font-black text-xs">
                                                {c.raisedBy?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.raisedBy?.role} Node</span>
                                        </div>
                                        <ChevronRight size={16} className={`text-gray-300 transition-transform ${selectedComplaint?._id === c._id ? 'rotate-90 text-rose-500' : ''}`} />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 glass-card border-dashed">
                                <History className="mx-auto text-slate-200 mb-4" size={48} />
                                <h3 className="text-gray-400 font-black uppercase tracking-widest">Archive Clear</h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Area Column */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {selectedComplaint ? (
                            <motion.div
                                key={selectedComplaint._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-10 space-y-8 border-rose-100 dark:border-rose-900/30 sticky top-24"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${selectedComplaint.status === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                {selectedComplaint.status === 'pending' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                                    {selectedComplaint.title || selectedComplaint.against}
                                                </h2>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Grievance Ticket ID: #{selectedComplaint._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Originator</p>
                                            <p className="text-sm font-black text-indigo-600 uppercase tracking-tight mt-1 truncate max-w-[150px]">{selectedComplaint.raisedBy?.name || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <FileText size={14} /> Description of Event
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                            "{selectedComplaint.description}"
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between ml-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjudication & Response</h4>
                                        {message.text && (
                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {message.text}
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <MessageSquare className="absolute left-4 top-4 text-gray-300 pointer-events-none group-focus-within:text-rose-500 transition-colors" size={20} />
                                        <textarea
                                            value={adminResponse}
                                            onChange={(e) => setAdminResponse(e.target.value)}
                                            placeholder="Document official mediation steps and final ruling..."
                                            className="input min-h-[180px] pl-12 py-4 text-sm leading-relaxed bg-white dark:bg-slate-900/50"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedComplaint._id, 'pending')}
                                            disabled={isUpdating}
                                            className="btn btn-outline border-amber-200 text-amber-600 px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Update Response
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedComplaint._id, 'resolved')}
                                            disabled={isUpdating || !adminResponse}
                                            className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-none shadow-emerald-600/20 px-8 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            Mark as Resolved
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 glass-card border-dashed space-y-4">
                                <div className="p-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-200">
                                    <ShieldAlert size={64} />
                                </div>
                                <h3 className="text-gray-400 font-black uppercase tracking-widest">Select a ticket to adjudicate</h3>
                                <p className="text-xs text-gray-300 font-bold uppercase tracking-tighter">Institutional oversight requires careful review of each grievance.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Support Alert */}
            <div className="bg-rose-50/50 dark:bg-rose-900/10 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-6">
                <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-600/20">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-rose-900 dark:text-rose-200 uppercase tracking-tight">Institutional Protocol</h4>
                    <p className="text-xs text-rose-700/70 dark:text-rose-400/70 mt-1">Grievances marked as 'Resolved' will be immediately visible to the originator along with your official response. Ensure legal and policy compliance.</p>
                </div>
            </div>
        </div>
    );
};
