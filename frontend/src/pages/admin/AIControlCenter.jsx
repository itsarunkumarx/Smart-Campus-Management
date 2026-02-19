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
    Loader2,
    Database,
    Trash2,
    Plus,
    X,
    Upload,
    FileJson,
    Edit2,
    Check
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AIControlCenter = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [knowledge, setKnowledge] = useState([]);
    const [newFact, setNewFact] = useState({ category: 'general', content: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
        fetchKnowledge();
    }, []);

    const fetchKnowledge = async () => {
        try {
            const data = await systemService.getKnowledge();
            setKnowledge(data);
        } catch (error) {
            console.error('Failed to fetch knowledge:', error);
        }
    };

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
            // Merge nested AI settings if AI fields are being updated
            const newSettings = { ...settings };
            if (updatedFields.ai) {
                newSettings.ai = { ...newSettings.ai, ...updatedFields.ai };
            } else {
                Object.assign(newSettings, updatedFields);
            }

            const data = await systemService.updateSettings(newSettings);
            setSettings(data);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleImportKnowledge = async () => {
        if (!newFact.content.trim()) return;
        setSaving(true);
        try {
            await systemService.importKnowledge([newFact]);
            setNewFact({ category: 'general', content: '' });
            fetchKnowledge();
            setMessage('Knowledge base synchronized!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Knowledge injection failed');
        } finally {
            setSaving(false);
        }
    };

    const handleFileImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const items = JSON.parse(event.target.result);
                if (!Array.isArray(items)) throw new Error('Invalid JSON format: Array expected.');

                setSaving(true);
                await systemService.importKnowledge(items);
                fetchKnowledge();
                setMessage('Neural archive batch synchronized!');
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                alert('Batch ingestion failed: ' + error.message);
            } finally {
                setSaving(false);
            }
        };
        reader.readAsText(file);
    };

    const handleUpdateKnowledge = async (id) => {
        setSaving(true);
        try {
            await systemService.updateKnowledge(id, editForm);
            setEditingId(null);
            fetchKnowledge();
            setMessage('Neural node refined!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Refinement failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteKnowledge = async (id) => {
        if (!confirm('Permanent purge of this neural node?')) return;
        try {
            await systemService.deleteKnowledge(id);
            fetchKnowledge();
        } catch (error) {
            alert('Purge failed');
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
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${settings.ai?.isEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                        }`}>
                        <Cpu size={32} className={settings.ai?.isEnabled ? 'animate-pulse' : ''} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Global AI Engine</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 italic leading-relaxed">
                        {settings.ai?.isEnabled ? 'Neural processing is active across all institutional nodes.' : 'AI services are currently suspended.'}
                    </p>

                    <button
                        onClick={() => handleUpdate({ ai: { isEnabled: !settings.ai.isEnabled } })}
                        className={`mt-6 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${settings.ai?.isEnabled ? 'text-emerald-500' : 'text-gray-400'
                            }`}
                    >
                        {settings.ai?.isEnabled ? <><ToggleRight size={32} /> Active</> : <><ToggleLeft size={32} /> Inactive</>}
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
                        {['academic', 'casual', 'professional'].map((tone) => (
                            <button
                                key={tone}
                                onClick={() => handleUpdate({ ai: { defaultTone: tone } })}
                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${settings.ai?.defaultTone === tone
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
                                <span className="text-xl font-black italic">{settings.ai?.usageLimitPerUser} Queries</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="200"
                                step="10"
                                className="w-full accent-indigo-600"
                                value={settings.ai?.usageLimitPerUser || 50}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    ai: { ...settings.ai, usageLimitPerUser: parseInt(e.target.value) }
                                })}
                                onMouseUp={() => handleUpdate({ ai: { usageLimitPerUser: settings.ai.usageLimitPerUser } })}
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

                {/* Neural Knowledge Archive */}
                <div className="md:col-span-3 glass-card p-10 border-slate-100 dark:border-slate-800 space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/10 rounded-2xl flex items-center justify-center text-sky-500">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tighter italic">Neural Knowledge Archive</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Inject institutional context to train neural links</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <label className="h-12 px-6 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                                <FileJson size={14} className="text-indigo-500" />
                                Import JSON
                                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Quick Inject */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 pl-2">Fact Classification</label>
                                <select
                                    value={newFact.category}
                                    onChange={(e) => setNewFact({ ...newFact, category: e.target.value })}
                                    className="w-full h-14 bg-white dark:bg-slate-800 rounded-2xl px-6 font-bold text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-800 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="institutional">Institutional Core</option>
                                    <option value="academic">Academic Protocol</option>
                                    <option value="scholarship">Financial Support</option>
                                    <option value="financial">Fee Structure</option>
                                    <option value="support">Help Desk & IT</option>
                                    <option value="policy">Governance Policy</option>
                                    <option value="general">Global Fact</option>
                                </select>
                            </div>
                            <div className="md:w-2/3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 pl-2">Neural Data Ingestion</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newFact.content}
                                        onChange={(e) => setNewFact({ ...newFact, content: e.target.value })}
                                        placeholder="e.g. 'Institutional Fee Deadline is the 15th of every semester month.'"
                                        className="flex-1 h-14 bg-white dark:bg-slate-800 rounded-2xl px-6 font-bold text-xs border border-slate-100 dark:border-slate-800 outline-none focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                    <button
                                        onClick={handleImportKnowledge}
                                        disabled={saving || !newFact.content}
                                        className="h-14 aspect-square bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Knowledge List */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {knowledge.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Neutral Data Core is Empty. Begin Ingestion.</p>
                            </div>
                        ) : (
                            knowledge.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={item._id}
                                    className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800 hover:border-sky-400/30 transition-all group gap-6"
                                >
                                    {editingId === item._id ? (
                                        <div className="space-y-4 w-full">
                                            <div className="flex gap-4">
                                                <select
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                    className="w-40 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 font-bold text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-800"
                                                >
                                                    <option value="institutional">Institutional Core</option>
                                                    <option value="academic">Academic Protocol</option>
                                                    <option value="scholarship">Financial Support</option>
                                                    <option value="financial">Fee Structure</option>
                                                    <option value="support">Help Desk & IT</option>
                                                    <option value="policy">Governance Policy</option>
                                                    <option value="general">Global Fact</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={editForm.content}
                                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                                    className="flex-1 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 font-bold text-xs border border-slate-100 dark:border-slate-800"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateKnowledge(item._id)}
                                                    className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2"
                                                >
                                                    <Check size={12} /> Save Refinement
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between w-full gap-6">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[8px] font-black uppercase tracking-widest bg-sky-50 dark:bg-sky-900/30 text-sky-500 px-3 py-1 rounded-lg border border-sky-100 dark:border-sky-800/50">
                                                        {item.category}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-gray-300 uppercase italic">
                                                        Archived by {item.createdBy?.name} • {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                                    {item.content}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(item._id);
                                                        setEditForm({ category: item.category, content: item.content });
                                                    }}
                                                    className="p-3 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKnowledge(item._id)}
                                                    className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
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
