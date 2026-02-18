import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Image as ImageIcon,
    Video,
    Tag,
    Globe,
    Users,
    Lock,
    Send,
    X,
    Sparkles,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export const CreatePostPage = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [visibility, setVisibility] = useState('public'); // 'public', 'department', 'private'
    const [loading, setLoading] = useState(false);

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            if (!tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Institutional Security Check
        if (type === 'image' && !file.type.startsWith('image/')) {
            return alert('Invalid archive: Image expected.');
        }
        if (type === 'video' && !file.type.startsWith('video/')) {
            return alert('Invalid archive: Video expected.');
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('media', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.url) {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const fullUrl = `${baseUrl}${response.data.url}`;
                setMediaUrl(fullUrl);
                setMediaType(response.data.type || type);
            }
        } catch (error) {
            console.error('Asset Transmission Failed:', error);
            alert('Security breach or network failure during asset archiving.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            // Send original relative URL or full URL depending on backend preference.
            // Our backend saves relative path, so we should ideally store that.
            const relativeUrl = mediaUrl.replace(import.meta.env.VITE_API_URL || 'http://localhost:5000', '');

            await api.post('/posts', {
                content,
                media: relativeUrl ? [{ url: relativeUrl, type: mediaType }] : [],
                tags,
                visibility
            });
            navigate('/student/posts');
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Manifest Transmission Failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight">
                        Create <span className="text-indigo-600 dark:text-sky-400">Manifest</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2 flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                        Institutional Broadcast Protocol
                        <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Visual Content Layer */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative glass-card p-1 border-white dark:border-slate-800 overflow-hidden rounded-[2rem] shadow-2xl">
                        {mediaUrl && mediaUrl.includes('//') ? (
                            <div className="relative aspect-video rounded-[1.8rem] overflow-hidden group/preview">
                                {mediaType === 'image' ? (
                                    <img src={mediaUrl} className="w-full h-full object-cover" alt="Manifest Asset" />
                                ) : (
                                    <video src={mediaUrl} className="w-full h-full object-cover" controls />
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles size={12} className="text-sky-400" /> Asset Synchronized
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setMediaUrl('')}
                                            className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-rose-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 gap-4">
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse">Archiving Asset...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all group">
                                                <ImageIcon className="text-indigo-600 group-hover:scale-110 transition-transform" size={20} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Add Image</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'image')}
                                                />
                                            </label>
                                            <label className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-sky-500 transition-all group border-sky-100">
                                                <Video className="text-sky-500 group-hover:scale-110 transition-transform" size={20} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Add Video</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="video/*"
                                                    onChange={(e) => handleFileChange(e, 'video')}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Support for High-Bandwidth Visual Assets</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Text Content Layer */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manifest Contents</label>
                    <textarea
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-lg font-medium placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none focus:border-indigo-500 transition-all min-h-[200px]"
                        placeholder="Broadcast your institutional status..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                {/* Metadata Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Tag size={12} /> Institutional Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(t => (
                                <span key={t} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 rounded-lg text-[9px] font-black flex items-center gap-2">
                                    #{t} <button type="button" onClick={() => removeTag(t)}><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl py-3 px-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500"
                            placeholder="Add tags and press enter..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleAddTag}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} /> Broadcast Scope
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'public', label: 'Global', icon: <Globe size={14} /> },
                                { id: 'department', label: 'Local', icon: <Users size={14} /> },
                                { id: 'private', label: 'Restricted', icon: <Lock size={14} /> }
                            ].map(v => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => setVisibility(v.id)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${visibility === v.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-gray-400'
                                        }`}
                                >
                                    {v.icon}
                                    <span className="text-[8px] font-black uppercase tracking-widest">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-10 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Transmit Manifest</>}
                    </button>
                </div>
            </form>
        </div>
    );
};
