import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { FaceCamera } from './FaceCamera';
import { useAuth } from '../../hooks/useAuth';

export const FaceLoginModal = ({ isOpen, onClose, onSuccess }) => {
    const { faceLogin } = useAuth();
    const [loginState, setLoginState] = useState('idle'); // idle, recognizing, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [userName, setUserName] = useState('');

    const handleCapture = async (embedding, livenessScore) => {
        try {
            setLoginState('recognizing');
            const data = await faceLogin(embedding, livenessScore);
            
            setUserName(data.name || data.user?.name || 'User');
            setLoginState('success');
            
            setTimeout(() => {
                if (onSuccess) onSuccess(data);
            }, 1500);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Face not recognized. Please try again or use password login.');
            setLoginState('error');
        }
    };

    const handleRetry = () => {
        setLoginState('idle');
        setErrorMessage('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="glass-card relative w-full max-w-lg overflow-hidden bg-slate-900 shadow-2xl border border-slate-700 rounded-2xl"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-6 md:p-8 flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-2 text-gold-metallic">
                                <ScanFace className="w-8 h-8" />
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Face Login</h2>
                            </div>
                            
                            <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest font-black text-[10px]">
                                Position your face in the guide
                            </p>

                            <div className="w-full relative rounded-xl overflow-hidden shadow-inner bg-black">
                                {loginState === 'idle' && (
                                    <FaceCamera 
                                        mode="login" 
                                        autoCapture={true} 
                                        showControls={false} 
                                        onCapture={handleCapture}
                                    />
                                )}
                                
                                {loginState === 'recognizing' && (
                                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-slate-800">
                                        <div className="relative w-24 h-24 mb-4">
                                            <ScanFace className="w-24 h-24 text-gold-metallic opacity-20" />
                                            <motion.div 
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute left-0 w-full h-1 bg-gold-metallic shadow-[0_0_10px_rgba(234,179,8,0.8)]"
                                            />
                                        </div>
                                        <p className="text-gold-metallic font-bold uppercase tracking-wider">Recognizing...</p>
                                    </div>
                                )}

                                {loginState === 'success' && (
                                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-emerald-900/20">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4"
                                        >
                                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                        </motion.div>
                                        <h3 className="text-emerald-400 font-bold text-xl mb-1">Welcome back, {userName}!</h3>
                                        <p className="text-slate-300 text-sm">Logging you in...</p>
                                    </div>
                                )}

                                {loginState === 'error' && (
                                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-red-950/40 p-6 text-center border border-red-800/40 rounded-xl">
                                        <AlertCircle className="w-14 h-14 text-red-500 mb-3 animate-bounce" />
                                        <h3 className="text-red-400 font-black text-lg uppercase tracking-tight mb-2">
                                            {errorMessage.includes('not registered') ? 'Unregistered Face Detected' : 'Recognition Failed'}
                                        </h3>
                                        <p className="text-slate-300 text-xs mb-6 max-w-sm leading-relaxed">{errorMessage}</p>
                                        
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleRetry}
                                                className="btn bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs border border-slate-700"
                                            >
                                                Try Again
                                            </button>
                                            <button 
                                                onClick={() => { onClose(); window.location.href = '/register'; }}
                                                className="btn bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-indigo-500/20"
                                            >
                                                Register Account
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                <button 
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-white transition-colors text-sm underline decoration-slate-600 underline-offset-4"
                                >
                                    Use Password Login Instead
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
