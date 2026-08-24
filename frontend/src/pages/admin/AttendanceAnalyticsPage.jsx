import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data generator for UI development before API is ready
const generateMockData = () => {
    return {
        attendance: {
            overview: { total: 4500, presentRate: 85, absentRate: 10, lateRate: 5 },
            trend: Array.from({length: 30}, (_, i) => ({ 
                day: i + 1, 
                present: Math.floor(Math.random() * 50) + 100,
                absent: Math.floor(Math.random() * 20)
            })),
            bySubject: [
                { name: 'Computer Science', rate: 92 },
                { name: 'Mathematics', rate: 78 },
                { name: 'Physics', rate: 85 },
                { name: 'Literature', rate: 88 }
            ]
        },
        security: {
            loginRatio: { success: 95, failed: 5 },
            accessRatio: { granted: 88, denied: 12 },
            topLocations: [
                { name: 'Server Room', attempts: 342, denied: 45 },
                { name: 'Library', attempts: 1205, denied: 12 },
                { name: 'Computer Lab', attempts: 890, denied: 34 }
            ]
        }
    };
};

export const AttendanceAnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setData(generateMockData());
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400 uppercase tracking-widest font-black">Crunching Data...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <BarChart3 className="text-indigo-400" />
                Biometric Analytics
            </h1>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900/20">
                    <Users className="w-8 h-8 text-indigo-400 mb-4" />
                    <p className="text-3xl font-black text-white">{data.attendance.overview.total}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Records Scanned</p>
                </div>
                <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-900/20">
                    <Clock className="w-8 h-8 text-emerald-400 mb-4" />
                    <p className="text-3xl font-black text-emerald-400">{data.attendance.overview.presentRate}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Average Present Rate</p>
                </div>
                <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-red-900/20">
                    <Activity className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-3xl font-black text-red-400">{data.attendance.overview.absentRate}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Average Absent Rate</p>
                </div>
                <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-900/20">
                    <ShieldCheck className="w-8 h-8 text-amber-400 mb-4" />
                    <p className="text-3xl font-black text-amber-400">{data.security.loginRatio.success}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Face Login Success</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Trend Chart (Custom HTML/CSS) */}
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Attendance Trend (30 Days)</h2>
                    <div className="h-48 flex items-end gap-1">
                        {data.attendance.trend.map((day, i) => {
                            const total = day.present + day.absent;
                            const presentHeight = (day.present / Math.max(...data.attendance.trend.map(t => t.present + t.absent))) * 100;
                            
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                    <div className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-sm transition-all" style={{ height: `${presentHeight}%` }}></div>
                                    
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-xs p-2 rounded shadow-xl pointer-events-none z-10 whitespace-nowrap">
                                        Day {day.day}<br/>Present: {day.present}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Subject Breakdown */}
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-center space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject Attendance Rates</h2>
                    
                    {data.attendance.bySubject.map((subject, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-slate-300">{subject.name}</span>
                                <span className="text-emerald-400">{subject.rate}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${subject.rate}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Security - Access Control */}
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Access Control Hotspots</h2>
                    <div className="space-y-4">
                        {data.security.topLocations.map((loc, i) => {
                            const deniedRate = ((loc.denied / loc.attempts) * 100).toFixed(1);
                            return (
                                <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-200">{loc.name}</p>
                                        <p className="text-xs text-slate-400">{loc.attempts} total scans</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-400">{loc.denied} Denied</p>
                                        <p className="text-[10px] text-slate-500">{deniedRate}% rejection rate</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Security Metrics */}
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-center">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">System Reliability</h2>
                    
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-bold text-slate-300 uppercase tracking-wider">Face Login Success</span>
                                <span className="text-indigo-400">{data.security.loginRatio.success}%</span>
                            </div>
                            <div className="w-full h-3 bg-red-500/20 rounded-full overflow-hidden flex">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.security.loginRatio.success}%` }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-indigo-500"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 text-right">{data.security.loginRatio.failed}% Failure/Retry Rate</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-bold text-slate-300 uppercase tracking-wider">Physical Access Granted</span>
                                <span className="text-emerald-400">{data.security.accessRatio.granted}%</span>
                            </div>
                            <div className="w-full h-3 bg-red-500/20 rounded-full overflow-hidden flex">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.security.accessRatio.granted}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 text-right">{data.security.accessRatio.denied}% Denied Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
