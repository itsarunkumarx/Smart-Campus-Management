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

export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchTasks();
    }, []);

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
            setFormData({ title: '', description: '', deadline: '', priority: 'medium' });
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
        </div>
    );
};
