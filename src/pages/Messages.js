import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage as sendMessageAPI,
    sendMessageWithAttachment,
    sendGifMessageAPI,
    deleteConversation,
    editMessage as editMessageAPI,
    deleteMessageAPI,
    globalSearch
} from '../services/api';
import {
    Send, Search, MessageCircleMore, Trash2,
    X, UserPlus, MoreVertical, User, Pin,
    CheckCheck, Clock, Loader, Plus, Camera,
    FileText, Image, Video, Copy, Pencil
} from 'lucide-react';
import './Messages.css';

// GIPHY public API key — replace with your own from https://developers.giphy.com
const GIPHY_KEY = 'dc6zaTOxFJmzC';
const BACKEND_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Avatar = ({ user, size = 40 }) => (
    <div
        className="msg-avatar"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        title={user?.name}
    >
        {user?.avatar
            ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : getInitials(user?.name)
        }
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Messages = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Conversations
    const [conversations, setConversations] = useState([]);
    const [convLoading, setConvLoading] = useState(true);
    const [convSearch, setConvSearch] = useState('');

    // Unified sidebar search — user results
    const [userResults, setUserResults] = useState([]);
    const [userSearchLoading, setUserSearchLoading] = useState(false);

    // Active conversation
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);

    // Message input
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    // Attachment state
    const [attachment, setAttachment] = useState(null); // { file, preview, type }

    // GIF picker
    const [gifPickerOpen, setGifPickerOpen] = useState(false);
    const [gifSearch, setGifSearch] = useState('');
    const [gifResults, setGifResults] = useState([]);
    const [gifLoading, setGifLoading] = useState(false);

    // Misc UI
    const [mobileShowConv, setMobileShowConv] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const [attachMenuOpen, setAttachMenuOpen] = useState(false);

    // Selected message (click-to-select, WhatsApp style)
    const [selectedMsg, setSelectedMsg] = useState(null); // full msg object + isMine
    const [deleteSubOpen, setDeleteSubOpen] = useState(false);
    const [pinnedMsg, setPinnedMsg] = useState(null); // { _id, content, type }
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    // Camera modal
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null); // data URL
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const pollRef = useRef(null);
    const fileInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const gifPickerRef = useRef(null);
    const attachMenuRef = useRef(null);

    // ── Camera modal handlers ──────────────────────────────────────────
    const openCamera = async () => {
        setGifPickerOpen(false);
        setCapturedPhoto(null);
        // Try getUserMedia (desktop + modern mobile)
        if (navigator.mediaDevices?.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                setCameraStream(stream);
                setCameraOpen(true);
                // Assign stream to video element after modal renders
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                }, 80);
                return;
            } catch {
                // Fallback to file input below
            }
        }
        // Fallback: native camera file picker (mobile)
        cameraInputRef.current?.click();
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.92));
        // Pause stream preview
        video.pause();
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
        if (videoRef.current) videoRef.current.play();
    };

    const confirmPhoto = () => {
        if (!capturedPhoto) return;
        // Convert data URL to File
        const arr = capturedPhoto.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8 = new Uint8Array(n);
        while (n--) u8[n] = bstr.charCodeAt(n);
        const file = new File([u8], `photo_${Date.now()}.jpg`, { type: mime });
        setAttachment({ file, preview: capturedPhoto, type: mime, name: file.name });
        closeCameraModal();
    };

    const closeCameraModal = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            setCameraStream(null);
        }
        setCameraOpen(false);
        setCapturedPhoto(null);
    };

    // ── Load conversations ──────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        try {
            const res = await getConversations();
            setConversations(res.data.conversations || []);
        } catch {
            // silent fail on poll
        } finally {
            setConvLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Auto-open conversation from navigation state (e.g., from PublicProfile)
    useEffect(() => {
        if (!location.state?.convId || conversations.length === 0) return;
        const target = conversations.find(c => c._id === location.state.convId);
        if (target) {
            selectConversation(target);
            // Clear state so refresh doesn't re-trigger
            navigate(location.pathname, { replace: true, state: {} });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.convId, conversations]);

    // ── Load messages for active conversation ───────────────────────────
    const loadMessages = useCallback(async (convId, silent = false) => {
        if (!silent) setMsgLoading(true);
        try {
            const res = await getMessages(convId);
            setMessages(res.data.messages || []);
            // Update unread to 0 locally
            setConversations(prev =>
                prev.map(c => c._id === convId ? { ...c, unreadCount: 0 } : c)
            );
        } catch {
            // ignore
        } finally {
            if (!silent) setMsgLoading(false);
        }
    }, []);

    // ── Poll for new messages ───────────────────────────────────────────
    useEffect(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        if (!activeConv) {
            pollRef.current = setInterval(loadConversations, 10000);
        } else {
            pollRef.current = setInterval(async () => {
                await loadMessages(activeConv._id, true);
                await loadConversations();
            }, 3000);
        }
        return () => clearInterval(pollRef.current);
    }, [activeConv, loadMessages, loadConversations]);

    // ── Stop camera stream on unmount ───────────────────────────────────
    useEffect(() => {
        return () => {
            if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cameraStream]);

    // ── Close attach menu on outside click ─────────────────────────────
    useEffect(() => {
        if (!attachMenuOpen) return;
        const handler = (e) => {
            const inGroup = attachMenuRef.current?.contains(e.target);
            const inMenu = e.target.closest('.attach-menu');
            if (!inGroup && !inMenu) setAttachMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [attachMenuOpen]);

    // ── Scroll to bottom when messages change ───────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Select conversation ─────────────────────────────────────────────
    const selectConversation = async (conv) => {
        setActiveConv(conv);
        setMobileShowConv(false);
        setShowOptions(false);
        await loadMessages(conv._id);
        inputRef.current?.focus({ preventScroll: true });
    };

    // ── Send message ────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e?.preventDefault();
        if (sending) return;

        // Send attachment if one is selected
        if (attachment) {
            setSending(true);
            try {
                const res = await sendMessageWithAttachment(activeConv._id, attachment.file, input.trim());
                setMessages(prev => [...prev, res.data.message]);
                setConversations(prev =>
                    prev.map(c => c._id === activeConv._id
                        ? { ...c, lastMessage: input.trim() || attachment.name, lastMessageAt: new Date().toISOString() }
                        : c
                    ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                );
                setAttachment(null);
                setInput('');
            } catch {
                // silent
            } finally {
                setSending(false);
                inputRef.current?.focus({ preventScroll: true });
            }
            return;
        }

        if (!input.trim() || !activeConv) return;
        const text = input.trim();
        setInput('');
        setSending(true);
        try {
            const res = await sendMessageAPI(activeConv._id, text);
            setMessages(prev => [...prev, res.data.message]);
            setConversations(prev =>
                prev.map(c => c._id === activeConv._id
                    ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
                    : c
                ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
        } catch {
            setInput(text);
        } finally {
            setSending(false);
            inputRef.current?.focus({ preventScroll: true });
        }
    };

    // ── File select handler ─────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const preview = (isImage || isVideo) ? URL.createObjectURL(file) : null;
        setAttachment({ file, preview, type: file.type, name: file.name });
        e.target.value = '';
        setGifPickerOpen(false);
    };

    // ── GIF search via GIPHY ────────────────────────────────────────────
    const searchGifs = useCallback(async (query) => {
        setGifLoading(true);
        try {
            const endpoint = query.trim()
                ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`
                : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24&rating=g`;
            const res = await fetch(endpoint);
            const data = await res.json();
            setGifResults(data.data || []);
        } catch {
            setGifResults([]);
        } finally {
            setGifLoading(false);
        }
    }, []);

    // Load trending GIFs when picker first opens
    useEffect(() => {
        if (gifPickerOpen && gifResults.length === 0) searchGifs('');
    }, [gifPickerOpen, gifResults.length, searchGifs]);

    // ── Send GIF ────────────────────────────────────────────────────────
    const handleGifSelect = async (gif) => {
        setGifPickerOpen(false);
        setGifSearch('');
        if (!activeConv || sending) return;
        setSending(true);
        try {
            const gifUrl = gif.images.original.url;
            const res = await sendGifMessageAPI(activeConv._id, gifUrl, gif.title);
            setMessages(prev => [...prev, res.data.message]);
            setConversations(prev =>
                prev.map(c => c._id === activeConv._id
                    ? { ...c, lastMessage: '🎬 GIF', lastMessageAt: new Date().toISOString() }
                    : c
                ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
        } catch {
            // silent
        } finally {
            setSending(false);
        }
    };

    // ── User search (unified sidebar) — triggers from convSearch ─────────
    useEffect(() => {
        if (convSearch.trim().length < 2) { setUserResults([]); return; }
        const t = setTimeout(async () => {
            setUserSearchLoading(true);
            try {
                const res = await globalSearch(convSearch.trim());
                setUserResults(res.data.users || []);
            } catch { setUserResults([]); }
            finally { setUserSearchLoading(false); }
        }, 350);
        return () => clearTimeout(t);
    }, [convSearch]);

    const startNewConversation = async (targetUserId) => {
        try {
            const res = await getOrCreateConversation(targetUserId);
            const conv = res.data.conversation;
            setConversations(prev => {
                const exists = prev.find(c => c._id === conv._id);
                return exists ? prev : [conv, ...prev];
            });
            setConvSearch('');
            setUserResults([]);
            await selectConversation(conv);
        } catch (err) {
            console.error('Failed to start conversation', err);
        }
    };

    const handleDeleteConversation = async (convId) => {
        if (!window.confirm('Delete this conversation?')) return;
        try {
            await deleteConversation(convId);
            setConversations(prev => prev.filter(c => c._id !== convId));
            if (activeConv?._id === convId) {
                setActiveConv(null);
                setMessages([]);
                setMobileShowConv(true);
            }
            setShowOptions(false);
        } catch {
            // ignore
        }
    };
    // ── Per-message actions ─────────────────────────────────────────────
    const clearSelection = () => { setSelectedMsg(null); setDeleteSubOpen(false); };

    const handleCopyMsg = (text) => {
        navigator.clipboard?.writeText(text).catch(() => { });
        clearSelection();
        setShowOptions(false);
    };

    const handleStartEdit = (msg) => {
        setEditingMsgId(msg._id);
        setEditingContent(msg.content);
        clearSelection();
        setShowOptions(false);
    };

    const handlePinMessage = (msg) => {
        if (pinnedMsg?._id === msg._id) {
            setPinnedMsg(null);
        } else {
            setPinnedMsg({ _id: msg._id, content: msg.content, type: msg.messageType || 'text' });
        }
        clearSelection();
        setShowOptions(false);
    };

    const handleSaveEdit = async (msgId) => {
        if (!editingContent.trim()) return;
        try {
            const res = await editMessageAPI(msgId, editingContent.trim());
            setMessages(prev => prev.map(m => m._id === msgId ? { ...m, content: res.data.message.content, isEdited: true } : m));
        } catch { /* ignore */ }
        setEditingMsgId(null);
        setEditingContent('');
    };

    const handleDeleteMsg = async (msgId, mode) => {
        try {
            await deleteMessageAPI(msgId, mode);
            if (mode === 'everyone') {
                setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeletedForEveryone: true, content: '' } : m));
            } else {
                setMessages(prev => prev.filter(m => m._id !== msgId));
            }
        } catch { /* ignore */ }
        clearSelection();
        setShowOptions(false);
    };

    // Close header options menu on outside click
    const chatOptionsRef = useRef(null);
    useEffect(() => {
        if (!showOptions) return;
        const handler = (e) => {
            if (chatOptionsRef.current && !chatOptionsRef.current.contains(e.target)) setShowOptions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showOptions]);

    // Escape key clears selection
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') { clearSelection(); setShowOptions(false); } };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Filtered conversation list ──────────────────────────────────────
    const filteredConvs = conversations.filter(c => {
        if (!convSearch.trim()) return true;
        return c.others?.some(o =>
            o.name?.toLowerCase().includes(convSearch.toLowerCase())
        );
    });

    const activeOther = activeConv?.others?.[0];

    // ─── Render ─────────────────────────────────────────────────────────
    return (
        <div className="messages-page">
            {/* ── Sidebar ── */}
            <aside className={`messages-sidebar ${!mobileShowConv ? 'mobile-hide' : ''}`}>
                {/* Back button removed */}
                {/* 
                <div className="sidebar-back-bar">
                    <button className="sidebar-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                        <ChevronLeft size={18} /> Back
                    </button>
                </div>
                */}

                <div className="sidebar-header">
                    <h2 className="sidebar-title">
                        <MessageCircleMore size={20} /> Messages
                    </h2>
                </div>

                {/* Unified search */}
                <div className="conv-search-wrap">
                    <Search size={13} className="conv-search-icon" />
                    <input
                        className="conv-search-input"
                        type="text"
                        placeholder="Search conversations..."
                        value={convSearch}
                        onChange={e => setConvSearch(e.target.value)}
                        autoComplete="off"
                    />
                    {convSearch && (
                        <button className="conv-search-clear" onClick={() => { setConvSearch(''); setUserResults([]); }}><X size={12} /></button>
                    )}
                </div>

                {/* List */}
                <div className="conv-list">
                    {convLoading && (
                        <div className="conv-list-empty"><Loader size={20} className="spin" /><span>Loading...</span></div>
                    )}

                    {/* Existing conversations */}
                    {!convLoading && filteredConvs.length === 0 && !convSearch && (
                        <div className="conv-list-empty">
                            <MessageCircleMore size={36} className="empty-icon" />
                            <span>No messages yet</span>
                            <span className="conv-list-hint">Search for a person above to start a chat</span>
                        </div>
                    )}

                    {filteredConvs.map(conv => {
                        const other = conv.others?.[0];
                        const isActive = activeConv?._id === conv._id;
                        return (
                            <button
                                key={conv._id}
                                className={`conv-item ${isActive ? 'conv-item-active' : ''} ${conv.unreadCount > 0 ? 'conv-item-unread' : ''}`}
                                onClick={() => selectConversation(conv)}
                            >
                                <Avatar user={other} size={42} />
                                <div className="conv-item-body">
                                    <div className="conv-item-top">
                                        <span className="conv-item-name">{other?.name || 'Unknown'}</span>
                                        <span className="conv-item-time">{formatTime(conv.lastMessageAt)}</span>
                                    </div>
                                    <div className="conv-item-bottom">
                                        <span className="conv-item-last">{conv.lastMessage || 'No messages yet'}</span>
                                        {conv.unreadCount > 0 && (
                                            <span className="conv-item-badge">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>
                                        )}
                                    </div>
                                    {other?.headline && (
                                        <div className="conv-item-headline">{other.headline}</div>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {/* People results section — shown when searching */}
                    {convSearch.trim().length >= 2 && (
                        <>
                            <div className="people-section-label">
                                {userSearchLoading ? 'Searching people...' : userResults.filter(u => u._id !== currentUser?._id).length > 0 ? 'People' : filteredConvs.length === 0 ? 'No results found' : ''}
                            </div>
                            {!userSearchLoading && userResults
                                .filter(u => u._id !== currentUser?._id && currentUser?.connections?.some(cid => String(cid._id || cid) === String(u._id)))
                                .map(u => (
                                    <button key={u._id} className="conv-item nc-people-item" onClick={() => startNewConversation(u._id)}>
                                        <Avatar user={u} size={42} />
                                        <div className="conv-item-body">
                                            <div className="conv-item-top">
                                                <span className="conv-item-name">{u.name}</span>
                                                <span className="nc-new-tag">Message</span>
                                            </div>
                                            {(u.headline || u.role) && (
                                                <div className="conv-item-headline">{u.headline || u.role}</div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            }
                        </>
                    )}
                </div>
            </aside>

            {/* ── Chat Panel ── */}
            <main className={`messages-panel ${mobileShowConv ? 'mobile-hide' : ''}`}>
                {!activeConv ? (
                    <div className="chat-empty-state">
                        <div className="chat-empty-icon">
                            <MessageCircleMore size={56} />
                        </div>
                        <h3>Your Messages</h3>
                        <p>Select a conversation or start a new one to begin chatting</p>
                        <button className="chat-empty-btn" onClick={() => setMobileShowConv(true)}>
                            <UserPlus size={16} /> Find Someone
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="chat-header">
                            {/* Back button removed */}
                            {/* 
                            <button
                                className="chat-back-btn"
                                onClick={() => {
                                    if (mobileShowConv === false) {
                                        setMobileShowConv(true);
                                        setActiveConv(null);
                                    } else {
                                        navigate(-1);
                                    }
                                }}
                                aria-label="Back"
                                title="Go back"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                            */}
                            <Avatar user={activeOther} size={38} />
                            <div className="chat-header-info">
                                <span className="chat-header-name">{activeOther?.name || 'Conversation'}</span>
                                <span className="chat-header-role">{activeOther?.headline || activeOther?.role}</span>
                            </div>
                            <div className="chat-header-actions">
                                <div className="chat-options-wrap" ref={chatOptionsRef}>
                                    <button
                                        className="chat-options-btn"
                                        title="More options"
                                        onClick={e => { e.stopPropagation(); setShowOptions(v => !v); }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    {showOptions && (
                                        <div className="chat-options-menu">
                                            {selectedMsg && !selectedMsg.isDeletedForEveryone && (
                                                <>
                                                    {selectedMsg.content && (
                                                        <button className="chat-option-item" onClick={() => handleCopyMsg(selectedMsg.content)}>
                                                            <Copy size={15} /> Copy
                                                        </button>
                                                    )}
                                                    {selectedMsg.isMine && (selectedMsg.messageType === 'text' || !selectedMsg.messageType) && (
                                                        <button className="chat-option-item" onClick={() => handleStartEdit(selectedMsg)}>
                                                            <Pencil size={15} /> Edit
                                                        </button>
                                                    )}
                                                    <button className="chat-option-item" onClick={() => handlePinMessage(selectedMsg)}>
                                                        <Pin size={15} /> {pinnedMsg?._id === selectedMsg._id ? 'Unpin' : 'Pin'}
                                                    </button>
                                                    <button className="chat-option-item danger" onClick={() => setDeleteSubOpen(v => !v)}>
                                                        <Trash2 size={15} /> Delete <span className="ctx-sub-arrow">{deleteSubOpen ? '▲' : '▼'}</span>
                                                    </button>
                                                    {deleteSubOpen && (
                                                        <div className="msg-ctx-delete-sub">
                                                            <button className="chat-option-item" onClick={() => { handleDeleteMsg(selectedMsg._id, 'me'); setShowOptions(false); }}>Delete for me</button>
                                                            {selectedMsg.isMine && (
                                                                <button className="chat-option-item danger" onClick={() => { handleDeleteMsg(selectedMsg._id, 'everyone'); setShowOptions(false); }}>Delete for everyone</button>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="chat-option-divider" />
                                                </>
                                            )}
                                            <button className="chat-option-item" onClick={() => { setShowOptions(false); navigate(`/users/profile/${activeOther?._id}`); }}>
                                                <User size={15} /> View Profile
                                            </button>
                                            {!selectedMsg && (
                                                <button className="chat-option-item danger" onClick={() => handleDeleteConversation(activeConv._id)}>
                                                    <Trash2 size={15} /> Delete Conversation
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pinned message banner */}
                        {pinnedMsg && (
                            <div className="pin-banner" onClick={() => document.getElementById(`msg-${pinnedMsg._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                <Pin size={13} className="pin-banner-icon" />
                                <div className="pin-banner-body">
                                    <span className="pin-banner-label">Pinned Message</span>
                                    <span className="pin-banner-text">{pinnedMsg.content || (pinnedMsg.type !== 'text' ? `📎 ${pinnedMsg.type}` : '')}</span>
                                </div>
                                <button className="pin-banner-close" onClick={e => { e.stopPropagation(); setPinnedMsg(null); }}><X size={13} /></button>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="chat-messages" onClick={() => { setShowOptions(false); setGifPickerOpen(false); clearSelection(); }}>
                            {msgLoading && (
                                <div className="chat-loading"><Loader size={22} className="spin" /></div>
                            )}
                            {!msgLoading && messages.length === 0 && (
                                <div className="chat-no-msgs">
                                    <p>Start the conversation with {activeOther?.name?.split(' ')[0]}!</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => {
                                const isMine = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                                const showAvatar = !isMine && (idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id);
                                const type = msg.messageType || 'text';
                                const fileUrl = msg.fileUrl
                                    ? (msg.fileUrl.startsWith('http') ? msg.fileUrl : `${BACKEND_URL}${msg.fileUrl}`)
                                    : null;
                                const isSelected = selectedMsg?._id === msg._id;
                                const isEditing = editingMsgId === msg._id;
                                return (
                                    <div key={msg._id} className={`msg-row ${isMine ? 'msg-row-mine' : 'msg-row-theirs'} ${isSelected ? 'msg-row-selected' : ''}`}>
                                        {!isMine && (
                                            <div className="msg-avatar-cell">
                                                {showAvatar ? <Avatar user={msg.sender} size={28} /> : <div style={{ width: 28 }} />}
                                            </div>
                                        )}

                                        <div className={`msg-bubble-wrap ${isMine ? 'wrap-mine' : 'wrap-theirs'}`}>

                                            <div
                                                id={`msg-${msg._id}`}
                                                className={`msg-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'} ${type !== 'text' ? 'bubble-media' : ''} ${isSelected ? 'bubble-selected' : ''}`}
                                                onClick={e => { e.stopPropagation(); setSelectedMsg(isSelected ? null : { ...msg, isMine }); setDeleteSubOpen(false); setShowOptions(v => isSelected ? false : v); }}
                                            >
                                                {/* Deleted for everyone */}
                                                {msg.isDeletedForEveryone ? (
                                                    <span className="msg-deleted">🚫 This message was deleted</span>
                                                ) : isEditing ? (
                                                    /* Inline edit input */
                                                    <div className="msg-edit-wrap">
                                                        <input
                                                            className="msg-edit-input"
                                                            value={editingContent}
                                                            onChange={e => setEditingContent(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleSaveEdit(msg._id);
                                                                if (e.key === 'Escape') { setEditingMsgId(null); setEditingContent(''); }
                                                            }}
                                                            autoFocus
                                                        />
                                                        <div className="msg-edit-actions">
                                                            <button className="msg-edit-save" onClick={() => handleSaveEdit(msg._id)}>Save</button>
                                                            <button className="msg-edit-cancel" onClick={() => { setEditingMsgId(null); setEditingContent(''); }}>Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {type === 'image' && fileUrl && (
                                                            <a href={fileUrl} target="_blank" rel="noreferrer">
                                                                <img src={fileUrl} alt={msg.fileName || 'image'} className="msg-image" />
                                                            </a>
                                                        )}
                                                        {type === 'gif' && fileUrl && (
                                                            <img src={fileUrl} alt={msg.content || 'GIF'} className="msg-image msg-gif" />
                                                        )}
                                                        {type === 'video' && fileUrl && (
                                                            <video src={fileUrl} controls className="msg-video" />
                                                        )}
                                                        {type === 'file' && fileUrl && (
                                                            <a href={fileUrl} target="_blank" rel="noreferrer" className="msg-file-link">
                                                                <FileText size={16} />
                                                                <span>{msg.fileName || msg.content}</span>
                                                            </a>
                                                        )}
                                                        {(type === 'text' || (!fileUrl && msg.content)) && (
                                                            <span className="msg-text">{msg.content}</span>
                                                        )}
                                                        {type !== 'text' && msg.content && msg.content !== msg.fileName && (
                                                            <span className="msg-caption">{msg.content}</span>
                                                        )}
                                                    </>
                                                )}
                                                {!isEditing && (
                                                    <span className="msg-meta">
                                                        <Clock size={10} />
                                                        {formatTime(msg.createdAt)}
                                                        {msg.isEdited && <span className="msg-edited-tag">edited</span>}
                                                        {isMine && <CheckCheck size={11} className="msg-read-check" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chat-input-area">
                            {/* Attachment preview */}
                            {attachment && (
                                <div className="attachment-preview-bar">
                                    {attachment.type.startsWith('image/') ? (
                                        <img src={attachment.preview} alt="preview" className="attach-thumb" />
                                    ) : attachment.type.startsWith('video/') ? (
                                        <video src={attachment.preview} className="attach-thumb" />
                                    ) : (
                                        <div className="attach-file-chip">
                                            <FileText size={14} />
                                            <span>{attachment.name}</span>
                                        </div>
                                    )}
                                    <button type="button" className="attach-remove-btn" onClick={() => setAttachment(null)}>
                                        <X size={13} />
                                    </button>
                                </div>
                            )}

                            {/* GIF Picker */}
                            {gifPickerOpen && (
                                <div className="gif-picker" ref={gifPickerRef}>
                                    <div className="gif-search-bar">
                                        <Search size={13} />
                                        <input
                                            className="gif-search-input"
                                            type="text"
                                            placeholder="Search GIFs..."
                                            value={gifSearch}
                                            autoFocus
                                            onChange={e => { setGifSearch(e.target.value); searchGifs(e.target.value); }}
                                        />
                                        <button type="button" className="gif-close-btn" onClick={() => { setGifPickerOpen(false); setGifSearch(''); }}>
                                            <X size={13} />
                                        </button>
                                    </div>
                                    <div className="gif-grid">
                                        {gifLoading && <div className="gif-loading"><Loader size={20} className="spin" /></div>}
                                        {!gifLoading && gifResults.map(gif => (
                                            <button type="button" key={gif.id} className="gif-item" onClick={() => handleGifSelect(gif)}>
                                                <img
                                                    src={gif.images.fixed_height_small.url}
                                                    alt={gif.title}
                                                    loading="lazy"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="gif-powered">Powered by GIPHY</div>
                                </div>
                            )}

                            {/* Attach menu popover */}
                            {attachMenuOpen && (
                                <div className="attach-menu">
                                    <button type="button" className="attach-menu-item" onClick={() => { fileInputRef.current?.click(); setAttachMenuOpen(false); }}>
                                        <div className="attach-menu-icon attach-doc-icon"><FileText size={22} /></div>
                                        <span>Document</span>
                                    </button>
                                    <button type="button" className="attach-menu-item" onClick={() => { photoInputRef.current?.click(); setAttachMenuOpen(false); }}>
                                        <div className="attach-menu-icon attach-photo-icon"><Image size={22} /></div>
                                        <span>Photo</span>
                                    </button>
                                    <button type="button" className="attach-menu-item" onClick={() => { videoInputRef.current?.click(); setAttachMenuOpen(false); }}>
                                        <div className="attach-menu-icon attach-video-icon"><Video size={22} /></div>
                                        <span>Video</span>
                                    </button>
                                </div>
                            )}

                            <form className="chat-input-form" onSubmit={handleSend}>
                                {/* Hidden file inputs */}
                                <input ref={fileInputRef} type="file" hidden
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.ppt,.pptx"
                                    onChange={handleFileSelect} />
                                <input ref={photoInputRef} type="file" hidden
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect} />
                                <input ref={videoInputRef} type="file" hidden
                                    accept="video/*"
                                    onChange={handleFileSelect} />
                                <input ref={cameraInputRef} type="file" hidden
                                    accept="image/*" capture="camera"
                                    onChange={handleFileSelect} />

                                {/* Single rounded input box containing left icons + text + camera */}
                                <div className="chat-input-box">
                                    {/* Left inside buttons: + and GIF grouped tightly */}
                                    <div className="input-left-group" ref={attachMenuRef}>
                                        <button type="button" className={`input-action-btn${attachMenuOpen ? ' active-plus' : ''}`} title="Attach"
                                            onClick={() => { setAttachMenuOpen(v => !v); setGifPickerOpen(false); }}>
                                            <Plus size={18} />
                                        </button>
                                        <button type="button"
                                            className={`input-action-btn gif-btn${gifPickerOpen ? ' active' : ''}`}
                                            title="Send GIF"
                                            onClick={() => { setGifPickerOpen(v => !v); setAttachment(null); }}>
                                            <span className="gif-label">GIF</span>
                                        </button>
                                    </div>

                                    {/* Text input */}
                                    <input
                                        ref={inputRef}
                                        className="chat-input"
                                        type="text"
                                        placeholder={`Message ${activeOther?.name?.split(' ')[0] || ''}...`}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        autoComplete="off"
                                        maxLength={2000}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                                        }}
                                    />

                                    {/* Right inside button: camera */}
                                    <button type="button" className="input-action-btn" title="Take photo"
                                        onClick={openCamera}>
                                        <Camera size={18} />
                                    </button>
                                </div>

                                {/* Send button outside the box */}
                                <button
                                    type="submit"
                                    className="chat-send-btn"
                                    disabled={(!input.trim() && !attachment) || sending}
                                    aria-label="Send"
                                >
                                    {sending ? <Loader size={17} className="spin" /> : <Send size={17} />}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </main>

            {/* ── Camera Modal ── */}
            {
                cameraOpen && (
                    <div className="camera-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeCameraModal(); }}>
                        <div className="camera-modal">
                            <div className="camera-modal-header">
                                <span>Take a Photo</span>
                                <button className="camera-close-btn" onClick={closeCameraModal}><X size={16} /></button>
                            </div>

                            <div className="camera-preview">
                                {!capturedPhoto && (
                                    <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                                )}
                                {capturedPhoto && (
                                    <img src={capturedPhoto} alt="captured" className="camera-captured" />
                                )}
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                            </div>

                            <div className="camera-modal-actions">
                                {!capturedPhoto ? (
                                    <button className="camera-shutter-btn" onClick={capturePhoto}>
                                        <div className="camera-shutter-inner" />
                                    </button>
                                ) : (
                                    <>
                                        <button className="camera-action-btn camera-retake" onClick={retakePhoto}>Retake</button>
                                        <button className="camera-action-btn camera-confirm" onClick={confirmPhoto}>Use Photo</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Messages;
