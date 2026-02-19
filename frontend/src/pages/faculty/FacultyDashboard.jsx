import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    MessageSquare,
    Calendar,
    ChevronRight,
    Bell,
    TrendingUp,
    Award,
    Clock,
    UserCheck,
    ShieldAlert,
    Navigation,
    BookOpen,
    PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { facultyService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { ProfileCompletionBanner } from '../../components/ProfileCompletionBanner';

export const FacultyDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await facultyService.getDashboard();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: 'Mark Attendance', path: '/faculty/attendance', icon: <UserCheck size={20} />, color: 'bg-gold-metallic' },
        { label: 'Push Announcement', path: '/faculty/announcements', icon: <Bell size={20} />, color: 'bg-slate-900' },
        { label: 'Manage Students', path: '/faculty/students', icon: <Users size={20} />, color: 'bg-gold-metallic/80' },
        { label: 'Schedule Event', path: '/faculty/events', icon: <PlusCircle size={20} />, color: 'bg-slate-700' },
        { label: 'Academic Control', path: '/admin/academic', icon: <Award size={20} />, color: 'bg-amber-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-8 pb-32">
            <ProfileCompletionBanner />
            {/* Elegant Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none italic">
                            Academic <span className="text-gold-metallic">Command</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-3 font-bold flex items-center gap-2 text-xs md:text-sm">
                            <span className="w-8 h-[2px] bg-slate-900 dark:bg-gold-metallic"></span>
                            PROF. {user?.name?.toUpperCase()} · {user?.department} FACULTY · SESSION ACTIVE
                        </p>
                    </motion.div>
                </div>
                <Link to="/faculty/profile" className="group">
                    <div className="glass-card py-2 px-4 flex items-center gap-3 border-indigo-100 dark:border-indigo-900/30 group-hover:border-indigo-500 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Profile</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Review Credentials</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Student Strength"
                    value={stats?.studentCount || 0}
                    icon={<Users className="text-gold-metallic" size={32} />}
                    trend="+12% from last term"
                    delay={0}
                />
                <StatCard
                    title="Active Grievances"
                    value={stats?.pendingComplaints || 0}
                    icon={<ShieldAlert className="text-rose-500" size={32} />}
                    trend="Needs resolution priority"
                    variant="warning"
                    delay={0.1}
                />
                <StatCard
                    title="Department Rank"
                    value="#04"
                    icon={<Award className="text-amber-500" size={32} />}
                    trend="Top 10% Institution-wide"
                    delay={0.2}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Quick Actions Column */}
                <div className="space-y-6">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Control Panel</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, idx) => (
                            <Link key={idx} to={action.path}>
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="glass-card p-6 h-full flex flex-col items-center justify-center text-center gap-3 group border-slate-100 dark:border-slate-800"
                                >
                                    <div className={`p-4 rounded-2xl ${action.color} text-white shadow-lg group-hover:ring-4 ring-indigo-500/10 transition-all shadow-indigo-600/20`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {action.label}
                                    </span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    <div className="glass-card bg-indigo-600 text-white p-8 overflow-hidden relative group">
                        <div className="relative z-10 space-y-4">
                            <Navigation className="opacity-50" size={32} />
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none text-white/90">Institutional Knowledge</h3>
                            <p className="text-xs text-indigo-100/70 font-medium">Access latest circulars, curriculum guides, and faculty policies.</p>
                            <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                                Open Repository
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    </div>
                </div>

                {/* Center Column: Upcoming Events */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between ml-2">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Calendar</h2>
                        <Link to="/faculty/events" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">View All Events</Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="glass-card h-24 animate-pulse rounded-3xl" />)
                        ) : stats?.upcomingEvents?.length > 0 ? (
                            stats.upcomingEvents.map((event, idx) => (
                                <motion.div
                                    key={event._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-5 group hover:border-indigo-500 transition-all flex items-center justify-between border-slate-100 dark:border-slate-800"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-default text-gray-500 dark:text-gray-400">
                                            <span className="text-lg font-black leading-none">{new Date(event.date).getDate()}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                                <Navigation size={10} className="text-indigo-500" />
                                                {event.location} · {event.category}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-3 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="glass-card border-dashed py-12 text-center">
                                <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
                                <h3 className="text-gray-400 font-black uppercase tracking-widest text-sm">No scheduled events</h3>
                                <p className="text-xs text-gray-300 mt-1 uppercase tracking-tighter">Your academic calendar is clear.</p>
                            </div>
                        )}

                        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-600">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Departmental Activity Feed</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time alerts & updates</p>
                                </div>
                            </div>
                            <button className="btn btn-outline border-indigo-200 text-[10px] py-1.5 px-4 font-black">Track Logs</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, variant = 'default', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card p-0 overflow-hidden relative group border-slate-100 dark:border-slate-800"
    >
        <div className="p-8 space-y-4 relative z-10">
            <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${variant === 'warning' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-indigo-50 dark:bg-indigo-900/20'} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</h3>
                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</p>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${variant === 'warning' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                {trend}
            </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>
    </motion.div>
);
