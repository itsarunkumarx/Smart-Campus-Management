import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    ShieldAlert,
    Cpu,
    TrendingUp,
    ChevronRight,
    Activity,
    Globe,
    Lock,
    Zap,
    BarChart3,
    GraduationCap,
    HeartPulse,
    Server,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { ProfileCompletionBanner } from '../../components/ProfileCompletionBanner';

export const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboard();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const adminActions = [
        { label: 'User Directory', path: '/admin/users', icon: <Users size={20} />, color: 'bg-gold-metallic', desc: 'Manage all campus roles' },
        { label: 'Grievance Hub', path: '/admin/complaints', icon: <ShieldAlert size={20} />, color: 'bg-slate-900', desc: 'Resolve system disputes' },
        { label: 'Academic Control', path: '/admin/academic', icon: <GraduationCap size={20} />, color: 'bg-gold-metallic/80', desc: 'Placements & Scholarships' },
        { label: 'AI Control Hub', path: '/admin/ai-control', icon: <Cpu size={20} />, color: 'bg-sky-500', desc: 'Neural network oversight' },
        { label: 'Social Moderation', path: '/admin/moderation', icon: <Lock size={20} />, color: 'bg-slate-700', desc: 'Content policy oversight' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-8 pb-32">
            <ProfileCompletionBanner />
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none italic">
                            Institutional <span className="text-gold-metallic">Command</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-3 font-bold flex items-center gap-2 text-xs md:text-sm">
                            <span className="w-8 h-[2px] bg-slate-900 dark:bg-white"></span>
                            CHIEF ADMINISTRATOR · {user?.name?.toUpperCase()} · SYSTEM OVERWATCH LIVE
                        </p>
                    </motion.div>
                </div>

                <div className="flex items-center gap-3 glass-card py-2 px-5 bg-gold-metallic/5 dark:bg-gold-metallic/10 border-gold-metallic/20 dark:border-gold-metallic/30">
                    <div className="w-2 h-2 rounded-full bg-gold-metallic animate-pulse"></div>
                    <span className="text-[10px] font-black text-gold-metallic dark:text-gold-light uppercase tracking-widest">Global Systems Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard
                    title="Total Population"
                    value={stats?.totalUsers || 0}
                    icon={<Users className="text-gold-metallic" size={24} />}
                    subValue={`${stats?.totalStudents || 0} Students · ${stats?.totalFaculty || 0} Staff`}
                    delay={0}
                />
                <AdminStatCard
                    title="System Grievances"
                    value={stats?.pendingComplaints || 0}
                    icon={<ShieldAlert className="text-gold-metallic" size={24} />}
                    subValue="Awaiting Official Resolution"
                    variant="gold"
                    delay={0.1}
                />
                <div className="lg:col-span-2">
                    <AISummaryCard />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* System Control Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between ml-2">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Operational Gateways</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
                            <Zap size={12} />
                            AUTOSAVE ENABLED
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {adminActions.map((action, idx) => (
                            <Link key={idx} to={action.path}>
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="glass-card p-8 flex items-center gap-6 group border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${action.color} text-white flex items-center justify-center shadow-lg shadow-indigo-600/10 group-hover:rotate-12 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{action.label}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{action.desc}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />

                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {/* Infrastructure Health */}
                    <div className="glass-card p-8 bg-slate-900 text-white overflow-hidden relative">
                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Server className="text-sky-400" size={24} />
                                    <h3 className="text-xl font-black uppercase tracking-tight">Mainframe Diagnostics</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <HealthIndicator label="API Latency" value="24ms" status="optimal" />
                                    <HealthIndicator label="Vite HMR" value="Active" status="optimal" />
                                    <HealthIndicator label="Institutional Node" value="Primary" status="optimal" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
                                    All subsystems reporting peak performance. Distributed database synchronization active across production nodes.
                                </p>
                            </div>
                            <div className="w-32 h-32 relative shrink-0">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-800" />
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="283" strokeDashoffset="28" className="text-sky-500" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-black italic">92%</span>
                                    <span className="text-[8px] font-black uppercase">Load</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Status Column */}
                <div className="space-y-6">
                    <SystemFeed />
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Institutional Safety</h2>
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-6 border-l-4 border-indigo-500"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="text-indigo-500" size={20} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Security Clearance</h4>
                            </div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed italic">
                                "Root access confirmed for Principal Admin. High-level security protocols are active for all data transmissions."
                            </p>
                        </motion.div>

                        <div className="glass-card p-0 overflow-hidden group">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="text-rose-500" size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Live Traffic</span>
                                </div>
                                <span className="text-[8px] font-black px-2 py-0.5 bg-rose-500 text-white rounded-full">REALTIME</span>
                            </div>
                            <div className="p-6 space-y-4 font-mono">
                                <TrafficLine label="/api/v1/auth" value="200 OK" time="Just now" />
                                <TrafficLine label="/api/v1/admin" value="Fetch Stats" time="2s ago" />
                                <TrafficLine label="/api/v1/posts" value="12 matches" time="5s ago" />
                            </div>
                        </div>

                        <div className="glass-card bg-gradient-to-br from-indigo-600 to-sky-600 text-white p-8 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4 text-center">
                                <Globe className="mx-auto opacity-30 group-hover:rotate-180 transition-transform duration-1000" size={48} />
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">Global Broadcast</h3>
                                <p className="text-xs text-white/70 font-medium">Issue institutional memos across the entire campus network.</p>
                                <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-black/20">
                                    Open Comm Channel
                                </button>
                            </div>
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminStatCard = ({ title, value, icon, subValue, variant = 'default', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card p-6 border-slate-100 dark:border-slate-800 group hover:border-indigo-500/50 transition-all relative overflow-hidden"
    >
        <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${variant === 'warning' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-indigo-50 dark:bg-indigo-900/20'} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                {icon}
            </div>
            <div className={`text-[8px] font-black px-2 py-0.5 rounded-lg ${variant === 'warning' ? 'bg-rose-500' : 'bg-indigo-600'} text-white`}>
                SECURE
            </div>
        </div>
        <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic leading-none">{value}</p>
        </div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-4 flex items-center gap-2">
            <span className={`w-1 h-1 rounded-full ${variant === 'warning' ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'}`}></span>
            {subValue}
        </p>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
    </motion.div>
);

const HealthIndicator = ({ label, value, status }) => (
    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${status === 'optimal' ? 'bg-sky-400 animate-pulse' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] font-black uppercase text-slate-200">{value}</span>
        </div>
    </div>
);

const TrafficLine = ({ label, value, time }) => (
    <div className="flex items-center justify-between text-[9px] border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
        <div className="flex items-center gap-2">
            <span className="text-indigo-400">{'>'}</span>
            <span className="text-gray-500 dark:text-gray-400 font-bold">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-emerald-500 font-black">{value}</span>
            <span className="text-gray-300 dark:text-gray-600 text-[8px]">{time}</span>
        </div>
    </div>
);

const AISummaryCard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await adminService.getAISummary();
                setSummary(data);
            } catch (err) {
                console.error('AI Summary fetch failed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return (
        <div className="glass-card p-6 h-full animate-pulse">
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 h-full border-l-4 border-sky-500 bg-gradient-to-br from-white to-sky-50/30 dark:from-slate-900 dark:to-sky-900/10 relative overflow-hidden group"
        >
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-sky-500 text-white rounded-lg shadow-lg shadow-sky-500/20">
                        <Cpu size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">Smart Campus AI Insight</h3>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 italic mb-4 leading-relaxed">
                    "{summary?.summary}"
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <Zap size={12} fill="currentColor" />
                    Recommended Action: {summary?.insight}
                </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Cpu size={120} />
            </div>
        </motion.div>
    );
};

const SystemFeed = () => {
    const activities = [
        { type: 'login', user: 'Admin Arun', action: 'System Overwatch Initialized', time: '1m ago', icon: '⚡' },
        { type: 'complaint', user: 'Student R.', action: 'New Grievance: Library Access', time: '5m ago', icon: '📝' },
        { type: 'post', user: 'Faculty S.', action: 'Resource Published: React v19 Guide', time: '12m ago', icon: '📁' },
        { type: 'security', user: 'System', action: 'Nightly Sync Complete', time: '1h ago', icon: '🛡️' }
    ];

    return (
        <div className="glass-card overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="text-indigo-500" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Institutional Feed</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((activity, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex gap-4">
                            <span className="text-lg">{activity.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 mb-0.5">{activity.user}</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{activity.action}</p>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase shrink-0 mt-1">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full py-3 bg-slate-50/50 dark:bg-slate-800/20 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                View All Activity Logs
            </button>
        </div>
    );
};
