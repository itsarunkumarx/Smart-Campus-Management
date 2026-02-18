import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import { studentService } from '../../services';

export const AttendancePage = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const data = await studentService.getAttendance();
            setAttendanceData(data);
        } catch (err) {
            setError('Failed to load attendance records.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const overallPercentage = attendanceData.length > 0
        ? (attendanceData.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0) / attendanceData.length).toFixed(2)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute top-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Attendance</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your consistency across all subjects</p>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-2">
                    <Calendar className="text-indigo-500" size={18} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester: Fall 2026</span>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Progress Circle */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card lg:col-span-1 flex flex-col items-center justify-center text-center py-10"
                >
                    <div className="relative w-48 h-48">
                        {/* Background Track */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="12"
                                className="text-gray-100 dark:text-slate-800"
                            />
                            {/* Progress Bar */}
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="transparent"
                                stroke="url(#gradient)"
                                strokeWidth="12"
                                strokeDasharray={552.92}
                                initial={{ strokeDashoffset: 552.92 }}
                                animate={{ strokeDashoffset: 552.92 - (552.92 * overallPercentage) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4f46e5" />
                                    <stop offset="100%" stopColor="#0ea5e9" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-gray-900 dark:text-white">{overallPercentage}%</span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Consistency</span>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-8 divide-x divide-gray-100 dark:divide-slate-800">
                        <div className="px-4">
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {attendanceData.reduce((acc, curr) => acc + curr.present, 0)}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">PRESENT</p>
                        </div>
                        <div className="px-4">
                            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                {attendanceData.reduce((acc, curr) => acc + (curr.total - curr.present), 0)}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">ABSENT</p>
                        </div>
                    </div>
                </motion.div>

                {/* Subject Cards Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attendanceData.map((subject, idx) => (
                        <motion.div
                            key={subject.subject}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    <BookOpen size={20} />
                                </div>
                                <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${parseFloat(subject.percentage) >= 75
                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600'
                                        : 'bg-red-50 dark:bg-red-900/30 text-red-600'
                                    }`}>
                                    {subject.percentage}%
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white truncate">{subject.subject}</h3>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Progress</span>
                                    <span>{subject.present}/{subject.total} Classes</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${subject.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        className={`h-full rounded-full ${parseFloat(subject.percentage) >= 75 ? 'bg-indigo-500' : 'bg-rose-500'
                                            }`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Attendance Journal */}
            <div className="glass-card rounded-2xl overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Journal</h2>
                    <TrendingUp className="text-gray-400" size={20} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Marked By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {attendanceData.flatMap(s => s.records).slice(0, 8).map((record, i) => (
                                <motion.tr
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 + i * 0.05 }}
                                    className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{record.subject}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {record.status === 'present' ? (
                                                <CheckCircle2 className="text-green-500" size={16} />
                                            ) : record.status === 'late' ? (
                                                <Clock className="text-amber-500" size={16} />
                                            ) : (
                                                <XCircle className="text-red-500" size={16} />
                                            )}
                                            <span className={`text-xs font-bold capitalize ${record.status === 'present' ? 'text-green-600' :
                                                    record.status === 'late' ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{record.markedBy?.name}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Low Attendance Warning */}
            {overallPercentage < 75 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center space-x-4"
                >
                    <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300">Minimum Requirements Not Met</h4>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">Your attendance is below 75%. Please attend more classes to qualify for final examinations.</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
