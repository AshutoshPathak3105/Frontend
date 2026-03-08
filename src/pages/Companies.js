import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Users, Briefcase, ChevronRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllCompanies, getUploadUrl } from '../services/api';

const INDUSTRIES = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
    'Manufacturing', 'Media', 'Consulting', 'Real Estate', 'Other'
];

const COMPANIES_PER_PAGE = 12;

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [industry, setIndustry] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(total / COMPANIES_PER_PAGE);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: COMPANIES_PER_PAGE };
            if (search) params.search = search;
            if (industry) params.industry = industry;
            const res = await getAllCompanies(params);
            setCompanies(res.data.companies || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error(err);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [search, industry, currentPage]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setCurrentPage(1);
    };

    const handleIndustryChange = (val) => {
        setIndustry(val);
        setCurrentPage(1);
    };

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* ── Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.04) 100%)',
                borderBottom: '1px solid var(--border)', padding: '48px 0 40px',
                position: 'relative', overflow: 'hidden'
            }}>
                <div className="glow-orb glow-orb-primary" style={{ width: 400, height: 400, top: -100, right: -60, opacity: 0.12 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, marginBottom: 8 }}>
                            Explore <span className="gradient-text">Top Companies</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                            {total > 0
                                ? <><strong style={{ color: 'var(--primary)' }}>{total}</strong> companies hiring right now</>
                                : 'Discover great places to work and find your next opportunity'}
                        </p>
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{
                            flex: 2, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)', padding: '12px 16px'
                        }}>
                            <Search size={17} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                style={{
                                    flex: 1, background: 'none', border: 'none', outline: 'none',
                                    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter'
                                }}
                            />
                        </div>
                        <select
                            className="form-select"
                            value={industry}
                            onChange={e => handleIndustryChange(e.target.value)}
                            style={{ minWidth: 180 }}
                        >
                            <option value="">All Industries</option>
                            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                            <Search size={15} /> Search
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Companies Grid ── */}
            <div className="container" style={{ padding: '40px 24px' }}>

                {/* Active filters bar */}
                {(search || industry) && !loading && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                        padding: '10px 16px', background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>🔍 Filtering by:</span>
                        {search && <span className="tag" style={{ fontSize: 12 }}>"{search}"</span>}
                        {industry && <span className="tag" style={{ fontSize: 12 }}>🏭 {industry}</span>}
                        <button
                            onClick={() => { setSearch(''); setSearchInput(''); setIndustry(''); setCurrentPage(1); }}
                            style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Clear all ×
                        </button>
                    </div>
                )}

                {loading ? (
                    /* Skeleton grid */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                                <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 14, marginBottom: 16 }} />
                                <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 10 }} />
                                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
                                <div className="skeleton" style={{ height: 14, width: '80%' }} />
                            </div>
                        ))}
                    </div>
                ) : companies.length > 0 ? (
                    <>
                        {/* Results count */}
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                            Showing <strong style={{ color: 'var(--text-primary)' }}>{companies.length}</strong> of{' '}
                            <strong style={{ color: 'var(--primary)' }}>{total}</strong> companies
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 20 }}>
                            {companies.map(company => (
                                <CompanyCard key={company._id} company={company} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="btn btn-secondary btn-sm"
                                >
                                    ← Prev
                                </button>
                                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 7) page = i + 1;
                                    else if (currentPage <= 4) page = i + 1;
                                    else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                                    else page = currentPage - 3 + i;
                                    return (
                                        <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}>
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏢</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No companies found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {search || industry
                                ? 'Try adjusting your search or filters.'
                                : 'No companies have been registered yet. Check back soon!'}
                        </p>
                        {(search || industry) && (
                            <button
                                onClick={() => { setSearch(''); setSearchInput(''); setIndustry(''); }}
                                className="btn btn-primary"
                                style={{ marginTop: 24 }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Individual Company Card ── */
const CompanyCard = ({ company }) => {
    const logoUrl = getUploadUrl(company.logo);

    return (
        <Link to={`/companies/${company._id}`} style={{ textDecoration: 'none' }}>
            <div
                className="job-card"
                style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = '';
                }}
            >
                {/* Top: logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{
                        width: 58, height: 58, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                        background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white',
                        border: '1px solid var(--border)'
                    }}>
                        {logoUrl
                            ? <img src={logoUrl} alt={company.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                            : (company.name?.[0]?.toUpperCase() || <Building2 size={24} />)
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <h3 style={{
                                fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                                margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {company.name}
                            </h3>
                            {company.isVerified && (
                                <span style={{ color: 'var(--primary)', fontSize: 13, flexShrink: 0 }} title="Verified">✓</span>
                            )}
                        </div>
                        {company.industry && (
                            <span className="badge badge-primary" style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
                                {company.industry}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                {company.description && (
                    <p style={{
                        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                        marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1
                    }}>
                        {company.description}
                    </p>
                )}

                {/* Meta info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {company.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span>{company.location}</span>
                        </div>
                    )}
                    {company.size && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Users size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span>{company.size} employees</span>
                        </div>
                    )}
                </div>

                {/* Footer: open jobs + view button */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 14, borderTop: '1px solid var(--border)', marginTop: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Briefcase size={13} style={{ color: 'var(--primary)' }} />
                        <span>
                            {company.totalJobs > 0
                                ? <><strong style={{ color: 'var(--primary)' }}>{company.totalJobs}</strong> open {company.totalJobs === 1 ? 'job' : 'jobs'}</>
                                : 'No open jobs'}
                        </span>
                    </div>
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600, color: 'var(--primary)'
                    }}>
                        View <ChevronRight size={14} />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default Companies;
