import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Briefcase, Search, ChevronDown,
    User, LogOut, BookmarkCheck, FileText,
    Building2, PlusCircle, LayoutDashboard,
    Sun, Moon, X, Menu, Home, Mail,
    Users, MessageCircleMore, Bell, Trash2, CheckCheck, Clock, Sparkles
} from 'lucide-react';
import './Navbar.css';
import LogoImage from '../common/Logo';
import { globalSearch, getUnreadMessageCount, getNotifications, markAllNotificationsRead, markNotificationRead, deleteNotification } from '../../services/api';

const Navbar = () => {
    const { user, logoutUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ── Global Search state ──────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const mobileSearchRef = useRef(null);
    const mobileSearchInputRef = useRef(null);

    // ── Unread messages badge ────────────────────────────────────────────
    const [unreadMessages, setUnreadMessages] = useState(0);
    useEffect(() => {
        if (!user) { setUnreadMessages(0); return; }
        const fetchUnread = async () => {
            try {
                const res = await getUnreadMessageCount();
                setUnreadMessages(res.data.unread || 0);
            } catch { /* silent */ }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, [user]);

    // ── Notifications ────────────────────────────────────────────────────
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await getNotifications({ limit: 15 });
            setNotifications(res.data.notifications || []);
            setUnreadNotifs(res.data.unreadCount || 0);
        } catch { /* silent */ }
    };

    useEffect(() => {
        if (!user) { setNotifications([]); setUnreadNotifs(0); return; }
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]); // eslint-disable-line

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadNotifs(0);
        } catch { /* silent */ }
    };

    const handleNotifClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await markNotificationRead(notif._id);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadNotifs(prev => Math.max(0, prev - 1));
            } catch { /* silent */ }
        }
        if (notif.link) navigate(notif.link);
        setNotifOpen(false);
    };

    const handleDeleteNotif = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch { /* silent */ }
    };

    const timeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        if (mobileOpen) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-menu-open');
        };
    }, [mobileOpen]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
            if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
                setMobileSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setDropdownOpen(false);
        setSearchOpen(false);
        setMobileSearchOpen(false);
        setSearchQuery('');
        setSearchResults(null);
    }, [location]);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults(null);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await globalSearch(searchQuery.trim());
                setSearchResults(res.data);
            } catch {
                setSearchResults(null);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearchSelect = (path) => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults(null);
        navigate(path);
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    const navLinks = [
        { to: '/', label: 'Home', icon: <Home size={15} /> },
        { to: '/jobs', label: 'Find Jobs', icon: <Briefcase size={15} /> },
        { to: '/companies', label: 'Companies', icon: <Building2 size={15} /> },
        { to: '/contact', label: 'Contact Us', icon: <Mail size={15} /> },
    ];

    const getInitials = (name) =>
        name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <>
            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-container">

                    {/* ☰ Hamburger — LEFT on mobile */}
                    <button
                        className="mobile-toggle"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <LogoImage height={34} withText={true} />
                    </Link>

                    {/* ── Global Search Bar (between logo and theme toggle) ── */}
                    <div className="navbar-search" ref={searchRef}>
                        <div className="search-input-wrap">
                            <Search size={15} className="search-icon-left" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="search-input"
                                placeholder="Search jobs, companies, people..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                                onFocus={() => setSearchOpen(true)}
                                autoComplete="off"
                            />
                            {searchQuery && (
                                <button className="search-clear" onClick={() => { setSearchQuery(''); setSearchResults(null); searchInputRef.current?.focus(); }}>
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {searchOpen && searchQuery.trim().length >= 2 && (
                            <div className="search-dropdown">
                                {searchLoading && (
                                    <div className="search-loading">Searching...</div>
                                )}
                                {!searchLoading && searchResults && (
                                    <>
                                        {/* Jobs */}
                                        {searchResults.jobs?.length > 0 && (
                                            <div className="search-section">
                                                <div className="search-section-label"><Briefcase size={12} /> Jobs</div>
                                                {searchResults.jobs.map(job => (
                                                    <button key={job._id} className="search-result-item" onClick={() => handleSearchSelect(`/jobs/${job._id}`)}>
                                                        <div className="search-result-main">{job.title}</div>
                                                        <div className="search-result-sub">{job.company?.name} &bull; {job.location}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {/* Companies */}
                                        {searchResults.companies?.length > 0 && (
                                            <div className="search-section">
                                                <div className="search-section-label"><Building2 size={12} /> Companies</div>
                                                {searchResults.companies.map(c => (
                                                    <button key={c._id} className="search-result-item" onClick={() => handleSearchSelect(`/companies/${c._id}`)}>
                                                        <div className="search-result-main">{c.name}</div>
                                                        <div className="search-result-sub">{c.industry} &bull; {c.location}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {/* Users */}
                                        {searchResults.users.map(u => (
                                            <button key={u._id} className="search-result-item" onClick={() => handleSearchSelect(`/users/profile/${u._id}`)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
                                                        {u.avatar
                                                            ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                            : getInitials(u.name)}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="search-result-main">{u.name}</div>
                                                        <div className="search-result-sub">{u.headline || u.role}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                        {/* No results */}
                                        {!searchResults.jobs?.length && !searchResults.companies?.length && !searchResults.users?.length && (
                                            <div className="search-no-results">No results for &ldquo;{searchQuery}&rdquo;</div>
                                        )}
                                        {/* View all */}
                                        {(searchResults.jobs?.length > 0 || searchResults.companies?.length > 0) && (
                                            <button className="search-view-all" onClick={() => handleSearchSelect(`/jobs?search=${encodeURIComponent(searchQuery)}`)}>
                                                View all results for &ldquo;{searchQuery}&rdquo;
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Nav Section with Space-Around */}
                    <div className="navbar-main-section">
                        {/* Desktop Theme Toggle */}
                        <button
                            className="theme-toggle hide-mobile"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle colour mode"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Desktop Nav Links */}
                        <div className="navbar-links">
                            {navLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                                >
                                    {link.icon}{link.label}
                                </Link>
                            ))}
                            {user?.role === 'jobseeker' && (
                                <Link
                                    to="/network"
                                    className={`nav-link hide-desktop ${location.pathname === '/network' ? 'active' : ''}`}
                                >
                                    <Users size={15} /> My Network
                                </Link>
                            )}
                        </div>

                        {/* Right Side / Auth */}
                        <div className="navbar-right">
                            {user?.role === 'employer' && (
                                <Link
                                    to="/post-job"
                                    className="nav-link hide-mobile"
                                    style={{ marginRight: 15 }}
                                >
                                    <Briefcase size={15} /> Post Job
                                </Link>
                            )}

                            {/* Mobile Search Icon — visible only on small screens */}
                            <button
                                className="mobile-search-icon-btn"
                                onClick={() => setMobileSearchOpen(v => !v)}
                                aria-label="Search"
                            >
                                {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
                            </button>

                            {/* Notification Bell */}
                            {user && (
                                <div className="notif-wrap" ref={notifRef}>
                                    <button
                                        className="msg-icon-btn"
                                        title="Notifications"
                                        aria-label="Notifications"
                                        onClick={() => { setNotifOpen(v => !v); if (!notifOpen) fetchNotifications(); }}
                                    >
                                        <Bell size={20} />
                                        {unreadNotifs > 0 && (
                                            <span className="msg-badge">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                                        )}
                                    </button>

                                    {notifOpen && (
                                        <div className="notif-dropdown">
                                            <div className="notif-header">
                                                <span className="notif-title">Notifications</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {unreadNotifs > 0 && (
                                                        <button className="notif-mark-all" onClick={handleMarkAllRead} title="Mark all as read">
                                                            <CheckCheck size={14} /> Mark all read
                                                        </button>
                                                    )}
                                                    <button className="notif-close-btn" onClick={() => setNotifOpen(false)} title="Close">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="notif-list">
                                                {notifications.length === 0 ? (
                                                    <div className="notif-empty">
                                                        <Bell size={28} />
                                                        <p>No notifications yet</p>
                                                    </div>
                                                ) : notifications.map(n => (
                                                    <div
                                                        key={n._id}
                                                        className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}
                                                        onClick={() => handleNotifClick(n)}
                                                    >
                                                        {/* 1. Left: Profile Picture or Placeholder */}
                                                        <div className="notif-avatar-box">
                                                            {n.sender?.avatar ? (
                                                                <img src={n.sender.avatar} alt={n.sender.name} className="notif-pfp" />
                                                            ) : (
                                                                <div className="notif-initials">
                                                                    {getInitials(n.sender?.name || n.title)}
                                                                </div>
                                                            )}
                                                            {!n.isRead && <div className="notif-dot-v2" />}
                                                        </div>

                                                        {/* 2. Center: Name/Title + Message */}
                                                        <div className="notif-content-box">
                                                            <div className="notif-header-line">
                                                                <span className="notif-item-title">{n.sender?.name || n.title}</span>
                                                                <div className="notif-time-badge">
                                                                    <Clock size={11} />
                                                                    <span>{timeAgo(n.createdAt)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="notif-item-msg">{n.message}</div>
                                                        </div>

                                                        <button className="notif-delete" onClick={(e) => handleDeleteNotif(e, n._id)} title="Delete">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Messaging Icon */}
                            {user && (
                                <Link to="/messages" className="msg-icon-btn navbar-messages-btn" title="Messages" aria-label="Messages">
                                    <MessageCircleMore size={20} />
                                    {unreadMessages > 0 && (
                                        <span className="msg-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                                    )}
                                </Link>
                            )}
                            {user ? (
                                <div className="user-menu" ref={dropdownRef}>
                                    <button
                                        className="user-btn"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                getInitials(user.name)
                                            )}
                                        </div>
                                        <span className="hide-mobile user-name-text" style={{ fontSize: 14 }}>
                                            {user.name?.split(' ')[0]}
                                        </span>
                                        <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="dropdown-menu">
                                            <div className="dropdown-header">
                                                <div className="avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                                                    {user.avatar
                                                        ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                        : getInitials(user.name)}
                                                </div>
                                                <div>
                                                    <div className="user-name-text" style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {user.name}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="dropdown-divider" />
                                            <Link to="/dashboard" className="dropdown-item">
                                                <LayoutDashboard size={16} /> Dashboard
                                            </Link>
                                            <Link to="/profile" className="dropdown-item">
                                                <User size={16} /> My Profile
                                            </Link>
                                            <Link to="/network" className="dropdown-item">
                                                <Users size={16} /> My Network
                                            </Link>
                                            {user.role === 'jobseeker' && (
                                                <>
                                                    <Link to="/applications" className="dropdown-item">
                                                        <FileText size={16} /> My Applications
                                                    </Link>
                                                    <Link to="/saved-jobs" className="dropdown-item">
                                                        <BookmarkCheck size={16} /> Saved Jobs
                                                    </Link>
                                                    <Link to="/resume-ai" className="dropdown-item" style={{ color: '#a78bfa' }}>
                                                        <Sparkles size={16} /> AI Resume Matcher
                                                    </Link>
                                                </>
                                            )}
                                            {user.role === 'employer' && (
                                                <>
                                                    <Link to="/my-jobs" className="dropdown-item">
                                                        <Briefcase size={16} /> My Jobs
                                                    </Link>
                                                    <Link to="/company-profile" className="dropdown-item">
                                                        <Building2 size={16} /> Company Profile
                                                    </Link>
                                                    <Link to="/post-job" className="dropdown-item">
                                                        <PlusCircle size={16} /> Post a Job
                                                    </Link>
                                                </>
                                            )}
                                            <div className="dropdown-divider" />
                                            <button className="dropdown-item danger" onClick={handleLogout}>
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="auth-buttons">
                                    <Link to="/login" className="btn btn-secondary btn-sm mobile-auth-btn">Sign In</Link>
                                    <Link to="/register" className="btn btn-primary btn-sm btn-static hide-mobile">Get Started</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Search Panel — slides down below navbar */}
            {mobileSearchOpen && (
                <div className="mobile-search-panel" ref={mobileSearchRef}>
                    <div className="mobile-search-inner">
                        <Search size={16} className="search-icon-left" />
                        <input
                            ref={mobileSearchInputRef}
                            type="text"
                            className="search-input"
                            placeholder="Search jobs, companies, people..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                            onFocus={() => setSearchOpen(true)}
                            autoComplete="off"
                            autoFocus
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => { setSearchQuery(''); setSearchResults(null); mobileSearchInputRef.current?.focus(); }}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {searchOpen && searchQuery.trim().length >= 2 && (
                        <div className="mobile-search-dropdown">
                            {searchLoading && <div className="search-loading">Searching...</div>}
                            {!searchLoading && searchResults && (
                                <>
                                    {searchResults.jobs?.length > 0 && (
                                        <div className="search-section">
                                            <div className="search-section-label"><Briefcase size={12} /> Jobs</div>
                                            {searchResults.jobs.map(job => (
                                                <button key={job._id} className="search-result-item" onClick={() => { handleSearchSelect(`/jobs/${job._id}`); setMobileSearchOpen(false); }}>
                                                    <div className="search-result-main">{job.title}</div>
                                                    <div className="search-result-sub">{job.company?.name} &bull; {job.location}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.companies?.length > 0 && (
                                        <div className="search-section">
                                            <div className="search-section-label"><Building2 size={12} /> Companies</div>
                                            {searchResults.companies.map(c => (
                                                <button key={c._id} className="search-result-item" onClick={() => { handleSearchSelect(`/companies/${c._id}`); setMobileSearchOpen(false); }}>
                                                    <div className="search-result-main">{c.name}</div>
                                                    <div className="search-result-sub">{c.industry} &bull; {c.location}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.users?.length > 0 && (
                                        <div className="search-section">
                                            <div className="search-section-label"><Users size={12} /> People</div>
                                            {searchResults.users.map(u => (
                                                <button key={u._id} className="search-result-item" onClick={() => { handleSearchSelect(`/users/profile/${u._id}`); setMobileSearchOpen(false); }}>
                                                    <div className="search-result-main">{u.name}</div>
                                                    <div className="search-result-sub">{u.headline || u.role}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {!searchResults.jobs?.length && !searchResults.companies?.length && !searchResults.users?.length && (
                                        <div className="search-no-results">No results for &ldquo;{searchQuery}&rdquo;</div>
                                    )}
                                    {(searchResults.jobs?.length > 0 || searchResults.companies?.length > 0) && (
                                        <button className="search-view-all" onClick={() => { handleSearchSelect(`/jobs?search=${encodeURIComponent(searchQuery)}`); setMobileSearchOpen(false); }}>
                                            View all results for &ldquo;{searchQuery}&rdquo;
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Slide-in Drawer (from LEFT) */}
            {mobileOpen && (
                <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
                    {/* Drawer Header */}
                    <div className="mobile-menu-header">
                        <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
                            <LogoImage height={32} withText={true} />
                        </Link>
                        <button
                            className="mobile-close-btn"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="mobile-menu-body">

                        {/* User info strip */}
                        {user && (
                            <Link to="/profile" className="mobile-user-info" onClick={() => setMobileOpen(false)}>
                                <div className="avatar" style={{ width: 42, height: 42, fontSize: 15, flexShrink: 0 }}>
                                    {user.avatar
                                        ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        : getInitials(user.name)}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div className="user-name-text" style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                        {user.role}
                                    </div>
                                </div>
                            </Link>
                        )}

                        <div className="mobile-divider" />

                        {/* ── Home ── */}
                        <Link
                            to="/"
                            className="mobile-home-link"
                            onClick={() => setMobileOpen(false)}
                        >
                            <Home size={18} />
                            <span>Home</span>
                        </Link>

                        {/* ── For Job Seekers — hidden for employers ── */}
                        {(!user || user.role === 'jobseeker') && (
                            <div className="mobile-grid-section">
                                <span className="mobile-section-label">For Job Seekers</span>
                                <div className="mobile-grid-2">
                                    <Link to="/dashboard" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <LayoutDashboard size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link to="/profile" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <User size={18} />
                                        <span>Profile</span>
                                    </Link>
                                    <Link to="/jobs" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <Search size={18} />
                                        <span>Browse Jobs</span>
                                    </Link>
                                    <Link to="/companies" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <Building2 size={18} />
                                        <span>Companies</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* ── For Employers — hidden for job seekers ── */}
                        {(!user || user.role === 'employer') && (
                            <div className="mobile-grid-section">
                                <span className="mobile-section-label">For Employers</span>
                                <div className="mobile-grid-2">
                                    <Link to="/dashboard" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <Users size={18} />
                                        <span>Account</span>
                                    </Link>
                                    <Link to="/my-jobs" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <Briefcase size={18} />
                                        <span>My Jobs</span>
                                    </Link>
                                    <Link to="/post-job" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <PlusCircle size={18} />
                                        <span>Post Job</span>
                                    </Link>
                                    <Link to="/company-profile" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                        <Building2 size={18} />
                                        <span>Company</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* ── Colour Mode & Messages ── */}
                        <div className="mobile-grid-section">
                            <span className="mobile-section-label">Settings</span>
                            <div className="mobile-grid-2">
                                <button className="mobile-grid-link" onClick={toggleTheme}>
                                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>
                                <Link to="/messages" className="mobile-grid-link" onClick={() => setMobileOpen(false)}>
                                    <MessageCircleMore size={18} />
                                    <span>Messages</span>
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Drawer Footer — Login/Logout + Version */}
                    <div className="mobile-menu-footer">
                        {user ? (
                            <button className="mobile-footer-auth-btn mobile-footer-logout" onClick={handleLogout}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        ) : (
                            <Link to="/login" className="mobile-footer-auth-btn mobile-footer-login" onClick={() => setMobileOpen(false)}>
                                <User size={16} /> Sign In / Register
                            </Link>
                        )}
                        <div className="mobile-footer-version">
                            JobSarthi &nbsp;·&nbsp; v1.0.4
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
