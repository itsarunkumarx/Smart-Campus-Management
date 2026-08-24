import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Play, Pause } from 'lucide-react';
import { FaceCamera } from '../../components/face/FaceCamera';
import faceService from '../../services/faceService';

const mockSubjects = [
    { id: 'CS101', name: 'Introduction to Computer Science' },
    { id: 'MA201', name: 'Advanced Calculus' },
    { id: 'PH301', name: 'Quantum Physics' }
];

export const FaceAttendance = () => {
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isScanning, setIsScanning] = useState(false);
    const [recognizedStudents, setRecognizedStudents] = useState([]);
    const [unrecognizedCount, setUnrecognizedCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);

    const handleFaceCapture = (embedding, livenessScore) => {
        // In a real implementation, we'd probably want to buffer these or send to backend incrementally
        // For this UI simulation, we just store the embeddings locally until submission
        const newStudent = {
            id: Date.now().toString(),
            embedding,
            livenessScore,
            timestamp: new Date().toLocaleTimeString(),
            status: 'scanned' // Will change to 'recognized' after API verification if done live, but here we submit in batch
        };

        setRecognizedStudents(prev => [newStudent, ...prev].slice(0, 50)); // Keep last 50
    };

    const toggleScanning = () => {
        setIsScanning(!isScanning);
        if (!isScanning) {
            setSubmitResult(null); // Clear previous results
        }
    };

    const submitAttendance = async () => {
        if (recognizedStudents.length === 0) return;
        
        try {
            setIsSubmitting(true);
            setIsScanning(false);
            
            const data = {
                embeddings: recognizedStudents.map(s => s.embedding),
                livenessScores: recognizedStudents.map(s => s.livenessScore),
                subject,
                date
            };
            
            const result = await faceService.faceAttendance(data);
            setSubmitResult(result);
            setRecognizedStudents([]); // Clear queue after success
        } catch (error) {
            setSubmitResult({ error: error.message || 'Failed to submit attendance' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                    <Users className="text-indigo-400" />
                    AI Face Attendance
                </h1>
                <a href="/faculty/attendance" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold uppercase tracking-wider underline underline-offset-4">
                    Switch to Manual
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls and Camera Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 rounded-2xl flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject</label>
                            <select 
                                className="input w-full bg-slate-900 border-slate-700 text-white"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={isScanning}
                            >
                                <option value="">Select Subject...</option>
                                {mockSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="input w-full pl-10 bg-slate-900 border-slate-700 text-white"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    disabled={isScanning}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={toggleScanning}
                            disabled={!subject}
                            className={`btn ${isScanning ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'btn-primary'} px-8 h-[42px] flex items-center gap-2 disabled:opacity-50`}
                        >
                            {isScanning ? <><Pause className="w-4 h-4" /> Stop Scanning</> : <><Play className="w-4 h-4" /> Start Scanning</>}
                        </button>
                    </div>

                    <div className="glass-card p-6 rounded-2xl min-h-[400px] flex flex-col relative overflow-hidden">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Live Camera Feed</h2>
                        
                        <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                            {isScanning ? (
                                <FaceCamera 
                                    mode="attendance" 
                                    continuous={true} 
                                    autoCapture={true} 
                                    showControls={false}
                                    onCapture={handleFaceCapture}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="text-center text-slate-500 flex flex-col items-center">
                                    <Users className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="uppercase tracking-widest font-black text-sm">Camera Offline</p>
                                    <p className="text-xs mt-2">Select a subject and start scanning</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan Session</h2>
                            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-black px-2 py-1 rounded">
                                {recognizedStudents.length} Scanned
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 max-h-[400px]">
                            <AnimatePresence>
                                {recognizedStudents.length === 0 && !submitResult ? (
                                    <div className="text-center text-slate-500 text-sm py-8 italic">
                                        Waiting for faces...
                                    </div>
                                ) : (
                                    recognizedStudents.map((student) => (
                                        <motion.div 
                                            key={student.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">Face Captured</p>
                                                    <p className="text-xs text-slate-400">{student.timestamp} • Liveness: {(student.livenessScore * 100).toFixed(0)}%</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {submitResult && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl border ${submitResult.error ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                {submitResult.error ? (
                                    <p className="text-red-400 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {submitResult.error}</p>
                                ) : (
                                    <div>
                                        <p className="text-emerald-400 text-sm font-bold flex gap-2 mb-2"><CheckCircle2 className="w-4 h-4" /> Sync Complete</p>
                                        <p className="text-slate-300 text-xs">Marked: {submitResult.marked || 0}</p>
                                        <p className="text-slate-400 text-xs">Unknown: {submitResult.unknown || 0}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <button 
                            onClick={submitAttendance}
                            disabled={recognizedStudents.length === 0 || isSubmitting || isScanning}
                            className="w-full btn btn-primary py-3 rounded-lg font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><ArrowRight className="w-4 h-4" /> Submit Records</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
