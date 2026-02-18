import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Info,
    TriangleAlert,
    CheckCircle,
    Zap,
    Calendar,
    Clock,
    Trash2,
    MailOpen,
    Shield,
    Heart,
    MessageCircle,
    UserPlus,
    ClipboardList,
    Mail,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services';

export const NotificationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true, readBy: [...(n.readBy || []), user?._id] } : n
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart size={22} className="text-rose-500" />;
            case 'comment': return <MessageCircle size={22} className="text-indigo-500" />;
            case 'follow': return <UserPlus size={22} className="text-sky-500" />;
            case 'task': return <ClipboardList size={22} className="text-amber-500" />;
            case 'message': return <Mail size={22} className="text-indigo-500" />;
            case 'success': return <CheckCircle size={22} className="text-emerald-500" />;
            case 'warning': return <TriangleAlert size={22} className="text-amber-500" />;
            case 'urgent': return <Zap size={22} className="text-rose-500" />;
            default: return <Info size={22} className="text-blue-500" />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'like': return 'bg-rose-50 dark:bg-rose-900/10';
            case 'comment': return 'bg-indigo-50 dark:bg-indigo-900/10';
            case 'follow': return 'bg-sky-50 dark:bg-sky-900/10';
            case 'task': return 'bg-amber-50 dark:bg-amber-900/10';
            case 'success': return 'bg-emerald-50 dark:bg-emerald-900/10';
            case 'urgent': return 'bg-rose-100 dark:bg-rose-900/20';
            default: return 'bg-blue-50 dark:bg-blue-900/10';
        }
    };

    const unreadCount = notifications.filter(n =>
        n.recipient ? !n.isRead : !n.readBy.includes(user?._id)
    ).length;

    return (
        <div className="max-w-5xl mx-auto space-y-12 p-4 md:p-6 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl gap-2 font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center">
                        Institutional Grid <Sparkles className="text-indigo-600" size={28} />
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Active Signal Monitoring · Institutional Stream</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${unreadCount > 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800 text-gray-400'}`}>
                        <Bell size={18} className={unreadCount > 0 ? 'animate-bounce' : ''} />
                        {unreadCount} Unread Signals
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="glass-card h-28 animate-pulse rounded-[2.5rem]" />)
                ) : notifications.length > 0 ? (
                    notifications.map((notif, idx) => {
                        const isRead = notif.recipient ? notif.isRead : notif.readBy.includes(user?._id);

                        return (
                            <motion.div
                                key={notif._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`glass-card p-1 group relative overflow-hidden transition-all hover:scale-[1.01] ${isRead ? 'opacity-60 grayscale-[0.2]' : 'border-l-[6px] border-l-indigo-600 shadow-2xl shadow-indigo-600/10'
                                    }`}
                            >
                                <div className="p-6 flex items-start gap-6 bg-white dark:bg-slate-900 rounded-[2.4rem]">
                                    <div className={`w-16 h-16 rounded-[1.5rem] shrink-0 flex items-center justify-center p-1 border border-transparent group-hover:border-indigo-200 transition-all ${getBg(notif.type)}`}>
                                        {getIcon(notif.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className={`text-lg font-black uppercase tracking-tighter italic truncate ${isRead ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic flex items-center gap-1">
                                                <Clock size={10} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`mt-1 text-sm font-medium leading-relaxed max-w-2xl ${isRead ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {notif.message}
                                        </p>

                                        <div className="pt-4 flex flex-wrap items-center gap-6">
                                            {notif.link && (
                                                <button
                                                    onClick={() => navigate(notif.link)}
                                                    className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform"
                                                >
                                                    Access Sector <ExternalLink size={12} />
                                                </button>
                                            )}
                                            {!isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif._id)}
                                                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                                >
                                                    <MailOpen size={12} /> Mark Read
                                                </button>
                                            )}
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-auto italic">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-2 border-slate-100 dark:border-slate-800">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Shield className="text-slate-200 dark:text-slate-700" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter italic">Sector Secured</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">No institutional signals detected in current cycle</p>
                    </div>
                )}
            </div>
        </div>
    );
};
