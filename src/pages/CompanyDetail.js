import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Globe, Calendar, Building2, ExternalLink, Briefcase, Verified, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCompany, getJobs, getUploadUrl, toggleFollowCompany } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/jobs/JobCard';
import '../components/jobs/JobCard.css';

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Roles');
    const [loading, setLoading] = useState(true);
    const [logoError, setLogoError] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // Derived filtered jobs
    const filteredJobs = React.useMemo(() => {
        if (selectedCategory === 'All Roles') return jobs;
        return jobs.filter(j => (j.category || 'Other') === selectedCategory);
    }, [jobs, selectedCategory]);

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
                if (user && companyRes.data.company.followers) {
                    setIsFollowing(companyRes.data.company.followers.includes(user._id));
                }
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
    };

    const handleFollow = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to follow companies');
            return navigate('/login');
        }

        try {
            const res = await toggleFollowCompany(id);
            setIsFollowing(res.data.isFollowing);
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to follow company');
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 60 }}>
            <style>{`
                .company-hero {
                    height: 260px;
                    background: var(--gradient-hero);
                    position: relative;
                    overflow: hidden;
                    border-bottom: 1px solid var(--border);
                }
                .company-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.25) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 40%);
                    opacity: 0.6;
                }
                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent, var(--bg-primary));
                }
                .hero-pattern {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(var(--primary) 0.5px, transparent 0.5px);
                    background-size: 30px 30px;
                    opacity: 0.1;
                }

                .header-wrapper {
                    margin-top: -120px;
                    position: relative;
                    z-index: 20;
                    padding-bottom: 40px;
                }

                .profile-header-card {
                    background: var(--bg-glass);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid var(--border);
                    border-radius: 32px;
                    padding: 40px;
                    box-shadow: var(--shadow-xl);
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .logo-container {
                    width: 140px;
                    height: 140px;
                    background: var(--bg-card);
                    border: 6px solid var(--bg-primary);
                    border-radius: 36px;
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .header-main-content {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    width: 100%;
                }

                .company-info-box {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }

                .company-name-h1 {
                    font-size: clamp(32px, 5vw, 48px);
                    font-weight: 800;
                    margin: 12px 0 16px;
                    color: var(--text-primary);
                    letter-spacing: -1.5px;
                    line-height: 1.1;
                    word-break: break-word;
                    overflow-wrap: break-word;
                }

                .full-width-stat-box {
                    width: 100%;
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.15);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                }

                .stat-item-horizontal {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .stat-item-horizontal .val { font-size: 32px; font-weight: 800; line-height: 1; }
                .stat-item-horizontal .lbl { font-size: 13px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }

                .main-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 32px;
                    margin-top: 24px;
                }

                .content-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 28px;
                    padding: 32px;
                    position: relative;
                    overflow: hidden;
                }
                .content-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 4px; height: 100%;
                    background: var(--gradient-primary);
                    opacity: 0.6;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 24px;
                    color: var(--text-primary);
                }

                .info-row {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    padding: 12px;
                    border-radius: 16px;
                    transition: var(--transition);
                }
                .info-row:hover { background: var(--bg_glass-light); }
                .info-icon-box {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: var(--bg-secondary);
                    color: var(--primary-light);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                }

                .job-cat-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    scrollbar-width: none;
                }
                .job-cat-tabs::-webkit-scrollbar { display: none; }

                .tab-pill {
                    padding: 8px 20px;
                    border-radius: 100px;
                    border: 1px solid var(--border);
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: var(--transition);
                }
                .tab-pill.active {
                    background: var(--gradient-button);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }

                @media (max-width: 1024px) {
                    .main-layout-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .company-hero { height: 160px; }
                    .header-wrapper { margin-top: -80px; }
                    .profile-header-card { padding: 20px; gap: 20px; border-radius: 24px; }
                    .header-main-content { gap: 16px; }
                    .logo-container { width: 90px; height: 90px; border-radius: 18px; border-width: 3px; }
                    .company-name-h1 { font-size: 24px; margin: 4px 0 8px; }
                    .content-card { padding: 24px; }
                    .full-width-stat-box { padding: 14px; border-radius: 16px; }
                    .stat-item-horizontal .val { font-size: 22px; }
                    .stat-item-horizontal .lbl { font-size: 11px; }
                }

                @media (max-width: 640px) {
                    .header-main-content { flex-direction: column; align-items: center; text-align: center; gap: 16px; }
                    .company-info-box { align-items: center; text-align: center; }
                    .logo-container { width: 110px; height: 110px; }
                    .company-name-h1 { font-size: 26px; line-height: 1.2; }
                }

                @media (max-width: 400px) {
                    .profile-header-card { padding: 16px; }
                    .logo-container { width: 90px; height: 90px; }
                    .company-name-h1 { font-size: 22px; }
                }
            `}</style>

            {/* Banner Section */}
            <div className="company-hero">
                <div className="hero-pattern"></div>
                <div className="hero-overlay"></div>
            </div>

            <div className="container header-wrapper">
                <div className="profile-header-card">
                    <div className="header-main-content">
                        <div className="logo-container">
                            {showLogo ? (
                                <img
                                    src={logoUrl}
                                    alt={company.name}
                                    onError={() => setLogoError(true)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%', height: '100%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 48, fontWeight: 900, color: 'white'
                                }}>
                                    {company.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="company-info-box">
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {company.industry && (
                                    <span className="badge" style={{
                                        background: 'rgba(59, 130, 246, 0.15)',
                                        color: 'var(--primary-light)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        textTransform: 'uppercase',
                                        fontSize: '11px',
                                        fontWeight: '800'
                                    }}>
                                        {company.industry}
                                    </span>
                                )}
                                {company.isVerified && <span className="badge badge-success" style={{ gap: 4 }}><Verified size={12} /> Verified</span>}
                            </div>
                            <h1 className="company-name-h1">{company.name}</h1>
                            <div style={{ display: 'flex', gap: 20, color: 'var(--text-secondary)', fontSize: 15, flexWrap: 'wrap' }}>
                                {company.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={18} /> {company.location}</span>}
                                {company.website && (
                                    <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-light)', fontWeight: 700 }}>
                                        <Globe size={18} /> Visit Website <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="full-width-stat-box">
                        <div className="stat-item-horizontal">
                            <div className="val gradient-text">{jobs.length}</div>
                            <div className="lbl">Open Positions</div>
                        </div>
                    </div>
                </div>

                <div className="main-layout-grid">
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {/* About Card */}
                        <div className="content-card">
                            <h2 className="section-header"><Building2 size={22} className="text-primary" /> About {company.name}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-wrap' }}>
                                {company.description || "No description provided."}
                            </p>

                            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                <button
                                    className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                                    style={{ flex: 1 }}
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? 'Following' : 'Follow Company'}
                                </button>
                                <button className="btn btn-outline" style={{ width: 48, padding: 0, justifyContent: 'center' }}><Share2 size={18} /></button>
                            </div>
                        </div>

                        {/* Jobs List */}
                        <div className="content-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                                <h2 className="section-header" style={{ marginBottom: 0 }}><Briefcase size={22} className="text-primary" /> Career Opportunities</h2>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{filteredJobs.length} Positions</span>
                            </div>

                            {jobs.length > 0 ? (
                                <>
                                    <div className="job-cat-tabs">
                                        {['All Roles', ...new Set(jobs.map(j => j.category || 'Other'))].map(cat => (
                                            <button
                                                key={cat}
                                                className={`tab-pill ${selectedCategory === cat ? 'active' : ''}`}
                                                onClick={() => handleCategoryFilter(cat)}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
                                        {filteredJobs.map(job => (
                                            <JobCard key={job._id} job={job} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: 24 }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>No active openings</h3>
                                    <p style={{ color: 'var(--text-secondary)', maxWidth: 300, margin: '8px auto 0' }}>Check back later or follow the company for updates.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="sidebar-container">
                        <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 100 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Company Overview</h3>

                            <div className="info-row">
                                <div className="info-icon-box"><Building2 size={18} /></div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Industry</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{company.industry || "N/A"}</div>
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-icon-box"><Users size={18} /></div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Employees</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{company.size || "10-50"}</div>
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-icon-box"><Calendar size={18} /></div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Founded</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{company.founded || "N/A"}</div>
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-icon-box"><MapPin size={18} /></div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Based In</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{company.location || "Global"}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-secondary)', borderRadius: 20, border: '1px dashed var(--border)' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>Company Culture</div>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>Join a team of innovators and builders shaping the future.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;
