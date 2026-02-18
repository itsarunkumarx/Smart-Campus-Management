import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    MoreVertical,
    UserPlus,
    Mail,
    Clock,
    CheckCircle2,
    XCircle,
    UserX,
    ChevronDown,
    Shield
} from 'lucide-react';
import { adminService } from '../../services';

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [feedback, setFeedback] = useState({ type: '', text: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUsers(selectedRole === 'all' ? undefined : selectedRole);
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (id) => {
        try {
            setIsProcessing(true);
            const result = await adminService.toggleSuspendUser(id);
            setUsers(users.map(u => u._id === id ? result.user : u));
            setFeedback({ type: 'success', text: `Account status updated successfully.` });
        } catch (err) {
            setFeedback({ type: 'error', text: 'Action failed. Check administrator permissions.' });
        } finally {
            setIsProcessing(false);
            setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete this account? This cannot be undone.')) return;

        try {
            setIsProcessing(true);
            await adminService.deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            setFeedback({ type: 'success', text: 'Account permanently purged from registry.' });
        } catch (err) {
            setFeedback({ type: 'error', text: 'Deletion failed. Protect protocols might be active.' });
        } finally {
            setIsProcessing(false);
            setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Users className="text-indigo-600" size={32} />
                        Population Registry
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold italic border-l-2 border-indigo-200 pl-3 ml-1">
                        Global oversight of students, faculty, and administrative nodes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3 shadow-lg shadow-indigo-600/5">
                        <ShieldCheck className="text-indigo-500" size={20} />
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">{users.length} TOTAL RECORDS</span>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {feedback.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl flex items-center shadow-lg border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        <CheckCircle2 size={20} className="mr-3 shrink-0" />
                        <p className="font-semibold text-sm uppercase tracking-tight">{feedback.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Config & Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, roll, email, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-12 py-3 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-2xl text-sm font-medium"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="input pl-12 pr-10 py-3 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 text-xs font-black uppercase tracking-widest rounded-2xl appearance-none cursor-pointer"
                        >
                            <option value="all">ALL ROLES</option>
                            <option value="student">STUDENTS</option>
                            <option value="faculty">FACULTY</option>
                            <option value="admin">ADMINS</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    <Link to="/admin/faculty/add" className="btn btn-primary px-6 flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 whitespace-nowrap">
                        <UserPlus size={18} />
                        Register Faculty
                    </Link>
                </div>
            </div>

            {/* Data Grid */}
            <div className="glass-card overflow-hidden border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role & Dept</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="p-8">
                                            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black relative group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                    {u.role === 'admin' && <Shield className="absolute -top-1 -right-1 text-amber-500 fill-amber-500" size={12} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{u.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                        <Mail size={10} />
                                                        {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-100 text-amber-600' :
                                                u.role === 'faculty' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-sky-100 text-sky-600'
                                                }`}>
                                                {u.role}
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 ml-1">{u.department || 'GLOBAL'}</p>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.isSuspended ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${u.isSuspended ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {u.isSuspended ? 'Suspended' : 'Verified'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-[10px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                                                <Clock size={12} />
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleSuspend(u._id)}
                                                    className={`p-2 rounded-lg transition-all ${u.isSuspended ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'} hover:scale-110`}
                                                    title={u.isSuspended ? "Reactivate Account" : "Suspend Account"}
                                                >
                                                    {u.isSuspended ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u._id)}
                                                    className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:scale-110 transition-all"
                                                    title="Purge Account"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <UserX className="mx-auto text-slate-200 mb-4" size={64} />
                                        <p className="text-gray-400 font-black uppercase tracking-widest">No population matches in current tier</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pro Tip/Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-l-4 border-indigo-500 flex items-center gap-5">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Growth Index</h4>
                        <p className="text-lg font-black text-gray-900 dark:text-white">Active session density high.</p>
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-rose-500 flex items-center gap-5">
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Security Alert</h4>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{users.filter(u => u.isSuspended).length} Nodes isolated.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
