import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Eye, X, Calendar, User, Download, Briefcase, GraduationCap, Code, ExternalLink, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyApplications, getCompanyApplications, updateApplicationStatus, withdrawApplication, scheduleInterviewAPI, cancelInterviewAPI, getUploadUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    reviewing: { label: 'Reviewing', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    shortlisted: { label: 'Shortlisted', color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    interview: { label: 'Interview', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
    offered: { label: 'Accepted', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    withdrawn: { label: 'Withdrawn', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' },
};

const Applications = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);

    // Interview scheduling state
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewType, setInterviewType] = useState('video');
    const [interviewNotes, setInterviewNotes] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [schedulingInterview, setSchedulingInterview] = useState(false);

    const isEmployer = user?.role === 'employer' || user?.role === 'admin';

    useEffect(() => {
        const status = searchParams.get('status');
        if (status) setFilterStatus(status);
        fetchApplications();
    }, [isEmployer, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = isEmployer ? await getCompanyApplications() : await getMyApplications();
            setApplications(isEmployer ? (res.data.applications || []) : (res.data.applications || []));
        } catch (err) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (id) => {
        if (!window.confirm('Withdraw this application?')) return;
        try {
            await withdrawApplication(id);
            toast.success('Application withdrawn');
            fetchApplications();
        } catch (err) {
            toast.error('Failed to withdraw application');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateApplicationStatus(id, { status });
            toast.success(`Application marked as ${status}`);
            setApplications(prev => prev.map(a => a._id === id ? { ...a, status } : a));
            if (selectedApp?._id === id) setSelectedApp(prev => ({ ...prev, status }));
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleScheduleInterview = async () => {
        if (!interviewDate) {
            toast.error('Please select an interview date and time');
            return;
        }
        setSchedulingInterview(true);
        try {
            const isReschedule = selectedApp.status === 'interview' && selectedApp.interviewDate;
            await scheduleInterviewAPI(selectedApp._id, {
                interviewDate,
                interviewType,
                notes: interviewNotes,
                meetingLink,
            });
            toast.success(isReschedule
                ? 'Interview rescheduled! Applicant has been notified.'
                : 'Interview scheduled! Applicant has been notified via email and dashboard.');
            setApplications(prev => prev.map(a =>
                a._id === selectedApp._id
                    ? { ...a, status: 'interview', interviewDate, interviewType, meetingLink }
                    : a
            ));
            setSelectedApp(prev => ({ ...prev, status: 'interview', interviewDate, interviewType, meetingLink }));
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
        if (!window.confirm('Cancel the scheduled interview for this applicant?')) return;
        try {
            await cancelInterviewAPI(selectedApp._id, { reason: '' });
            toast.success('Interview cancelled. Applicant has been notified.');
            setApplications(prev => prev.map(a =>
                a._id === selectedApp._id
                    ? { ...a, status: 'shortlisted', interviewDate: null, interviewType: null }
                    : a
            ));
            setSelectedApp(prev => ({ ...prev, status: 'shortlisted', interviewDate: null, interviewType: null }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel interview');
        }
    };

    const filtered = filterStatus ? applications.filter(a => a.status === filterStatus) : applications;

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading applications...</p>
        </div>
    );

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Detail Modal */}
            {selectedApp && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(16px, 4vw, 36px)', maxWidth: 680, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                                    {isEmployer ? selectedApp.applicant?.name : selectedApp.job?.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                    {isEmployer ? selectedApp.applicant?.email : selectedApp.company?.name}
                                </p>
                            </div>
                            <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, background: STATUS_CONFIG[selectedApp.status]?.bg, color: STATUS_CONFIG[selectedApp.status]?.color, border: `1px solid ${STATUS_CONFIG[selectedApp.status]?.border}` }}>
                                {STATUS_CONFIG[selectedApp.status]?.label}
                            </span>
                            {selectedApp.status === 'interview' && selectedApp.interviewDate && (
                                <span style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={12} />
                                    {new Date(selectedApp.interviewDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    {selectedApp.interviewType && ` · ${selectedApp.interviewType}`}
                                </span>
                            )}
                        </div>

                        {/* Job seeker: interview reminder box */}
                        {!isEmployer && selectedApp.status === 'interview' && selectedApp.interviewDate && (
                            <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    🎯 Interview Scheduled
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                                    <span><strong style={{ color: 'var(--text-primary)' }}>Date & Time:</strong> {new Date(selectedApp.interviewDate).toLocaleString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                    {selectedApp.interviewType && (
                                        <span><strong style={{ color: 'var(--text-primary)' }}>Format:</strong> {
                                            { phone: '📞 Phone Call', video: '🎥 Video Call', 'in-person': '🏢 In-Person', technical: '💻 Technical Round' }[selectedApp.interviewType] || selectedApp.interviewType
                                        }</span>
                                    )}
                                    {selectedApp.meetingLink && (
                                        <span><strong style={{ color: 'var(--text-primary)' }}>Meeting Link:</strong>{' '}
                                            <a href={selectedApp.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <ExternalLink size={12} /> Join Meeting
                                            </a>
                                        </span>
                                    )}
                                    {selectedApp.notes && (
                                        <span><strong style={{ color: 'var(--text-primary)' }}>Notes:</strong> {selectedApp.notes}</span>
                                    )}
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>A confirmation email has been sent to your registered email address.</p>
                            </div>
                        )}

                        {/* Employer: Applicant Profile Summary */}
                        {isEmployer && selectedApp.applicant && (
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Candidate Profile</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {selectedApp.applicant.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                            <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{selectedApp.applicant.phone}</span>
                                        </div>
                                    )}
                                    {selectedApp.applicant.location && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                            <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{selectedApp.applicant.location}</span>
                                        </div>
                                    )}
                                    {/* Skills */}
                                    {selectedApp.applicant.skills?.length > 0 && (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                <Code size={13} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Skills</span>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {selectedApp.applicant.skills.slice(0, 10).map((s, i) => (
                                                    <span key={i} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)' }}>{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Experience */}
                                    {selectedApp.applicant.experience?.length > 0 && (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                <Briefcase size={13} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Experience</span>
                                            </div>
                                            {selectedApp.applicant.experience.slice(0, 2).map((e, i) => (
                                                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                                    <strong style={{ color: 'var(--text-primary)' }}>{e.title}</strong> at {e.company}
                                                    {e.from && <span style={{ color: 'var(--text-muted)' }}> · {new Date(e.from).getFullYear()}–{e.current ? 'Present' : (e.to ? new Date(e.to).getFullYear() : '')}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Education */}
                                    {selectedApp.applicant.education?.length > 0 && (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                <GraduationCap size={13} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Education</span>
                                            </div>
                                            {selectedApp.applicant.education.slice(0, 2).map((e, i) => (
                                                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                                    <strong style={{ color: 'var(--text-primary)' }}>{e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}</strong> — {e.school}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* External Links */}
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                                        {selectedApp.resume && (
                                            <a href={getUploadUrl(selectedApp.resume)} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', textDecoration: 'none' }}>
                                                <Download size={12} /> Download Resume
                                            </a>
                                        )}
                                        {selectedApp.applicant.linkedIn && (
                                            <a href={selectedApp.applicant.linkedIn} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', textDecoration: 'none' }}>
                                                <ExternalLink size={12} /> LinkedIn
                                            </a>
                                        )}
                                        {selectedApp.applicant.github && (
                                            <a href={selectedApp.applicant.github} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', textDecoration: 'none' }}>
                                                <ExternalLink size={12} /> GitHub
                                            </a>
                                        )}
                                        {selectedApp.applicant.portfolio && (
                                            <a href={selectedApp.applicant.portfolio} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', textDecoration: 'none' }}>
                                                <ExternalLink size={12} /> Portfolio
                                            </a>
                                        )}
                                        <Link to={`/users/profile/${selectedApp.applicant._id}`} target="_blank"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)', textDecoration: 'none' }}>
                                            <User size={12} /> Full Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedApp.coverLetter && (
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>Cover Letter</h4>
                                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {selectedApp.coverLetter}
                                </div>
                            </div>
                        )}

                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                            Applied on {new Date(selectedApp.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>

                        {isEmployer && selectedApp.status !== 'withdrawn' && (
                            <div>
                                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Update Status</h4>
                                {['offered', 'rejected'].includes(selectedApp.status) && (
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Status has been finalised and cannot be changed.</p>
                                )}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                                    {Object.entries(STATUS_CONFIG).filter(([k]) => k === 'offered' || k === 'rejected').map(([status, config]) => {
                                        const isFinalized = ['offered', 'rejected'].includes(selectedApp.status);
                                        return (
                                        <button key={status}
                                            onClick={() => !isFinalized && handleStatusUpdate(selectedApp._id, status)}
                                            disabled={isFinalized}
                                            style={{
                                                padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                                                cursor: isFinalized ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
                                                opacity: isFinalized && selectedApp.status !== status ? 0.35 : 1,
                                                background: selectedApp.status === status ? config.bg : 'transparent',
                                                color: selectedApp.status === status ? config.color : 'var(--text-secondary)',
                                                border: `1px solid ${selectedApp.status === status ? config.border : 'var(--border)'}`,
                                                transition: 'var(--transition)'
                                            }}>
                                            {config.label}
                                        </button>
                                        );
                                    })}
                                </div>

                                {/* ── Interview Scheduling Section ── */}
                                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: '20px 20px 16px' }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Calendar size={15} /> Schedule Interview
                                        {selectedApp.interviewDate && (
                                            <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                                                Currently: {new Date(selectedApp.interviewDate).toLocaleDateString('en-IN')}
                                            </span>
                                        )}
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date & Time *</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={interviewDate}
                                                onChange={e => setInterviewDate(e.target.value)}
                                                min={new Date().toISOString().slice(0, 16)}
                                                style={{ fontSize: 13, padding: '8px 12px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Interview Type</label>
                                            <select className="form-select" value={interviewType} onChange={e => setInterviewType(e.target.value)} style={{ fontSize: 13, padding: '8px 12px' }}>
                                                <option value="video">🎥 Video Call</option>
                                                <option value="phone">📞 Phone Call</option>
                                                <option value="in-person">🏢 In-Person</option>
                                                <option value="technical">💻 Technical Round</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Meeting Link (Zoom / Google Meet / Teams)</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            placeholder="https://meet.google.com/xxx-yyy-zzz"
                                            value={meetingLink}
                                            onChange={e => setMeetingLink(e.target.value)}
                                            style={{ fontSize: 13, padding: '8px 12px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notes / Instructions (optional)</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={2}
                                            placeholder="e.g. Please bring your portfolio, wear business casual..."
                                            value={interviewNotes}
                                            onChange={e => setInterviewNotes(e.target.value)}
                                            style={{ fontSize: 13, padding: '8px 12px', resize: 'vertical' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleScheduleInterview}
                                        disabled={schedulingInterview || !interviewDate}
                                        className="btn btn-primary btn-sm"
                                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', width: '100%', justifyContent: 'center' }}
                                    >
                                        {schedulingInterview
                                            ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Scheduling...</>
                                            : selectedApp.status === 'interview' && selectedApp.interviewDate
                                                ? <><Calendar size={14} /> Reschedule Interview & Notify Applicant</>
                                                : <><Calendar size={14} /> Schedule Interview & Notify Applicant</>
                                        }
                                    </button>
                                    {selectedApp.status === 'interview' && selectedApp.interviewDate && (
                                        <button
                                            onClick={handleCancelInterview}
                                            className="btn btn-sm"
                                            style={{ width: '100%', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', marginTop: 6 }}
                                        >
                                            <X size={14} /> Cancel Interview
                                        </button>
                                    )}
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                                        The applicant will receive an email and in-app notification with the interview details.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="container" style={{ padding: '40px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                            {isEmployer ? 'Received Applications' : 'My Applications'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{filtered.length} application{filtered.length !== 1 ? 's' : ''}</p>
                    </div>
                    <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
                        <option value="">All Statuses</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>

                {filtered.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {filtered.map(app => (
                            <div key={app._id} style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderLeft: `4px solid ${STATUS_CONFIG[app.status]?.color || 'var(--border)'}`,
                                borderRadius: 'var(--radius-xl)',
                                padding: '20px 22px',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    e.currentTarget.style.borderTopColor = STATUS_CONFIG[app.status]?.color || 'var(--border-hover)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = '';
                                    e.currentTarget.style.boxShadow = '';
                                    e.currentTarget.style.borderTopColor = 'var(--border)';
                                }}
                            >
                                {/* Top row: logo + info */}
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    {/* Logo */}
                                    <div style={{
                                        width: 54, height: 54,
                                        background: app.job?.company?.logo ? 'var(--bg-secondary)' : 'var(--gradient-primary)',
                                        borderRadius: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 22, flexShrink: 0, overflow: 'hidden',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {isEmployer
                                            ? <User size={22} color="white" />
                                            : app.job?.company?.logo
                                                ? <img src={app.job.company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : '🏢'}
                                    </div>

                                    {/* Text info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{
                                            fontWeight: 700, fontSize: 16, marginBottom: 3,
                                            lineHeight: 1.35, color: 'var(--text-primary)',
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {isEmployer ? app.applicant?.name : app.job?.title}
                                        </h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 500 }}>
                                            {isEmployer ? app.job?.title : app.job?.company?.name}
                                        </p>

                                        {/* Meta chips */}
                                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                            {!isEmployer && app.job?.location && (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    fontSize: 12, color: 'var(--text-muted)',
                                                    background: 'var(--bg-secondary)',
                                                    padding: '3px 9px', borderRadius: 99,
                                                    border: '1px solid var(--border)'
                                                }}>
                                                    <MapPin size={11} />{app.job.location}
                                                </span>
                                            )}
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                fontSize: 12, color: 'var(--text-muted)',
                                                background: 'var(--bg-secondary)',
                                                padding: '3px 9px', borderRadius: 99,
                                                border: '1px solid var(--border)'
                                            }}>
                                                <Clock size={11} />
                                                {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {app.status === 'interview' && app.interviewDate && (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    fontSize: 12, fontWeight: 600,
                                                    background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
                                                    border: '1px solid rgba(139,92,246,0.3)',
                                                    padding: '3px 9px', borderRadius: 99
                                                }}>
                                                    <Calendar size={11} />
                                                    Interview: {new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom row: status badge + action buttons */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    marginTop: 16, paddingTop: 14,
                                    borderTop: '1px solid var(--border)',
                                    gap: 10, flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                                        background: STATUS_CONFIG[app.status]?.bg,
                                        color: STATUS_CONFIG[app.status]?.color,
                                        border: `1px solid ${STATUS_CONFIG[app.status]?.border}`,
                                        letterSpacing: '0.02em'
                                    }}>
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: STATUS_CONFIG[app.status]?.color,
                                            display: 'inline-block', flexShrink: 0
                                        }} />
                                        {STATUS_CONFIG[app.status]?.label || app.status}
                                    </span>

                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <button onClick={() => {
                                            setSelectedApp(app);
                                            if (app.status === 'interview' && app.interviewDate) {
                                                const dt = new Date(app.interviewDate);
                                                const pad = n => String(n).padStart(2, '0');
                                                setInterviewDate(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
                                                setInterviewType(app.interviewType || 'video');
                                                setInterviewNotes(app.notes || '');
                                                setMeetingLink(app.meetingLink || '');
                                            } else {
                                                setInterviewDate('');
                                                setInterviewType('video');
                                                setInterviewNotes('');
                                                setMeetingLink('');
                                            }
                                        }} className="btn btn-secondary btn-sm">
                                            <Eye size={13} /> Details
                                        </button>
                                        {!isEmployer && app.status === 'pending' && (
                                            <button onClick={() => handleWithdraw(app._id)} className="btn btn-sm"
                                                style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                <X size={13} /> Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                            {filterStatus ? `No ${STATUS_CONFIG[filterStatus]?.label.toLowerCase()} applications` : 'No applications yet'}
                        </h3>
                        <p>{isEmployer ? 'Applications will appear here when candidates apply to your jobs' : 'Start applying to jobs to track your progress here'}</p>
                        {!isEmployer && (
                            <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 24 }}>Browse Jobs</Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Applications;
