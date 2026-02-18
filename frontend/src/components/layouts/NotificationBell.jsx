import { useState, useEffect, useRef } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Polling every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'success': return <CheckCircle className="text-emerald-500" size={16} />;
            case 'urgent': return <AlertTriangle className="text-rose-500 animate-pulse" size={16} />;
            default: return <Info className="text-blue-500" size={16} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-slate-400 hover:text-gold-metallic transition-colors"
                aria-label="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock size={14} className="text-gold-metallic" /> Institutional Logs
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                {unreadCount} New Signals
                            </span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group ${!notification.isRead ? 'bg-indigo-50/20 dark:bg-indigo-900/5' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-xs font-bold leading-tight ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification._id)}
                                                                className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-indigo-600 uppercase tracking-tighter transition-opacity"
                                                            >
                                                                Seal
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-slate-500 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    {notification.link && (
                                                        <Link
                                                            to={notification.link}
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-block text-[10px] font-black uppercase tracking-widest text-gold-metallic hover:text-amber-500 transition-colors mt-2"
                                                        >
                                                            Redirect &gt;&gt;
                                                        </Link>
                                                    )}
                                                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-2">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center py-20">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                        <Bell size={32} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        No active transmissions
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 text-center">
                            <Link
                                to="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-400 transition-colors"
                            >
                                View All Protocols
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
