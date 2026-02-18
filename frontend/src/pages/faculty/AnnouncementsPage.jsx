import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Send,
    Users,
    Shield,
    CheckCircle2,
    Clock,
    Filter,
    Megaphone,
    PlusCircle,
    X
} from 'lucide-react';
import { facultyService } from '../../services';

export const AnnouncementsPage = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('student');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', text: '' });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch sent announcements (could reuse notification list filtered by creator)
        // For now we simulate the history or let the user see the effect in student side
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        try {
            setIsSubmitting(true);
            await facultyService.createAnnouncement({
                title,
                message,
                targetRole
            });
            setFeedback({ type: 'success', text: 'Institutional announcement broadcasted successfully!' });
            setTitle('');
            setMessage('');
            // Add to local history for immediate UI feedback
            setHistory(prev => [{ id: Date.now(), title, message, targetRole, createdAt: new Date() }, ...prev]);
        } catch (err) {
            setFeedback({ type: 'error', text: 'Broadcast failed. Check system logs.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 p-4 md:p-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Megaphone className="text-indigo-600" size={32} />
                        Broadcast Hub
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">Push departmental alerts and institutional memos</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                    <Shield className="text-indigo-500" size={20} />
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.2em]">Verified Broadcaster</span>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {feedback.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm">{feedback.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Compose Area */}
            <div className="glass-card p-8 border-indigo-100 dark:border-indigo-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Send size={120} className="text-indigo-600" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Announcement Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Semester Project Deadline"
                                className="input py-3 text-sm font-bold bg-white/50 dark:bg-slate-900/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Target Audience</label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="input py-3 text-sm font-bold bg-white/50 dark:bg-slate-900/50"
                            >
                                <option value="student">Only Students</option>
                                <option value="faculty">Fellow Faculty</option>
                                <option value="all">Campus Wide (Public)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Memo Content</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Provide detailed instructions or information..."
                            className="input min-h-[160px] py-4 text-sm leading-relaxed bg-white/50 dark:bg-slate-900/50"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary px-10 py-3 flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                            ) : (
                                <>
                                    <Send size={20} />
                                    Broadcast Now
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* History Feed */}
            <div className="space-y-6">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Recent Broadcasts</h2>

                <div className="space-y-4">
                    {history.length > 0 ? (
                        history.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-5 group flex items-start gap-5 border-slate-100 dark:border-slate-800"
                            >
                                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shrink-0">
                                    <Bell size={24} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {item.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic line-clamp-2">
                                        "{item.message}"
                                    </p>
                                    <div className="pt-2">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">
                                            LIVE · {item.targetRole.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 glass-card border-dashed">
                            <Clock className="mx-auto text-gray-200 mb-4" size={48} />
                            <h3 className="text-gray-400 font-black uppercase tracking-widest text-sm">No broadcast history</h3>
                            <p className="text-xs text-gray-300 mt-1 uppercase tracking-tighter">Your recent alerts will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
