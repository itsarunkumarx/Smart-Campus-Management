import { useState, useEffect, useRef } from 'react';
import { chatService, messageService } from '../../services/chatService';
import {
    Send,
    Paperclip,
    MoreVertical,
    ChevronLeft,
    Users,
    User,
    Search,
    Image as ImageIcon,
    FileText,
    Smile,
    X,
    MessageCircle,
    Trash2,
    Copy,
    UserCircle,
    Download,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, Link } from 'react-router-dom';


/* ─── Helpers ─────────────────────────────────────── */
const fileIcon = (type) => {
    if (!type) return <FileText size={14} />;
    if (type.startsWith('image/')) return <ImageIcon size={14} />;
    return <FileText size={14} />;
};

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ChatPage = () => {
    const { user } = useAuth();
    const location = useLocation();

    /* state */
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(location.state?.selectedChat || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    /* group modal */
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    /* three-dots menu */
    const [showMenu, setShowMenu] = useState(false);
    const [menuToast, setMenuToast] = useState('');
    const menuRef = useRef(null);

    /* file attachment */
    const [attachment, setAttachment] = useState(null);
    const fileInputRef = useRef(null);

    /* emoji picker */
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState('smileys');
    const emojiPickerRef = useRef(null);

    /* members modal */
    const [showMembers, setShowMembers] = useState(false);

    const messagesEndRef = useRef(null);

    /* ── effects ── */
    useEffect(() => {
        if (user) {
            fetchChats();
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (selectedChat && user) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
            return () => clearInterval(interval);
        }
    }, [selectedChat, user]);


    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // close three-dots on outside click
    useEffect(() => {
        const close = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        if (showMenu) document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [showMenu]);

    // close emoji picker on outside click
    useEffect(() => {
        const close = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) setShowEmojiPicker(false);
        };
        if (showEmojiPicker) document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [showEmojiPicker]);

    const insertEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };

    /* ── data ── */
    const fetchChats = async () => {
        try {
            const data = await chatService.fetchChats();
            setChats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const data = await messageService.getMessages(selectedChat._id);
            setMessages(data);
        } catch (e) {
            console.error(e);
        }
    };

    /* ── send ── */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment) || !selectedChat) return;

        setSending(true);
        try {
            let fileUrl = null;
            let fileType = null;
            let fileName = null;

            // If there's a file, build a fake URL (or swap for real upload endpoint)
            if (attachment) {
                fileUrl = attachment.previewUrl;          // use real upload URL in production
                fileType = attachment.type;
                fileName = attachment.name;
            }

            const payload = {
                content: newMessage || (fileName ? `📎 ${fileName}` : ''),
                chatId: selectedChat._id,
                ...(fileUrl && { fileUrl, fileType, fileName }),
            };

            const data = await messageService.sendMessage(payload);
            setMessages(prev => [...prev, data]);
            setNewMessage('');
            setAttachment(null);
            fetchChats();
        } catch (e) {
            console.error('Send failed:', e);
        } finally {
            setSending(false);
        }
    };

    /* ── file picker ── */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setAttachment({ file, previewUrl, name: file.name, size: file.size, type: file.type });
        e.target.value = '';   // reset so same file can be re-selected
    };

    /* ── group ── */
    const handleSearchUsers = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) { setSearchResults([]); return; }
        try {
            const data = await chatService.searchUsers(query);
            setSearchResults(data);
        } catch (e) { console.error(e); }
    };

    const handleGroupCreate = async () => {
        if (!groupName || selectedUsers.length < 2) return;
        setLoading(true);
        try {
            const data = await chatService.createGroupChat({
                name: groupName,
                users: JSON.stringify(selectedUsers.map(u => u._id))
            });
            setChats([data, ...chats]);
            setSelectedChat(data);
            setShowGroupModal(false);
            setGroupName('');
            setSelectedUsers([]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    /* ── three-dots actions ── */
    const handleClearChat = async () => {
        setShowMenu(false);
        if (!window.confirm('Permanently delete all messages in this chat? This cannot be undone.')) return;
        try {
            await messageService.clearMessages(selectedChat._id);
            setMessages([]);
            setChats(prev => prev.map(c =>
                c._id === selectedChat._id ? { ...c, latestMessage: null } : c
            ));
            showToast('Chat cleared permanently ✓');
        } catch {
            showToast('Failed to clear chat');
        }
    };

    const handleCopyName = () => {
        navigator.clipboard?.writeText(getChatName(selectedChat));
        setShowMenu(false);
        showToast('Name copied!');
    };

    const showToast = (msg) => {
        setMenuToast(msg);
        setTimeout(() => setMenuToast(''), 2500);
    };

    /* ── helpers ── */
    const getChatName = (chat) => {
        if (chat.isGroupChat) return chat.chatName;
        const other = chat.users.find(u => u._id !== user._id);
        return other?.name || 'Unknown User';
    };

    const getChatImage = (chat) => {
        if (chat.isGroupChat) return null;
        const other = chat.users.find(u => u._id !== user._id);
        return other?.profileImage;
    };

    if (!user) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-10 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse"></div>
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full flex items-center justify-center text-indigo-600 mb-8 border border-indigo-100 dark:border-indigo-500/20">
                    <MessageCircle size={48} />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Secure Messaging <span className="text-indigo-600">Protocol</span></h1>
                <p className="max-w-md text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed mb-8">
                    Our end-to-end encrypted communication cluster allows students, faculty, and admins to collaborate in real-time. Experience seamless file sharing, group dynamics, and instant notifications.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link to="/login/student" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30">
                        Begin Session
                    </Link>
                    <Link to="/student/posts" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                        Explore Social
                    </Link>
                </div>

                <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-2xl opacity-50">
                    <div className="space-y-2">
                        <Lock size={20} className="mx-auto text-emerald-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest">E2E Encrypted</p>
                    </div>
                    <div className="space-y-2">
                        <Users size={20} className="mx-auto text-indigo-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Group Sync</p>
                    </div>
                    <div className="space-y-2">
                        <Paperclip size={20} className="mx-auto text-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Deep Sharing</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ══════════════════════ RENDER ══════════════════════ */
    return (
        <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">


            {/* ── Sidebar ── */}
            <div className={`w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Messages</h2>
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                            title="Create Group Chat"
                        >
                            <Users size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : chats.length > 0 ? (
                        chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${selectedChat?._id === chat._id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500'
                                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                                    {getChatImage(chat) ? (
                                        <img src={getChatImage(chat)} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            {chat.isGroupChat ? <Users size={20} /> : <User size={20} />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs font-black uppercase truncate">{getChatName(chat)}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold truncate mt-1">
                                        {chat.latestMessage ? chat.latestMessage.content : 'No messages yet'}
                                    </p>
                                </div>
                                {chat.latestMessage && (
                                    <span className="text-[8px] font-black text-gray-300 uppercase flex-shrink-0">
                                        {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-400">
                            <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No conversations yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Chat Area ── */}
            <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-gray-400">
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {getChatImage(selectedChat) ? (
                                        <img src={getChatImage(selectedChat)} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        selectedChat.isGroupChat ? <Users size={20} /> : <User size={20} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-widest">{getChatName(selectedChat)}</h2>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                        {selectedChat.isGroupChat ? `${selectedChat.users?.length} members` : 'Online'}
                                    </span>
                                </div>
                            </div>

                            {/* ── Three-dots Menu ── */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(v => !v)}
                                    className="p-2 text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                <AnimatePresence>
                                    {showMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                            className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1"
                                        >
                                            {selectedChat.isGroupChat && (
                                                <button
                                                    onClick={() => { setShowMembers(true); setShowMenu(false); }}
                                                    className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-gray-600 dark:text-gray-300 transition-colors"
                                                >
                                                    <UserCircle size={15} className="text-indigo-500" /> View Members
                                                </button>
                                            )}
                                            <button
                                                onClick={handleCopyName}
                                                className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-gray-600 dark:text-gray-300 transition-colors"
                                            >
                                                <Copy size={15} className="text-indigo-500" /> Copy Name
                                            </button>
                                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                                            <button
                                                onClick={handleClearChat}
                                                className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={15} /> Clear Chat
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Toast */}
                        <AnimatePresence>
                            {menuToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2"
                                >
                                    <CheckCircle2 size={13} /> {menuToast}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {messages.map((msg, idx) => {
                                const isMine = msg.sender._id === user._id;
                                const isImage = msg.fileType?.startsWith('image/');
                                return (
                                    <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] group relative ${isMine ? 'items-end' : 'items-start'}`}>
                                            {selectedChat.isGroupChat && !isMine && (
                                                <span className="text-[8px] font-black text-gray-400 uppercase ml-1 mb-1 block">
                                                    {msg.sender.name}
                                                </span>
                                            )}
                                            <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${isMine
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-slate-100 dark:border-slate-800'
                                                }`}>
                                                {msg.content && <p>{msg.content}</p>}

                                                {/* File / Image attachment preview */}
                                                {msg.fileUrl && (
                                                    <div className="mt-2">
                                                        {isImage ? (
                                                            <img
                                                                src={msg.fileUrl}
                                                                alt={msg.fileName || 'attachment'}
                                                                className="max-w-[200px] rounded-xl object-cover cursor-pointer"
                                                                onClick={() => window.open(msg.fileUrl, '_blank')}
                                                            />
                                                        ) : (
                                                            <a
                                                                href={msg.fileUrl}
                                                                download={msg.fileName}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={`flex items-center gap-2 p-2.5 rounded-xl text-[10px] font-bold transition-colors ${isMine ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                    }`}
                                                            >
                                                                <FileText size={15} />
                                                                <span className="truncate max-w-[140px]">{msg.fileName || 'Download'}</span>
                                                                <Download size={13} className="flex-shrink-0 ml-auto" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[8px] font-black text-gray-400 uppercase mt-1 block px-1">
                                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Attachment Preview Strip */}
                        <AnimatePresence>
                            {attachment && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="px-4 pb-2 border-t border-slate-100 dark:border-slate-800 pt-3"
                                >
                                    <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow">
                                            {attachment.type.startsWith('image/') ? (
                                                <img src={attachment.previewUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <FileText size={20} className="text-indigo-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 truncate">{attachment.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold">{formatSize(attachment.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => setAttachment(null)}
                                            className="text-rose-400 hover:text-rose-600 flex-shrink-0 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Bar */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 relative">

                            {/* Emoji Picker */}
                            <div ref={emojiPickerRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(v => !v)}
                                    className={`p-2 transition-colors rounded-lg ${showEmojiPicker ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-400 hover:text-indigo-600'}`}
                                    title="Emoji"
                                >
                                    <Smile size={20} />
                                </button>

                                <AnimatePresence>
                                    {showEmojiPicker && (() => {
                                        const EMOJIS = {
                                            smileys: ['😀', '😂', '😍', '🥰', '😎', '🤩', '😭', '😅', '🤔', '😴', '😡', '🥺', '😇', '🤗', '😬', '🤯', '😱', '😤', '🙄', '😏'],
                                            gestures: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '👌', '🤘', '💪', '🙏', '👋', '🤙', '☝️', '👇', '👈', '👉', '🫶', '🫁', '🤜'],
                                            hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💝', '💘', '💟', '❣️', '💔', '🫀'],
                                            nature: ['🌸', '🌺', '🌹', '🌻', '🌼', '🍀', '🌿', '🍁', '🌊', '⭐', '🌙', '☀️', '🌈', '❄️', '🔥', '🌍', '🦋', '🐶', '🐱', '🐸'],
                                            food: ['🍕', '🍔', '🍣', '🌮', '🍩', '🧁', '🍰', '🎂', '🍫', '🍺', '☕', '🧃', '🥤', '🍜', '🥗', '🍎', '🍓', '🍇', '🥑', '🍞'],
                                            objects: ['📱', '💻', '🎮', '🎵', '🎧', '📚', '✏️', '🏆', '🎁', '💡', '🔑', '🚀', '🛸', '💎', '📸', '🧲', '⏰', '🗓️', '📌', '💼'],
                                        };
                                        const CATS = [
                                            { id: 'smileys', icon: '😀' },
                                            { id: 'gestures', icon: '👍' },
                                            { id: 'hearts', icon: '❤️' },
                                            { id: 'nature', icon: '🌸' },
                                            { id: 'food', icon: '🍕' },
                                            { id: 'objects', icon: '📱' },
                                        ];
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                                className="absolute bottom-12 left-0 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                            >
                                                {/* Category tabs */}
                                                <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                                    {CATS.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => setEmojiCategory(cat.id)}
                                                            className={`flex-1 py-2 text-base transition-colors ${emojiCategory === cat.id
                                                                ? 'bg-white dark:bg-slate-900 border-b-2 border-indigo-500'
                                                                : 'hover:bg-white/60 dark:hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            {cat.icon}
                                                        </button>
                                                    ))}
                                                </div>
                                                {/* Emoji grid */}
                                                <div className="p-3 grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
                                                    {EMOJIS[emojiCategory].map((emoji, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => insertEmoji(emoji)}
                                                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        );
                                    })()}
                                </AnimatePresence>
                            </div>

                            {/* Paperclip → triggers file picker */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-2 transition-colors rounded-lg ${attachment ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600'}`}
                                title="Attach file"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                                onChange={handleFileChange}
                            />

                            <input
                                type="text"
                                placeholder={attachment ? 'Add a caption (optional)...' : 'Write a message...'}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={(!newMessage.trim() && !attachment) || sending}
                                className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                {sending ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-50">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                            <MessageCircle size={48} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Encrypted Secure Comms</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 max-w-xs">
                            Select a conversation from the sidebar to begin.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Group Create Modal ── */}
            <AnimatePresence>
                {showGroupModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-tighter">New Group Chat</h3>
                                <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-rose-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Group Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none border border-slate-100 dark:border-slate-700"
                                        placeholder="Engineering Squad, Faculty Board..."
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Add Members</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none border border-slate-100 dark:border-slate-700"
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearchUsers(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(u => (
                                        <div key={u._id} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                                            {u.name}
                                            <X size={10} className="cursor-pointer" onClick={() => setSelectedUsers(selectedUsers.filter(su => su._id !== u._id))} />
                                        </div>
                                    ))}
                                </div>

                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {searchResults.map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => {
                                                if (!selectedUsers.some(su => su._id === u._id)) setSelectedUsers([...selectedUsers, u]);
                                                setSearchQuery('');
                                                setSearchResults([]);
                                            }}
                                            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase">{u.name}</p>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase">@{u.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                                <button
                                    disabled={!groupName || selectedUsers.length < 2 || loading}
                                    onClick={handleGroupCreate}
                                    className="btn btn-primary px-8 py-3 text-[10px] uppercase font-black disabled:opacity-50"
                                >
                                    Create Group
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Members Modal (group) ── */}
            <AnimatePresence>
                {showMembers && selectedChat?.isGroupChat && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowMembers(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest">{getChatName(selectedChat)} · Members</h3>
                                <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-rose-500"><X size={18} /></button>
                            </div>
                            <div className="p-4 max-h-80 overflow-y-auto space-y-2">
                                {selectedChat.users?.map(u => (
                                    <div key={u._id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-sm flex-shrink-0">
                                            {u.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase">{u.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{u.role}</p>
                                        </div>
                                        {u._id === selectedChat.groupAdmin?._id && (
                                            <span className="ml-auto text-[8px] font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-1 rounded-lg uppercase tracking-widest">Admin</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
