import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, UserCheck, MessageCircle,
    MoreHorizontal, Search, Check, X,
    Briefcase, MapPin, Globe, Loader2
} from 'lucide-react';
import {
    getConnectionRequests, respondToConnectionRequest,
    getConnections, toggleFollow, removeConnection, getMe,
    browsePeople, sendConnectionRequest, getUploadUrl
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Network.css';
import Avatar from '../components/common/Avatar';

const Network = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [networkSearch, setNetworkSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [connecting, setConnecting] = useState({});

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Debounced platform-wide user search
    useEffect(() => {
        if (networkSearch.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await browsePeople({ q: networkSearch.trim(), limit: 20 });
                setSearchResults(res.data.people || []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [networkSearch]);

    const handleConnect = async (personId) => {
        setConnecting(prev => ({ ...prev, [personId]: true }));
        try {
            await sendConnectionRequest(personId);
            toast.success('Connection request sent!');
            setSearchResults(prev =>
                prev.map(p => p._id === personId ? { ...p, connectionStatus: 'pending' } : p)
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setConnecting(prev => ({ ...prev, [personId]: false }));
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, connRes] = await Promise.all([
                getConnectionRequests(),
                getConnections()
            ]);
            setRequests(reqRes.data.requests || []);
            setConnections(connRes.data.connections || []);
        } catch (err) {
            toast.error('Failed to load network data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const handleRespond = async (requestId, status) => {
        try {
            await respondToConnectionRequest(requestId, status);
            toast.success(status === 'accepted' ? 'Connection accepted! 🎉' : 'Request ignored');
            // Refresh data
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleRemoveConnection = async (id) => {
        if (!window.confirm('Are you sure you want to remove this connection?')) return;
        try {
            await removeConnection(id);
            toast.success('Connection removed');
            fetchData();
        } catch (err) {
            toast.error('Failed to remove connection');
        }
    };

    const handleToggleFollow = async (id) => {
        try {
            const res = await toggleFollow(id);
            toast.success(res.data.isFollowing ? 'Following' : 'Unfollowed');

            // Refresh current user in context to update following list
            const me = await getMe();
            if (updateUser) updateUser(me.data.user);
        } catch (err) {
            toast.error('Failed to update follow status');
        }
    };

    const AvatarComponent = ({ u, size = 60 }) => (
        <div className="network-avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
            <Avatar user={u} size={size} />
        </div>
    );

    if (loading) return (
        <div className="network-loading">
            <Loader2 className="spin" size={32} />
            <p>Loading your network...</p>
        </div>
    );

    return (
        <div className="network-page">
            <div className="container">

                {/* ── Hero Banner ── */}
                <div className="network-hero">
                    <div className="network-hero-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <div className="network-hero-icon">
                                <Users size={26} />
                            </div>
                            <div className="network-hero-left">
                                <h1>My Network</h1>
                                <p>Manage your professional connections and requests</p>
                            </div>
                        </div>
                        <div className="network-hero-stats">
                            <div className="network-hero-stat">
                                <div className="network-hero-stat-val">{connections.length}</div>
                                <div className="network-hero-stat-label">Connections</div>
                            </div>
                            <div className="network-hero-stat">
                                <div className="network-hero-stat-val">{requests.length}</div>
                                <div className="network-hero-stat-label">Requests</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Global Search Bar ── */}
                <div className="network-search-wrap">
                    <Search size={16} className="network-search-icon" />
                    <input
                        type="text"
                        className="network-search-input"
                        placeholder="Search connections or pending requests by name, role..."
                        value={networkSearch}
                        onChange={e => setNetworkSearch(e.target.value)}
                    />
                    {networkSearch && (
                        <button className="conn-search-clear" onClick={() => setNetworkSearch('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* ── Tabs (hidden while searching) ── */}
                {!networkSearch.trim() && (
                    <div className="network-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            Pending Requests
                            {requests.length > 0 && <span className="tab-badge">{requests.length}</span>}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
                            onClick={() => setActiveTab('connections')}
                        >
                            My Connections
                            {connections.length > 0 && <span className="tab-badge secondary">{connections.length}</span>}
                        </button>
                    </div>
                )}

                <main className="network-content">
                    {/* ── Platform-wide search results ── */}
                    {networkSearch.trim().length >= 2 ? (
                        <div>
                            {searchLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                    <Loader2 className="spin" size={28} />
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon-wrap"><Search size={36} /></div>
                                    <h3>No users found</h3>
                                    <p>No one matches &ldquo;{networkSearch}&rdquo;.</p>
                                </div>
                            ) : (
                                <div className="connections-grid">
                                    {searchResults.map(person => {
                                        const isConnected = connections.some(c => c._id === person._id);
                                        const status = isConnected ? 'connected' : person.connectionStatus;
                                        return (
                                            <div key={person._id} className="connection-card">
                                                <div className="connection-cover">
                                                    <div className="connection-cover-pattern" />
                                                </div>
                                                <div className="conn-avatar-wrap">
                                                    <Avatar u={person} size={68} />
                                                </div>
                                                <div className="conn-body">
                                                    <Link to={`/users/profile/${person._id}`} className="conn-name-link">
                                                        <h3>{person.name}</h3>
                                                    </Link>
                                                    <p className="conn-headline">{person.headline || person.role}</p>
                                                    {person.location && (
                                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, margin: '4px 0 0' }}>
                                                            <MapPin size={11} /> {person.location}
                                                        </p>
                                                    )}
                                                    {status === 'connected' && <span className="badge badge-primary-light" style={{ marginTop: 6 }}>Connected</span>}
                                                    {status === 'pending' && <span className="badge" style={{ marginTop: 6, background: 'rgba(251,191,36,0.1)', color: '#f59e0b', border: '1px solid rgba(251,191,36,0.2)' }}>Request Sent</span>}
                                                </div>
                                                <div className="connection-footer">
                                                    {status === 'connected' ? (
                                                        <button className="btn btn-primary btn-full" onClick={() => navigate('/messages')}>
                                                            <MessageCircle size={15} /> Message
                                                        </button>
                                                    ) : status === 'pending' ? (
                                                        <button className="btn btn-outline btn-full" disabled>
                                                            <UserCheck size={15} /> Pending
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary btn-full"
                                                            onClick={() => handleConnect(person._id)}
                                                            disabled={connecting[person._id]}
                                                        >
                                                            {connecting[person._id] ? <Loader2 size={14} className="spin" /> : <UserPlus size={15} />}
                                                            {connecting[person._id] ? 'Sending…' : 'Connect'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        activeTab === 'requests' ? (
                            <div className="requests-grid">
                                {requests.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon-wrap">
                                            <UserPlus size={48} />
                                        </div>
                                        <h3>No pending requests</h3>
                                        <p>When people want to connect with you, their requests will appear here.</p>
                                        <Link to="/people" className="btn btn-primary">Find People to Connect</Link>
                                    </div>
                                ) : (() => {
                                    const filteredReqs = networkSearch
                                        ? requests.filter(r =>
                                            r.sender?.name?.toLowerCase().includes(networkSearch.toLowerCase()) ||
                                            r.sender?.role?.toLowerCase().includes(networkSearch.toLowerCase()) ||
                                            r.sender?.headline?.toLowerCase().includes(networkSearch.toLowerCase())
                                        )
                                        : requests;
                                    if (filteredReqs.length === 0) return (
                                        <div className="empty-state">
                                            <div className="empty-icon-wrap"><Search size={36} /></div>
                                            <h3>No results found</h3>
                                            <p>No requests match &ldquo;{networkSearch}&rdquo;.</p>
                                        </div>
                                    );
                                    return filteredReqs.map(req => (
                                        <div key={req._id} className="request-card">
                                            {/* Cover */}
                                            <div className="request-cover">
                                                <div className="connection-cover-pattern" />
                                            </div>
                                            {/* Avatar centred over cover */}
                                            <div className="conn-avatar-wrap">
                                                <Avatar u={req.sender} size={68} />
                                            </div>
                                            {/* Info */}
                                            <div className="conn-body">
                                                <Link to={`/users/profile/${req.sender?._id}`} className="conn-name-link">
                                                    <h3>{req.sender?.name}</h3>
                                                </Link>
                                                <p className="conn-headline">{req.sender?.headline || req.sender?.role}</p>
                                                <div className="request-meta">
                                                    <Briefcase size={12} />
                                                    <span>{req.sender?.role}</span>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="request-footer">
                                                <button
                                                    className="btn btn-primary req-action-btn"
                                                    onClick={() => handleRespond(req._id, 'accepted')}
                                                >
                                                    <Check size={15} /> Accept
                                                </button>
                                                <button
                                                    className="btn btn-outline req-action-btn ignore-btn"
                                                    onClick={() => handleRespond(req._id, 'rejected')}
                                                >
                                                    <X size={15} /> Ignore
                                                </button>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        ) : (
                            <div>

                                {connections.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon-wrap"><Users size={48} /></div>
                                        <h3>No connections yet</h3>
                                        <p>Start building your professional network by connecting with colleagues and recruiters.</p>
                                        <Link to="/jobs" className="btn btn-primary">Discover People</Link>
                                    </div>
                                ) : (() => {
                                    const filtered = connections.filter(c =>
                                        !networkSearch ||
                                        c.name?.toLowerCase().includes(networkSearch.toLowerCase()) ||
                                        c.role?.toLowerCase().includes(networkSearch.toLowerCase()) ||
                                        c.headline?.toLowerCase().includes(networkSearch.toLowerCase())
                                    );
                                    if (filtered.length === 0) return (
                                        <div className="empty-state">
                                            <div className="empty-icon-wrap"><Search size={36} /></div>
                                            <h3>No results found</h3>
                                            <p>No connections match &ldquo;{networkSearch}&rdquo;.</p>
                                        </div>
                                    );
                                    return (
                                        <div className="connections-grid">
                                            {filtered.map(conn => (
                                                <div key={conn._id} className="connection-card">
                                                    {/* Cover */}
                                                    <div className="connection-cover">
                                                        <div className="connection-cover-pattern" />
                                                    </div>

                                                    {/* Avatar centred over the cover */}
                                                    <div className="conn-avatar-wrap">
                                                        <Avatar u={conn} size={68} />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="conn-body">
                                                        <Link to={`/users/profile/${conn._id}`} className="conn-name-link">
                                                            <h3>{conn.name}</h3>
                                                        </Link>
                                                        <p className="conn-headline">{conn.headline || conn.role}</p>
                                                        <span className="badge badge-primary-light">Connected</span>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="connection-footer">
                                                        <button
                                                            className="btn btn-primary btn-full"
                                                            onClick={() => navigate('/messages')}
                                                        >
                                                            <MessageCircle size={16} /> Message
                                                        </button>
                                                        <div className="menu-container" style={{ position: 'relative' }}>
                                                            <button
                                                                className="btn btn-outline icon-only"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenMenuId(openMenuId === conn._id ? null : conn._id);
                                                                }}
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                            {openMenuId === conn._id && (
                                                                <div className="network-dropdown-menu">
                                                                    <button onClick={() => handleToggleFollow(conn._id)}>
                                                                        {user?.following?.includes(conn._id) ? (
                                                                            <><UserCheck size={14} /> Unfollow</>
                                                                        ) : (
                                                                            <><UserPlus size={14} /> Follow User</>
                                                                        )}
                                                                    </button>
                                                                    <button className="danger" onClick={() => handleRemoveConnection(conn._id)}>
                                                                        <X size={14} /> Unfriend
                                                                    </button>
                                                                    <button onClick={() => toast.success('Profile shared!')}>
                                                                        <Globe size={14} /> Share Profile
                                                                    </button>
                                                                    <button className="danger" onClick={() => toast.error('User Reported')}>
                                                                        🚩 Report
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )
                    )}
                </main>
            </div>
        </div>
    );
};

export default Network;
