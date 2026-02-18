import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { postService } from '../../services';
import {
    Heart,
    MessageCircle,
    Share2,
    MoreVertical,
    Send,
    Image as ImageIcon,
    Trash2,
    Flag,
    AlertCircle,
    PlusCircle,
    Sparkles,
    ChevronRight,
    Tag as TagIcon
} from 'lucide-react';

export const PostsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await postService.getPosts(page);
            if (page === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load posts.');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const updatedPost = await postService.toggleLike(postId);
            setPosts(posts.map(post => post._id === postId ? { ...post, likes: updatedPost.likes } : post));
        } catch (err) {
            console.error('Like failed');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 p-4 md:p-6 pb-24">
            {/* Create Post Entry Point */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/student/create-post')}
                className="group relative h-32 rounded-[2rem] bg-gradient-to-r from-indigo-900 to-indigo-600 p-[2px] cursor-pointer shadow-2xl hover:scale-[1.02] transition-all overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="h-full w-full bg-white dark:bg-slate-900 rounded-[1.9rem] flex items-center justify-between px-10 relative">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <PlusCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Create Manifest</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: Active · Broadcast Mode On</p>
                        </div>
                    </div>
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl group-hover:rotate-12 transition-transform">
                        <ChevronRight size={24} />
                    </div>
                </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center space-x-3 text-red-600 dark:text-red-400"
                    >
                        <AlertCircle size={20} />
                        <p>{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-sm font-medium">Dismiss</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Posts List */}
            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            currentUser={user}
                            onLike={() => handleLike(post._id)}
                            onDelete={() => handleDelete(post._id)}
                            onReport={() => handleReport(post._id)}
                        />
                    ))
                ) : !loading && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-xl font-medium">No posts yet</p>
                        <p>Be the first to share something!</p>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="glass-card h-64 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {page < totalPages && !loading && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const PostCard = ({ post, currentUser, onLike, onDelete, onReport }) => {
    const navigate = useNavigate();
    const isLiked = post.likes.includes(currentUser?._id);
    const isOwner = post.userId?._id === currentUser?._id;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border-slate-100 dark:border-white/5 transition-all hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900/30"
        >
            <div className="p-8 space-y-6">
                {/* Post Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => navigate(`/profile/${post.userId?._id}`)}
                            className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center p-1 cursor-pointer border border-transparent hover:border-indigo-400 transition-all"
                        >
                            {post.userId?.profileImage ? (
                                <img src={post.userId.profileImage} alt={post.userId.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="text-xl font-black text-indigo-600 uppercase">{post.userId?.name?.charAt(0)}</div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-black text-lg uppercase tracking-tighter italic flex items-center gap-2">
                                <span className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigate(`/profile/${post.userId?._id}`)}>
                                    {post.userId?.name}
                                </span>
                                <span className="text-[8px] font-black text-gray-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase italic">
                                    {post.userId?.role}
                                </span>
                            </h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 italic">
                                {new Date(post.createdAt).toLocaleDateString()} · {post.visibility} scope
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isOwner ? (
                            <button onClick={onDelete} className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                        ) : (
                            <button onClick={onReport} className="p-3 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"><Flag size={18} /></button>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                <div className="space-y-4 cursor-pointer" onClick={() => navigate(`/post/${post._id}`)}>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </p>

                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map(t => (
                                <span key={t} className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 px-2 py-1 rounded-md">#{t}</span>
                            ))}
                        </div>
                    )}

                    {post.media?.length > 0 && (
                        <div className="rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group relative">
                            {post.media[0].type === 'image' ? (
                                <img src={post.media[0].url} className="w-full max-h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" alt="Post" />
                            ) : (
                                <video src={post.media[0].url} className="w-full max-h-[500px] object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">View Intelligence</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onLike} className={`flex items-center gap-2 group transition-all ${isLiked ? 'text-rose-500 scale-110' : 'text-gray-400 hover:text-rose-500'}`}>
                        <Heart size={22} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-heartbeat" : "group-hover:scale-110 transition-transform"} />
                        <span className="text-sm font-black italic">{post.likes.length}</span>
                    </button>

                    <button onClick={() => navigate(`/post/${post._id}`)} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors group">
                        <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-black italic">{post.comments.length}</span>
                    </button>

                    <button className="flex items-center gap-2 text-gray-400 hover:text-sky-500 transition-colors ml-auto">
                        <Share2 size={22} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
