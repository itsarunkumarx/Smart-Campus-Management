import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserCheck,
    Users,
    Calendar,
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    ChevronRight,
    Save,
    AlertCircle,
    UserX
} from 'lucide-react';
import { facultyService } from '../../services';

export const MarkAttendance = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('Computer Science');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [marks, setMarks] = useState({}); // { studentId: status }
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await facultyService.getStudents();
            setStudents(data);

            // Initialize all as 'present' by default for convenience
            const initialMarks = {};
            data.forEach(s => initialMarks[s._id] = 'present');
            setMarks(initialMarks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (id) => {
        setMarks(prev => {
            const current = prev[id];
            let next = 'present';
            if (current === 'present') next = 'absent';
            else if (current === 'absent') next = 'late';
            return { ...prev, [id]: next };
        });
    };

    const handleBulkMark = (status) => {
        const newMarks = { ...marks };
        students.forEach(s => {
            if (s.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                newMarks[s._id] = status;
            }
        });
        setMarks(newMarks);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const attendanceData = Object.entries(marks).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await facultyService.markBulkAttendance({
                attendanceData,
                subject: selectedSubject,
                date: attendanceDate
            });

            setMessage({ type: 'success', text: `Attendance for ${selectedSubject} recorded successfully!` });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save attendance logs.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const presentCount = Object.values(marks).filter(v => v === 'present').length;
    const absentCount = Object.values(marks).filter(v => v === 'absent').length;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <UserCheck className="text-indigo-600" size={32} />
                        Attendance Registry
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">Log academic consistency for your department sessions</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="glass-card py-2 px-4 border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Present</p>
                        <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{presentCount}</p>
                    </div>
                    <div className="glass-card py-2 px-4 border-rose-100 bg-rose-50/50 dark:bg-rose-900/10 dark:border-rose-900/30">
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Absent</p>
                        <p className="text-lg font-black text-rose-700 dark:text-rose-400">{absentCount}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || students.length === 0}
                        className="btn btn-primary shadow-indigo-500/20 px-8 flex items-center gap-2 h-full"
                    >
                        {isSaving ? <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" /> : <Save size={20} />}
                        Save Registry
                    </button>
                </div>
            </div>

            {/* Config Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-4 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Session Subject</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="input pl-10 py-2.5 text-sm bg-transparent"
                        >
                            <option value="Computer Science">Computer Science</option>
                            <option value="Advanced Mathematics">Advanced Mathematics</option>
                            <option value="Data Structures">Data Structures</option>
                            <option value="Artificial Intelligence">Artificial Intelligence</option>
                        </select>
                    </div>
                </div>

                <div className="glass-card p-4 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Session Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="input pl-10 py-2 bg-transparent text-sm"
                        />
                    </div>
                </div>

                <div className="glass-card p-4 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Quick Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                        <input
                            type="text"
                            placeholder="Student name or roll..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 py-2 bg-transparent text-sm"
                        />
                    </div>
                </div>
            </div>

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

            {/* Student List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Student Manifest</h2>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkMark('present')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">Mark All Present</button>
                        <button onClick={() => handleBulkMark('absent')} className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-lg">Mark All Absent</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="glass-card h-24 animate-pulse rounded-3xl" />)
                    ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((student, idx) => (
                            <motion.div
                                key={student._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => toggleStatus(student._id)}
                                className={`glass-card p-4 cursor-pointer group transition-all relative overflow-hidden flex items-center gap-4 ${marks[student._id] === 'present' ? 'border-emerald-100 hover:border-emerald-400' :
                                    marks[student._id] === 'absent' ? 'border-rose-100 hover:border-rose-400 opacity-80' :
                                        'border-amber-100 hover:border-amber-400'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-colors ${marks[student._id] === 'present' ? 'bg-emerald-500 text-white' :
                                    marks[student._id] === 'absent' ? 'bg-rose-500 text-white' :
                                        'bg-amber-500 text-white'
                                    }`}>
                                    {student.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm truncate">{student.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{student.username}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${marks[student._id] === 'present' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' :
                                        marks[student._id] === 'absent' ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' :
                                            'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
                                        }`}>
                                        {marks[student._id]?.toUpperCase()}
                                    </span>
                                </div>

                                <div className={`absolute top-0 right-0 w-2 h-full ${marks[student._id] === 'present' ? 'bg-emerald-500/20' :
                                    marks[student._id] === 'absent' ? 'bg-rose-500/20' :
                                        'bg-amber-500/20'
                                    }`}></div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center glass-card border-dashed">
                            <UserX className="mx-auto text-gray-200 mb-4" size={48} />
                            <h3 className="text-gray-400 font-black uppercase tracking-widest">No students found</h3>
                            <p className="text-xs text-gray-300 mt-1 uppercase tracking-tighter">Adjust your department filters or search term.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-6 rounded-3xl flex items-center gap-6">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-tight">Interactive Controls</h4>
                    <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 mt-1">Tap any student card to cycle through Present → Absent → Late statuses. Save once finalized.</p>
                </div>
            </div>
        </div>
    );
};
