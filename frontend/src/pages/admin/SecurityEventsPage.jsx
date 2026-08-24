import React, { useState, useEffect } from 'react';
import { Shield, AlertOctagon, Activity, Filter, Server, EyeOff, AlertTriangle } from 'lucide-react';
import faceService from '../../services/faceService';
import { motion } from 'framer-motion';

export const SecurityEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [stats, setStats] = useState({ total: 0, today: 0, alerts: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchSecurityData = async () => {
            setLoading(true);
            try {
                // In a real app, we'd fetch all these from the actual API endpoints
                // For this simulation/UI build, we'll try to fetch, catch error, and set mock data if API isn't ready
                try {
                    const statsData = await faceService.getSecurityStats();
                    const anomalyData = await faceService.getAnomalies();
                    const eventsData = await faceService.getSecurityEvents();
                    setStats(statsData);
                    setAnomalies(anomalyData);
                    setEvents(eventsData.data || []);
                } catch (e) {
                    console.warn("Backend not ready, using mock data for UI visualization");
                    setStats({ total: 15420, today: 342, alerts: 12 });
                    
                    setAnomalies([
                        { id: 1, type: 'multiple_faces', severity: 'high', location: 'Server Room', time: '10 mins ago', detail: 'Multiple faces detected during access attempt' },
                        { id: 2, type: 'liveness_fail', severity: 'medium', location: 'Library Entrance', time: '1 hour ago', detail: 'Failed 3D liveness check (possible photo)' }
                    ]);

                    setEvents([
                        { id: 1, type: 'access_granted', user: 'Dr. Smith', location: 'Server Room', time: new Date().toISOString(), confidence: 0.98 },
                        { id: 2, type: 'access_denied', user: 'Unknown', location: 'Server Room', time: new Date(Date.now() - 3600000).toISOString(), confidence: 0.45 },
                        { id: 3, type: 'face_login_success', user: 'Alice Johnson', location: 'Web Portal', time: new Date(Date.now() - 7200000).toISOString(), confidence: 0.99 },
                        { id: 4, type: 'anomaly_detected', user: 'Unknown', location: 'Library Entrance', time: new Date(Date.now() - 86400000).toISOString(), confidence: 0.88 },
                    ]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSecurityData();
    }, []);

    const getEventColor = (type) => {
        if (type.includes('success') || type.includes('granted')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (type.includes('fail') || type.includes('denied')) return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (type.includes('anomaly')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    };

    const getSeverityIcon = (severity) => {
        if (severity === 'high') return <AlertOctagon className="w-5 h-5 text-red-500" />;
        if (severity === 'medium') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        return <Activity className="w-5 h-5 text-blue-500" />;
    };

    const filteredEvents = filter === 'all' ? events : events.filter(e => e.type.includes(filter));

    if (loading) return <div className="p-8 text-center text-slate-400 uppercase tracking-widest font-black">Loading Security Console...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <Shield className="text-indigo-400" />
                        Security Operations Center
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">Biometric security monitoring & audit logs</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 bg-slate-900/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <Activity className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.total.toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Scans (All Time)</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 bg-slate-900/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.today.toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Successful Scans Today</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-900/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <AlertOctagon className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-red-400">{stats.alerts}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-1">Active Security Alerts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Anomalies Panel */}
                <div className="xl:col-span-1 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <EyeOff className="w-4 h-4" /> Detected Anomalies
                    </h2>
                    
                    <div className="space-y-4">
                        {anomalies.map(anomaly => (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={anomaly.id} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${anomaly.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(anomaly.severity)}
                                        <span className="font-bold text-slate-200 uppercase text-xs tracking-wider">{anomaly.type.replace('_', ' ')}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{anomaly.time}</span>
                                </div>
                                <p className="text-sm text-slate-400 pl-2 mb-2">{anomaly.detail}</p>
                                <div className="pl-2 flex items-center gap-2 text-xs text-slate-500">
                                    <Server className="w-3 h-3" /> {anomaly.location}
                                </div>
                            </motion.div>
                        ))}
                        {anomalies.length === 0 && (
                            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                                No recent anomalies detected. System is secure.
                            </div>
                        )}
                    </div>
                </div>

                {/* Event Log Table */}
                <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden flex flex-col h-[600px]">
                    <div className="p-6 border-b border-slate-700/50 flex flex-wrap justify-between items-center gap-4">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Global Audit Log
                        </h2>
                        
                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
                            <Filter className="w-4 h-4 text-slate-500 ml-2" />
                            <select 
                                className="bg-transparent text-sm text-slate-300 outline-none p-2"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Events</option>
                                <option value="success">Success / Granted</option>
                                <option value="denied">Failed / Denied</option>
                                <option value="anomaly">Anomalies</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-700/50">Time</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-700/50">Event Type</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-700/50">User / Subject</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-700/50">Location</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-700/50 text-right">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {filteredEvents.map(event => (
                                    <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(event.time).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getEventColor(event.type)}`}>
                                                {event.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-slate-200">
                                            {event.user}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {event.location}
                                        </td>
                                        <td className="p-4 text-sm text-right font-mono text-slate-300">
                                            {(event.confidence * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredEvents.length === 0 && (
                            <div className="text-center py-12 text-slate-500 italic">No events match the current filter.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
