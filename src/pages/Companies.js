import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Users, Briefcase, ChevronRight, Building2, Filter, ArrowUpRight } from 'lucide-react';
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 80 }}>
            <style>{`
                .companies-hero {
                    background: var(--gradient-hero);
                    padding: 80px 0 60px;
                    border-bottom: 1px solid var(--border);
                    position: relative;
                    overflow: hidden;
                }
                .companies-hero::before {
                    content: '';
                    position: absolute;
                    top: -100px; right: -50px; width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
                }
                .search-container {
                    background: var(--bg-glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 8px;
                    display: flex;
                    gap: 8px;
                    max-width: 800px;
                    margin: 32px auto 0;
                    box-shadow: var(--shadow-lg);
                }
                .search-box {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0 20px;
                    background: var(--bg-secondary);
                    border-radius: 18px;
                    border: 1px solid transparent;
                    transition: var(--transition);
                }
                .search-box:focus-within { border-color: var(--primary); background: var(--bg-card); }
                .search-input {
                    width: 100%;
                    height: 52px;
                    background: none;
                    border: none;
                    outline: none;
                    color: var(--text-primary);
                    font-size: 15px;
                    font-weight: 500;
                }
                .filter-select {
                    width: 180px;
                    background: var(--bg-secondary);
                    border: 1px solid transparent;
                    border-radius: 18px;
                    padding: 0 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    color: var(--text-secondary);
                }
                .filter-select:hover { background: var(--bg-card-hover); }

                .company-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 40px;
                }

                @media (max-width: 768px) {
                    .search-container { flex-direction: column; padding: 16px; border-radius: 28px; }
                    .filter-select { width: 100%; height: 52px; }
                    .search-box { height: 52px; }
                    .companies-hero { padding: 100px 0 40px; }
                }
            `}</style>

            <div className="companies-hero">
                <div className="container">
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                            Top <span className="gradient-text">Companies</span> Global
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 12, maxWidth: 600, margin: '12px auto' }}>
                            Discover organizations where you can grow, learn and build your dream career.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="search-container">
                        <div className="search-box">
                            <Search size={20} className="text-secondary" />
                            <input
                                className="search-input"
                                placeholder="Search by name or keyword..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                            />
                        </div>
                        <select
                            className="filter-select"
                            value={industry}
                            onChange={e => handleIndustryChange(e.target.value)}
                        >
                            <option value="">All Industries</option>
                            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        <button type="submit" className="btn btn-primary" style={{ borderRadius: 16, height: 52, padding: '0 28px' }}>
                            Find
                        </button>
                    </form>
                </div>
            </div>

            <div className="container" style={{ marginTop: 40 }}>
                {loading ? (
                    <div className="company-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card" style={{ height: 260, opacity: 0.6 }} />
                        ))}
                    </div>
                ) : companies.length > 0 ? (
                    <>
                        <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                Showing <strong style={{ color: 'var(--text-primary)' }}>{companies.length}</strong> companies
                            </div>
                            {(search || industry) && (
                                <button
                                    onClick={() => { setSearch(''); setSearchInput(''); setIndustry(''); }}
                                    style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Clear all filters ×
                                </button>
                            )}
                        </div>

                        <div className="company-grid">
                            {companies.map(company => (
                                <CompanyCard key={company._id} company={company} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 60 }}>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-secondary btn-sm">Prev</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-secondary btn-sm">Next</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>🏭</div>
                        <h2 style={{ fontSize: 24, fontWeight: 800 }}>No companies found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CompanyCard = ({ company }) => {
    const [logoError, setLogoError] = useState(false);
    const logoUrl = getUploadUrl(company.logo);

    return (
        <Link to={`/companies/${company._id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 24,
                borderRadius: 28,
                background: 'var(--bg-card)',
                transition: 'var(--transition)'
            }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16, overflow: 'hidden',
                        background: 'var(--gradient-primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 900, color: 'white', flexShrink: 0,
                        border: '1px solid var(--border)'
                    }}>
                        {(logoUrl && !logoError) ? (
                            <img src={logoUrl} alt={company.name} onError={() => setLogoError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            company.name?.[0]?.toUpperCase()
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {company.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 8px' }}>{company.industry || "General"}</span>
                            {company.isVerified && <span style={{ color: 'var(--primary)', fontSize: 12 }}>✓ Verified</span>}
                        </div>
                    </div>
                    <ArrowUpRight size={20} className="text-muted" />
                </div>

                <p style={{
                    marginTop: 20, fontSize: 14, color: 'var(--text-secondary)',
                    lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                    {company.description || `Leading firm in the ${company.industry} sector, focusing on innovation and global reach.`}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <MapPin size={14} className="text-primary" /> <span>{company.location || 'Global'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Briefcase size={14} className="text-primary" /> <span>{company.totalJobs || 0} Openings</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default Companies;
