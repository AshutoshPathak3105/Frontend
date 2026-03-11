import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin, Briefcase, Users, Calendar,
    BookmarkPlus, BookmarkCheck, CheckCircle, Send,
    Building2, Globe, Clock, ChevronLeft, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getJob, applyJob, toggleSaveJob, getUploadUrl } from '../services/api';
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
        const fmt = (n) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(n);
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 80 }}>
            <style>{`
                .job-hero {
                    background: var(--gradient-hero);
                    padding: 100px 0 60px;
                    border-bottom: 1px solid var(--border);
                    position: relative;
                }
                .job-hero::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, var(--primary), transparent);
                    opacity: 0.3;
                }
                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 24px;
                    transition: var(--transition);
                }
                .back-btn:hover { color: var(--primary); transform: translateX(-4px); }

                .content-box {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 28px;
                    padding: 32px;
                    margin-bottom: 24px;
                    transition: var(--transition);
                }
                .content-box:hover { border-color: var(--border-hover); }

                .sidebar-widget {
                    background: var(--bg-glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 28px;
                    margin-bottom: 20px;
                }

                .pill-badge {
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                @media (max-width: 768px) {
                    .job-hero { padding: 100px 0 40px; }
                    .content-box { padding: 24px; }
                    .desktop-flex { flex-direction: column; align-items: flex-start !important; gap: 20px; }
                }

                @media (min-width: 1025px) {
                    .desktop-hide { display: none !important; }
                }
                @media (max-width: 1024px) {
                    .mobile-hide { display: none !important; }
                }
            `}</style>

            {/* Apply Modal */}
            {showApplyModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="glass-panel" style={{
                        borderRadius: 32, padding: 36, maxWidth: 560, width: '100%',
                        position: 'relative'
                    }}>
                        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Apply for this Role</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 28 }}>
                            You are applying for <strong>{job.title}</strong> at <strong>{job.company?.name}</strong>.
                        </p>
                        <textarea
                            className="form-textarea"
                            placeholder="Briefly explain why you're a good fit..."
                            value={coverLetter}
                            onChange={e => setCoverLetter(e.target.value)}
                            style={{ borderRadius: 16, marginBottom: 24 }}
                            rows={5}
                        />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowApplyModal(false)} className="btn btn-secondary">Discard</button>
                            <button onClick={handleApply} disabled={applying} className="btn btn-primary" style={{ minWidth: 160 }}>
                                {applying ? 'Submitting...' : 'Send Application'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="job-hero">
                <div className="container">

                    <div className="desktop-flex" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                        <div style={{
                            width: 88, height: 88, borderRadius: 24, background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', flexShrink: 0,
                            overflow: 'hidden', border: '4px solid var(--bg-card)', boxShadow: 'var(--shadow-md)'
                        }}>
                            {job.company?.logo ? (
                                <img src={getUploadUrl(job.company.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : job.company?.name?.[0]?.toUpperCase()}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                {job.featured && <span className="badge badge-warning">Featured Role</span>}
                                <span className="badge badge-primary">{job.type}</span>
                                {isExpired && <span className="badge badge-danger">Closed</span>}
                            </div>
                            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{job.title}</h1>
                            <div style={{ display: 'flex', gap: 16, marginTop: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                <Link to={`/companies/${job.company?._id}`} style={{ color: 'var(--primary-light)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Building2 size={16} /> {job.company?.name}
                                </Link>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={16} /> {job.location}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={16} /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={handleSave} className="stat-card-mini" style={{ padding: '12px 20px', minWidth: 'auto', cursor: 'pointer' }}>
                                {saved ? <BookmarkCheck size={20} className="text-primary" /> : <BookmarkPlus size={20} />}
                            </button>
                            <button className="stat-card-mini" style={{ padding: '12px 20px', minWidth: 'auto', cursor: 'pointer' }}><Share2 size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: 40 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'start' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <div className="content-box">
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Overview</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-wrap' }}>
                                {job.description}
                            </p>
                        </div>

                        {job.requirements?.length > 0 && (
                            <div className="content-box">
                                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Key Requirements</h2>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    {job.requirements.map((req, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800 }}>{i + 1}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{req}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="content-box">
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Skills & Expertise</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {job.skills?.map((skill, i) => (
                                    <span key={i} className="tag" style={{ padding: '8px 16px', fontSize: 14 }}>{skill}</span>
                                ))}
                            </div>
                        </div>

                        {/* About Company - Laptop version (appears on left under Skills) */}
                        <div className="sidebar-widget mobile-hide" style={{ textAlign: 'center', marginTop: -8 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                                <Globe size={32} />
                            </div>
                            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>About the Company</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Learn more about their mission and values.</p>
                            <Link to={`/companies/${job.company?._id}`} className="btn btn-outline btn-full">View Profile</Link>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="sidebar-widget" style={{ border: '1px solid var(--primary)', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37,99,235,0.05) 100%)' }}>
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Compensation</div>
                                <div className="gradient-text" style={{ fontSize: 28, fontWeight: 900 }}>{formatSalary(job.salary?.min, job.salary?.max)}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>per annum</div>
                            </div>

                            {hasApplied ? (
                                <div style={{ background: 'var(--bg-primary-subtle)', color: 'var(--success)', padding: 16, borderRadius: 16, textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <CheckCircle size={20} /> Selection Pending
                                </div>
                            ) : isExpired ? (
                                <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: 16, borderRadius: 16, textAlign: 'center', fontWeight: 700 }}>
                                    Closed for Applications
                                </div>
                            ) : (
                                <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-full shadow-lg" style={{ height: 56, fontSize: 16 }}>
                                    Apply for this Job <Send size={18} />
                                </button>
                            )}
                        </div>

                        <div className="sidebar-widget">
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Role Summary</h3>
                            <div style={{ display: 'grid', gap: 20 }}>
                                {[
                                    { icon: <Briefcase size={18} />, label: 'Job Function', value: job.type },
                                    { icon: <Users size={18} />, label: 'Level', value: job.experience || 'Entry Level' },
                                    { icon: <Calendar size={18} />, label: 'Apply Before', value: new Date(job.deadline).toLocaleDateString() },
                                    { icon: <Send size={18} />, label: 'Applicants', value: `${job.applicantsCount || 0} People` }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                        <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</div>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* About Company - Mobile/Tablet version (stays in sidebar) */}
                        <div className="sidebar-widget desktop-hide" style={{ textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                                <Globe size={32} />
                            </div>
                            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>About the Company</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Learn more about their mission and values.</p>
                            <Link to={`/companies/${job.company?._id}`} className="btn btn-outline btn-full">View Profile</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default JobDetail;
