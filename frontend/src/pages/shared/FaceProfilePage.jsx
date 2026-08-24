import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, Shield, Clock, Trash2, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import faceService from '../../services/faceService';
import { FaceCamera } from '../../components/face/FaceCamera';

export const FaceProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureMode, setCaptureMode] = useState('register'); // 'register' or 'update'

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileData, logsData] = await Promise.all([
                faceService.getFaceProfile(),
                faceService.getMyAccessLogs()
            ]);
            setProfile(profileData);
            setLogs(logsData.logs || []);
        } catch (err) {
            setError('Failed to load profile data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleCapture = async (embedding) => {
        try {
            if (captureMode === 'register') {
                await faceService.registerFace(embedding);
            } else {
                await faceService.updateFace(embedding);
            }
            setIsCapturing(false);
            fetchProfileData();
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your face data? You will lose access to face login.')) {
            try {
                await faceService.deleteFace();
                fetchProfileData();
            } catch (err) {
                alert('Failed to delete face data');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400 uppercase tracking-widest font-black">Loading Profile...</div>;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                <ScanFace className="text-indigo-400" />
                Face Profile
            </h1>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle /> {error}
                </div>
            )}

            {isCapturing ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
                    <h2 className="text-xl font-black uppercase tracking-tight text-white mb-6">
                        {captureMode === 'register' ? 'Register Face' : 'Update Face'}
                    </h2>
                    <div className="max-w-2xl mx-auto bg-black rounded-xl overflow-hidden">
                        <FaceCamera mode="register" onCapture={handleCapture} />
                    </div>
                    <div className="mt-6 text-center">
                        <button onClick={() => setIsCapturing(false)} className="text-slate-400 hover:text-white uppercase tracking-wider text-sm">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl md:col-span-1">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Registration Status
                        </h2>
                        
                        <div className="flex flex-col items-center text-center py-6">
                            {profile?.registered ? (
                                <>
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">Active</h3>
                                    <p className="text-sm text-slate-400 mb-6">Your face is registered and ready to use.</p>
                                    
                                    <div className="w-full space-y-3">
                                        <button 
                                            onClick={() => { setCaptureMode('update'); setIsCapturing(true); }}
                                            className="w-full btn btn-primary py-2 rounded-lg text-sm flex justify-center items-center gap-2"
                                        >
                                            <Camera className="w-4 h-4" /> Update Face
                                        </button>
                                        <button 
                                            onClick={handleDelete}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" /> Remove Face
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                                        <ScanFace className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-300 mb-1">Not Registered</h3>
                                    <p className="text-sm text-slate-400 mb-6">Register your face to enable quick login.</p>
                                    
                                    <button 
                                        onClick={() => { setCaptureMode('register'); setIsCapturing(true); }}
                                        className="w-full btn btn-primary py-2 rounded-lg text-sm flex justify-center items-center gap-2"
                                    >
                                        <Camera className="w-4 h-4" /> Register Now
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {profile?.registered && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                                <p>Model: {profile.modelVersion || 'v1.0'}</p>
                                <p>Last Updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Recent Access History */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl md:col-span-2">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Recent Access Activity
                        </h2>

                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 italic">
                                    No recent access activity found.
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${log.status === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {log.status === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-200">{log.location}</h4>
                                                <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded ${log.status === 'granted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
