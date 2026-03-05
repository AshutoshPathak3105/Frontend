import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllCompanies } from '../services/api';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [industry, setIndustry] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, [search, industry]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (industry) params.industry = industry;
            const res = await getAllCompanies(params);
            setCompanies(res.data.companies || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Media', 'Consulting'];

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
                <div className="container">
                    <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 8 }}>
                        Explore <span className="gradient-text">Top Companies</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
                        Discover great places to work and find your next opportunity
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{
                            flex: 2, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)', padding: '12px 16px'
                        }}>
                            <Search size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter' }}
                            />
                        </div>
                        <select
                            className="form-select"
                            value={industry}
                            onChange={e => setIndustry(e.target.value)}
                            style={{ minWidth: 180 }}
                        >
                            <option value="">All Industries</option>
                            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '40px 24px' }}>
                <div className="empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No companies found</h3>
                    <p>There are no companies to display at the moment</p>
                </div>
            </div>
        </div>
    );
};

export default Companies;
