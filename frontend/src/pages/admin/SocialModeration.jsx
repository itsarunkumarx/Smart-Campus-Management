import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Trash2,
    Filter,
    AlertTriangle,
    CheckCircle2,
    MessageCircle,
    Heart,
    Search,
    Eye,
    EyeOff,
    MoreVertical,
    Clock,
    UserCircle2
} from 'lucide-react';
import { postService, adminService } from '../../services';

export const SocialModeration = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [feedback, setFeedback] = useState({ type: '', text: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await postService.getPosts();
            setPosts(data.posts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePost = async (id) => {
        if (!window.confirm('INSTITUTIONAL ACTION: Are you sure you want to remove this post from the global feed for policy violations?')) return;

        try {
            setIsProcessing(true);
            await adminService.removePost(id);
            setPosts(posts.map(p => p._id === id ? { ...p, isRemoved: true } : p));
            setFeedback({ type: 'success', text: 'Post suppressed from global ecosystem.' });
        } catch (err) {
            setFeedback({ type: 'error', text: 'Moderation action failed. Audit logs required.' });
        } finally {
            setIsProcessing(false);
            setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
        }
    };

    const filteredPosts = posts.filter(p =>
        p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Shield className="text-slate-800 dark:text-slate-200" size={32} />
                        Social Moderation
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold italic border-l-2 border-slate-300 pl-3 ml-1">
                        Ensuring institutional standards across the campus digital square
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">{posts.filter(p => p.isRemoved).length} POSTS SUPPRESSED</span>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {feedback.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm uppercase tracking-tight">{feedback.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-700 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search content or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12 py-3 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl text-sm"
                />
            </div>

            {/* Display Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse rounded-3xl" />)
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post, idx) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`glass-card p-0 overflow-hidden border-slate-100 dark:border-slate-800 hover:border-slate-400 group transition-all relative ${post.isRemoved ? 'opacity-60 grayscale' : ''}`}
                        >
                            {/* Card Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 font-black">
                                            {post.userId?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{post.userId?.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <UserCircle2 size={10} />
                                                {post.userId?.role}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-black">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[100px]">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {post.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-rose-500 font-black text-[10px]">
                                            <Heart size={14} fill="currentColor" />
                                            {post.likes?.length || 0}
                                        </div>
                                        <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px]">
                                            <MessageCircle size={14} />
                                            {post.comments?.length || 0}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemovePost(post._id)}
                                        disabled={isProcessing || post.isRemoved}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${post.isRemoved
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-600/20'
                                            }`}
                                    >
                                        {post.isRemoved ? <EyeOff size={14} /> : <Trash2 size={14} />}
                                        {post.isRemoved ? 'Suppressed' : 'Suppress Post'}
                                    </button>
                                </div>
                            </div>

                            {post.isRemoved && (
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                                    <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl rotate-12 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-amber-500" />
                                        VIOLATION REMOVED
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-24 glass-card border-dashed">
                        <Shield className="mx-auto text-slate-200 mb-4" size={64} />
                        <h3 className="text-gray-400 font-black uppercase tracking-widest">Digital Square Clear</h3>
                    </div>
                )}
            </div>

            {/* Policy Reminder */}
            <div className="glass-card p-6 border-l-4 border-slate-900 dark:border-slate-200 flex items-center gap-5">
                <Shield className="text-slate-900 dark:text-slate-200 shrink-0" size={24} />
                <p className="text-xs font-bold text-gray-500 italic">
                    "Content removal is an institutional countermeasure. All suppressed posts are logged for secondary administrative review according to the Charter of Digital Conduct."
                </p>
            </div>
        </div>
    );
};
