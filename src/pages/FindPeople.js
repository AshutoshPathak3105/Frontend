import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, Search, X, MapPin, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { browsePeople, sendConnectionRequest, cancelConnectionRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Network.css';
import './FindPeople.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatar = (a, name) =>
    a
        ? <img src={`${API_BASE}${a}`} alt={name} className="conn-avatar-img" />
        : <div className="conn-avatar-initials">{getInitials(name)}</div>;

const FindPeople = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [people, setPeople] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [connecting, setConnecting] = useState({}); // { [userId]: true }

    const fetchPeople = useCallback(async (q, pg) => {
        setLoading(true);
        try {
            const params = { page: pg, limit: 12 };
            if (q && q.trim().length >= 2) params.q = q.trim();
            const res = await browsePeople(params);
            setPeople(res.data.people || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch {
            toast.error('Failed to load people');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchPeople(query, page);
    }, [user, navigate, fetchPeople, query, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setQuery(search);
    };

    const handleClear = () => {
        setSearch('');
        setQuery('');
        setPage(1);
    };

    const handleConnect = async (personId) => {
        setConnecting(prev => ({ ...prev, [personId]: true }));
        try {
            await sendConnectionRequest(personId);
            toast.success('Connection request sent!');
            setPeople(prev =>
                prev.map(p => p._id === personId ? { ...p, connectionStatus: 'pending' } : p)
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setConnecting(prev => ({ ...prev, [personId]: false }));
        }
    };

    const handleCancel = async (personId) => {
        setConnecting(prev => ({ ...prev, [personId]: true }));
        try {
            await cancelConnectionRequest(personId);
            toast.success('Request cancelled');
            setPeople(prev =>
                prev.map(p => p._id === personId ? { ...p, connectionStatus: 'none' } : p)
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel request');
        } finally {
            setConnecting(prev => ({ ...prev, [personId]: false }));
        }
    };

    return (
        <div className="network-page">
            <div className="container">

                {/* ── Hero ── */}
                <div className="network-hero">
                    <div className="network-hero-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <div className="network-hero-icon">
                                <Users size={26} />
                            </div>
                            <div className="network-hero-left">
                                <h1>Find People to Connect</h1>
                                <p>Grow your professional network by connecting with others</p>
                            </div>
                        </div>
                        <div className="network-hero-stats">
                            <div className="network-hero-stat">
                                <div className="network-hero-stat-val">{total}</div>
                                <div className="network-hero-stat-label">People</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Search Bar ── */}
                <form className="network-search-wrap" onSubmit={handleSearch}>
                    <Search size={16} className="network-search-icon" />
                    <input
                        type="text"
                        className="network-search-input"
                        placeholder="Search by name, headline, skills, or location..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button type="button" className="conn-search-clear" onClick={handleClear}>
                            <X size={14} />
                        </button>
                    )}
                </form>

                {/* ── Content ── */}
                {loading ? (
                    <div className="network-loading">
                        <Loader2 className="spin" size={32} />
                        <p>Finding people…</p>
                    </div>
                ) : people.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon-wrap"><Users size={48} /></div>
                        <h3>No people found</h3>
                        <p>{query ? `No results for "${query}". Try a different search.` : 'No new people to connect with right now.'}</p>
                        {query && (
                            <button className="btn btn-primary" onClick={handleClear}>Clear search</button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="connections-grid">
                            {people.map(person => (
                                <div key={person._id} className="connection-card fp-card-clickable">
                                    <Link to={`/users/profile/${person._id}`} className="fp-card-link">
                                    <div className="connection-cover fp-cover">
                                        <div className="connection-cover-pattern" />
                                    </div>
                                    <div className="conn-avatar-wrap">
                                        <div className="conn-avatar">
                                            {avatar(person.avatar, person.name)}
                                        </div>
                                    </div>
                                    <div className="conn-body">
                                        <h3 className="fp-card-name">{person.name}</h3>
                                        {person.headline && (
                                            <p className="conn-headline">{person.headline}</p>
                                        )}
                                        {person.location && (
                                            <p className="fp-location">
                                                <MapPin size={11} /> {person.location}
                                            </p>
                                        )}
                                        {person.mutualCount > 0 && (
                                            <p className="fp-mutual">
                                                <Users size={11} /> {person.mutualCount} mutual connection{person.mutualCount > 1 ? 's' : ''}
                                            </p>
                                        )}
                                        {person.skills?.length > 0 && (
                                            <div className="profile-badges" style={{ marginTop: 8 }}>
                                                {person.skills.slice(0, 3).map(s => (
                                                    <span key={s} className="badge badge-primary-light">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    </Link>
                                    <div style={{ padding: '0 16px 16px' }}>
                                        {person.connectionStatus === 'pending' ? (
                                            <button
                                                className="btn btn-outline btn-full fp-cancel-btn"
                                                onClick={() => handleCancel(person._id)}
                                                disabled={connecting[person._id]}
                                            >
                                                {connecting[person._id]
                                                    ? <Loader2 size={14} className="spin" />
                                                    : <X size={14} />
                                                }
                                                {connecting[person._id] ? 'Cancelling…' : 'Pending · Undo'}
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-full"
                                                onClick={() => handleConnect(person._id)}
                                                disabled={connecting[person._id]}
                                            >
                                                {connecting[person._id]
                                                    ? <Loader2 size={14} className="spin" />
                                                    : <UserPlus size={14} />
                                                }
                                                {connecting[person._id] ? 'Sending…' : 'Connect'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Pagination ── */}
                        {pages > 1 && (
                            <div className="fp-pagination">
                                <button
                                    className="fp-page-btn"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="fp-page-info">Page {page} of {pages}</span>
                                <button
                                    className="fp-page-btn"
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={page === pages}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FindPeople;
