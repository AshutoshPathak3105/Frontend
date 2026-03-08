import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Globe, Calendar, Building2, ExternalLink } from 'lucide-react';
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
    const [logoError, setLogoError] = useState(false);

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

    useEffect(() => {
        setLogoError(false);
    }, [company?.logo]);

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        if (category === 'All Roles') {
            setFilteredJobs(jobs);
        } else {
            setFilteredJobs(jobs.filter(j => (j.category || 'Other') === category));
        }
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading company...</p>
        </div>
    );

    if (!company) return null;

    const logoUrl = getUploadUrl(company.logo);
    const showLogo = logoUrl && !logoError;

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <style>{`
                .cd-header-grid { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
                .cd-main-grid  { display: grid; grid-template-columns: 1fr 300px; gap: 28px; align-items: start; }
                .cd-cat-btn {
                    padding: 8px 20px;
                    border-radius: var(--radius-full);
                    border: 1.5px solid var(--border);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 13px; font-weight: 600;
                    white-space: nowrap; cursor: pointer;
                    transition: var(--transition);
                    font-family: 'Inter', sans-serif;
                }
                .cd-cat-btn:hover { border-color: var(--border-hover); background: var(--bg-card-hover); }
                .cd-cat-btn.active {
                    background: var(--gradient-button);
                    border-color: transparent;
                    color: white;
                    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
                }
                [data-theme="light"] .cd-cat-btn.active {
                    box-shadow: 0 4px 14px rgba(5,150,105,0.3);
                }
                @media (max-width: 900px) {
                    .cd-main-grid { grid-template-columns: 1fr !important; }
                    .cd-sidebar-sticky { position: static !important; }
                }
                @media (max-width: 600px) {
                    .cd-header-grid { gap: 16px; }
                }
            `}</style>

            {/* ── Company Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
                borderBottom: '1px solid var(--border)',
                padding: '48px 0'
            }}>
                <div className="container">
                    <div className="cd-header-grid">
                        {/* Logo */}
                        <div style={{
                            width: 88, height: 88,
                            background: 'var(--gradient-primary)',
                            borderRadius: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 36, fontWeight: 800, color: 'white',
                            flexShrink: 0, overflow: 'hidden',
                            border: '2px solid var(--border)',
                            position: 'relative'
                        }}>
                            {showLogo && (
                                <img
                                    src={logoUrl}
                                    alt={company.name}
                                    onError={() => setLogoError(true)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                                />
                            )}
                            {!showLogo && (company.name?.[0]?.toUpperCase() || '🏢')}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                {company.industry && <span className="badge badge-primary">{company.industry}</span>}
                                {company.isVerified && <span className="badge badge-success">✓ Verified</span>}
                            </div>
                            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 12 }}>
                                {company.name}
                            </h1>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                {company.location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                                        <MapPin size={14} />{company.location}
                                    </span>
                                )}
                                {company.size && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                                        <Users size={14} />{company.size} employees
                                    </span>
                                )}
                                {company.founded && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                                        <Calendar size={14} />Founded {company.founded}
                                    </span>
                                )}
                                {company.website && (
                                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-light)', fontSize: 14 }}>
                                        <Globe size={14} />Website <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Open Positions count */}
                        <div style={{
                            textAlign: 'center', padding: '16px 28px',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)', flexShrink: 0
                        }}>
                            <div style={{ fontSize: 32, fontWeight: 900 }} className="gradient-text">{jobs.length}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Open Positions</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="container" style={{ padding: '40px 24px' }}>
                <div className="cd-main-grid">

                    {/* ── Left column ── */}
                    <div>
                        {/* About */}
                        {company.description && (
                            <div style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)', marginBottom: 24
                            }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>About {company.name}</h2>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>
                                    {company.description}
                                </p>
                            </div>
                        )}

                        {/* Open Jobs */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Open Positions</h2>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Showing {filteredJobs.length} opportunities
                                </div>
                            </div>

                            {jobs.length > 0 ? (
                                <>
                                    {/* Category tabs */}
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
                                        {['All Roles', ...new Set(jobs.map(j => j.category || 'Other'))].map(cat => (
                                            <button
                                                key={cat}
                                                className={`cd-cat-btn${selectedCategory === cat ? ' active' : ''}`}
                                                onClick={() => handleCategoryFilter(cat)}
                                            >
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                        {filteredJobs.length > 0 ? filteredJobs.map(job => (
                                            <div key={job._id} style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                                                    <span style={{
                                                        background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                                                        padding: '2px 8px', borderRadius: 6,
                                                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                                        border: '1px solid var(--border)'
                                                    }}>
                                                        {job.category || 'Other'}
                                                    </span>
                                                </div>
                                                <JobCard job={job} />
                                            </div>
                                        )) : (
                                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                                                No positions found in this category.
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state" style={{ padding: '40px 24px' }}>
                                    <div className="empty-state-icon">💼</div>
                                    <h3>No open positions</h3>
                                    <p>Check back later for new opportunities</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="cd-sidebar-sticky" style={{ position: 'sticky', top: 100 }}>
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)', padding: 28
                        }}>
                            {/* Mini logo + name */}
                            <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: 14, overflow: 'hidden',
                                    background: 'var(--gradient-button)',
                                    border: '1px solid var(--border)', margin: '0 auto 12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 24, fontWeight: 800, color: 'white', position: 'relative'
                                }}>
                                    {showLogo && (
                                        <img
                                            src={logoUrl} alt=""
                                            onError={() => setLogoError(true)}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                                        />
                                    )}
                                    {!showLogo && (company.name?.[0]?.toUpperCase() || <Building2 size={24} />)}
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{company.name}</h3>
                                {company.isVerified && (
                                    <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Verified Institution</span>
                                )}
                            </div>

                            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Company Details
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { icon: <Building2 size={16} />, label: 'Industry', value: company.industry },
                                    { icon: <Users size={16} />, label: 'Company Size', value: company.size },
                                    { icon: <MapPin size={16} />, label: 'Headquarters', value: company.location },
                                    { icon: <Calendar size={16} />, label: 'Founded', value: company.founded },
                                    { icon: <Globe size={16} />, label: 'Website', value: company.website, isLink: true },
                                ].filter(item => item.value).map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{
                                            width: 36, height: 36,
                                            background: 'var(--gradient-button)',
                                            borderRadius: 10,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', flexShrink: 0
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                                            {item.isLink ? (
                                                <a href={item.value} target="_blank" rel="noopener noreferrer"
                                                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-light)' }}>
                                                    Visit Website
                                                </a>
                                            ) : (
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                                            )}
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

export default CompanyDetail;
