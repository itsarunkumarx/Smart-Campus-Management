import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, ScanFace, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FaceCamera = ({
    onCapture,
    onError,
    mode = 'register',
    continuous = false,
    autoCapture = false,
    showControls = true,
    className = ''
}) => {
    const videoRef = useRef(null);
    const animationFrameId = useRef(null);
    const streamRef = useRef(null);
    const faceapiRef = useRef(null);
    const isCapturingRef = useRef(false);

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [modelError, setModelError] = useState(null);
    const [status, setStatus] = useState('Initializing camera...');
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectionQuality, setDetectionQuality] = useState('Poor');
    const [livenessStatus, setLivenessStatus] = useState('Checking...');
    const [cameraError, setCameraError] = useState(null);

    const cleanup = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const blinkDetectedRef = useRef(false);
    const earHistoryRef = useRef([]);
    const frameCountRef = useRef(0);
    const currentLivenessScoreRef = useRef(0.2);

    const calculateEAR = (landmarks) => {
        if (!landmarks || !landmarks.positions || landmarks.positions.length < 68) return 0.3;
        const p = landmarks.positions;
        const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

        const l1 = dist(p[37], p[41]);
        const l2 = dist(p[38], p[40]);
        const l3 = dist(p[36], p[39]);
        const leftEAR = l3 > 0 ? (l1 + l2) / (2.0 * l3) : 0.3;

        const r1 = dist(p[43], p[47]);
        const r2 = dist(p[44], p[46]);
        const r3 = dist(p[42], p[45]);
        const rightEAR = r3 > 0 ? (r1 + r2) / (2.0 * r3) : 0.3;

        return (leftEAR + rightEAR) / 2.0;
    };

    const captureFace = useCallback(async (existingDetection = null) => {
        if (!faceapiRef.current || !videoRef.current || isCapturingRef.current) return;

        const score = currentLivenessScoreRef.current;
        if (score < 0.70) {
            setStatus('⚠️ Blink your eyes to verify live person');
            return;
        }
        
        isCapturingRef.current = true;
        let detection = existingDetection;
        const faceapi = faceapiRef.current;

        try {
            if (!detection) {
                detection = await faceapi.detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 })
                ).withFaceLandmarks().withFaceDescriptor();
            }

            if (detection && onCapture) {
                const embeddingArray = Array.from(detection.descriptor);
                onCapture(embeddingArray, score);
            } else {
                setStatus('Could not capture. Ensure face is visible.');
                isCapturingRef.current = false;
            }
        } catch (err) {
            isCapturingRef.current = false;
        }
    }, [onCapture]);

    const detectFaces = useCallback(async () => {
        if (!videoRef.current || !faceapiRef.current || videoRef.current.paused || videoRef.current.ended) {
            animationFrameId.current = requestAnimationFrame(detectFaces);
            return;
        }

        if (videoRef.current.readyState < 2) {
            animationFrameId.current = requestAnimationFrame(detectFaces);
            return;
        }

        const faceapi = faceapiRef.current;

        try {
            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 })
            ).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                drawLandmarks(detection);
                const { width, height } = detection.detection.box;
                const ear = calculateEAR(detection.landmarks);

                earHistoryRef.current.push(ear);
                if (earHistoryRef.current.length > 20) {
                    earHistoryRef.current.shift();
                }

                // Check EAR blink pattern (min EAR < 0.20 and max EAR > 0.25)
                const minEar = Math.min(...earHistoryRef.current);
                const maxEar = Math.max(...earHistoryRef.current);

                if (minEar < 0.21 && maxEar > 0.25) {
                    blinkDetectedRef.current = true;
                    currentLivenessScoreRef.current = 0.95;
                }

                frameCountRef.current += 1;
                // Allow organic micro-movement fallback after 25 frames if EAR variance is non-zero
                if (frameCountRef.current > 25 && (maxEar - minEar) > 0.04) {
                    currentLivenessScoreRef.current = Math.max(currentLivenessScoreRef.current, 0.85);
                }

                const isLive = currentLivenessScoreRef.current >= 0.70;

                if (width < 60 || height < 60) {
                    setDetectionQuality('Poor');
                    setStatus('Move closer to the camera');
                    setLivenessStatus(isLive ? '✓ Passed' : 'Blink required');
                } else if (width > 390 || height > 390) {
                    setDetectionQuality('Poor');
                    setStatus('Move back slightly');
                    setLivenessStatus(isLive ? '✓ Passed' : 'Blink required');
                } else if (!isLive) {
                    setDetectionQuality('Good');
                    setStatus('👁️ Please BLINK your eyes to verify live person');
                    setLivenessStatus('Checking... (Blink eyes)');
                } else {
                    setDetectionQuality('Good');
                    setStatus('✓ Live Face Aligned');
                    setLivenessStatus('✓ Passed (Live Person)');

                    if (autoCapture && !isCapturingRef.current) {
                        if (!continuous) {
                            captureFace(detection);
                            return;
                        } else {
                            captureFace(detection);
                            await new Promise(r => setTimeout(r, 1200));
                            isCapturingRef.current = false;
                        }
                    }
                }
            } else {
                setStatus('No face detected. Center your face in the guide.');
                setDetectionQuality('Poor');
                setLivenessStatus('Checking...');
            }
        } catch (err) {
            // Continue frame loop
        }

        if (!isCapturingRef.current || continuous) {
            animationFrameId.current = requestAnimationFrame(detectFaces);
        }
    }, [autoCapture, continuous, captureFace]);

    useEffect(() => {
        let isMounted = true;

        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    }
                });
                if (!isMounted) return;
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                if (!isMounted) return;
                setCameraError('Camera access denied or no camera available.');
                if (onError) onError(err);
            }
        };

        const loadModels = async () => {
            try {
                setStatus('Loading AI models...');
                const faceapi = await import('face-api.js');
                faceapiRef.current = faceapi;
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1/model';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                if (!isMounted) return;
                setModelsLoaded(true);
                setStatus('Camera Ready');
                await initCamera();
            } catch (err) {
                if (!isMounted) return;
                setModelError('Failed to load AI models. Check internet connection.');
                if (onError) onError(err);
            }
        };

        loadModels();

        return () => {
            isMounted = false;
            cleanup();
        };
    }, [cleanup, onError]);

    const handleVideoPlay = () => {
        setIsDetecting(true);
        isCapturingRef.current = false;
        detectFaces();
    };

    const canvasRef = useRef(null);

    const drawLandmarks = (detection) => {
        if (!canvasRef.current || !videoRef.current || !detection) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        if (detection.landmarks && detection.landmarks.positions) {
            // Draw neon dots over landmarks
            ctx.fillStyle = '#34d399'; // Emerald dot
            for (const pt of detection.landmarks.positions) {
                ctx.beginPath();
                // Mirrored coordinates for scale-x-[-1]
                ctx.arc(width - pt.x, pt.y, 2, 0, 2 * Math.PI);
                ctx.fill();
            }

            // Draw bounding box
            const box = detection.detection.box;
            ctx.strokeStyle = '#38bdf8'; // Sky blue neon box
            ctx.lineWidth = 2;
            ctx.strokeRect(width - box.x - box.width, box.y, box.width, box.height);
        }
    };

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    return (
        <div className={`relative flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden ${className}`}>
            {!modelsLoaded && !modelError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-30 backdrop-blur-sm p-6 text-center">
                    <Loader2 className="w-10 h-10 text-gold-metallic animate-spin mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-slate-300">Initializing AI Neural Models...</p>
                    <p className="text-xs text-slate-400 mt-2">Loading 68-Point Facial Landmark Tensor</p>
                </div>
            )}

            {modelError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-30 p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-red-400 mb-2">{modelError}</p>
                </div>
            )}

            {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-30 p-6 text-center">
                    <Camera className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-red-400 mb-2">{cameraError}</p>
                </div>
            )}

            <div className="relative w-full aspect-video bg-black max-w-2xl mx-auto overflow-hidden">
                <video
                    ref={videoRef}
                    onPlay={handleVideoPlay}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                />

                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                />

                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                    <div className={`w-52 h-64 border-2 border-dashed rounded-[40%] transition-colors duration-300 ${
                        detectionQuality === 'Good' 
                            ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
                            : 'border-gold-metallic/50 animate-pulse'
                    }`} />
                </div>

                <div className="absolute top-3 inset-x-3 z-20 pointer-events-none flex justify-center">
                    <div className="bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/80 text-xs font-bold text-slate-200 shadow-lg flex items-center gap-2 text-center">
                        <ScanFace className="w-4 h-4 text-gold-metallic shrink-0" />
                        <span>{status}</span>
                    </div>
                </div>
            </div>

            <div className="w-full bg-slate-800/80 p-4 border-t border-slate-700/50 z-20 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${detectionQuality === 'Good' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span>{detectionQuality === 'Good' ? 'Face Ready' : 'Positioning...'}</span>
                    </div>
                    <div>
                        Quality: <span className={detectionQuality === 'Good' ? 'text-emerald-400' : 'text-amber-400'}>{detectionQuality}</span>
                    </div>
                    <div>
                        Liveness: <span className={livenessStatus.includes('Passed') ? 'text-emerald-400' : 'text-slate-400'}>{livenessStatus}</span>
                    </div>
                </div>

                {showControls && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => captureFace()}
                        disabled={!isDetecting || detectionQuality !== 'Good'}
                        className="btn btn-primary self-center rounded-full px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        <Camera className="w-5 h-5" />
                        <span>Capture Face</span>
                    </motion.button>
                )}
            </div>
        </div>
    );
};

