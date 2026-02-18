import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Book,
    Calendar,
    Shield,
    Edit2,
    Check,
    X,
    MessageCircle,
    UserPlus,
    UserMinus,
    Award,
    MapPin,
    GraduationCap,
    Clock,
    Briefcase,
    Zap,
    Github,
    Linkedin,
    Instagram,
    Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';

export const ProfilePage = () => {
    const { id: profileId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const isOwnProfile = !profileId || profileId === currentUser?._id;

    useEffect(() => {
        fetchProfile();
    }, [profileId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            if (isOwnProfile) {
                setProfile(currentUser);
            } else {
                const data = await userService.getUserById(profileId);
                setProfile(data);
                setIsFollowing(data.followers?.some(f => (f._id || f) === currentUser._id));
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await userService.unfollowUser(profile._id);
                setIsFollowing(false);
            } else {
                await userService.followUser(profile._id);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Follow action failed');
        }
    };

    const handleMessage = async () => {
        try {
            const chat = await chatService.accessChat(profile._id);
            navigate('/chat', { state: { selectedChat: chat } });
        } catch (err) {
            console.error('Chat access failed');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Decrypting Scout Profile...</p>
        </div>
    );

    if (!profile) return (
        <div className="text-center py-40">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Scout Data Redacted</h2>
            <p className="text-gray-500 mt-2">The requested profile does not exist or has been archived.</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Hero Header */}
            <div className="relative h-64 rounded-[3rem] overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                {/* Actions */}
                <div className="absolute top-8 right-8 flex gap-3 z-10">
                    {isOwnProfile ? (
                        <button
                            onClick={() => navigate('/settings')}
                            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white hover:bg-white/20 transition-all"
                        >
                            <Edit2 size={20} />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleFollow}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30'
                                    }`}
                            >
                                {isFollowing ? <><UserMinus size={14} /> Unfollow</> : <><UserPlus size={14} /> Follow Scout</>}
                            </button>
                            <button
                                onClick={handleMessage}
                                className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                            >
                                <MessageCircle size={14} className="inline mr-2" /> Message
                            </button>
                        </>
                    )}
                </div>

                <div className="absolute -bottom-1 left-12 flex items-end gap-8 translate-y-1/2">
                    <div className="w-44 h-44 rounded-[2.5rem] bg-white dark:bg-slate-900 p-2 shadow-2xl overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                        {profile.profileImage ? (
                            <img src={profile.profileImage} className="w-full h-full object-cover rounded-[2rem]" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-black text-indigo-600">
                                {profile.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-24 px-6 md:px-12">
                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{profile.name}</h1>
                        <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">@{profile.username}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Followers</p>
                            <p className="text-xl font-black italic">{profile.followers?.length || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Following</p>
                            <p className="text-xl font-black italic">{profile.following?.length || 0}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed italic border-l-4 border-indigo-500/30 pl-4">
                            {profile.bio || "No biographical manifest recorded for this scout."}
                        </p>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {profile.privacy?.showEmail && (
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <Mail size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{profile.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                            <MapPin size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{profile.department}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                            <GraduationCap size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{profile.role} · {profile.year} Year</span>
                        </div>
                    </div>

                    {/* Social Presence */}
                    {profile.socialLinks && (
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            {profile.socialLinks.github && (
                                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100 dark:border-slate-800">
                                    <Github size={18} />
                                </a>
                            )}
                            {profile.socialLinks.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 dark:border-slate-800">
                                    <Linkedin size={18} />
                                </a>
                            )}
                            {profile.socialLinks.instagram && (
                                <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 dark:border-slate-800">
                                    <Instagram size={18} />
                                </a>
                            )}
                            {profile.socialLinks.website && (
                                <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100 dark:border-slate-800">
                                    <Globe size={18} />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Skills & Certs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Award size={18} className="text-amber-500" /> Neural Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.length > 0 ? profile.skills.map(s => (
                                    <span key={s} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                        {s}
                                    </span>
                                )) : <p className="text-[10px] text-gray-400 italic">No expertise recorded.</p>}
                            </div>
                        </div>

                        <div className="glass-card p-8 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Check size={18} className="text-emerald-500" /> Certifications
                            </h3>
                            <div className="space-y-3">
                                {profile.certifications?.length > 0 ? profile.certifications.map(c => (
                                    <div key={c} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-500">
                                            <Shield size={12} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-600 dark:text-gray-400">{c}</span>
                                    </div>
                                )) : <p className="text-[10px] text-gray-400 italic">No credentials logged.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Academic / Faculty Records */}
                    <div className="glass-card p-8 border-slate-100 dark:border-slate-800">
                        {profile.role === 'student' ? (
                            <>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <Book size={18} className="text-sky-500" /> Academic Transcript
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Institutional CGPA</p>
                                        <p className="text-3xl font-black italic text-indigo-600">{profile.academicInfo?.cgpa || '0.00'}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Current Semester</p>
                                        <p className="text-3xl font-black italic">{profile.academicInfo?.semester || '1'}</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Subject Load</p>
                                        <p className="text-xs font-bold">{profile.academicInfo?.currentSubjects?.length || 0} Modules Active</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <Briefcase size={18} className="text-purple-500" /> Professional Status
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Designation</p>
                                        <p className="text-xl font-black italic">{profile.facultyInfo?.designation || 'Faculty Member'}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Office Hours</p>
                                        <p className="text-xs font-bold italic">{profile.facultyInfo?.officeHours || 'N/A'}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Exp Cycle</p>
                                        <p className="text-xl font-black italic">{profile.facultyInfo?.experience || 0} Quarters</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
