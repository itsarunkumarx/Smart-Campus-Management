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
    AlertCircle,
    PartyPopper,
    Trophy,
    BookOpen,
    X,
    Bell,
    Eye,
    Zap,
    UserCheck,
    Ban
} from 'lucide-react';
import { eventService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';


// Days until event date
const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Category colour map
const CAT_COLORS = {
    academic: { bg: 'bg-blue-500', ring: 'ring-blue-400/40', light: 'bg-blue-50 text-blue-700' },
    cultural: { bg: 'bg-purple-500', ring: 'ring-purple-400/40', light: 'bg-purple-50 text-purple-700' },
    sports: { bg: 'bg-orange-500', ring: 'ring-orange-400/40', light: 'bg-orange-50 text-orange-700' },
    placement: { bg: 'bg-indigo-500', ring: 'ring-indigo-400/40', light: 'bg-indigo-50 text-indigo-700' },
    other: { bg: 'bg-slate-600', ring: 'ring-slate-400/40', light: 'bg-slate-100 text-slate-600' },
};

// Event status config
const STATUS_CONFIG = {
    upcoming: { label: 'Upcoming', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    ongoing: { label: 'Ongoing 🔴', color: 'bg-rose-50 text-rose-600 border-rose-200' },
    completed: { label: 'Completed', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-400 border-gray-200' },
};

// Details Modal
const EventDetailsModal = ({ event, currentUser, onClose, onRegister, isRegistering }) => {
    if (!event) return null;

    const isRegistered = currentUser ? event.registeredUsers?.some(id => id === currentUser?._id || id?._id === currentUser?._id) : false;

    const isFull = event.registeredUsers?.length >= event.capacity;
    const isPast = event.status === 'completed' || event.status === 'cancelled';
    const daysLeft = daysUntil(event.date);
    const cat = CAT_COLORS[event.category] || CAT_COLORS.other;
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
    const slotsLeft = event.capacity - (event.registeredUsers?.length || 0);
    const eventDate = new Date(event.date);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`relative ${cat.bg} p-8 text-white`}>
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                        <X size={18} />
                    </button>

                    <div className="flex items-start gap-4">
                        {/* Date block */}
                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                            <p className="text-4xl font-black leading-none">{eventDate.getDate()}</p>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                                {eventDate.toLocaleString('default', { month: 'short' })}
                            </p>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">
                                    {event.category}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${statusCfg.color}`}>
                                    {statusCfg.label}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{event.title}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm bg-white/10 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                                    <MapPin size={13} /> {event.location}
                                </span>
                                {!isPast && (
                                    <span className={`text-sm px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 ${daysLeft <= 3 ? 'bg-amber-500/40' : 'bg-white/10'}`}>
                                        <Clock size={13} />
                                        {daysLeft <= 0 ? 'Today!' : `${daysLeft}d away`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 max-h-[55vh] overflow-y-auto">
                    {/* Description */}
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About This Event</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{event.description}</p>
                    </div>

                    {/* Registration Status */}
                    {isRegistered && (
                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-700">
                            <UserCheck size={20} />
                            <div>
                                <p className="font-black text-sm uppercase tracking-wider">You're Registered ✓</p>
                                <p className="text-xs opacity-70 font-medium mt-0.5">Your spot is confirmed. See you there!</p>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <Users size={20} className="mx-auto text-indigo-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Registered</p>
                            <p className="text-xl font-black text-gray-800 dark:text-white">{event.registeredUsers?.length || 0}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <Zap size={20} className="mx-auto text-amber-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Slots Left</p>
                            <p className={`text-xl font-black ${slotsLeft <= 10 ? 'text-rose-600' : 'text-gray-800 dark:text-white'}`}>
                                {Math.max(0, slotsLeft)}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                            <Calendar size={20} className="mx-auto text-emerald-500 mb-1" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Date</p>
                            <p className="text-xs font-black text-gray-800 dark:text-white">
                                {eventDate.toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {!currentUser ? (
                    <Link
                        to="/login/student"
                        className={`w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${cat.bg}`}
                    >
                        Sign In to Register <ArrowRight size={18} />
                    </Link>
                ) : (
                    <>
                        {isRegistered ? (
                            <button disabled className="w-full py-4 rounded-2xl border-2 border-emerald-200 text-emerald-600 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                <UserCheck size={18} /> Registered
                            </button>
                        ) : isPast || event.status === 'cancelled' ? (
                            <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-sm uppercase tracking-widest">
                                {event.status === 'cancelled' ? 'Event Cancelled' : 'Event Ended'}
                            </button>
                        ) : isFull ? (
                            <button disabled className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                <Ban size={18} /> Sold Out
                            </button>
                        ) : (
                            <button
                                onClick={() => onRegister(event._id)}
                                disabled={isRegistering === event._id}
                                className={`w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${cat.bg}`}
                            >
                                {isRegistering === event._id ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                ) : (
                                    <> Register Now <ArrowRight size={18} /></>
                                )}
                            </button>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export const EventsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegistering, setIsRegistering] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => { fetchEvents(); }, [filter]);

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
        if (!user) {
            navigate('/login/student');
            return;
        }

        try {
            setIsRegistering(id);
            await eventService.registerForEvent(id);
            setMessage({ type: 'success', text: 'Registered! Your spot is confirmed. 🎉' });
            setSelectedEvent(null);
            fetchEvents();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
        } finally {
            setIsRegistering(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        }
    };

    const categories = [
        { id: 'all', label: 'All', icon: <Tag size={15} /> },
        { id: 'academic', label: 'Academic', icon: <BookOpen size={15} /> },
        { id: 'cultural', label: 'Cultural', icon: <PartyPopper size={15} /> },
        { id: 'sports', label: 'Sports', icon: <Trophy size={15} /> },
        { id: 'placement', label: 'Placement', icon: <Users size={15} /> },
    ];

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Events happening within 3 days
    const urgentEvents = events.filter(e => {
        const d = daysUntil(e.date);
        return d >= 0 && d <= 3 && e.status === 'upcoming';
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Campus Life</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Join workshops, festivals, and tech meets</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
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

            {/* Upcoming Urgency Alert */}
            <AnimatePresence>
                {urgentEvents.length > 0 && (
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
                            <p className="font-black text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wider">⚡ Happening Soon!</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
                                {urgentEvents.map(e => (
                                    <span key={e._id} className="inline-block mr-3">
                                        <strong>{e.title}</strong> — {daysUntil(e.date) === 0 ? 'Today!' : `${daysUntil(e.date)} day(s) away`}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Banner */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${message.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
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
                        const isPast = event.status === 'completed' || event.status === 'cancelled';
                        const daysLeft = daysUntil(event.date);
                        const isUrgent = !isPast && daysLeft >= 0 && daysLeft <= 3;
                        const cat = CAT_COLORS[event.category] || CAT_COLORS.other;
                        const slotsLeft = event.capacity - (event.registeredUsers?.length || 0);
                        const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
                        const date = new Date(event.date);

                        return (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={`glass-card group hover:scale-[1.02] transition-all duration-300 p-0 overflow-hidden flex flex-col border-slate-100 dark:border-slate-800 relative ${isUrgent ? `ring-2 ${cat.ring}` : ''}`}
                            >
                                {/* Category badge */}
                                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 items-end">
                                    <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg text-white ${cat.bg}`}>
                                        {event.category}
                                    </div>
                                    {isUrgent && (
                                        <div className="px-2 py-1 rounded-xl font-black text-[9px] uppercase tracking-widest bg-amber-500 text-white shadow">
                                            {daysLeft === 0 ? 'Today!' : `${daysLeft}d!`}
                                        </div>
                                    )}
                                </div>

                                {/* Date Banner */}
                                <div className="h-40 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                    <div className={`absolute inset-0 ${cat.bg} opacity-20`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 text-white z-10">
                                        <p className="text-4xl font-black uppercase tracking-tighter leading-none">{date.getDate()}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{date.toLocaleString('default', { month: 'short' })} · {date.getFullYear()}</p>
                                    </div>
                                    {/* Event status */}
                                    <div className={`absolute top-4 left-4 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusCfg.color}`}>
                                        {statusCfg.label}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6 flex-1 space-y-3">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                            <MapPin size={13} className="text-indigo-500" /> {event.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
                                            <Users size={13} className={slotsLeft <= 10 && !isPast ? 'text-rose-500' : 'text-indigo-500'} />
                                            <span className={slotsLeft <= 10 && !isPast ? 'text-rose-500' : 'text-gray-400'}>
                                                {event.registeredUsers?.length || 0}/{event.capacity} seats
                                                {slotsLeft <= 10 && !isPast && slotsLeft > 0 ? ` · ${slotsLeft} left!` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    {/* Registration status badge */}
                                    {isRegistered && (
                                        <div className="flex items-center justify-center gap-2 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                            <UserCheck size={13} /> Registered
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {/* View Details */}
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="flex-1 py-2.5 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all font-inter"
                                        >
                                            <Eye size={13} /> Details
                                        </button>

                                        {/* Register / Status */}
                                        {!user ? (
                                            <Link
                                                to="/login/student"
                                                className={`flex-1 py-2.5 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${cat.bg}`}
                                            >
                                                Register <ArrowRight size={13} />
                                            </Link>
                                        ) : (
                                            <>
                                                {isRegistered ? null : isPast || event.status === 'cancelled' ? (
                                                    <button disabled className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                                                        {event.status === 'cancelled' ? 'Cancelled' : 'Ended'}
                                                    </button>
                                                ) : isFull ? (
                                                    <button disabled className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                                                        Sold Out
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegister(event._id)}
                                                        disabled={isRegistering === event._id}
                                                        className={`flex-1 py-2.5 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${cat.bg}`}
                                                    >
                                                        {isRegistering === event._id ? (
                                                            <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                                                        ) : (
                                                            <> Register <ArrowRight size={13} /></>
                                                        )}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
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

            {/* Details Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <EventDetailsModal
                        event={selectedEvent}
                        currentUser={user}
                        onClose={() => setSelectedEvent(null)}
                        onRegister={handleRegister}
                        isRegistering={isRegistering}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
