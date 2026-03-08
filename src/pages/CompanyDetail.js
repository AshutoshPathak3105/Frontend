import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Globe, Calendar, Building2, ExternalLink, Briefcase, ChevronRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCompany, getJobs, getUploadUrl } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import '../components/jobs/JobCard.css';

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Roles');
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyRes, jobsRes] = await Promise.all([
                    getCompany(id),
                    getJobs({ company: id, limit: 20 })
                ]);
                setCompany(companyRes.data.company);
                const fetchedJobs = jobsRes.data.jobs || [];
                setJobs(fetchedJobs);
                setFilteredJobs(fetchedJobs);
            } catch (err) {
                toast.error('Company not found');
                navigate('/companies');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        setFilteredJobs(category === 'All Roles' ? jobs : jobs.filter(j => (j.category || 'Other') === category));
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading company...</p>
        </div>
    );

    if (!company) return null;

    const logoUrl = getUploadUrl(company.logo);
    const categories = ['All Roles', ...new Set(jobs.map(j => j.category || 'Other'))];

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <style>{`
                .cd-hero {
                    position: relative;
                    overflow: hidden;
                    min-height: 260px;
                    background: var(--bg-secondary);
                }
                .cd-hero-mesh {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 80% 60% at 20% 40%, rgba(37,99,235,0.18) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 80% at 80% 20%, rgba(99,102,241,0.14) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 50% at 50% 100%, rgba(16,185,129,0.08) 0%, transparent 60%);
                }
                [data-theme="light"] .cd-hero {
                    background: var(--bg-secondary);
                }
                [data-theme="light"] .cd-hero-mesh {
                    background:
                        radial-gradient(ellipse 80% 60% at 20% 40%, rgba(5,150,105,0.12) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 80% at 80% 20%, rgba(16,185,129,0.10) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 50% at 50% 100%, rgba(52,211,153,0.08) 0%, transparent 60%);
                }
                .cd-stat-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 600;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: var(--text-secondary);
                    backdrop-filter: blur(8px);
                    transition: all 0.2s;
                }
                [data-theme="light"] .cd-stat-pill {
                    background: rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.08);
                }
                .cd-stat-pill:hover { border-color: var(--border-hover); color: var(--text-primary); }
                .cd-cat-btn {
                    padding: 7px 18px;
                    border-radius: 999px;
                    border: 1.5px solid var(--border);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    font-family: 'Inter', sans-serif;
                }
                .cd-cat-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
                .cd-cat-btn.active {
                    background: var(--gradient-primary);
                    border-color: transparent;
                    color: white;
                    box-shadow: 0 4px 14px rgba(37,99,235,0.3);
                }
                [data-theme="light"] .cd-cat-btn.active {
                    box-shadow: 0 4px 14px rgba(5,150,105,0.25);
                }
                .cd-info-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 0;
                    border-bottom: 1px solid var(--border);
                }
                .cd-info-row:last-child { border-bottom: none; }
                .cd-info-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: var(--gradient-primary);
                    opacity: 0.85;
                }
                .cd-main-grid {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 28px;
                    align-items: start;
                }
                @media (max-width: 960px) {
                    .cd-main-grid { grid-template-columns: 1fr !important; }
                    .cd-sidebar-sticky { position: static !important; }
                    .cd-hero-content { flex-direction: column; gap: 16px !important; }
                    .cd-hero-stats { justify-content: flex-start !important; flex-wrap: wrap; }
                }
                @media (max-width: 600px) {
                    .cd-logo-card { width: 72px !important; height: 72px !important; border-radius: 16px !important; font-size: 26px !important; }
                }
            `}</style>

            {/* ── Hero Banner ── */}
            <div className="cd-hero">
                <div className="cd-hero-mesh" />
                <div className="container" style={{ position: 'relative', zIndex: 1, padding: '40px 24px 0' }}>
                    {/* Back link */}
                    <button
                        onClick={() => navigate('/companies')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 600,
                            color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 28,
                            backdropFilter: 'blur(8px)', transition: 'all 0.2s', fontFamily: 'Inter'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <ArrowLeft size={14} /> All Companies
                    </button>

                    {/* Company identity row */}
                    <div className="cd-hero-content" style={{ display: 'flex', gap: 28, alignItems: 'flex-end', paddingBottom: 40 }}>
                        {/* Logo */}
                        <div
                            className="cd-logo-card"
                            style={{
                                width: 96, height: 96, borderRadius: 22, flexShrink: 0,
                                background: 'var(--gradient-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 36, fontWeight: 900, color: 'white',
                                border: '3px solid rgba(255,255,255,0.15)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                overflow: 'hidden', position: 'relative'
                            }}
                        >
                            {logoUrl && !imgError && (
                                <img
                                    src={logoUrl}
                                    alt={company.name}
                                    onError={() => setImgError(true)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                                />
                            )}
                            {(!logoUrl || imgError) && (company.name?.[0]?.toUpperCase() || '🏢')}
                        </div>

                        {/* Name + meta */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                {company.industry && (
                                    <span style={{
                                        background: 'var(--gradient-primary)', color: 'white',
                                        borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                                        letterSpacing: '0.04em', textTransform: 'uppercase'
                                    }}>{company.industry}</span>
                                )}
                                {company.isVerified && (
                                    <span style={{
                                        background: 'rgba(16,185,129,0.15)', color: '#34d399',
                                        border: '1px solid rgba(16,185,129,0.3)',
                                        borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700
                                    }}>✓ Verified</span>
                                )}
                            </div>
                            <h1 style={{ fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.1 }}>
                                {company.name}
                            </h1>
                            {/* Stat pills */}
                            <div className="cd-hero-stats" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {company.location && (
                                    <span className="cd-stat-pill"><MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />{company.location}</span>
                                )}
                                {company.size && (
                                    <span className="cd-stat-pill"><Users size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />{company.size} employees</span>
                                )}
                                {company.founded && (
                                    <span className="cd-stat-pill"><Calendar size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />Est. {company.founded}</span>
                                )}
                                {jobs.length > 0 && (
                                    <span className="cd-stat-pill" style={{ background: 'var(--gradient-primary)', border: 'none', color: 'white' }}>
                                        <Briefcase size={13} />{jobs.length} open {jobs.length === 1 ? 'role' : 'roles'}
                                    </span>
                                )}
                                {company.website && (
                                    <a
                                        href={company.website} target="_blank" rel="noopener noreferrer"
                                        className="cd-stat-pill"
                                        style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}
                                    >
                                        <Globe size={13} style={{ color: 'var(--primary)' }} />Visit Website<ExternalLink size={11} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
                    background: 'linear-gradient(to bottom, transparent, var(--bg-primary))'
                }} />
            </div>

            {/* ── Main Content ── */}
            <div className="container" style={{ padding: '36px 24px 60px' }}>
                <div className="cd-main-grid">
                    {/* Left column */}
                    <div>
                        {/* About card */}
                        {company.description && (
                            <div style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-xl)', padding: 'clamp(18px, 4vw, 32px)',
                                marginBottom: 28, position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Accent bar */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                                    background: 'var(--gradient-primary)'
                                }} />
                                <div style={{ paddingLeft: 16 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            background: 'var(--gradient-primary)',
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Building2 size={16} color="white" />
                                        </span>
                                        About {company.name}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, fontSize: 14.5, whiteSpace: 'pre-wrap' }}>
                                        {company.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Open Positions */}
                        <div>
                            {/* Section header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{
                                        width: 34, height: 34, borderRadius: 9,
                                        background: 'var(--gradient-primary)',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Briefcase size={16} color="white" />
                                    </span>
                                    Open Positions
                                </h2>
                                {jobs.length > 0 && (
                                    <span style={{
                                        fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
                                        background: 'var(--bg-secondary)', padding: '4px 12px',
                                        borderRadius: 999, border: '1px solid var(--border)'
                                    }}>
                                        {filteredJobs.length} of {jobs.length} shown
                                    </span>
                                )}
                            </div>

                            {jobs.length > 0 ? (
                                <>
                                    {/* Category filter pills */}
                                    {categories.length > 2 && (
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    className={`cd-cat-btn${selectedCategory === cat ? ' active' : ''}`}
                                                    onClick={() => handleCategoryFilter(cat)}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {filteredJobs.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
                                            {filteredJobs.map(job => (
                                                <JobCard key={job._id} job={job} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            textAlign: 'center', padding: '48px 24px',
                                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-xl)', color: 'var(--text-muted)'
                                        }}>
                                            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                                            <p style={{ fontWeight: 600 }}>No positions in this category</p>
                                            <button
                                                onClick={() => handleCategoryFilter('All Roles')}
                                                style={{ marginTop: 12, fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Show all roles →
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{
                                    textAlign: 'center', padding: '64px 24px',
                                    background: 'var(--bg-card)', border: '1px dashed var(--border)',
                                    borderRadius: 'var(--radius-xl)'
                                }}>
                                    <div style={{ fontSize: 44, marginBottom: 14 }}>💼</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No open positions yet</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Check back later for new opportunities at {company.name}</p>
                                    <button
                                        onClick={() => navigate('/jobs')}
                                        className="btn btn-primary"
                                        style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                    >
                                        Browse All Jobs <ChevronRight size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="cd-sidebar-sticky" style={{ position: 'sticky', top: 100 }}>
                        {/* Company card */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 20
                        }}>
                            {/* Card header gradient strip */}
                            <div style={{ height: 6, background: 'var(--gradient-primary)' }} />
                            <div style={{ padding: '24px 24px 20px' }}>
                                {/* Mini logo + name centered */}
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: 18, margin: '0 auto 12px',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 28, fontWeight: 800, color: 'white',
                                        overflow: 'hidden', position: 'relative',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                                    }}>
                                        {logoUrl && !imgError && (
                                            <img src={logoUrl} alt={company.name}
                                                onError={() => setImgError(true)}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                                            />
                                        )}
                                        {(!logoUrl || imgError) && (company.name?.[0]?.toUpperCase() || '🏢')}
                                    </div>
                                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{company.name}</h3>
                                    {company.isVerified && (
                                        <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>✓ Verified Company</span>
                                    )}
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: 'var(--border)', marginBottom: 18 }} />

                                {/* Details list */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {[
                                        { icon: <Building2 size={14} />, label: 'Industry', value: company.industry, color: '#6366f1' },
                                        { icon: <Users size={14} />, label: 'Company Size', value: company.size ? `${company.size} employees` : null, color: '#8b5cf6' },
                                        { icon: <MapPin size={14} />, label: 'Headquarters', value: company.location, color: '#06b6d4' },
                                        { icon: <Calendar size={14} />, label: 'Founded', value: company.founded, color: '#f59e0b' },
                                        { icon: <Briefcase size={14} />, label: 'Open Roles', value: jobs.length > 0 ? `${jobs.length} position${jobs.length !== 1 ? 's' : ''}` : 'No openings', color: '#10b981' },
                                        { icon: <Globe size={14} />, label: 'Website', value: company.website, isLink: true, color: '#3b82f6' },
                                    ].filter(item => item.value).map((item, i) => (
                                        <div key={i} className="cd-info-row">
                                            <div style={{
                                                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                                background: `${item.color}18`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: item.color
                                            }}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{item.label}</div>
                                                {item.isLink ? (
                                                    <a href={item.value} target="_blank" rel="noopener noreferrer"
                                                        style={{ fontSize: 13, fontWeight: 700, color: item.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        Visit Website <ExternalLink size={11} />
                                                    </a>
                                                ) : (
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA card */}
                        {jobs.length > 0 && (
                            <div style={{
                                background: 'var(--gradient-primary)',
                                borderRadius: 'var(--radius-xl)', padding: '22px 24px',
                                textAlign: 'center', boxShadow: '0 8px 28px rgba(37,99,235,0.25)'
                            }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>🚀</div>
                                <h4 style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 6 }}>
                                    {jobs.length} Open {jobs.length === 1 ? 'Position' : 'Positions'}
                                </h4>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 14, lineHeight: 1.5 }}>
                                    Don't miss your chance to join {company.name}
                                </p>
                                <button
                                    onClick={() => document.querySelector('.cd-cat-btn')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 700,
                                        color: 'white', cursor: 'pointer', backdropFilter: 'blur(8px)',
                                        transition: 'all 0.2s', width: '100%', fontFamily: 'Inter'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                >
                                    View All Roles ↓
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;
