import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, CheckCircle, AlertCircle, ArrowRight, SkipForward } from 'lucide-react';
import { FaceCamera } from './FaceCamera';
import faceService from '../../services/faceService';

export const FaceRegistration = ({ onComplete, onSkip, userId }) => {
    const [step, setStep] = useState(1); // 1: instructions, 2: capture, 3: success/error
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleCapture = async (embedding) => {
        try {
            setStep(3);
            setIsRegistering(true);
            await faceService.registerFace(embedding);
            
            setIsRegistering(false);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 2000);
        } catch (err) {
            setIsRegistering(false);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto glass-card rounded-2xl border border-slate-700/50 overflow-hidden bg-slate-900/80 shadow-xl">
            <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 text-indigo-400 border-b border-slate-700/50 pb-4">
                    <ScanFace className="w-8 h-8" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Register Your Face</h2>
                </div>

                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className="text-slate-300 mb-6">
                            Register your face for quick login, attendance tracking, and campus access. 
                            This process is secure and your biometric data is encrypted.
                        </p>
                        
                        <div className="bg-slate-800/50 rounded-lg p-4 mb-8">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold-metallic mb-3">Registration Tips</h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Look directly at the camera</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Ensure good lighting on your face</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Remove dark glasses or hats</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <button 
                                onClick={onSkip}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2"
                            >
                                <SkipForward className="w-4 h-4" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Skip for now</span>
                            </button>
                            <button 
                                onClick={() => setStep(2)}
                                className="btn btn-primary flex items-center gap-2 px-6 py-2 rounded-lg"
                            >
                                <span>Start Registration</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-4 italic">
                            You can always register your face later from your profile settings.
                        </p>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                            Position your face inside the guide and click capture
                        </p>
                        
                        <div className="rounded-xl overflow-hidden shadow-2xl bg-black">
                            <FaceCamera 
                                mode="register"
                                onCapture={handleCapture}
                                showControls={true}
                            />
                        </div>
                        
                        <button 
                            onClick={() => setStep(1)}
                            className="mt-6 text-slate-400 hover:text-white text-sm uppercase tracking-wide block mx-auto"
                        >
                            Back to Instructions
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                        {isRegistering ? (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                                <h3 className="text-xl font-black uppercase tracking-wider text-indigo-400">Registering...</h3>
                                <p className="text-slate-400 text-sm mt-2">Processing your biometric data</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center bg-red-900/20 p-6 rounded-xl border border-red-900/50">
                                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                                <h3 className="text-xl font-bold text-red-400 mb-2">Registration Failed</h3>
                                <p className="text-slate-300 mb-6">{error}</p>
                                <button 
                                    onClick={() => { setError(''); setStep(2); }}
                                    className="btn bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wide"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"
                                >
                                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                                </motion.div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-emerald-400 mb-2">Success!</h3>
                                <p className="text-slate-300">Your face has been securely registered.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};
