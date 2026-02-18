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
    MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

export const ChatPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(location.state?.selectedChat || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChats = async () => {
        try {
            const data = await chatService.fetchChats();
            setChats(data);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const data = await messageService.getMessages(selectedChat._id);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        setSending(true);
        try {
            const data = await messageService.sendMessage({
                content: newMessage,
                chatId: selectedChat._id
            });
            setMessages([...messages, data]);
            setNewMessage('');
            fetchChats(); // Update latest message in sidebar
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleSearchUsers = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const data = await chatService.searchUsers(query);
            setSearchResults(data);
        } catch (error) {
            console.error('User search failed:', error);
        }
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
        } catch (error) {
            console.error('Group creation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChatName = (chat) => {
        if (chat.isGroupChat) return chat.chatName;
        const otherUser = chat.users.find(u => u._id !== user._id);
        return otherUser?.name || 'Unknown User';
    };

    const getChatImage = (chat) => {
        if (chat.isGroupChat) return null;
        const otherUser = chat.users.find(u => u._id !== user._id);
        return otherUser?.profileImage;
    };

    return (
        <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            {/* Chats Sidebar */}
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
                                        <img src={getChatImage(chat)} className="w-full h-full object-cover" />
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
                                    <span className="text-[8px] font-black text-gray-300 uppercase">
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

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-gray-400">
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {getChatImage(selectedChat) ? (
                                        <img src={getChatImage(selectedChat)} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        selectedChat.isGroupChat ? <Users size={20} /> : <User size={20} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-widest">{getChatName(selectedChat)}</h2>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {messages.map((msg, idx) => (
                                <div
                                    key={msg._id || idx}
                                    className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] group relative ${msg.sender._id === user._id ? 'items-end' : 'items-start'}`}>
                                        {selectedChat.isGroupChat && msg.sender._id !== user._id && (
                                            <span className="text-[8px] font-black text-gray-400 uppercase ml-1 mb-1 block">
                                                {msg.sender.name}
                                            </span>
                                        )}
                                        <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${msg.sender._id === user._id
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-slate-100 dark:border-slate-800'
                                            }`}>
                                            {msg.content}
                                            {msg.fileUrl && (
                                                <div className="mt-2 p-2 bg-black/10 rounded-lg flex items-center gap-2">
                                                    {msg.fileType === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
                                                    <span className="text-[10px] font-bold underline truncate cursor-pointer">View Attachment</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase mt-1 block px-1">
                                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                <Smile size={20} />
                            </button>
                            <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                placeholder="Write a message..."
                                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                <Send size={20} />
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
                            Select a scout or group from the sidebar to begin institutional correspondence.
                        </p>
                    </div>
                )}
            </div>

            {/* Group Modal */}
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
                                <h3 className="text-lg font-black uppercase tracking-tighter">Initiate Group Discourse</h3>
                                <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-rose-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Group Designation</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none border border-slate-100 dark:border-slate-700"
                                        placeholder="Engineering Squad, Faculty Board..."
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Recruit Scouts</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none border border-slate-100 dark:border-slate-700"
                                            placeholder="Search by name or username..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearchUsers(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Selected Users */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(u => (
                                        <div key={u._id} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 animate-in fade-in zoom-in">
                                            {u.name}
                                            <X size={10} className="cursor-pointer" onClick={() => setSelectedUsers(selectedUsers.filter(user => user._id !== u._id))} />
                                        </div>
                                    ))}
                                </div>

                                {/* Search Results */}
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {searchResults.map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => {
                                                if (!selectedUsers.some(user => user._id === u._id)) {
                                                    setSelectedUsers([...selectedUsers, u]);
                                                }
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
                                    className="btn btn-primary px-8 py-3 text-[10px] uppercase font-black"
                                >
                                    Establish Group
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
