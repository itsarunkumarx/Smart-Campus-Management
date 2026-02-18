import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    UserPlus,
    UserMinus,
    MessageCircle,
    Users,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export const SearchPage = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const data = await userService.searchUsers(val);
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId) => {
        try {
            await userService.followUser(userId);
            setResults(results.map(r =>
                r._id === userId ? { ...r, isFollowing: true } : r
            ));
        } catch (err) {
            console.error('Follow failed', err);
        }
    };

    const handleMessage = async (userId) => {
        try {
            const chat = await chatService.accessChat(userId);
            navigate('/chat', { state: { selectedChat: chat } });
        } catch (err) {
            console.error('Chat access failed', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Discover Campus</h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">
                    Find students, faculty, and institutional administrators
                </p>
            </div>

            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
                </div>
                <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl py-6 pl-16 pr-6 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    placeholder="Search by name, username, or department..."
                    value={query}
                    onChange={handleSearch}
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : results.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid gap-4"
                    >
                        {results.map((result) => (
                            <motion.div
                                key={result._id}
                                whileHover={{ scale: 1.01 }}
                                className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-500 transition-all border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none"
                            >
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div
                                        onClick={() => navigate(`/profile/${result._id}`)}
                                        className="w-16 h-16 rounded-2xl bg-indigo-600 overflow-hidden shadow-lg shadow-indigo-600/20 group-hover:rotate-6 transition-transform cursor-pointer shrink-0"
                                    >
                                        {result.profileImage ? (
                                            <img src={result.profileImage} alt={result.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black uppercase">
                                                {result.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => navigate(`/profile/${result._id}`)}
                                        className="cursor-pointer min-w-0"
                                    >
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight truncate hover:text-indigo-600 transition-colors">
                                            {result.name}
                                        </h3>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">@{result.username}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-black text-gray-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                {result.role}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                                {result.department}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleFollow(result._id)}
                                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${result.isFollowing
                                            ? 'bg-slate-100 dark:bg-slate-800 text-gray-500'
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95'
                                            }`}
                                    >
                                        {result.isFollowing ? <><UserMinus size={14} /> Unfollow</> : <><UserPlus size={14} /> Follow</>}
                                    </button>
                                    <button
                                        onClick={() => handleMessage(result._id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <MessageCircle size={14} />
                                        Message
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : query.length >= 2 ? (
                    <div className="glass-card py-20 text-center border-dashed border-2">
                        <SearchX className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-gray-400 font-black uppercase tracking-widest text-lg">No Results Found</h3>
                        <p className="text-xs text-gray-300 mt-2 uppercase tracking-tighter">Try refining your search keywords.</p>
                    </div>
                ) : (
                    <div className="glass-card py-20 text-center border-dashed border-2 opacity-50">
                        <Users className="mx-auto text-gray-100 mb-4" size={64} />
                        <h3 className="text-gray-300 font-black uppercase tracking-widest text-lg">Start Scouting</h3>
                        <p className="text-xs text-gray-200 mt-2 uppercase tracking-tighter">Enter at least 2 characters to search the campus.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
