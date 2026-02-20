import { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import {
    Clock,
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    Calendar,
    Filter,
    CircleArrowUp,
    CircleArrowDown,
    CircleMinus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RINGTONES, playRingtone } from '../../utils/audioUtils';
import { Bell, BellOff, Music, Volume2 } from 'lucide-react';

export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        alarmSound: 'digital_alarm',
        isAlarmEnabled: true
    });

    const [activeAlarm, setActiveAlarm] = useState(null);
    const [audioInstance, setAudioInstance] = useState(null);
    const [triggeredAlarms, setTriggeredAlarms] = useState(new Set());

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const interval = setInterval(checkAlarms, 1000);
        return () => clearInterval(interval);
    }, [tasks, triggeredAlarms]);

    const checkAlarms = () => {
        const now = new Date();
        tasks.forEach(task => {
            if (
                task.status !== 'completed' &&
                task.isAlarmEnabled &&
                !task.notified &&
                !triggeredAlarms.has(task._id)
            ) {
                const deadline = new Date(task.deadline);
                // Trigger if within the last minute and not triggered yet
                if (deadline <= now && deadline > new Date(now.getTime() - 60000)) {
                    triggerAlarm(task);
                }
            }
        });
    };

    const triggerAlarm = async (task) => {
        setTriggeredAlarms(prev => new Set(prev).add(task._id));
        setActiveAlarm(task);

        // Update local state to reflect notification
        setTasks(prevTasks => prevTasks.map(t =>
            t._id === task._id ? { ...t, notified: true } : t
        ));

        // Persist notified status to backend immediately
        try {
            await taskService.updateTask(task._id, { notified: true });
        } catch (error) {
            console.error('Failed to update notification status:', error);
        }

        const audio = playRingtone(task.alarmSound);
        audio.loop = true;
        setAudioInstance(audio);
    };

    const stopAlarm = () => {
        if (audioInstance) {
            audioInstance.pause();
            audioInstance.currentTime = 0;
            setAudioInstance(null);
        }
        setActiveAlarm(null);
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const newTask = await taskService.createTask(formData);
            setTasks([newTask, ...tasks]);
            setIsAdding(false);
            setFormData({
                title: '',
                description: '',
                deadline: '',
                priority: 'medium',
                alarmSound: 'digital_alarm',
                isAlarmEnabled: true
            });
        } catch (error) {
            alert('Failed to create task');
        }
    };

    const handleToggleComplete = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            const updated = await taskService.updateTask(task._id, { status: newStatus });
            setTasks(tasks.map(t => t._id === task._id ? updated : t));
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.deleteTask(id);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return <CircleArrowUp className="text-rose-500" size={18} />;
            case 'medium': return <CircleMinus className="text-amber-500" size={18} />;
            case 'low': return <CircleArrowDown className="text-emerald-500" size={18} />;
            default: return null;
        }
    };


    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Tasks & Reminders</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold text-xs uppercase tracking-widest">
                        Manage your academic and personal schedules
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-primary flex items-center gap-2 px-6"
                >
                    <Plus size={20} />
                    <span>New Task</span>
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-6 border-indigo-500/20"
                    >
                        <form onSubmit={handleCreateTask} className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Task Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Complete OS Assignment"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description (Optional)</label>
                                <textarea
                                    className="input min-h-[100px]"
                                    placeholder="Add details about your task..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Deadline</label>
                                <input
                                    type="datetime-local"
                                    className="input"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                                <select
                                    className="input"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ringtone</label>
                                <div className="flex gap-2">
                                    <select
                                        className="input flex-1"
                                        value={formData.alarmSound}
                                        onChange={(e) => setFormData({ ...formData, alarmSound: e.target.value })}
                                    >
                                        {RINGTONES.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => playRingtone(formData.alarmSound)}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title="Test Sound"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Enable Alarm</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isAlarmEnabled: !formData.isAlarmEnabled })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isAlarmEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isAlarmEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-gray-500 font-bold uppercase tracking-widest text-xs">Cancel</button>
                                <button type="submit" className="btn btn-primary px-8">Save Task</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="glass-card h-24 animate-pulse rounded-3xl" />)
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <motion.div
                            key={task._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`glass-card p-5 group flex items-center justify-between transition-all ${task.status === 'completed' ? 'opacity-60 bg-gray-50 dark:bg-slate-900 border-gray-200' : 'border-slate-100 dark:border-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <button
                                    onClick={() => handleToggleComplete(task)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${task.status === 'completed'
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    <CheckCircle size={24} />
                                </button>
                                <div>
                                    <h3 className={`font-black uppercase tracking-tight ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                        {task.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <Calendar size={12} className="text-indigo-500" />
                                            {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            {getPriorityIcon(task.priority)}
                                            {task.priority}
                                        </p>
                                        {new Date(task.deadline) < new Date() && task.status !== 'completed' && (
                                            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                                                <AlertCircle size={10} /> Overdue
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="p-3 text-gray-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="glass-card border-dashed py-16 text-center">
                        <Clock className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-gray-400 font-black uppercase tracking-widest text-lg">No Tasks Found</h3>
                        <p className="text-xs text-gray-300 mt-2 uppercase tracking-tighter">Your schedule is currently clear. Add a new task to get started!</p>
                    </div>
                )}
            </div>

            {/* Alarm Modal */}
            <AnimatePresence>
                {activeAlarm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl border-4 border-indigo-600 animate-bounce-subtle"
                        >
                            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-600/40 relative">
                                <Bell className="text-white animate-wiggle" size={48} />
                                <div className="absolute inset-0 rounded-full border-4 border-white animate-ping" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic text-gray-900 dark:text-white">Time's Up!</h2>
                            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-6">{activeAlarm.title}</p>
                            <div className="space-y-4">
                                <button
                                    onClick={stopAlarm}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Dismiss Alarm
                                </button>
                                <button
                                    onClick={() => {
                                        handleToggleComplete(activeAlarm);
                                        stopAlarm();
                                    }}
                                    className="w-full py-5 border-2 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                >
                                    Mark as Completed
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
