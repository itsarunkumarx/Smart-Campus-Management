import { useState, useEffect } from 'react';
import { systemService } from '../../services/systemService';
import {
    Cpu,
    ToggleLeft,
    ToggleRight,
    MessageSquare,
    Zap,
    ShieldCheck,
    History,
    Save,
    Settings,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AIControlCenter = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await systemService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (updatedFields) => {
        setSaving(true);
        try {
            const data = await systemService.updateSettings({ ...settings, ...updatedFields });
            setSettings(data);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Neural Core...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">AI Control Center</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" /> System-Wide Neural Management
                    </p>
                </div>
                {message && (
                    <motion.span
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl"
                    >
                        {message}
                    </motion.span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Global Status */}
                <div className="glass-card p-8 border-slate-100 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${settings.aiEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                        }`}>
                        <Cpu size={32} className={settings.aiEnabled ? 'animate-pulse' : ''} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Global AI Engine</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 italic leading-relaxed">
                        {settings.aiEnabled ? 'Neural processing is active across all institutional nodes.' : 'AI services are currently suspended.'}
                    </p>

                    <button
                        onClick={() => handleUpdate({ aiEnabled: !settings.aiEnabled })}
                        className={`mt-6 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${settings.aiEnabled ? 'text-emerald-500' : 'text-gray-400'
                            }`}
                    >
                        {settings.aiEnabled ? <><ToggleRight size={32} /> Active</> : <><ToggleLeft size={32} /> Inactive</>}
                    </button>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
                </div>

                {/* Tone Configuration */}
                <div className="md:col-span-2 glass-card p-8 border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-center justify-center text-indigo-600">
                            <MessageSquare size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Linguistic Behavior</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {['Academic', 'Casual', 'Professional'].map((tone) => (
                            <button
                                key={tone}
                                onClick={() => handleUpdate({ aiTone: tone })}
                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${settings.aiTone === tone
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20'
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-gray-400 hover:border-indigo-200'
                                    }`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">{tone}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resource Limits */}
                <div className="md:col-span-3 glass-card p-8 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/10 rounded-xl flex items-center justify-center text-amber-500">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Resource Allocation</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Usage Limit (Daily)</label>
                                <span className="text-xl font-black italic">{settings.dailyLimit} Queries</span>
                            </div>
                            <input
                                type="range"
                                min="1000"
                                max="10000"
                                step="500"
                                className="w-full accent-indigo-600"
                                value={settings.dailyLimit}
                                onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) })}
                                onMouseUp={() => handleUpdate({ dailyLimit: settings.dailyLimit })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">System Load</p>
                                <p className="text-2xl font-black italic text-indigo-600">Low</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Model Version</p>
                                <p className="text-2xl font-black italic text-sky-500">L3.1</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Logs Placeholder */}
                <div className="md:col-span-3 glass-card p-8 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-500">
                                <History size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Activity Audit Logs</h3>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 hover:underline">
                            Export Manifest <Settings size={12} />
                        </button>
                    </div>

                    <div className="space-y-4 font-mono">
                        {[
                            { action: 'Daily Limit Threshold Adjusted', user: 'Admin_Super', time: '2m ago' },
                            { action: 'AI Suspension Triggered (Maintenance)', user: 'System', time: '1h ago' },
                            { action: 'Behavioral Tone switched to Academic', user: 'Admin_Academic', time: '3h ago' },
                        ].map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <span className="text-indigo-500 font-black">{'>'}</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{log.action}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400 uppercase">USR: {log.user}</span>
                                    <span className="text-gray-300 dark:text-gray-600 italic">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
