import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Users,
    Tag,
    CheckCircle2,
    Clock,
    ArrowRight,
    Search,
    Bookmark,
    AlertCircle,
    PartyPopper,
    Trophy,
    Gamepad2,
    BookOpen
} from 'lucide-react';
import { eventService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

export const EventsPage = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegistering, setIsRegistering] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchEvents();
    }, [filter]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { category: filter } : {};
            const data = await eventService.getEvents(params);
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (id) => {
        try {
            setIsRegistering(id);
            await eventService.registerForEvent(id);
            setMessage({ type: 'success', text: 'Successfully registered for the event! Pack your bags.' });
            fetchEvents();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
        } finally {
            setIsRegistering(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const categories = [
        { id: 'all', label: 'All', icon: <Tag size={16} /> },
        { id: 'academic', label: 'Academic', icon: <BookOpen size={16} /> },
        { id: 'cultural', label: 'Cultural', icon: <PartyPopper size={16} /> },
        { id: 'sports', label: 'Sports', icon: <Trophy size={16} /> },
        { id: 'placement', label: 'Placement', icon: <Users size={16} /> },
    ];

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Campus Life</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Join workshops, festivals, and tech meets</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${filter === cat.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-gray-400 hover:text-indigo-500'
                                }`}
                        >
                            {cat.icon}
                            <span className="hidden sm:inline">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search events, workshops, or clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12 py-3.5 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-2xl"
                />
            </div>

            {/* Message Area */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="glass-card h-80 animate-pulse rounded-3xl" />)
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event, idx) => {
                        const isRegistered = event.registeredUsers?.some(id => id === user?._id || id?._id === user?._id);
                        const isFull = event.registeredUsers?.length >= event.capacity;
                        const date = new Date(event.date);

                        return (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card group hover:scale-[1.02] transition-all duration-300 p-0 overflow-hidden flex flex-col border-slate-100 dark:border-slate-800 relative"
                            >
                                <div className="absolute top-4 right-4 z-10">
                                    <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg ${event.category === 'academic' ? 'bg-blue-500 text-white' :
                                            event.category === 'cultural' ? 'bg-purple-500 text-white' :
                                                event.category === 'sports' ? 'bg-orange-500 text-white' :
                                                    'bg-slate-800 text-white'
                                        }`}>
                                        {event.category}
                                    </div>
                                </div>

                                <div className="h-40 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-0"></div>
                                    <div className="absolute bottom-4 left-4 z-10 text-white">
                                        <p className="text-2xl font-black uppercase tracking-tighter leading-none">{date.getDate()}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{date.toLocaleString('default', { month: 'short' })}</p>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 space-y-4">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">{event.title}</h3>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                            <MapPin size={14} className="text-indigo-500" />
                                            {event.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                            <Users size={14} className="text-indigo-500" />
                                            {event.registeredUsers?.length || 0} / {event.capacity} SECURED
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                                    {isRegistered ? (
                                        <div className="w-full py-2.5 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                            <CheckCircle2 size={16} />
                                            CONFIRMED ENTRY
                                        </div>
                                    ) : isFull ? (
                                        <div className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                            <AlertCircle size={16} />
                                            TOCKETS SOLD OUT
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleRegister(event._id)}
                                            disabled={isRegistering === event._id}
                                            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/30"
                                        >
                                            {isRegistering === event._id ? (
                                                <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                            ) : (
                                                <>
                                                    REGISTER NOW
                                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-20 glass-card">
                        <PartyPopper className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">The stage is quiet</h3>
                        <p className="text-gray-400 mt-2">No upcoming events found for this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
