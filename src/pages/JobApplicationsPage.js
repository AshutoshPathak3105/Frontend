import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, User, MapPin, Phone, Download, Briefcase,
    GraduationCap, Code, ExternalLink, Calendar, X, ChevronRight,
    Users, FileText, Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getJobApplications, updateApplicationStatus,
    scheduleInterviewAPI, cancelInterviewAPI,
    getJob, getUploadUrl,
} from '../services/api';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    reviewing: { label: 'Reviewing', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    shortlisted: { label: 'Shortlisted', color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    interview: { label: 'Interview', color: 'var(--text-accent)', bg: 'var(--bg-primary-subtle)', border: 'var(--border-primary-subtle)' },
    offered: { label: 'Offered', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    withdrawn: { label: 'Withdrawn', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' },
};

const AvatarCircle = ({ user, size = 44 }) => {
    const src = user?.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`)
        : null;
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden', fontSize: size * 0.4,
            fontWeight: 700, color: 'white',
        }}>
            {src
                ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                : (user?.name?.[0]?.toUpperCase() || <User size={size * 0.4} />)}
        </div>
    );
};

const JobApplicationsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');

    // Interview scheduling state
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewType, setInterviewType] = useState('video');
    const [interviewNotes, setInterviewNotes] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [schedulingInterview, setSchedulingInterview] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [appsRes, jobRes] = await Promise.all([
                    getJobApplications(jobId),
                    getJob(jobId),
                ]);
                setApplications(appsRes.data.applications || []);
                setJob(jobRes.data.job || null);
            } catch {
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId]);

    const handleStatusUpdate = async (appId, status) => {
        try {
            await updateApplicationStatus(appId, { status });
            toast.success(`Candidate marked as ${STATUS_CONFIG[status]?.label || status}`);
            setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
            if (selectedApp?._id === appId) setSelectedApp(prev => ({ ...prev, status }));
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleScheduleInterview = async () => {
        if (!interviewDate) { toast.error('Please select a date and time'); return; }
        setSchedulingInterview(true);
        try {
            const isReschedule = selectedApp.status === 'interview' && selectedApp.interviewDate;
            await scheduleInterviewAPI(selectedApp._id, {
                interviewDate, interviewType, notes: interviewNotes, meetingLink,
            });
            toast.success(isReschedule
                ? 'Interview rescheduled! Candidate has been notified.'
                : 'Interview scheduled! Candidate notified via email & dashboard.');
            const updated = { ...selectedApp, status: 'interview', interviewDate, interviewType, meetingLink };
            setApplications(prev => prev.map(a => a._id === selectedApp._id ? updated : a));
            setSelectedApp(updated);
            setInterviewDate('');
            setInterviewNotes('');
            setMeetingLink('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule interview');
        } finally {
            setSchedulingInterview(false);
        }
    };

    const handleCancelInterview = async () => {
        if (!window.confirm('Cancel the scheduled interview for this candidate?')) return;
        try {
            await cancelInterviewAPI(selectedApp._id, { reason: '' });
            toast.success('Interview cancelled. Candidate has been notified.');
            const updated = { ...selectedApp, status: 'shortlisted', interviewDate: null, interviewType: null };
            setApplications(prev => prev.map(a => a._id === selectedApp._id ? updated : a));
            setSelectedApp(updated);
        } catch {
            toast.error('Failed to cancel interview');
        }
    };

    const selectCandidate = (app) => {
        setSelectedApp(app);
        if (app.status === 'interview' && app.interviewDate) {
            const dt = new Date(app.interviewDate);
            const pad = n => String(n).padStart(2, '0');
            setInterviewDate(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
            setInterviewType(app.interviewType || 'video');
            setInterviewNotes(app.notes || '');
            setMeetingLink(app.meetingLink || '');
        } else {
            setInterviewDate(''); setInterviewType('video');
            setInterviewNotes(''); setMeetingLink('');
        }
        // On mobile, scroll to top to show the detail panel
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filtered = filterStatus
        ? applications.filter(a => a.status === filterStatus)
        : applications;

    // Schedule Interview unlocked for shortlisted or already-scheduled candidates
    const showScheduleInterview = selectedApp &&
        (selectedApp.status === 'shortlisted' || selectedApp.status === 'interview') &&
        selectedApp.status !== 'withdrawn';

    const stats = {
        total: applications.length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        interviews: applications.filter(a => a.status === 'interview').length,
        offered: applications.filter(a => a.status === 'offered').length,
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading applications…</p>
        </div>
    );

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="container" style={{ padding: isMobile ? '20px 16px 56px' : '32px 24px 56px' }}>

                {/* ── Page Header ── */}
                <div style={{ marginBottom: 28 }}>
                    <button
                        onClick={() => navigate('/my-jobs')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                            marginBottom: 16, padding: 0,
                        }}
                    >
                        <ArrowLeft size={15} /> Back to My Jobs
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
                        <div>
                            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, marginBottom: 4, lineHeight: 1.2 }}>
                                {job?.title || 'Job Applications'}
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {job?.location && <span>{job.location}</span>}
                                {job?.type && <span>• {job.type}</span>}
                                <span>• {applications.length} applicant{applications.length !== 1 ? 's' : ''}</span>
                            </p>
                        </div>
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            style={{ width: isMobile ? '100%' : 'auto', minWidth: 160, alignSelf: isMobile ? 'stretch' : 'center' }}
                        >
                            <option value="">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stats Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: isMobile ? 10 : 12,
                        marginTop: 20
                    }}>
                        {[
                            { label: 'Total Applied', value: stats.total, color: '#6366f1', icon: <Users size={15} /> },
                            { label: 'Shortlisted', value: stats.shortlisted, color: '#10b981', icon: <FileText size={15} /> },
                            { label: 'Interviews', value: stats.interviews, color: '#a78bfa', icon: <Calendar size={15} /> },
                            { label: 'Offers Made', value: stats.offered, color: '#f59e0b', icon: <Mail size={15} /> },
                        ].map((s, i) => (
                            <div key={i} style={{
                                padding: isMobile ? '10px 14px' : '12px 20px', borderRadius: 12,
                                background: `${s.color}14`, border: `1px solid ${s.color}30`,
                                display: 'flex', flexDirection: 'column',
                            }}>
                                <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: s.color }}>{s.value}</span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Main Content ── */}
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
                            {filterStatus
                                ? `No ${STATUS_CONFIG[filterStatus]?.label} candidates`
                                : 'No applications yet'}
                        </h3>
                        <p>Applications will appear here once candidates apply.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: (selectedApp && !isMobile) ? 'minmax(280px, 340px) 1fr' : '1fr',
                        gap: isMobile ? 12 : 20,
                        alignItems: 'start',
                    }}>
                        {/* ── Candidate List — Hidden on mobile if viewing details ── */}
                        {(!selectedApp || !isMobile) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: isMobile ? 8 : 0 }}>
                                {filtered.map(app => (
                                    <div
                                        key={app._id}
                                        onClick={() => selectCandidate(app)}
                                        style={{
                                            background: selectedApp?._id === app._id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                            border: `1px solid ${selectedApp?._id === app._id ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '14px 16px',
                                            cursor: 'pointer',
                                            transition: 'var(--transition)',
                                            boxShadow: selectedApp?._id === app._id ? '0 0 0 2px rgba(99,102,241,0.15)' : 'none',
                                        }}
                                        onMouseEnter={e => { if (selectedApp?._id !== app._id) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                                        onMouseLeave={e => { if (selectedApp?._id !== app._id) e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <AvatarCircle user={app.applicant} size={44} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {app.applicant?.name || 'Unknown'}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {app.applicant?.email}
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                                        background: STATUS_CONFIG[app.status]?.bg,
                                                        color: STATUS_CONFIG[app.status]?.color,
                                                        border: `1px solid ${STATUS_CONFIG[app.status]?.border}`,
                                                    }}>
                                                        {STATUS_CONFIG[app.status]?.label}
                                                    </span>
                                                    {app.status === 'interview' && app.interviewDate && (
                                                        <span style={{ fontSize: 11, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <Calendar size={10} />
                                                            {new Date(app.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Candidate Detail Panel ── */}
                        {selectedApp && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: isMobile ? 12 : 0 }}>
                                {/* Mobile Back to List button */}


                                <div style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: 'clamp(18px, 3vw, 28px)',
                                    position: isMobile ? 'static' : 'sticky',
                                    top: 100,
                                    maxHeight: isMobile ? 'none' : 'calc(100vh - 120px)',
                                    overflowY: isMobile ? 'visible' : 'auto',
                                }}>
                                    {/* Panel Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <AvatarCircle user={selectedApp.applicant} size={54} />
                                            <div style={{ minWidth: 0 }}>
                                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedApp.applicant?.name}</h3>
                                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedApp.applicant?.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedApp(null)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Status + Interview Date Badge */}
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
                                        <span style={{
                                            padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                            background: STATUS_CONFIG[selectedApp.status]?.bg,
                                            color: STATUS_CONFIG[selectedApp.status]?.color,
                                            border: `1px solid ${STATUS_CONFIG[selectedApp.status]?.border}`,
                                        }}>
                                            {STATUS_CONFIG[selectedApp.status]?.label}
                                        </span>
                                        {selectedApp.status === 'interview' && selectedApp.interviewDate && (
                                            <span style={{
                                                padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                                background: 'var(--bg-primary-subtle)', color: 'var(--text-accent)',
                                                border: '1px solid var(--border-primary-subtle)',
                                                display: 'flex', alignItems: 'center', gap: 5,
                                            }}>
                                                <Calendar size={11} />
                                                {new Date(selectedApp.interviewDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                {selectedApp.interviewType && ` · ${selectedApp.interviewType}`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Candidate Profile Block */}
                                    <div style={{
                                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                        borderRadius: 12, padding: 16, marginBottom: 18,
                                    }}>
                                        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                                            Candidate Profile
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                            {selectedApp.applicant?.phone && (
                                                <div style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}>
                                                    <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                    <span style={{ color: 'var(--text-secondary)' }}>{selectedApp.applicant.phone}</span>
                                                </div>
                                            )}
                                            {selectedApp.applicant?.location && (
                                                <div style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}>
                                                    <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                    <span style={{ color: 'var(--text-secondary)' }}>{selectedApp.applicant.location}</span>
                                                </div>
                                            )}
                                            {selectedApp.applicant?.skills?.length > 0 && (
                                                <div>
                                                    <div style={{ display: 'flex', gap: 5, marginBottom: 6, alignItems: 'center' }}>
                                                        <Code size={13} style={{ color: 'var(--text-muted)' }} />
                                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                        {selectedApp.applicant.skills.slice(0, 12).map((s, i) => (
                                                            <span key={i} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedApp.applicant?.experience?.length > 0 && (
                                                <div>
                                                    <div style={{ display: 'flex', gap: 5, marginBottom: 6, alignItems: 'center' }}>
                                                        <Briefcase size={13} style={{ color: 'var(--text-muted)' }} />
                                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</span>
                                                    </div>
                                                    {selectedApp.applicant.experience.slice(0, 2).map((e, i) => (
                                                        <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                                                            <strong style={{ color: 'var(--text-primary)' }}>{e.title}</strong> at {e.company}
                                                            {e.from && <span style={{ color: 'var(--text-muted)' }}> · {new Date(e.from).getFullYear()}–{e.current ? 'Present' : (e.to ? new Date(e.to).getFullYear() : '')}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedApp.applicant?.education?.length > 0 && (
                                                <div>
                                                    <div style={{ display: 'flex', gap: 5, marginBottom: 6, alignItems: 'center' }}>
                                                        <GraduationCap size={13} style={{ color: 'var(--text-muted)' }} />
                                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Education</span>
                                                    </div>
                                                    {selectedApp.applicant.education.slice(0, 2).map((e, i) => (
                                                        <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                                                            <strong style={{ color: 'var(--text-primary)' }}>{e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}</strong> — {e.school}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Action Links */}
                                            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
                                                {(selectedApp.applicant?.resume || selectedApp.resume) && (
                                                    <a href={getUploadUrl(selectedApp.applicant?.resume || selectedApp.resume)} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', textDecoration: 'none' }}>
                                                        <Download size={12} /> Resume
                                                    </a>
                                                )}
                                                {selectedApp.applicant?.linkedIn && (
                                                    <a href={selectedApp.applicant.linkedIn} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', textDecoration: 'none' }}>
                                                        <ExternalLink size={12} /> LinkedIn
                                                    </a>
                                                )}
                                                {selectedApp.applicant?.github && (
                                                    <a href={selectedApp.applicant.github} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', textDecoration: 'none' }}>
                                                        <ExternalLink size={12} /> GitHub
                                                    </a>
                                                )}
                                                {selectedApp.applicant?.portfolio && (
                                                    <a href={selectedApp.applicant.portfolio} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', textDecoration: 'none' }}>
                                                        <ExternalLink size={12} /> Portfolio
                                                    </a>
                                                )}
                                                <Link
                                                    to={`/users/profile/${selectedApp.applicant?._id}`}
                                                    target="_blank"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)', textDecoration: 'none' }}>
                                                    <User size={12} /> Full Profile
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cover Letter */}
                                    {selectedApp.coverLetter && (
                                        <div style={{ marginBottom: 18 }}>
                                            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Cover Letter</h4>
                                            <div style={{
                                                background: 'var(--bg-secondary)', borderRadius: 10, padding: 14,
                                                color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7,
                                                whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto',
                                            }}>
                                                {selectedApp.coverLetter}
                                            </div>
                                        </div>
                                    )}

                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                                        Applied {new Date(selectedApp.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>

                                    {/* ── Status Update ── */}
                                    {selectedApp.status !== 'withdrawn' && (
                                        <div style={{ marginBottom: 18 }}>
                                            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Update Status</h4>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {Object.entries(STATUS_CONFIG)
                                                    .filter(([k]) => k !== 'withdrawn' && k !== 'interview')
                                                    .map(([status, config]) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusUpdate(selectedApp._id, status)}
                                                            style={{
                                                                padding: '5px 13px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                                                cursor: 'pointer', fontFamily: 'Inter',
                                                                background: selectedApp.status === status ? config.bg : 'transparent',
                                                                color: selectedApp.status === status ? config.color : 'var(--text-secondary)',
                                                                border: `1px solid ${selectedApp.status === status ? config.border : 'var(--border)'}`,
                                                                transition: 'var(--transition)',
                                                            }}
                                                        >
                                                            {config.label}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Schedule Interview — only shown when shortlisted or already interview ── */}
                                    {showScheduleInterview && (
                                        <div style={{
                                            background: 'var(--bg-primary-subtle)',
                                            border: '1px solid var(--border-primary-subtle)',
                                            borderRadius: 12,
                                            padding: '18px 16px 28px',
                                        }}>
                                            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <Calendar size={14} />
                                                {selectedApp.status === 'interview' && selectedApp.interviewDate ? 'Reschedule Interview' : 'Schedule Interview'}
                                                {selectedApp.interviewDate && (
                                                    <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--bg-primary-subtle)', color: 'var(--text-accent)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                                                        {new Date(selectedApp.interviewDate).toLocaleDateString('en-IN')}
                                                    </span>
                                                )}
                                            </h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 10 }}>
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Date & Time *</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-input"
                                                        value={interviewDate}
                                                        onChange={e => setInterviewDate(e.target.value)}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                        style={{ fontSize: 12, padding: '7px 10px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Type</label>
                                                    <select
                                                        className="form-select"
                                                        value={interviewType}
                                                        onChange={e => setInterviewType(e.target.value)}
                                                        style={{ fontSize: 12, padding: '7px 10px' }}
                                                    >
                                                        <option value="video">🎥 Video Call</option>
                                                        <option value="phone">📞 Phone Call</option>
                                                        <option value="in-person">🏢 In-Person</option>
                                                        <option value="technical">💻 Technical Round</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: 10 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Meeting Link</label>
                                                <input
                                                    type="url"
                                                    className="form-input"
                                                    placeholder="https://meet.google.com/…"
                                                    value={meetingLink}
                                                    onChange={e => setMeetingLink(e.target.value)}
                                                    style={{ fontSize: 12, padding: '7px 10px' }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: 12 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Notes / Instructions</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={2}
                                                    placeholder="e.g. Bring portfolio, business casual attire…"
                                                    value={interviewNotes}
                                                    onChange={e => setInterviewNotes(e.target.value)}
                                                    style={{ fontSize: 12, padding: '7px 10px', resize: 'vertical' }}
                                                />
                                            </div>
                                            <button
                                                onClick={handleScheduleInterview}
                                                disabled={schedulingInterview || !interviewDate}
                                                className="btn btn-primary btn-sm"
                                                style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                                            >
                                                {schedulingInterview
                                                    ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Scheduling…</>
                                                    : <><Calendar size={13} /> {selectedApp.status === 'interview' && selectedApp.interviewDate ? 'Reschedule & Notify' : 'Schedule & Notify Candidate'}</>
                                                }
                                            </button>
                                            {selectedApp.status === 'interview' && selectedApp.interviewDate && (
                                                <button
                                                    onClick={handleCancelInterview}
                                                    className="btn btn-primary btn-sm"
                                                    style={{ width: '100%', justifyContent: 'center', marginTop: 7, fontSize: 13 }}
                                                >
                                                    <X size={14} /> Cancel Interview
                                                </button>
                                            )}
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 20, textAlign: 'center' }}>
                                                Candidate will receive an email & in-app notification.
                                            </p>
                                        </div>
                                    )}

                                    {/* Hint — shown only when candidate is NOT shortlisted yet */}
                                    {!showScheduleInterview && selectedApp.status !== 'withdrawn' && (
                                        <div style={{
                                            background: 'rgba(250,204,21,0.07)',
                                            border: '1px solid rgba(250,204,21,0.2)',
                                            borderRadius: 10, padding: '11px 14px',
                                            fontSize: 12, color: 'var(--text-muted)',
                                            display: 'flex', gap: 8, alignItems: 'center',
                                        }}>
                                            <Calendar size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                                            <span>
                                                Mark as <strong style={{ color: '#34d399' }}>Shortlisted</strong> above to unlock the{' '}
                                                <strong style={{ color: '#a78bfa' }}>Schedule Interview</strong> option.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobApplicationsPage;
