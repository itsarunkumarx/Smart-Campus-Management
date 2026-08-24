import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { FaceCamera } from '../../components/face/FaceCamera';
import faceService from '../../services/faceService';

const locations = [
    { id: 'lab', name: 'Computer Lab', icon: '💻', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    { id: 'library', name: 'Library', icon: '📚', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
    { id: 'server_room', name: 'Server Room', icon: '🖥️', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
    { id: 'faculty_lounge', name: 'Faculty Lounge', icon: '☕', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50' },
];

export const AccessControlPage = () => {
    const [selectedLocation, setSelectedLocation] = useState(locations[0]);
    const [accessResult, setAccessResult] = useState(null); // { status: 'granted'|'denied', message: string, user: string }
    const [isVerifying, setIsVerifying] = useState(false);
    const [history, setHistory] = useState([]);

    const handleAccessRequest = async (embedding, livenessScore) => {
        setIsVerifying(true);
        setAccessResult(null);

        try {
            const result = await faceService.verifyAccess({
                embedding,
                location: selectedLocation.id,
                livenessScore
            });

            const newResult = {
                status: 'granted',
                message: 'Access Granted',
                user: result.user?.name || 'Verified User',
                time: new Date().toLocaleTimeString()
            };
            setAccessResult(newResult);
            addToHistory(newResult);
        } catch (error) {
            const newResult = {
                status: 'denied',
                message: error.response?.data?.message || 'Access Denied: Unauthorized',
                user: 'Unknown',
                time: new Date().toLocaleTimeString()
            };
            setAccessResult(newResult);
            addToHistory(newResult);
        } finally {
            setIsVerifying(false);
            // Clear result after a few seconds to ready for next scan
            setTimeout(() => setAccessResult(null), 4000);
        }
    };

    const addToHistory = (result) => {
        setHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                <Shield className="text-indigo-400" />
                Access Control
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Locations Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Select Checkpoint</h2>
                    <div className="flex flex-col gap-3">
                        {locations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => { setSelectedLocation(loc); setAccessResult(null); }}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    selectedLocation.id === loc.id 
                                    ? `bg-slate-800 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]` 
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                <div className="text-2xl mb-2">{loc.icon}</div>
                                <div className="font-bold text-slate-200">{loc.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Access Terminal */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card p-6 md:p-10 rounded-3xl border border-slate-700/50 overflow-hidden relative min-h-[500px] flex flex-col items-center bg-slate-900">
                        {/* Status Header */}
                        <div className="w-full flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-slate-400" />
                                <span className="font-bold text-lg text-white">{selectedLocation.name} Checkpoint</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Online</span>
                            </div>
                        </div>

                        {/* Scanner / Result Area */}
                        <div className="w-full max-w-2xl relative">
                            <AnimatePresence mode="wait">
                                {!accessResult && !isVerifying && (
                                    <motion.div 
                                        key="camera"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-slate-800"
                                    >
                                        <FaceCamera 
                                            mode="access"
                                            autoCapture={true}
                                            continuous={true}
                                            showControls={false}
                                            onCapture={handleAccessRequest}
                                        />
                                    </motion.div>
                                )}

                                {isVerifying && (
                                    <motion.div 
                                        key="verifying"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-20 bg-slate-800/50 rounded-2xl border border-indigo-500/30"
                                    >
                                        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
                                        <h3 className="text-xl font-black uppercase tracking-widest text-indigo-400">Verifying Identity...</h3>
                                    </motion.div>
                                )}

                                {accessResult && (
                                    <motion.div 
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`flex flex-col items-center justify-center py-16 rounded-2xl border-2 ${
                                            accessResult.status === 'granted' 
                                            ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                                            : 'bg-red-900/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                                        }`}
                                    >
                                        {accessResult.status === 'granted' ? (
                                            <CheckCircle className="w-24 h-24 text-emerald-500 mb-6" />
                                        ) : (
                                            <XCircle className="w-24 h-24 text-red-500 mb-6" />
                                        )}
                                        
                                        <h2 className={`text-4xl font-black uppercase tracking-tighter mb-2 ${
                                            accessResult.status === 'granted' ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                            {accessResult.message}
                                        </h2>
                                        <p className="text-slate-300 text-lg">{accessResult.user}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Recent History Table */}
                    <div className="glass-card p-6 rounded-2xl">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Live Terminal Log
                        </h2>
                        
                        <div className="space-y-2">
                            {history.length === 0 ? (
                                <p className="text-slate-500 text-sm py-4 italic">Waiting for terminal activity...</p>
                            ) : (
                                history.map((entry, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                                        <div className="flex items-center gap-4">
                                            {entry.status === 'granted' ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">{entry.user}</p>
                                                <p className="text-xs text-slate-400">{entry.message}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-slate-500">{entry.time}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
