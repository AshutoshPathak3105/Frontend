import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Bookmark, BookmarkCheck, Zap, Star, Users } from 'lucide-react';
import { toggleSaveJob } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './JobCard.css';

const typeColors = {
    'full-time': 'badge-success',
    'part-time': 'badge-warning',
    'contract': 'badge-info',
    'internship': 'badge-primary',
    'remote': 'badge-secondary',
    'freelance': 'badge-danger',
};

const levelColors = {
    'entry': 'badge-success',
    'mid': 'badge-info',
    'senior': 'badge-warning',
    'lead': 'badge-danger',
    'executive': 'badge-primary',
};

const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return null;
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

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
};

const JobCard = ({ job, onSaveToggle, isSaved: initialSaved = false }) => {
    const { user } = useAuth();
    const [saved, setSaved] = React.useState(initialSaved);
    const [saving, setSaving] = React.useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { toast.error('Please login to save jobs'); return; }
        setSaving(true);
        try {
            const res = await toggleSaveJob(job._id);
            setSaved(res.data.isSaved);
            toast.success(res.data.message);
            if (onSaveToggle) onSaveToggle(job._id, res.data.isSaved);
        } catch {
            toast.error('Failed to save job');
        } finally {
            setSaving(false);
        }
    };

    const salary = formatSalary(job.salary);
    const company = job.company;

    return (
        <Link to={`/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
            <div className="job-card">
                {/* Status Badges - Top Row */}
                {(job.isFeatured || job.isUrgent) && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {job.isFeatured && (
                            <span className="badge badge-warning" style={{ fontSize: 10, minWidth: 'auto', padding: '2px 8px', textTransform: 'uppercase' }}>
                                <Star size={10} /> Featured
                            </span>
                        )}
                        {job.isUrgent && (
                            <span className="badge badge-danger" style={{ fontSize: 10, minWidth: 'auto', padding: '2px 8px', textTransform: 'uppercase' }}>
                                <Zap size={10} /> Urgent
                            </span>
                        )}
                    </div>
                )}

                {/* Company Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 12, overflow: 'hidden',
                        background: 'var(--gradient-primary)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 800, color: 'white',
                        border: '1px solid var(--border)'
                    }}>
                        {company?.logo ? (
                            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            company?.name?.[0]?.toUpperCase() || 'C'
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{
                                fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500
                            }}>
                                {company?.name || 'Company'}
                            </span>
                            {company?.isVerified && (
                                <span style={{ color: 'var(--primary)', fontSize: 12, flexShrink: 0 }}>✓</span>
                            )}
                        </div>
                        <h3 style={{
                            fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                            lineHeight: 1.3, marginBottom: 8, display: 'flex', flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Position</span>
                            {job.title}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                            <span className={`badge ${typeColors[job.type] || 'badge-secondary'}`}>
                                {job.type === 'full-time' ? 'Full-Time' :
                                    job.type === 'part-time' ? 'Part-Time' :
                                        job.type?.charAt(0).toUpperCase() + job.type?.slice(1)}
                            </span>
                            <span className={`badge ${levelColors[job.level] || 'badge-secondary'}`}>
                                {job.level === 'entry' ? 'Entry-Level' :
                                    job.level === 'mid' ? 'Mid-Level' :
                                        job.level?.charAt(0).toUpperCase() + job.level?.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>{job.location}{job.isRemote ? ' · Remote' : ''}</span>
                    </div>
                    {salary && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <span style={{ color: '#ffffff', fontWeight: 600 }}>{salary}</span>
                            <span>/ {job.salary?.period || 'year'}</span>
                        </div>
                    )}
                </div>

                {/* Skills */}
                {job.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        {job.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="tag">{skill}</span>
                        ))}
                        {job.skills.length > 3 && (
                            <span className="tag" style={{ background: 'none', borderStyle: 'dashed' }}>
                                +{job.skills.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                            <Clock size={12} />
                            {timeAgo(job.createdAt)}
                        </div>
                        {job.applicationsCount > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                <Users size={12} />
                                {job.applicationsCount} applied
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: saved ? 'var(--primary)' : 'var(--text-muted)',
                            padding: 6, borderRadius: 8, transition: 'var(--transition-fast)',
                            display: 'flex', alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = saved ? 'var(--primary)' : 'var(--text-muted)'}
                    >
                        {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default JobCard;
