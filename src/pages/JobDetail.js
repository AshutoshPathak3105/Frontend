import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin, Briefcase, Users, Calendar,
    BookmarkPlus, BookmarkCheck, CheckCircle, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getJob, applyJob, toggleSaveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    useEffect(() => {
        fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchJob = async () => {
        try {
            const res = await getJob(id);
            setJob(res.data.job);
        } catch (err) {
            toast.error('Job not found');
            navigate('/jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!isAuthenticated) { toast.error('Please login to save jobs'); navigate('/login'); return; }
        try {
            await toggleSaveJob(id);
            setSaved(!saved);
            toast.success(saved ? 'Job removed from saved' : 'Job saved successfully!');
        } catch (err) {
            toast.error('Failed to save job');
        }
    };

    const handleApply = async () => {
        if (!isAuthenticated) { toast.error('Please login to apply'); navigate('/login'); return; }
        if (user?.role !== 'jobseeker') { toast.error('Only job seekers can apply'); return; }
        setApplying(true);
        try {
            await applyJob({ jobId: id, coverLetter });
            toast.success('Application submitted successfully! 🎉');
            setShowApplyModal(false);
            setCoverLetter('');
            fetchJob();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Salary not disclosed';
        // Force Indian Rupee formatting
        const fmt = (n) => {
            const formatted = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(n);
            return formatted;
        };
        if (min && max) return `${fmt(min)} - ${fmt(max)}`;
        if (min) return `From ${fmt(min)}`;
        return `Up to ${fmt(max)}`;
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading job details...</p>
        </div>
    );

    if (!job) return null;

    const isExpired = new Date(job.deadline) < new Date();
    const hasApplied = job.hasApplied;

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Apply Modal */}
            {showApplyModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
                }}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)', padding: 'clamp(16px, 4vw, 36px)', maxWidth: 560, width: '100%',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Apply for {job.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                            at {job.company?.name}
                        </p>
                        <div className="form-group">
                            <label className="form-label">Cover Letter (Optional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Tell the employer why you're a great fit for this role..."
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                                rows={6}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowApplyModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleApply} disabled={applying} className="btn btn-primary">
                                {applying ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</> : <><Send size={16} /> Submit Application</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container" style={{ padding: 'clamp(20px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
                <div className="job-detail-grid">
                    {/* Main Content */}
                    <div>
                        {/* Job Header */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)', marginBottom: 24
                        }}>
                            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: 72, height: 72, background: 'var(--gradient-primary)',
                                    borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 28, flexShrink: 0
                                }}>
                                    {job.company?.logo ? <img src={job.company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} /> : '🏢'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                        {job.featured && <span className="badge badge-warning">⭐ Featured</span>}
                                        {isExpired && <span className="badge badge-danger">Expired</span>}
                                        <span className="badge badge-primary">{job.type}</span>
                                    </div>
                                    <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, marginBottom: 8 }}>{job.title}</h1>
                                    <Link to={`/companies/${job.company?._id}`} style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: 16 }}>
                                        {job.company?.name}
                                    </Link>
                                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 16 }}>
                                        {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}><MapPin size={14} />{job.location}</span>}
                                        {job.type && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}><Briefcase size={14} />{job.type}</span>}
                                        {job.experience && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}><Users size={14} />{job.experience}</span>}
                                        {job.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: isExpired ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 14 }}><Calendar size={14} />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Job Description</h2>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>
                                {job.description}
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements?.length > 0 && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Requirements</h2>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {job.requirements.map((req, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: 14 }}>
                                            <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Skills */}
                        {job.skills?.length > 0 && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Required Skills</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {job.skills.map((skill, i) => (
                                        <span key={i} className="tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="job-detail-sidebar" style={{ position: 'sticky', top: 100 }}>
                        {/* Apply Card */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 3vw, 28px)', marginBottom: 20
                        }}>
                            {job.salary?.min || job.salary?.max ? (
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Salary Range</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                                        {formatSalary(job.salary?.min, job.salary?.max)}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>per year</div>
                                </div>
                            ) : null}

                            {hasApplied ? (
                                <div style={{
                                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                                    borderRadius: 'var(--radius-md)', padding: '14px 20px', textAlign: 'center',
                                    color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}>
                                    <CheckCircle size={18} /> Already Applied
                                </div>
                            ) : isExpired ? (
                                <div style={{
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: 'var(--radius-md)', padding: '14px 20px', textAlign: 'center',
                                    color: 'var(--danger)', fontWeight: 600
                                }}>Application Closed</div>
                            ) : (
                                <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: 15 }}>
                                    <Send size={16} /> Apply Now
                                </button>
                            )}

                            <button onClick={handleSave} className="btn btn-secondary btn-full" style={{ marginTop: 12 }}>
                                {saved ? <><BookmarkCheck size={16} /> Saved</> : <><BookmarkPlus size={16} /> Save Job</>}
                            </button>
                        </div>

                        {/* Job Overview */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 3vw, 28px)' }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Job Overview</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { icon: <Briefcase size={16} />, label: 'Job Type', value: job.type },
                                    { icon: <MapPin size={16} />, label: 'Location', value: job.location },
                                    { icon: <Users size={16} />, label: 'Experience', value: job.experience },
                                    { icon: <Calendar size={16} />, label: 'Posted', value: new Date(job.createdAt).toLocaleDateString() },
                                    { icon: <Users size={16} />, label: 'Applicants', value: `${job.applicantsCount || 0} applied` },
                                ].filter(item => item.value).map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ width: 36, height: 36, background: 'rgba(99,102,241,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
