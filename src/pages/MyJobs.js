import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, Users, MapPin, Clock, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyJobs, deleteJob, updateJob } from '../services/api';

const MyJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await getMyJobs();
            setJobs(res.data.jobs || []);
        } catch (err) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        setDeletingId(id);
        try {
            await deleteJob(id);
            toast.success('Job deleted successfully');
            setJobs(prev => prev.filter(j => j._id !== id));
        } catch (err) {
            toast.error('Failed to delete job');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleActive = async (job) => {
        const newStatus = job.status === 'active' ? 'paused' : 'active';
        try {
            await updateJob(job._id, { status: newStatus });
            setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
            toast.success(`Job ${newStatus === 'active' ? 'activated' : 'paused'}`);
        } catch (err) {
            toast.error('Failed to update job status');
        }
    };

    const formatSalary = (salary) => {
        if (!salary?.min && !salary?.max) return 'Not disclosed';
        const currencySym = '₹';
        const isINR = !salary.currency || salary.currency === 'INR';
        const fmt = (n) => {
            if (isINR) {
                if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
                if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
            }
            if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
            return n;
        };
        if (salary.min && salary.max) return `${currencySym}${fmt(salary.min)} - ${currencySym}${fmt(salary.max)}`;
        if (salary.max) return `Up to ${currencySym}${fmt(salary.max)}`;
        return `From ${currencySym}${fmt(salary.min)}`;
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading your jobs...</p>
        </div>
    );

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="container" style={{ padding: '40px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>My Job Postings</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
                    </div>
                    <Link to="/post-job" className="btn btn-primary">
                        <Plus size={16} /> Post New Job
                    </Link>
                </div>

                {jobs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {jobs.map(job => (
                            <div key={job._id} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-xl)', padding: 24, transition: 'var(--transition)'
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                            <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                                                {job.status === 'active' ? '● Active' : job.status === 'paused' ? '⏸ Paused' : job.status === 'closed' ? '○ Closed' : job.status}
                                            </span>
                                            {job.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
                                            <span className="badge badge-primary">{job.type}</span>
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{job.title}</h3>
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                            {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}><MapPin size={13} />{job.location}</span>}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}><Clock size={13} />{new Date(job.createdAt).toLocaleDateString()}</span>
                                            <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>💰 {formatSalary(job.salary)}</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 22, fontWeight: 800 }} className="gradient-text">{job.applicationsCount || 0}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Applicants</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{job.shortlistedCount || 0}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Shortlisted</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Link to={`/jobs/${job._id}`} className="btn btn-secondary btn-sm">
                                            <Eye size={14} /> View
                                        </Link>
                                        <button
                                            onClick={() => handleToggleActive(job)}
                                            className="btn btn-secondary btn-sm"
                                            title={job.status === 'active' ? 'Pause' : 'Activate'}
                                        >
                                            {job.status === 'active' ? <ToggleRight size={14} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={14} />}
                                            {job.status === 'active' ? 'Active' : 'Paused'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job._id)}
                                            disabled={deletingId === job._id}
                                            className="btn btn-sm"
                                            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
                                        >
                                            {deletingId === job._id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Trash2 size={14} />}
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* View Applications Link */}
                                {(job.applicationsCount || 0) > 0 && (
                                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                        <Link
                                            to={`/applications?job=${job._id}`}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary-light)', fontWeight: 600 }}
                                        >
                                            <Users size={13} /> View {job.applicationsCount} application{job.applicationsCount !== 1 ? 's' : ''} <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">💼</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No jobs posted yet</h3>
                        <p>Start attracting top talent by posting your first job</p>
                        <Link to="/post-job" className="btn btn-primary" style={{ marginTop: 24 }}>
                            <Plus size={16} /> Post Your First Job
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyJobs;
