import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Mail,
    Phone,
    User,
    Edit2,
    Lock,
    Cpu,
    Activity,
    Globe,
    ShieldCheck,
    Key,
    UserCheck,
    Server,
    Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services';

export const AdminProfile = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const data = await adminService.getDashboard();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch admin stats', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-8 pb-32">
            {/* Command Header */}
            <div className="relative h-80 rounded-[3rem] overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-black"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                {/* Visual Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-metallic/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="absolute top-10 right-10 flex gap-4 z-10">
                    <button
                        onClick={() => navigate('/settings')}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-white hover:bg-gold-metallic/20 hover:border-gold-metallic/30 transition-all flex items-center gap-2 group"
                    >
                        <Edit2 size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Edit Identity</span>
                    </button>
                    <button
                        onClick={() => navigate('/change-password')}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl text-gold-metallic hover:bg-gold-metallic hover:text-white transition-all flex items-center gap-2 group shadow-2xl"
                    >
                        <Lock size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Rotate Keys</span>
                    </button>
                </div>

                <div className="absolute -bottom-1 left-12 flex items-end gap-10 translate-y-1/2">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-56 h-56 rounded-[3rem] bg-white dark:bg-slate-900 p-3 shadow-2xl overflow-hidden group relative"
                    >
                        {currentUser?.profileImage ? (
                            <img src={currentUser.profileImage} className="w-full h-full object-cover rounded-[2.5rem]" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-7xl font-black text-gold-metallic italic">
                                {currentUser?.name?.charAt(0)}
                            </div>
                        )}
                        <div className="absolute inset-0 border-2 border-gold-metallic/20 rounded-[3rem] pointer-events-none"></div>
                    </motion.div>

                    <div className="pb-8 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg">
                                {currentUser?.name}
                            </h1>
                            <div className="px-3 py-1 bg-gold-metallic text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-gold-metallic/20">
                                root_active
                            </div>
                        </div>
                        <p className="text-gold-light/60 font-black text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-10 h-[1px] bg-gold-metallic/50"></span>
                            CHIEF ADMINISTRATOR · OVERWATCH NODE PC-01
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-32 px-4 md:px-0">
                {/* Registry Data */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-8 border-slate-100 dark:border-slate-800 space-y-6 relative overflow-hidden group">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Shield size={14} className="text-gold-metallic" /> Global Registry Data
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase">Encrypted Email</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{currentUser?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase">Institutional Node</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Prince Mainframe Central</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase">System Clearance</p>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Level 10 · UNRESTRICTED</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-gray-400 leading-relaxed font-bold italic">
                                "{currentUser?.bio || "No custom administrative mission statement recorded in neural database."}"
                            </p>
                        </div>

                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gold-metallic/5 rounded-full blur-2xl group-hover:bg-gold-metallic/10 transition-all"></div>
                    </div>

                    <div className="glass-card p-8 border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Security Manifest</h3>
                        <div className="space-y-3">
                            <SecurityNode label="Biometric Sync" status="ENABLED" />
                            <SecurityNode label="2FA Protocol" status="ACTIVE" />
                            <SecurityNode label="Audit Logging" status="STEALTH" />
                            <SecurityNode label="Remote Purge" status="STANDBY" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
                    </div>
                </div>

                {/* Command Intelligence */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-8 border-slate-100 dark:border-slate-800 bg-slate-900 text-white relative overflow-hidden group"
                        >
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <Server size={24} className="text-gold-metallic" />
                                    <span className="text-[8px] font-black px-2 py-0.5 bg-gold-metallic text-slate-900 rounded-full">MASTER_NODE</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter italic">Mainframe Load</h4>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time system stress analysis</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '45%' }}
                                            className="h-full bg-gold-metallic shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                                        ></motion.div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                                        <span className="text-gold-metallic">Safe Velocity</span>
                                        <span>45% utilized</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-metallic/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-8 border-slate-100 dark:border-slate-800 relative overflow-hidden group"
                        >
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <Cpu size={24} className="text-indigo-600" />
                                    <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-500 text-white rounded-full">OPERATIONAL</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter italic">Neural Status</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">AI core synchronization status</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-800">Knowledge_DB: Linked</span>
                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-800">Uptime: 99.9%</span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
                        </motion.div>
                    </div>

                    <div className="glass-card p-10 border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-gold-metallic" /> Global Oversight Command
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                                <CommandStat label="Total Registry" value={stats?.totalUsers || '0'} sub="Institutional Scale" />
                                <CommandStat label="Grievance Rate" value={stats?.pendingComplaints || '0'} sub="Active Disputes" />
                                <CommandStat label="Knowledge Nodes" value="156" sub="Neural Archiving" color="text-indigo-600" />
                                <CommandStat label="Security Alerts" value="0" sub="Zero Breeches" color="text-emerald-500" />
                            </div>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-metallic/30 to-transparent"></div>
                        <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                            <Shield size={200} />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 justify-center py-10 opacity-40">
                        <InstitutionalLogo label="ISO 9001:2015 CERTIFIED" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <InstitutionalLogo label="ACCREDITED AI CAMPUS" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <InstitutionalLogo label="GOVERNMENT OF INDIA SECURED" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecurityNode = ({ label, status }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-gold-metallic/30 transition-all cursor-crosshair">
        <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-[9px] font-black text-emerald-500 flex items-center gap-2">
            <Zap size={10} fill="currentColor" /> {status}
        </span>
    </div>
);

const CommandStat = ({ label, value, sub, color = "text-gray-900 dark:text-white" }) => (
    <div className="space-y-1">
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className={`text-4xl font-black italic tracking-tighter ${color}`}>{value}</p>
        <p className="text-[9px] font-bold text-gray-400 italic">#{sub}</p>
    </div>
);

const InstitutionalLogo = ({ label }) => (
    <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default group">
        <div className="w-6 h-6 border-2 border-slate-400 group-hover:border-gold-metallic transition-colors rounded-sm rotate-45"></div>
        <span className="text-[8px] font-black text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-widest">{label}</span>
    </div>
);
