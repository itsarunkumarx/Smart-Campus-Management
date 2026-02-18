import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Heart,
    MessageCircle,
    Share2,
    Send,
    Trash2,
    Flag,
    Shield,
    Calendar,
    ArrowLeft,
    MoreHorizontal,
    User as UserIcon,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { postService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

export const DetailedPostPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const data = await postService.getPostById(id);
            setPost(data);
        } catch (error) {
            console.error('Failed to load post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            const updated = await postService.toggleLike(id);
            setPost({ ...post, likes: updated.likes });
        } catch (err) {
            console.error('Like action failed');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            const updated = await postService.addComment(id, comment);
            setPost({ ...post, comments: updated.comments });
            setComment('');
        } catch (err) {
            console.error('Comment submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono">Loading Neural Links...</p>
        </div>
    );

    if (!post) return (
        <div className="text-center py-40">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Source Not Found</h2>
            <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold uppercase text-[10px] tracking-widest">Return to Grid</button>
        </div>
    );

    const isLiked = post.likes.includes(user?._id);

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">Back to Feed</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Visual Assets & Content */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="glass-card p-1 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        {post.media?.length > 0 ? (
                            <div className="relative group">
                                {post.media[0].type === 'image' ? (
                                    <img src={post.media[0].url} className="w-full aspect-square md:aspect-video object-cover rounded-[2rem]" alt="Manifest" />
                                ) : (
                                    <video src={post.media[0].url} controls className="w-full aspect-square md:aspect-video object-cover rounded-[2rem]" />
                                )}
                            </div>
                        ) : (
                            <div className="h-40 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 flex items-center justify-center">
                                <Sparkles className="text-indigo-500/20" size={60} />
                            </div>
                        )}
                    </div>

                    <div className="px-4 space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {post.tags?.map(t => (
                                <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-700">
                                    #{t}
                                </span>
                            ))}
                        </div>
                        <p className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                            {post.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-10 px-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={handleLike} className={`flex items-center gap-2 group ${isLiked ? 'text-rose-500' : 'text-gray-400'}`}>
                            <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-heartbeat" : "group-hover:scale-110 transition-transform"} />
                            <span className="font-black italic">{post.likes?.length || 0}</span>
                        </button>
                        <div className="flex items-center gap-2 text-gray-400">
                            <MessageCircle size={24} />
                            <span className="font-black italic">{post.comments?.length || 0}</span>
                        </div>
                        <button className="flex items-center gap-2 text-gray-400 ml-auto hover:text-indigo-500 transition-colors">
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>

                {/* Author & Discourse (Comments) */}
                <div className="lg:col-span-5 space-y-10">
                    {/* Author Manifest */}
                    <div className="glass-card p-6 border-slate-100 dark:border-slate-800 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 p-1">
                            {post.userId?.profileImage ? (
                                <img src={post.userId.profileImage} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-black text-indigo-600 uppercase">
                                    {post.userId?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-lg uppercase tracking-tighter italic leading-none">{post.userId?.name}</h4>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1 tracking-widest">{post.userId?.role} · {post.userId?.department}</p>
                        </div>
                        <button
                            onClick={() => navigate(`/profile/${post.userId?._id}`)}
                            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                        >
                            <UserIcon size={20} />
                        </button>
                    </div>

                    {/* Discourse Feed */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                            Institutional Discourse
                        </h3>

                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {post.comments?.map((c, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={c._id}
                                    className="flex gap-4"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-[10px] font-black uppercase">
                                        {c.userId?.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black uppercase text-indigo-600">{c.userId?.name}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase italic">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{c.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {post.comments?.length === 0 && (
                                <p className="text-center py-10 text-[10px] font-bold text-gray-400 uppercase italic">No logs detected. Initiate discourse.</p>
                            )}
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handleAddComment} className="relative pt-4">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Neural input..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-sm font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none focus:border-indigo-500 transition-all shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !comment.trim()}
                                className="absolute right-3 top-[calc(1rem+6px)] p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
