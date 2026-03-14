import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ChevronDown, MapPin, Briefcase } from 'lucide-react';
import { getJobs, getCategories } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import '../components/jobs/JobCard.css';
import './Jobs.css';

// Values MUST match the backend Job model enums exactly
const JOB_TYPES = [
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
    { label: 'Remote', value: 'remote' },
    { label: 'Freelance', value: 'freelance' },
];

const EXPERIENCE_LEVELS = [
    { label: 'Entry Level', value: 'entry' },
    { label: 'Mid Level', value: 'mid' },
    { label: 'Senior Level', value: 'senior' },
    { label: 'Lead', value: 'lead' },
    { label: 'Executive', value: 'executive' },
];

// key = composite string used as <option value>
const SALARY_RANGES = [
    { label: 'Any Salary', minSalary: '', maxSalary: '', key: 'any' },
    { label: '₹0 – ₹5L', minSalary: '0', maxSalary: '500000', key: '0-500000' },
    { label: '₹5L – ₹10L', minSalary: '500000', maxSalary: '1000000', key: '500000-1000000' },
    { label: '₹10L – ₹20L', minSalary: '1000000', maxSalary: '2000000', key: '1000000-2000000' },
    { label: '₹20L – ₹40L', minSalary: '2000000', maxSalary: '4000000', key: '2000000-4000000' },
    { label: '₹40L+', minSalary: '4000000', maxSalary: '', key: '4000000-plus' },
];

const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Highest Salary', value: 'salary' },
    { label: 'Most Viewed', value: 'views' },
    { label: 'Most Applied', value: 'applications' },
];

const JOBS_PER_PAGE = 12;

const Jobs = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalJobs, setTotalJobs] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Controlled inputs for the search bar (applied only on submit)
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');

    // Committed filters (what we actually send to the API)
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        location: searchParams.get('location') || '',
        category: searchParams.get('category') || '',
        type: '',
        level: '',
        salaryKey: 'any',   // tracks which salary range is selected
        minSalary: '',
        maxSalary: '',
        isRemote: '',
        sort: 'newest',
    });

    // ── Load categories once ──────────────────────────────────────────────────
    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data.categories || []))
            .catch(() => { });
    }, []);

    // ── Fetch jobs whenever filters OR page changes ───────────────────────────
    const fetchJobs = useCallback(async (filtersToUse, page) => {
        setLoading(true);
        try {
            const params = { page, limit: JOBS_PER_PAGE };
            if (filtersToUse.search) params.search = filtersToUse.search;
            if (filtersToUse.location) params.location = filtersToUse.location;
            if (filtersToUse.category) params.category = filtersToUse.category;
            if (filtersToUse.type) params.type = filtersToUse.type;
            if (filtersToUse.level) params.level = filtersToUse.level;
            if (filtersToUse.minSalary) params.minSalary = filtersToUse.minSalary;
            if (filtersToUse.maxSalary) params.maxSalary = filtersToUse.maxSalary;
            if (filtersToUse.isRemote) params.isRemote = filtersToUse.isRemote;
            if (filtersToUse.sort && filtersToUse.sort !== 'newest') params.sort = filtersToUse.sort;

            const res = await getJobs(params);
            setJobs(res.data.jobs || []);
            setTotalJobs(res.data.total || 0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
            setJobs([]);
            setTotalJobs(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs(filters, currentPage);
    }, [filters, currentPage, fetchJobs]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    // Search bar submit — commits search + location
    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, search: searchInput, location: locationInput }));
        setCurrentPage(1);
    };

    // Generic filter change (type, level, isRemote, sort, category)
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    // Salary range — use the stable key instead of a composite string
    const handleSalaryChange = (key) => {
        const found = SALARY_RANGES.find(r => r.key === key);
        if (found) {
            setFilters(prev => ({
                ...prev,
                salaryKey: found.key,
                minSalary: found.minSalary,
                maxSalary: found.maxSalary,
            }));
            setCurrentPage(1);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchInput('');
        setLocationInput('');
        setFilters({
            search: '', location: '', category: '',
            type: '', level: '',
            salaryKey: 'any', minSalary: '', maxSalary: '',
            isRemote: '', sort: 'newest',
        });
        setCurrentPage(1);
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const hasActiveSalary = filters.salaryKey && filters.salaryKey !== 'any';
    const currentSalaryLabel = SALARY_RANGES.find(r => r.key === filters.salaryKey)?.label || 'Any Salary';

    const activeFilterCount = [
        filters.category,
        filters.type,
        filters.level,
        hasActiveSalary ? '1' : '',
        filters.isRemote,
    ].filter(Boolean).length;

    const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>

            {/* ── Page Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
                borderBottom: '1px solid var(--border)',
                padding: '48px 0 40px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div className="glow-orb glow-orb-primary" style={{ width: 400, height: 400, top: -100, left: -100, opacity: 0.15 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
                            Find Your <span className="gradient-text">Perfect Career</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                            {totalJobs > 0
                                ? <><strong style={{ color: 'var(--primary)' }}>{totalJobs.toLocaleString()}</strong> opportunities waiting for you</>
                                : 'Search thousands of opportunities'}
                        </p>
                    </div>

                    {/* ── Search Bar ── */}
                    <form onSubmit={handleSearch} style={{ maxWidth: 960, margin: '0 auto' }}>
                        <div className="jobs-search-bar">
                            {/* Keyword input */}
                            <div className="jobs-search-keyword">
                                <Search size={17} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    placeholder="Job title, skills, or company..."
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    className="search-bar-input"
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter', padding: '16px 0', minWidth: 0 }}
                                />
                                {searchInput && (
                                    <button type="button" onClick={() => setSearchInput('')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Location input */}
                            <div className="jobs-search-location">
                                <MapPin size={17} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    placeholder="City, state or Remote..."
                                    value={locationInput}
                                    onChange={e => setLocationInput(e.target.value)}
                                    className="search-bar-input"
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter', padding: '16px 0', minWidth: 0 }}
                                />
                                {locationInput && (
                                    <button type="button" onClick={() => setLocationInput('')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Submit button */}
                            <button type="submit" className="jobs-search-submit"
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--gradient-button-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--gradient-button)'}
                            >
                                <span className="search-btn-text">Search</span>
                                <Search size={16} />
                            </button>
                        </div>
                    </form>

                    {/* ── Filter Toggle + Active Chips ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            style={{ borderRadius: 'var(--radius-full)', position: 'relative' }}
                        >
                            <SlidersHorizontal size={14} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span style={{
                                    background: 'var(--danger)', color: 'white', borderRadius: '50%',
                                    width: 18, height: 18, fontSize: 10, display: 'inline-flex',
                                    alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginLeft: 4
                                }}>{activeFilterCount}</span>
                            )}
                            <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </button>

                        {/* Active filter chips */}
                        {filters.type && (
                            <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                onClick={() => handleFilterChange('type', '')}>
                                <Briefcase size={10} />
                                {JOB_TYPES.find(t => t.value === filters.type)?.label}
                                <X size={10} />
                            </span>
                        )}
                        {filters.level && (
                            <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                onClick={() => handleFilterChange('level', '')}>
                                {EXPERIENCE_LEVELS.find(l => l.value === filters.level)?.label}
                                <X size={10} />
                            </span>
                        )}
                        {filters.category && (
                            <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                onClick={() => handleFilterChange('category', '')}>
                                {categories.find(c => c.id === filters.category)?.name || filters.category}
                                <X size={10} />
                            </span>
                        )}
                        {hasActiveSalary && (
                            <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                onClick={() => handleSalaryChange('any')}>
                                💰 {currentSalaryLabel}
                                <X size={10} />
                            </span>
                        )}
                        {filters.isRemote === 'true' && (
                            <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                onClick={() => handleFilterChange('isRemote', '')}>
                                🌐 Remote Only <X size={10} />
                            </span>
                        )}
                        {filters.isRemote === 'false' && (
                            <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                onClick={() => handleFilterChange('isRemote', '')}>
                                🏢 On-site Only <X size={10} />
                            </span>
                        )}
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="btn btn-sm"
                                style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* ── Filters Panel ── */}
                    {showFilters && (
                        <div style={{
                            maxWidth: 840, margin: '16px auto 0',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)', padding: '24px 28px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: 20,
                            animation: 'fadeIn 0.2s ease',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        }}>
                            {/* Category */}
                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>📂 Category</label>
                                <select className="form-select" value={filters.category}
                                    onChange={e => handleFilterChange('category', e.target.value)}>
                                    <option value="">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}{c.count > 0 ? ` (${c.count})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Type */}
                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>💼 Job Type</label>
                                <select className="form-select" value={filters.type}
                                    onChange={e => handleFilterChange('type', e.target.value)}>
                                    <option value="">All Types</option>
                                    {JOB_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>🎯 Experience Level</label>
                                <select className="form-select" value={filters.level}
                                    onChange={e => handleFilterChange('level', e.target.value)}>
                                    <option value="">All Levels</option>
                                    {EXPERIENCE_LEVELS.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Salary Range */}
                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>💰 Salary Range</label>
                                <select className="form-select"
                                    value={filters.salaryKey}
                                    onChange={e => handleSalaryChange(e.target.value)}>
                                    {SALARY_RANGES.map(s => (
                                        <option key={s.key} value={s.key}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Work Mode */}
                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>🌐 Work Mode</label>
                                <select className="form-select" value={filters.isRemote}
                                    onChange={e => handleFilterChange('isRemote', e.target.value)}>
                                    <option value="">All (On-site + Remote)</option>
                                    <option value="true">Remote Only</option>
                                    <option value="false">On-site Only</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>⬆️ Sort By</label>
                                <select className="form-select" value={filters.sort}
                                    onChange={e => handleFilterChange('sort', e.target.value)}>
                                    {SORT_OPTIONS.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Apply / Clear buttons */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, gridColumn: '1 / -1' }}>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                                        <X size={13} /> Clear Filters ({activeFilterCount})
                                    </button>
                                )}
                                <button onClick={() => setShowFilters(false)} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
                                    ✓ Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Jobs Grid ── */}
            <div className="container jobs-grid-container">

                {/* Active filter summary bar */}
                {(filters.search || filters.location || activeFilterCount > 0) && !loading && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 20, padding: '10px 16px',
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: 10, flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                            🔍 Filtering by:
                        </span>
                        {filters.search && <span className="tag" style={{ fontSize: 12 }}>"{filters.search}"</span>}
                        {filters.location && <span className="tag" style={{ fontSize: 12 }}>📍 {filters.location}</span>}
                        {filters.category && <span className="tag" style={{ fontSize: 12 }}>
                            {categories.find(c => c.id === filters.category)?.name || filters.category}
                        </span>}
                        {filters.type && <span className="tag" style={{ fontSize: 12 }}>
                            {JOB_TYPES.find(t => t.value === filters.type)?.label}
                        </span>}
                        {filters.level && <span className="tag" style={{ fontSize: 12 }}>
                            {EXPERIENCE_LEVELS.find(l => l.value === filters.level)?.label}
                        </span>}
                        {hasActiveSalary && <span className="tag" style={{ fontSize: 12 }}>{currentSalaryLabel}</span>}
                        {filters.isRemote === 'true' && <span className="tag" style={{ fontSize: 12 }}>Remote</span>}
                        {filters.isRemote === 'false' && <span className="tag" style={{ fontSize: 12 }}>On-site</span>}
                        <button onClick={clearFilters}
                            style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            Clear all ×
                        </button>
                    </div>
                )}

                {loading ? (
                    // Skeleton loader
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                        {[...Array(9)].map((_, i) => (
                            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, height: 260 }}>
                                <div className="skeleton" style={{ height: 52, width: 52, borderRadius: 12, marginBottom: 16 }} />
                                <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
                                <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 16 }} />
                                <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
                                <div className="skeleton" style={{ height: 14, width: '60%' }} />
                            </div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                                Showing <strong style={{ color: 'var(--text-primary)' }}>{jobs.length}</strong> of{' '}
                                <strong style={{ color: 'var(--primary)' }}>{totalJobs}</strong> jobs
                            </p>
                            {/* Inline sort */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort:</span>
                                <select className="form-select jobs-sort-select" value={filters.sort}
                                    onChange={e => handleFilterChange('sort', e.target.value)}
                                    style={{ padding: '6px 12px', fontSize: 13, minWidth: 150 }}>
                                    {SORT_OPTIONS.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
                            {jobs.map(job => <JobCard key={job._id} job={job} />)}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="btn btn-secondary btn-sm">
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
                                    className="btn btn-secondary btn-sm">
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No jobs found</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                            {filters.search
                                ? `No results for "${filters.search}". Try different keywords or remove some filters.`
                                : 'Try adjusting your filters to find more opportunities.'}
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                            <button onClick={clearFilters} className="btn btn-primary">Clear All Filters</button>
                            <button onClick={() => navigate('/companies')} className="btn btn-secondary">Browse Companies</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
