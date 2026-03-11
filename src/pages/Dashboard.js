import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase, FileText, CheckCircle, Calendar,
    Plus, ArrowRight, Eye, Users, Zap,
    BookmarkCheck, Building2, TrendingUp, UserCheck,
    Target, Layout, Bell, BarChart2, Send, Clock
} from 'lucide-react';
import { getDashboardStats, getEmployerDashboardStats, getMyApplications, getMyJobs, getUploadUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import SocialFeed from '../components/social/SocialFeed';
import './Dashboard.css';

const STATUS_CONFIG = {
    pending: { label: 'Applied', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
    reviewing: { label: 'Reviewing', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
    shortlisted: { label: 'Shortlisted', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
    interview: { label: 'Interview', color: 'var(--text-accent)', bg: 'var(--bg-primary-subtle)' },
    offered: { label: 'Offered', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
    withdrawn: { label: 'Withdrawn', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Good Morning';
    if (h >= 12 && h < 18) return 'Good Afternoon';
    if (h >= 18 && h < 23) return 'Good Evening';
    return 'Good Night';
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB SEEKER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const JobSeekerDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.hash === '#feed') {
            const el = document.getElementById('feed');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.hash, loading]);

    useEffect(() => {
        (async () => {
            try {
                const [statsRes, appsRes] = await Promise.all([
                    getDashboardStats(),
                    getMyApplications()
                ]);
                setStats(statsRes.data.stats);
                setApplications(appsRes.data.applications || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);


    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading your dashboard...</p>
        </div>
    );

    const pipeline = [
        { key: 'pending', label: 'Applied', color: '#fbbf24', emoji: '📤' },
        { key: 'reviewing', label: 'Reviewing', color: '#60a5fa', emoji: '👁️' },
        { key: 'shortlisted', label: 'Shortlisted', color: '#34d399', emoji: '✅' },
        { key: 'interviews', label: 'Interviews', color: 'var(--text-accent)', emoji: '📅' },
        { key: 'offered', label: 'Offered', color: '#10b981', emoji: '🎉' },
    ];

    const completion = stats?.profileCompletion || 0;

    return (
        <div style={{ paddingTop: 80, background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <div className="container" style={{ padding: 'clamp(20px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>

                {/* Welcome Banner — indigo themed */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.08) 100%)',
                    border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-xl)',
                    padding: 'clamp(20px, 4vw, 32px)', marginBottom: 28, position: 'relative', overflow: 'hidden'
                }}>
                    <div className="glow-orb glow-orb-primary" style={{ width: 350, height: 350, top: -120, right: -80, opacity: 0.45 }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700,
                                color: 'var(--primary-light)', marginBottom: 12
                            }}>
                                <Target size={12} /> Job Seeker
                            </div>
                            <h1 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, margin: '0 0 8px' }}>
                                {getGreeting()}, {user?.name?.split(' ')[0]} 👋
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                                {stats?.totalApplications
                                    ? `You have ${stats.totalApplications} active application${stats.totalApplications !== 1 ? 's' : ''} · ${stats.interviews || 0} interview${(stats.interviews || 0) !== 1 ? 's' : ''} scheduled`
                                    : 'Start your job hunt — hundreds of opportunities await!'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                            <Link to="/jobs" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 18px', gap: 6 }}>
                                <Briefcase size={14} /> Find Jobs
                            </Link>
                            <Link to="/profile" className="btn btn-secondary" style={{ fontSize: 13, padding: '9px 18px' }}>
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: 14, marginBottom: 28 }}>
                    {[
                        { label: 'Total Applied', value: stats?.totalApplications || 0, color: '#6366f1', icon: <FileText size={18} />, to: '/applications' },
                        { label: 'Interviews', value: stats?.interviews || 0, color: '#a78bfa', icon: <Calendar size={18} />, to: '/applications?status=interview' },
                        { label: 'Saved Jobs', value: stats?.savedJobs || 0, color: '#f59e0b', icon: <BookmarkCheck size={18} />, to: '/saved-jobs' },
                        { label: 'Profile Score', value: `${completion}%`, color: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#f87171', icon: <Zap size={18} />, to: '/profile' },
                    ].map((s, i) => (
                        <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
                            <div className="dash-stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', height: '100%', transition: 'var(--transition)' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 4px 16px ${s.color}22`; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ width: 40, height: 40, background: `${s.color}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 12 }}>{s.icon}</div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Interview Reminder Section — 30 min before */}
                {(() => {
                    const upcoming = applications.find(app =>
                        app.status === 'interview' &&
                        app.interviewDate &&
                        new Date(app.interviewDate) > new Date() &&
                        new Date(app.interviewDate) - new Date() < 30 * 60 * 1000
                    );
                    if (!upcoming) return null;
                    return (
                        <div style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            boxShadow: '0 10px 30px rgba(79,70,229,0.3)', color: 'white',
                            animation: 'pulse-notif 2s infinite ease-in-out'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={24} color="white" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Interview starting soon!</h4>
                                    <p style={{ fontSize: 13, opacity: 0.9, margin: 2 }}>{upcoming.job?.title} @ {upcoming.company?.name} · {new Date(upcoming.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <Link to="/applications" className="btn" style={{ background: 'white', color: '#4f46e5', fontWeight: 700, padding: '8px 20px', fontSize: 13 }}>
                                Join Now / Details
                            </Link>
                            <style>{`
                                @keyframes pulse-notif {
                                    0% { transform: scale(1); box-shadow: 0 10px 30px rgba(79,70,229,0.3); }
                                    50% { transform: scale(1.01); box-shadow: 0 10px 40px rgba(79,70,229,0.4); }
                                    100% { transform: scale(1); box-shadow: 0 10px 30px rgba(79,70,229,0.3); }
                                }
                            `}</style>
                        </div>
                    );
                })()}

                {/* Application Pipeline */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(16px, 3vw, 24px)', marginBottom: 28 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Your Application Pipeline</h2>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                        {pipeline.map((stage, i) => (
                            <div key={stage.key} style={{ flex: '1 1 90px', minWidth: 80, textAlign: 'center', position: 'relative' }}>
                                {i < pipeline.length - 1 && (
                                    <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 20, zIndex: 1, pointerEvents: 'none' }}>›</div>
                                )}
                                <div style={{ background: `${stage.color}12`, border: `1px solid ${stage.color}44`, borderRadius: 'var(--radius-lg)', padding: 'clamp(12px, 2vw, 18px) 8px' }}>
                                    <div style={{ fontSize: 20, marginBottom: 6 }}>{stage.emoji}</div>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: stage.color, lineHeight: 1 }}>{stats?.[stage.key] || 0}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{stage.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main 2-column grid */}
                <div className="seeker-main-grid">
                    {/* Left: Recent Applications */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
                        <div className="dash-recent-card">
                            <div className="dash-recent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Applications</h2>
                                <Link to="/applications" className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '5px 10px' }}>
                                    View All <ArrowRight size={11} />
                                </Link>
                            </div>
                            {(() => {
                                // Filter out expired interviews (older than 1 hour)
                                const activeApps = applications.filter(app => {
                                    if (app.status === 'interview' && app.interviewDate) {
                                        return new Date(app.interviewDate) > new Date(Date.now() - 60 * 60 * 1000);
                                    }
                                    return true;
                                });

                                if (activeApps.length === 0) return (
                                    <div className="empty-state" style={{ padding: '28px 16px' }}>
                                        <div className="empty-state-icon" style={{ fontSize: 36 }}>📋</div>
                                        <h3 style={{ fontSize: 15 }}>No recent activity</h3>
                                        <p style={{ fontSize: 13 }}>Browse jobs and start applying to track your progress</p>
                                    </div>
                                );

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {activeApps.slice(0, 6).map((app, i) => (
                                            <div key={i} className="dash-recent-item" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transition: 'var(--transition)' }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                                            >
                                                <div style={{ width: 40, height: 40, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                                                    {app.job?.company?.logo ? (
                                                        <img
                                                            src={getUploadUrl(app.job.company.logo)}
                                                            alt=""
                                                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                                                        />
                                                    ) : null}
                                                    <span style={{ display: app.job?.company?.logo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>🏢</span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job?.title || 'Unknown Role'}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.job?.company?.name || '—'}</div>
                                                </div>
                                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0, background: STATUS_CONFIG[app.status]?.bg || 'var(--bg-card)', color: STATUS_CONFIG[app.status]?.color || 'var(--text-secondary)' }}>
                                                    {STATUS_CONFIG[app.status]?.label || app.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Quick Actions */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
                            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { to: '/jobs', icon: <Briefcase size={15} />, label: 'Browse Jobs', color: '#6366f1' },
                                    { to: '/saved-jobs', icon: <BookmarkCheck size={15} />, label: 'Saved Jobs', color: '#f59e0b' },
                                    { to: '/applications', icon: <FileText size={15} />, label: 'My Applications', color: '#10b981' },
                                    { to: '/profile', icon: <UserCheck size={15} />, label: 'Update Profile', color: '#60a5fa' },
                                    { to: '/network', icon: <Users size={15} />, label: 'My Network', color: '#f472b6' },
                                ].map((a, i) => (
                                    <Link key={i} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'var(--transition)' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}10`; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                    >
                                        <span style={{ color: a.color, flexShrink: 0 }}>{a.icon}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                                        <ArrowRight size={12} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Profile Score */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
                            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Profile Score</h3>
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: 40, fontWeight: 900, color: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#f87171' }}>{completion}%</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {completion >= 80 ? '🚀 Strong profile!' : completion >= 50 ? '⚡ Almost there!' : '📝 Complete your profile'}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 14 }}>
                                <div style={{ height: '100%', width: `${completion}%`, background: completion >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : completion >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#f87171,#ef4444)', borderRadius: 99 }} />
                            </div>
                            <Link to="/profile" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', fontSize: 13, padding: '9px', gap: 6 }}>
                                <Zap size={13} /> Complete Profile
                            </Link>
                        </div>
                    </div>
                </div>

                <div id="feed"><SocialFeed /></div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const EmployerDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.hash === '#feed') {
            const el = document.getElementById('feed');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.hash, loading]);

    useEffect(() => {
        (async () => {
            try {
                const [statsRes, jobsRes] = await Promise.all([
                    getEmployerDashboardStats(),
                    getMyJobs()
                ]);
                setStats(statsRes.data.stats);
                setJobs((jobsRes.data.jobs || []).slice(0, 6));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading your dashboard...</p>
        </div>
    );

    const totalApps = stats?.totalApplications || 1;

    return (
        <div style={{ paddingTop: 80, background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <div className="container" style={{ padding: 'clamp(20px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>

                {/* Welcome Banner — emerald themed */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(6,182,212,0.07) 100%)',
                    border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-xl)',
                    padding: 'clamp(20px, 4vw, 32px)', marginBottom: 28, position: 'relative', overflow: 'hidden'
                }}>
                    <div className="glow-orb glow-orb-secondary" style={{ width: 350, height: 350, top: -120, right: -80, opacity: 0.4 }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700,
                                color: '#34d399', marginBottom: 12
                            }}>
                                <Building2 size={12} /> Employer
                            </div>
                            <h1 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, margin: '0 0 8px' }}>
                                {getGreeting()}, {user?.name?.split(' ')[0]} 🏢
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                                {stats?.activeJobs
                                    ? `You have ${stats.activeJobs} active job${stats.activeJobs !== 1 ? 's' : ''} · ${stats.totalApplications || 0} total applicant${(stats.totalApplications || 0) !== 1 ? 's' : ''}`
                                    : 'Post your first job and start finding great talent'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                            <Link to="/post-job" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 18px', gap: 6, background: 'linear-gradient(135deg,#059669,#10b981)', border: 'none' }}>
                                <Plus size={14} /> Post a Job
                            </Link>
                            <Link to="/company-profile" className="btn btn-secondary" style={{ fontSize: 13, padding: '9px 18px' }}>
                                Company Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: 14, marginBottom: 28 }}>
                    {[
                        { label: 'Active Jobs', value: stats?.activeJobs || 0, color: '#10b981', icon: <Briefcase size={18} />, to: '/my-jobs' },
                        { label: 'Total Applicants', value: stats?.totalApplications || 0, color: '#6366f1', icon: <Users size={18} />, to: '/applications' },
                        { label: 'Shortlisted', value: stats?.shortlisted || 0, color: '#34d399', icon: <CheckCircle size={18} />, to: '/applications?status=shortlisted' },
                        { label: 'Interviews', value: stats?.interviews || 0, color: '#a78bfa', icon: <Calendar size={18} />, to: '/applications?status=interview' },
                        { label: 'Hired', value: stats?.hired || 0, color: '#fbbf24', icon: <UserCheck size={18} />, to: '/applications?status=offered' },
                        { label: 'New Today', value: stats?.newApplicationsToday || 0, color: '#f472b6', icon: <Bell size={18} />, to: '/applications' },
                    ].map((s, i) => (
                        <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
                            <div className="dash-stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', height: '100%', transition: 'var(--transition)' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 4px 16px ${s.color}22`; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ width: 40, height: 40, background: `${s.color}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 12 }}>{s.icon}</div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Main 2-column grid */}
                <div className="employer-main-grid">
                    {/* Left: Active Job Postings */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
                        <div className="dash-recent-card">
                            <div className="dash-recent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Your Active Postings</h2>
                                <Link to="/my-jobs" className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '5px 10px' }}>
                                    Manage <ArrowRight size={11} />
                                </Link>
                            </div>
                            {jobs.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {jobs.map((job, i) => (
                                        <div key={i} className="dash-recent-item" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transition: 'var(--transition)' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                                                <Briefcase size={18} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
                                                    <span><Send size={10} style={{ verticalAlign: 'middle' }} /> {job.applicantsCount || 0} applicants</span>
                                                    {job.type && <span>· {job.type}</span>}
                                                </div>
                                            </div>
                                            <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: 10, flexShrink: 0 }}>
                                                {job.status === 'active' ? 'Active' : job.status || 'Closed'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '28px 16px' }}>
                                    <div className="empty-state-icon" style={{ fontSize: 36 }}>💼</div>
                                    <h3 style={{ fontSize: 15 }}>No jobs posted yet</h3>
                                    <p style={{ fontSize: 13 }}>Post your first job to start receiving applications</p>
                                    <Link to="/post-job" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                                        <Plus size={13} /> Post a Job
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Quick Actions */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
                            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { to: '/post-job', icon: <Plus size={15} />, label: 'Post a New Job', color: '#10b981' },
                                    { to: '/my-jobs', icon: <Layout size={15} />, label: 'Manage Postings', color: '#6366f1' },
                                    { to: '/applications', icon: <FileText size={15} />, label: 'View Applications', color: '#a78bfa' },
                                    { to: '/company-profile', icon: <Building2 size={15} />, label: 'Company Profile', color: '#f59e0b' },
                                    { to: '/profile', icon: <UserCheck size={15} />, label: 'Edit My Profile', color: '#60a5fa' },
                                ].map((a, i) => (
                                    <Link key={i} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'var(--transition)' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}10`; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                    >
                                        <span style={{ color: a.color, flexShrink: 0 }}>{a.icon}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                                        <ArrowRight size={12} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Hiring Funnel */}
                        <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.05))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
                            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Hiring Funnel</h3>
                            {[
                                { label: 'Applications In', value: stats?.totalApplications || 0, color: '#6366f1' },
                                { label: 'Shortlisted', value: stats?.shortlisted || 0, color: '#10b981' },
                                { label: 'Interviews', value: stats?.interviews || 0, color: '#a78bfa' },
                                { label: 'Offers Made', value: stats?.hired || 0, color: '#fbbf24' },
                            ].map((item, i) => {
                                const pct = i === 0 ? 100 : Math.min(100, Math.round((item.value / totalApps) * 100));
                                return (
                                    <div key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</span>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 99 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Job Performance */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
                            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Job Performance</h3>
                            {[
                                { icon: <Briefcase size={15} />, label: 'Total Jobs Posted', value: stats?.totalJobs || 0, color: '#10b981' },
                                { icon: <Eye size={15} />, label: 'Total Job Views', value: stats?.totalJobViews || 0, color: '#6366f1' },
                                { icon: <BarChart2 size={15} />, label: 'Avg. Applicants', value: stats?.activeJobs ? Math.round((stats?.totalApplications || 0) / stats.activeJobs) : 0, color: '#f59e0b' },
                            ].map((m, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 12 : 0 }}>
                                    <div style={{ width: 32, height: 32, background: `${m.color}18`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>{m.icon}</div>
                                    <div style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div id="feed"><SocialFeed /></div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root Router
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useAuth();
    return (user?.role === 'employer' || user?.role === 'admin') ? <EmployerDashboard /> : <JobSeekerDashboard />;
};

export default Dashboard;
