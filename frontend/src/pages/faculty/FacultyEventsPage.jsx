import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Plus,
    Users,
    MapPin,
    Clock,
    Tag,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Trophy,
    BookOpen,
    PartyPopper,
    Search,
    Send
} from 'lucide-react';
import { eventService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

export const FacultyEventsPage = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: 100,
        category: 'academic'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await eventService.getEvents();
            // Filter events created by this faculty or general events
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const newEvent = await eventService.createEvent(formData);
            setEvents([newEvent, ...events]);
            setShowForm(false);
            setFormData({ title: '', description: '', date: '', location: '', capacity: 100, category: 'academic' });
            setMessage({ type: 'success', text: 'Institutional event scheduled successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to schedule event.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Calendar className="text-indigo-600" size={32} />
                        Academic Events
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">Organize workshops, seminars, and campus festivities</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary shadow-indigo-500/20 px-8 flex items-center gap-2"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'Cancel Creation' : 'Schedule Event'}
                </button>
            </div>

            {/* Event Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-8 border-indigo-100 dark:border-indigo-900/30">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Event Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="input py-2.5 text-sm font-bold"
                                            placeholder="E.g., Tech Symposium 2026"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input py-2.5 text-sm font-bold"
                                        >
                                            <option value="academic">Academic</option>
                                            <option value="cultural">Cultural</option>
                                            <option value="sports">Sports</option>
                                            <option value="placement">Placement</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Event Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="input py-2.5 text-sm font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Location / Venue</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="input py-2.5 text-sm font-bold"
                                            placeholder="E.g., Auditorium B"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Max Capacity</label>
                                        <input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                            className="input py-2.5 text-sm font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input min-h-[120px] py-3 text-sm leading-relaxed"
                                        placeholder="Outline the event schedule and objectives..."
                                        required
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn btn-primary px-10 py-3 flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                                    >
                                        {isSubmitting ? <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" /> : <Send size={20} />}
                                        Launch Event
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Events Management List */}
            <div className="space-y-6">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Departmental Calendar</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="glass-card h-48 animate-pulse rounded-3xl" />)
                    ) : events.length > 0 ? (
                        events.map((event, idx) => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card p-6 group hover:border-indigo-500 transition-all border-slate-100 dark:border-slate-800"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${event.category === 'academic' ? 'bg-indigo-50 text-indigo-500' :
                                            event.category === 'cultural' ? 'bg-purple-50 text-purple-500' :
                                                'bg-slate-50 text-slate-500'
                                        } dark:bg-slate-800`}>
                                        {event.category === 'academic' ? <BookOpen size={24} /> :
                                            event.category === 'cultural' ? <PartyPopper size={24} /> :
                                                <Tag size={24} />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">
                                            {event.registeredUsers?.length || 0} Registered
                                        </span>
                                        <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                        <Calendar size={14} className="text-indigo-500" />
                                        {new Date(event.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                        <MapPin size={14} className="text-indigo-500" />
                                        {event.location}
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                                        {event.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass-card border-dashed">
                            <Calendar className="mx-auto text-gray-200 mb-4" size={64} />
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No events scheduled</h3>
                            <p className="text-gray-400 mt-2">Start organizing campus activities by clicking 'Schedule Event'.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
