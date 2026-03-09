import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    Navigation,
    MessageSquare,
    TrendingUp,
    Award,
    Calendar,
    Clock,
    Bell,
    Zap,
    Users
} from 'lucide-react';

export const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const studentLinks = [
        { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/student/profile', label: 'Profile', icon: '👤' },
        { path: '/student/posts', label: 'Social Feed', icon: '💬' },
        { path: '/student/attendance', label: 'Attendance', icon: '📅' },
        { path: '/student/complaints', label: 'Complaints', icon: '📝' },
        { path: '/student/placements', label: 'Placements', icon: '💼' },
        { path: '/student/scholarships', label: 'Scholarships', icon: '🎓' },
        { path: '/student/events', label: 'Events', icon: '🎉' },
        { path: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
        { path: '/tasks', label: 'Tasks', icon: '📝' },
        { path: '/search', label: 'Search', icon: '🔍' },
        { path: '/chat', label: 'Chat', icon: '💬' },
        { path: '/student/notifications', label: 'Notifications', icon: '🔔' },
    ];

    const facultyLinks = [
        { path: '/faculty/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/faculty/profile', label: 'Profile', icon: '👤' },
        { path: '/faculty/announcements', label: 'Announcements', icon: '📢' },
        { path: '/faculty/attendance', label: 'Mark Attendance', icon: '✅' },
        { path: '/faculty/students', label: 'Students', icon: '👥' },
        { path: '/faculty/events', label: 'Events', icon: '🎉' },
        { path: '/admin/academic', label: 'Academic Control', icon: '🎓' },
        { path: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
        { path: '/tasks', label: 'Tasks', icon: '📝' },
        { path: '/search', label: 'Search', icon: '🔍' },
        { path: '/chat', label: 'Chat', icon: '💬' },
    ];

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/profile', label: 'Profile', icon: '👤' },
        { path: '/admin/users', label: 'Global Registry', icon: '👥' },
        { path: '/admin/academic', label: 'Academic Control', icon: '🎓' },
        { path: '/admin/complaints', label: 'Grievance Hub', icon: '⚖️' },
        { path: '/admin/moderation', label: 'Social Moderation', icon: '🛡️' },
        { path: '/admin/ai-control', label: 'AI Control Center', icon: '🧠' },
        { path: '/tasks', label: 'Tasks', icon: '📝' },
        { path: '/search', label: 'Search', icon: '🔍' },
        { path: '/chat', label: 'Chat', icon: '💬' },
    ];

    const guestLinks = [
        { path: '/student/dashboard', label: 'Student Hub', icon: <Navigation size={18} /> },
        { path: '/student/posts', label: 'Social Feed', icon: <MessageSquare size={18} /> },
        { path: '/student/placements', label: 'Placements', icon: <TrendingUp size={18} /> },
        { path: '/student/scholarships', label: 'Scholarships', icon: <Award size={18} /> },
        { path: '/student/events', label: 'Campus Events', icon: <Calendar size={18} /> },
        { path: '/student/attendance', label: 'Attendance', icon: <Clock size={18} /> },
        { path: '/student/notifications', label: 'Alerts', icon: <Bell size={18} /> },
        { path: '/ai-assistant', label: 'AI Helper', icon: <Zap size={18} /> },
        { path: '/chat', label: 'Messages', icon: <MessageSquare size={18} /> },
        { path: '/search', label: 'Search', icon: <Users size={18} /> },
        { path: '/faculty/dashboard', label: 'Faculty Center', icon: <Navigation size={18} /> },
        { path: '/admin/dashboard', label: 'Admin HQ', icon: <Navigation size={18} /> },
    ];


    const getLinks = () => {
        if (!user) return guestLinks;
        switch (user?.role) {
            case 'student':
                return studentLinks;
            case 'faculty':
                return facultyLinks;
            case 'admin':
                return adminLinks;
            default:
                return [];
        }
    };

    return (
        <aside className="fixed bottom-0 left-0 w-full md:relative md:w-64 bg-white dark:bg-slate-950 border-t md:border-t-0 md:border-r border-slate-200 dark:border-gold-metallic/10 h-16 md:h-[calc(100vh-4rem)] md:sticky md:top-16 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden z-40 transition-colors duration-500 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
            <div className="flex flex-row md:flex-col p-2 md:p-4 gap-2 items-center md:items-stretch w-max md:w-auto h-full box-border">
                {getLinks().map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-4 py-1.5 md:p-3 rounded-xl transition-all h-full md:h-auto ${isActive(link.path) ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold sidebar-link-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 sidebar-link'}`}
                    >
                        <span className="text-lg md:text-xl flex-shrink-0 leading-none">{link.icon}</span>
                        <span className="text-[10px] md:text-sm whitespace-nowrap leading-none">{link.label}</span>
                    </Link>
                ))}
            </div>
        </aside>
    );
};
