import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    Mail,
    Book,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    MoreVertical,
    MessageSquare,
    UserX,
    Grid,
    List
} from 'lucide-react';
import { facultyService } from '../../services';
import { Link } from 'react-router-dom';

export const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filterDept, setFilterDept] = useState('all');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await facultyService.getStudents();
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Users className="text-indigo-600" size={32} />
                        Student Directory
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">Comprehensive overview of students in your department</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{students.length} TOTAL RECORDS</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search student by name, roll number, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-12 py-3 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-2xl"
                    />
                </div>
                <button className="btn btn-outline border-slate-200 dark:border-slate-800 px-6 flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                    <Filter size={16} />
                    Filter Dept
                </button>
            </div>

            {/* Display Area */}
            {loading ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="glass-card h-48 animate-pulse rounded-3xl" />)}
                </div>
            ) : filteredStudents.length > 0 ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                    {filteredStudents.map((student, idx) => (
                        <motion.div
                            key={student._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`glass-card p-0 group overflow-hidden border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all duration-300 ${viewMode === 'list' ? 'flex items-center gap-6 p-4' : ''}`}
                        >
                            {/* Card Content - Grid Mode */}
                            {viewMode === 'grid' ? (
                                <>
                                    <div className="h-20 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 dark:from-indigo-500/5 dark:to-sky-500/5 relative">
                                        <div className="absolute -bottom-6 left-6">
                                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg border border-slate-100 dark:border-slate-700">
                                                {student.profileImage ? (
                                                    <img src={student.profileImage} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-500 font-black text-xl">
                                                        {student.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 pt-10 space-y-4">
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors truncate">{student.name}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.username}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pb-2">
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Department</p>
                                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{student.department}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Year</p>
                                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{student.year} Year</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                                <TrendingUp size={10} />
                                                Stable Performance
                                            </span>
                                            <button className="p-2 text-gray-300 hover:text-indigo-600 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 transition-all">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Card Content - List Mode
                                <>
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-500 font-black text-lg">
                                        {student.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.username} · {student.department} · {student.year} Year</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition-all">
                                            <Mail size={18} />
                                        </button>
                                        <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition-all">
                                            <MessageSquare size={18} />
                                        </button>
                                        <ChevronRight size={20} className="text-gray-300 ml-4" />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 glass-card border-dashed">
                    <UserX className="mx-auto text-gray-200 mb-4" size={64} />
                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No student records found</h3>
                    <p className="text-gray-400 mt-2 font-medium">Try broadening your search criteria or check department filters.</p>
                </div>
            )}
        </div>
    );
};
