import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Maximize2, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AIChatbot.css';

/* ─────────────────────────────────────────────────────────────────────────
   Minimal Local Fallback — only used if Backend/AI is entirely unreachable
   ───────────────────────────────────────────────────────────────────────── */
const getFallbackMessage = (userInput) => {
    return `**Sarthi AI** 🤖\n\nI'm having a bit of trouble connecting to my brain right now, but I'm still here to help! \n\nYou asked: *"${userInput}"*\n\nPlease try again in a moment, or ask me about job searching, resumes, or any other topic once I'm back online! ✨`;
};

/* ─────────────────────────────────────────────────────────────────────────
   Try backend AI first, fall back to smart local responses
   ───────────────────────────────────────────────────────────────────────── */
const getAIResponse = async (message, conversationHistory) => {
    try {
        const token = localStorage.getItem('token');
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
        const apiBase = process.env.REACT_APP_API_URL ||
            ((hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]')
                ? '/api'
                : `${protocol}//${hostname}:8000/api`);
        const response = await fetch(`${apiBase}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ message, history: conversationHistory.slice(-6) }),
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) throw new Error('Backend unavailable');
        const data = await response.json();
        if (data.success && data.message) return { text: data.message, source: 'ai' };
        throw new Error('No response from backend');
    } catch (error) {
        console.warn('AI Translation error, using fallback:', error.message);
        return { text: getFallbackMessage(message), source: 'local' };
    }
};

/* ─────────────────────────────────────────────────────────────────────────
   Format markdown-ish text as HTML
   ───────────────────────────────────────────────────────────────────────── */
const formatMessage = (text) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background:rgba(99,102,241,0.15);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px">$1</code>')
        .replace(/^→\s(.+)$/gm, '<span style="color:var(--primary);margin-left:8px">→ $1</span>')
        .replace(/^✅\s(.+)$/gm, '<span style="color:var(--success)">✅ $1</span>')
        .replace(/^❌\s(.+)$/gm, '<span style="color:var(--danger)">❌ $1</span>')
        .replace(/\n/g, '<br/>');
};

/* ─────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────── */
const QUICK_PROMPTS = [
    { label: '🚀 Career Advice', msg: 'How can I grow my career in 2024?' },
    { label: '📄 Resume Review', msg: 'What makes a resume stand out for tech roles?' },
    { label: '🎤 Interview Tips', msg: 'Tell me about the STAR method for interviews' },
    { label: '💡 Tech Trends', msg: 'What are the top 5 tech trends in 2024?' },
    { label: '🎓 Global Knowledge', msg: 'Tell me an interesting fact about science or history' },
    { label: '✨ Ask Anything', msg: 'Hi Sarthi! What can you help me with today?' },
];

const getInitialMessage = (name) => ({
    id: 1,
    role: 'assistant',
    isInitial: true,
    content: `<div style="text-align: center; margin-bottom: 8px;">
**Hello${name ? `, ${name.split(' ')[0]}` : ''}! 👋**
**I'm Sarthi AI — your personal career guide!**
</div>
✨ Powered by **Google Gemini**, I can help with job searches, resume writing, interview prep, salary negotiation, career transitions, and platform guidance.

Click a quick topic below or just ask me anything!`,
    timestamp: new Date()
});

const AIChatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([getInitialMessage(user?.name)]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Update initial message if user name becomes available after load
    useEffect(() => {
        if (user?.name && messages.length === 1 && messages[0].isInitial) {
            setMessages([getInitialMessage(user.name)]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.name]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setHasNewMessage(false);
            setTimeout(() => inputRef.current?.focus(), 150);
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        } else {
            // Restore background scrolling
            document.body.style.overflow = 'auto';
        }

        // Cleanup function to restore scrolling if component unmounts
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, isMinimized]);

    const sendMessage = async (text = input.trim()) => {
        if (!text || loading) return;
        const userMessage = { id: Date.now(), role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        const start = Date.now();
        const chatHistory = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
        const { text: aiText } = await getAIResponse(text, chatHistory);

        // Wait for a total of 2 seconds before showing the answer
        setTimeout(() => {
            const duration = ((Date.now() - start) / 1000).toFixed(1);
            const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: aiText,
                timestamp: new Date(),
                duration: duration
            };
            setMessages(prev => [...prev, assistantMessage]);
            setLoading(false);
            if (!isOpen || isMinimized) setHasNewMessage(true);
        }, 2000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const clearChat = () => setMessages([getInitialMessage(user?.name)]);
    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!user) return null;

    return (
        <>
            {isOpen && (
                <div className="chatbot-wrapper" style={{ paddingBottom: '0' }}>
                    <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
                        <div className="chatbot-header">
                            {/* Left: avatar + status dot */}
                            <div className="chatbot-header-info">
                                <div className="chatbot-avatar">
                                    <MessageCircle size={14} />
                                    <span className="online-dot" />
                                </div>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: loading ? '#f59e0b' : '#10b981', display: 'inline-block', flexShrink: 0 }} />
                            </div>

                            {/* Center: title */}
                            <div className="chatbot-header-title">AI Assistant</div>

                            {/* Right: action buttons */}
                            <div className="chatbot-header-actions">
                                <button onClick={clearChat} className="header-btn" title="Clear chat">
                                    <RotateCcw size={14} />
                                </button>
                                <button onClick={() => setIsMinimized(!isMinimized)} className="header-btn" title={isMinimized ? "Maximize" : "Minimize"}>
                                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                </button>
                                <button className="chatbot-floating-close" onClick={() => setIsOpen(false)} title="Close Chat">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <div className="chatbot-messages">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`message-row ${msg.role}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="message-avatar bot-avatar">
                                                    <Bot size={15} />
                                                </div>
                                            )}
                                            <div className="message-bubble">
                                                <div
                                                    className="message-content"
                                                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                                />
                                                <div className="message-time">
                                                    {formatTime(msg.timestamp)}
                                                    {msg.duration && (
                                                        <span className="duration-badge">
                                                            {msg.duration}s
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="message-avatar user-avatar">
                                                    {user?.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{ fontSize: '10px', fontWeight: '800' }}>
                                                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="message-row assistant">
                                            <div className="message-avatar bot-avatar">
                                                <Bot size={15} />
                                            </div>
                                            <div className="message-bubble"><div className="typing-indicator"><span /><span /><span /></div></div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {isFocused && (
                                    <div className="quick-prompts">
                                        {QUICK_PROMPTS.map(p => (
                                            <button key={p.label} className="quick-prompt-btn" onClick={() => sendMessage(p.msg)}>{p.label}</button>
                                        ))}
                                    </div>
                                )}

                                <div className="chatbot-input-area">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                        placeholder="Ask Your Doubt"
                                        className="chatbot-input"
                                        rows={1}
                                        disabled={loading}
                                    />
                                    <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="send-btn">
                                        <Send size={15} />
                                    </button>
                                </div>
                                <div className="chatbot-footer-text">Sarthi AI • Powered by Gemini • Enter to send</div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {!isOpen && (
                <button
                    className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Open AI Career Chat"
                >
                    <MessageCircle size={22} />
                    {hasNewMessage && <span className="new-message-dot" />}
                    <div className="chatbot-tooltip">
                        <MessageCircle size={11} /> AI Career Assistant
                    </div>
                </button>
            )}
        </>
    );
};

export default AIChatbot;
