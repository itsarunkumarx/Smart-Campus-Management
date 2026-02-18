import { useState, useEffect, useRef } from 'react';
import {
    Bot,
    Send,
    Sparkles,
    Trash2,
    RefreshCcw,
    Volume2,
    Copy,
    MessageSquare,
    BookOpen,
    Zap,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { systemService } from '../../services/systemService';

export const AIAssistant = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Greetings, ${user?.name}. I am the Prince College Neural Assistant. How may I assist your academic journey today?`, mode: 'Academic' }
    ]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('Academic');
    const [loading, setLoading] = useState(false);
    const [systemSettings, setSystemSettings] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchSystemSettings();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchSystemSettings = async () => {
        try {
            const data = await systemService.getSettings();
            setSystemSettings(data);
            if (data.aiTone) setMode(data.aiTone);
        } catch (error) {
            console.error('Failed to fetch AI settings');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input, mode };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Crucial for cookie-based auth
                body: JSON.stringify({ query: input, mode })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response, mode }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I am experiencing a neural link interruption. Please check your institutional credentials.", mode }]);
            }
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sync failed. Institutional gateway is offline.", mode }]);
        } finally {
            setLoading(false);
        }
    };


    const clearChat = () => {
        if (window.confirm('Wipe session memory?')) {
            setMessages([messages[0]]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Bot size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Neural Assistant</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="text-amber-500" /> Active Layer: {systemSettings?.aiEnabled ? 'Stable' : 'Offline'}
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
                    {[
                        { id: 'Academic', icon: <BookOpen size={14} /> },
                        { id: 'Casual', icon: <MessageSquare size={14} /> },
                        { id: 'Professional', icon: <Zap size={14} /> }
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m.id
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {m.icon} {m.id}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 glass-card border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden relative shadow-2xl">
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600'
                                        }`}>
                                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className={`p-5 rounded-2xl text-sm font-medium leading-relaxed relative ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                            {msg.role === 'assistant' && (
                                                <div className="absolute -bottom-8 left-0 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-gray-400 hover:text-indigo-600 transition-colors"><Copy size={12} /></button>
                                                    <button className="text-gray-400 hover:text-indigo-600 transition-colors"><Volume2 size={12} /></button>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            {msg.mode} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 animate-pulse">
                                    <Bot size={20} />
                                </div>
                                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 flex gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSend} className="relative flex items-center gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-6 pr-14 text-sm font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
                                placeholder={`Ask me something in ${mode} mode...`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-300">
                                <Sparkles size={18} className="animate-pulse" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={clearChat}
                                className="p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-gray-400 rounded-2xl hover:text-rose-500 hover:border-rose-100 transition-all"
                            >
                                <Trash2 size={24} />
                            </button>
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </form>
                    <p className="text-[8px] text-center mt-4 font-black uppercase tracking-widest text-gray-400">
                        Institutional AI may produce inaccurate results. Verify critical academic data.
                    </p>
                </div>

                {mode === 'Academic' && (
                    <div className="hidden lg:block absolute right-6 top-6 w-48 space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Sparkles size={12} /> Suggestions
                            </h4>
                            <div className="space-y-2">
                                <button className="text-[9px] font-bold text-gray-500 hover:text-indigo-600 block text-left">Internal Marks threshold?</button>
                                <button className="text-[9px] font-bold text-gray-500 hover:text-indigo-600 block text-left">Exam schedule winter 2026?</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
