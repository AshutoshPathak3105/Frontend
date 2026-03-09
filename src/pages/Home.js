import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Star, Zap, ChevronRight, CheckCircle } from 'lucide-react';
import { getFeaturedJobs, getJobStats, getCategories, getStories, getUploadUrl } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import LogoImage from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import '../components/jobs/JobCard.css';

const HERO_STATS = [
    { value: '50K+', label: 'Active Jobs', icon: '💼' },
    { value: '10K+', label: 'Companies', icon: '🏢' },
    { value: '500K+', label: 'Job Seekers', icon: '👥' },
    { value: '95%', label: 'Success Rate', icon: '🎯' },
];

const TESTIMONIALS = [];

const Home = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [, setStats] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Removed auto-redirect to allow logged-in users to see landing page

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, statsRes, catsRes, storiesRes] = await Promise.all([
                    getFeaturedJobs(),
                    getJobStats(),
                    getCategories(),
                    getStories()
                ]);
                setFeaturedJobs(jobsRes.data.jobs || []);
                setStats(statsRes.data.stats);
                setCategories(catsRes.data.categories || []);
                setStories(storiesRes.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (searchLocation) params.set('location', searchLocation);
        navigate(`/jobs?${params.toString()}`);
    };

    return (
        <div>
            <style>{`
            .home-stats-grid   { display:grid; grid-template-columns: repeat(4,1fr); gap:20px; max-width:920px; margin:64px auto 0; }
            .home-cat-grid     { display:grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap:16px; }
            .home-cat-link     { display:block; height:100%; text-decoration:none; }
            .home-cat-card     {
                height:100%; box-sizing:border-box;
                background: var(--bg-card); border: 1px solid var(--border);
                border-radius: var(--radius-lg); padding: 24px 20px;
                text-align: center; transition: var(--transition); cursor: pointer;
                position: relative; overflow: hidden;
                display:flex; flex-direction:column; align-items:center; justify-content:center;
            }
            .home-cat-card:hover {
                border-color: rgba(59, 130, 246, 0.5);
                transform: translateY(-6px);
                box-shadow: 0 0 24px rgba(59, 130, 246, 0.2);
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.04));
            }
            .home-steps-grid   { display:grid; grid-template-columns: repeat(3,1fr); gap:32px; }
            .home-testi-grid   { display:grid; grid-template-columns: repeat(3,1fr); gap:24px; }

            /* AI Resume section */
            .ai-resume-section {
                padding: 80px 0;
                background: var(--bg-secondary);
                position: relative;
                overflow: hidden;
                border-bottom: 1px solid var(--border);
            }
            .ai-resume-inner {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 64px;
                align-items: center;
            }
            .ai-resume-features {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-top: 32px;
            }
            .ai-resume-feature-item {
                display: flex;
                align-items: flex-start;
                gap: 14px;
                padding: 16px 18px;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-lg);
                transition: all 0.25s ease;
            }
            .ai-resume-feature-item:hover {
                border-color: var(--primary);
                transform: translateX(4px);
                box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.1);
            }
            .ai-resume-mock {
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .ai-resume-card {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-xl);
                padding: 24px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            }
            .ai-resume-score-ring {
                width: 80px; height: 80px;
                border-radius: 50%;
                background: conic-gradient(var(--primary) 0% 88%, var(--border) 88% 100%);
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .ai-resume-score-inner {
                width: 62px; height: 62px;
                border-radius: 50%;
                background: var(--bg-card);
                display: flex; align-items: center; justify-content: center;
                flex-direction: column;
            }
            .ai-resume-skill-bar-wrap {
                display: flex; flex-direction: column; gap: 10px;
                margin-top: 12px;
            }
            .ai-resume-skill-bar-track {
                height: 6px;
                background: var(--border);
                border-radius: 99px;
                overflow: hidden;
            }
            .ai-resume-skill-bar-fill {
                height: 100%;
                border-radius: 99px;
                background: var(--gradient-button);
            }
            .ai-resume-badge {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 5px 12px;
                border-radius: 99px;
                font-size: 12px; font-weight: 700;
                background: rgba(var(--primary-rgb), 0.1);
                color: var(--primary);
                border: 1px solid rgba(var(--primary-rgb), 0.2);
                margin-bottom: 16px;
            }
            @media (max-width: 860px) {
                .ai-resume-inner { grid-template-columns: 1fr; gap: 40px; }
                .ai-resume-mock { max-width: 460px; margin: 0 auto; }
            }
            @media (max-width: 540px) {
                .ai-resume-section { padding: 52px 0; }
                .ai-resume-features { gap: 14px; }
            }
            .home-search-row   { display:flex; gap:8px; flex-wrap:wrap; }
            .home-search-input { flex:2; min-width:0; }
            .home-search-loc   { flex:1; min-width:120px; }

            /* Hero search bar */
            .hero-search-form {
                display: flex; align-items: center;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-xl);
                padding: 6px 6px 6px 0;
                gap: 0;
                margin-bottom: 20px;
                box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.08);
            }
            .hero-search-field {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 16px; flex: 1; min-width: 0;
            }
            .hero-search-field input {
                flex: 1; background: none; border: none; outline: none;
                color: var(--text-primary); font-size: 15px; font-family: Inter;
                min-width: 0;
            }
            .hero-search-field input::placeholder { color: var(--text-muted); }
            .hero-search-divider {
                width: 1px; background: var(--border);
                align-self: stretch; margin: 8px 0; flex-shrink: 0;
            }
            .hero-search-btn {
                display: flex; align-items: center; gap: 8px;
                background: var(--gradient-button);
                color: #fff; border: none; border-radius: 14px;
                padding: 12px 24px; font-size: 15px; font-weight: 700;
                font-family: Inter; cursor: pointer; white-space: nowrap;
                transition: all 0.2s; flex-shrink: 0;
            }
            .hero-search-btn:hover { background: var(--gradient-button-hover); transform: translateY(-1px); }

            /* Popular tags row */
            .hero-popular-row {
                display: flex; align-items: center; gap: 8px;
                flex-wrap: wrap; justify-content: center;
            }
            .hero-popular-label {
                font-size: 12px; font-weight: 600; color: var(--text-muted);
                text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
            }
            .hero-popular-tag {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.25);
                border-radius: var(--radius-full);
                padding: 5px 14px; font-size: 13px; font-weight: 500;
                color: #60a5fa; cursor: pointer; white-space: nowrap;
                font-family: Inter; transition: all 0.18s;
            }
            .hero-popular-tag:hover {
                background: rgba(59, 130, 246, 0.22);
                border-color: #3b82f6; color: #fff;
            }

            @media(max-width:900px){
                .home-stats-grid  { grid-template-columns: repeat(2,1fr); gap:16px; }
                .home-steps-grid  { grid-template-columns: repeat(2,1fr); gap:20px; }
                .home-testi-grid  { grid-template-columns: repeat(2,1fr); gap:20px; }
                .home-cat-grid    { grid-template-columns: repeat(2,1fr); }
            }
            @media(max-width:640px){
                .hero-search-form { flex-direction: column; padding: 10px; gap: 4px; border-radius: 20px; }
                .hero-search-field { padding: 10px 12px; }
                .hero-search-divider { width: 100%; height: 1px; margin: 4px 0; align-self: auto; }
                .hero-search-btn { width: 100%; justify-content: center; border-radius: 12px; padding: 13px; }
                .hero-popular-row { gap: 6px; }
                .hero-popular-tag { font-size: 12px; padding: 4px 11px; }
            }
            @media(max-width:540px){
                .home-stats-grid  { grid-template-columns: repeat(2,1fr); gap:12px; }
                .home-steps-grid  { grid-template-columns: 1fr; }
                .home-testi-grid  { grid-template-columns: 1fr; }
                .home-cat-grid    { grid-template-columns: repeat(2,1fr); }
                .home-search-row  { flex-direction:column; }
                .home-search-loc  { flex:1; min-width:unset; }
            }
        `}</style>
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'var(--gradient-hero)',
                position: 'relative',
                overflow: 'hidden',
                paddingTop: 80
            }}>
                {/* Gradient orbs - purple, pink, cyan */}
                <div className="glow-orb glow-orb-primary" style={{ width: 700, height: 700, top: -200, left: -250, opacity: 0.8 }} />
                <div className="glow-orb glow-orb-secondary" style={{ width: 500, height: 500, top: 100, right: -200, opacity: 0.7 }} />
                <div className="glow-orb glow-orb-cyan" style={{ width: 400, height: 400, bottom: -100, left: '40%', opacity: 0.5 }} />
                {/* Dot grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200, 200, 200, 0.1) 1px, transparent 0)',
                    backgroundSize: '36px 36px'
                }} />

                <div className="container hero-inner" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
                    <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
                        {/* Gradient animated badge */}
                        <div className="hero-badge" style={{ marginBottom: 32 }}>
                            <LogoImage height={18} withText={false} />
                            AI-Powered Job Matching Platform
                            <ChevronRight size={14} />
                        </div>

                        <h1 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24 }}>
                            Find Your{' '}
                            <span className="gradient-text">Dream Career</span>
                            {' '}with AI
                        </h1>

                        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)', marginBottom: 48, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 48px' }}>
                            Discover thousands of opportunities matched to your skills. Our AI understands your potential and connects you with the perfect role.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="hero-search-form">
                            <div className="hero-search-field">
                                <Search size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    placeholder="Job title, skills, or keywords..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="hero-search-divider" />
                            <div className="hero-search-field">
                                <MapPin size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    placeholder="Location or Remote"
                                    value={searchLocation}
                                    onChange={e => setSearchLocation(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="hero-search-btn">
                                <Search size={16} /> Search Jobs
                            </button>
                        </form>

                        {/* Popular searches */}
                        <div className="hero-popular-row">
                            <span className="hero-popular-label">Popular:</span>
                            {['React Developer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps'].map(term => (
                                <button key={term} className="hero-popular-tag" onClick={() => navigate(`/jobs?search=${term}`)}>
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="home-stats-grid">
                        {HERO_STATS.map((stat, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
                                border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                                padding: '24px 20px', textAlign: 'center', transition: 'var(--transition)',
                                position: 'relative', overflow: 'hidden'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }} className="gradient-text">{stat.value}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Employers Section */}
            <section style={{ padding: '60px 0', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Trusted by Industry Leaders</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '32px 64px',
                    }}>
                        {[
                            { name: 'Google', color: '#4285F4' },
                            { name: 'Microsoft', color: '#00A4EF' },
                            { name: 'Apple', color: 'var(--text-primary)' },
                            { name: 'TCS', color: '#0046AD' },
                            { name: 'Infosys', color: '#007CC3' },
                            { name: 'Amazon', color: '#FF9900' },
                            { name: 'Meta', color: '#0668E1' }
                        ].map((company, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{
                                    fontWeight: 800,
                                    fontSize: 20,
                                    color: company.color,
                                    letterSpacing: '-0.5px',
                                    opacity: 0.9,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    {company.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI-Powered Resume Builder Section */}
            <section className="ai-resume-section">
                <div className="glow-orb" style={{ width: 500, height: 500, top: -150, left: -150, opacity: 0.25 }} />
                <div className="glow-orb glow-orb-secondary" style={{ width: 400, height: 400, bottom: -100, right: -100, opacity: 0.2 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="ai-resume-inner">
                        {/* Left: Text */}
                        <div>
                            <div className="ai-resume-badge">
                                <Zap size={13} /> AI-Powered
                            </div>
                            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 16 }}>
                                Build a Resume That <span className="gradient-text">Gets You Hired</span>
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 0 }}>
                                Our AI analyzes your experience and the job description to craft a perfectly tailored resume — boosting your chances with every application.
                            </p>
                            <div className="ai-resume-features">
                                {[
                                    { icon: '🎯', title: 'ATS Optimized', desc: 'Beat applicant tracking systems with keyword-rich, machine-friendly formatting.' },
                                    { icon: '⚡', title: 'Instant Tailoring', desc: 'Paste a job description and AI rewrites your resume in seconds.' },
                                    { icon: '📊', title: 'Resume Score', desc: 'Get a real-time match score so you know exactly where you stand.' },
                                    { icon: '✨', title: 'Smart Suggestions', desc: 'AI highlights gaps and suggests improvements to strengthen your profile.' },
                                ].map((f, i) => (
                                    <div key={i} className="ai-resume-feature-item">
                                        <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{f.title}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <Zap size={16} /> Build My Resume <ArrowRight size={15} />
                                </Link>
                                <Link to="/jobs" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    Browse Jobs <ChevronRight size={15} />
                                </Link>
                            </div>
                        </div>

                        {/* Right: Mock resume preview card */}
                        <div className="ai-resume-mock">
                            {/* Floating AI badge */}
                            <div style={{
                                position: 'absolute', top: -16, right: 16, zIndex: 2,
                                background: 'var(--gradient-button)', color: '#fff',
                                padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                                boxShadow: '0 4px 16px rgba(var(--primary-rgb),0.35)',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <Zap size={12} /> AI Analyzing…
                            </div>

                            {/* Score card */}
                            <div className="ai-resume-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                    <div className="ai-resume-score-ring">
                                        <div className="ai-resume-score-inner">
                                            <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: 'var(--primary)' }}>88</span>
                                            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>SCORE</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Resume Match Score</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs. Senior Frontend Developer</div>
                                        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
                                            <CheckCircle size={11} /> Strong Match
                                        </div>
                                    </div>
                                </div>
                                <div className="ai-resume-skill-bar-wrap">
                                    {[
                                        { label: 'Technical Skills', pct: 92 },
                                        { label: 'Experience Fit', pct: 85 },
                                        { label: 'Keyword Match', pct: 78 },
                                        { label: 'Education', pct: 95 },
                                    ].map((s, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{s.pct}%</span>
                                            </div>
                                            <div className="ai-resume-skill-bar-track">
                                                <div className="ai-resume-skill-bar-fill" style={{ width: `${s.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Suggestions card */}
                            <div className="ai-resume-card">
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 16 }}>💡</span> AI Suggestions
                                </div>
                                {[
                                    { icon: '✅', text: 'Added 6 missing ATS keywords' },
                                    { icon: '✅', text: 'Quantified 3 work experience bullets' },
                                    { icon: '⚠️', text: 'Add a LinkedIn profile URL' },
                                ].map((tip, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                                        <span style={{ fontSize: 15 }}>{tip.icon}</span>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tip.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section" style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                <div className="glow-orb glow-orb-secondary" style={{ width: 400, height: 400, top: -100, right: -100, opacity: 0.4 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h2 className="section-title">Explore Job <span className="gradient-text">Categories</span></h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>
                            Explore opportunities across all industries and find your perfect fit
                        </p>
                    </div>
                    <div className="home-cat-grid">
                        {categories.map((cat) => (
                            <Link key={cat.id} to={`/jobs?category=${cat.id}`} className="home-cat-link">
                                <div className="home-cat-card">
                                    <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.icon}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{cat.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.count} jobs</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Jobs */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 40, gap: 16 }}>
                        <div>
                            <h2 className="section-title">Featured <span className="gradient-text">Opportunities</span></h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Hand-picked jobs from top companies</p>
                        </div>
                        <Link to="/jobs" className="btn btn-secondary">
                            View All Jobs <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, height: 240 }}>
                                    <div className="skeleton" style={{ height: 52, width: 52, borderRadius: 12, marginBottom: 16 }} />
                                    <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
                                    <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 16 }} />
                                    <div className="skeleton" style={{ height: 14, width: '90%' }} />
                                </div>
                            ))}
                        </div>
                    ) : featuredJobs.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                            {featuredJobs.map(job => <JobCard key={job._id} job={job} />)}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">💼</div>
                            <h3>No featured jobs yet</h3>
                            <p>Check back soon for exciting opportunities!</p>
                            <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 20 }}>Browse All Jobs</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* How it Works */}
            <section className="section" style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                <div className="glow-orb glow-orb-primary" style={{ width: 500, height: 500, bottom: -200, left: -100, opacity: 0.3 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <h2 className="section-title">How <span className="gradient-text">Job Sarthi</span> Works</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>Get hired in 3 simple steps</p>
                    </div>
                    <div className="home-steps-grid">
                        {[
                            { step: '01', icon: '👤', title: 'Create Your Profile', desc: 'Build a comprehensive profile showcasing your skills, experience, and career goals. Our AI will optimize it for maximum visibility.', grad: 'var(--gradient-cool)' },
                            { step: '02', icon: '🔍', title: 'Discover Opportunities', desc: 'Browse thousands of jobs filtered by your preferences. Our AI matches you with roles that align with your skills and aspirations.', grad: 'var(--gradient-primary)' },
                            { step: '03', icon: '🚀', title: 'Apply & Get Hired', desc: 'Apply with one click using your profile. Track your applications in real-time and get AI-powered interview preparation.', grad: 'var(--gradient-vivid)' },
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)', position: 'relative',
                                transition: 'var(--transition)', overflow: 'hidden'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Gradient step number */}
                                <div style={{
                                    position: 'absolute', top: 20, right: 20, fontSize: 52, fontWeight: 900,
                                    background: item.grad,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text', fontFamily: 'Plus Jakarta Sans', opacity: 0.2
                                }}>{item.step}</div>
                                {/* Gradient top bar */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.grad, borderRadius: '16px 16px 0 0' }} />
                                <div style={{ fontSize: 48, marginBottom: 20 }}>{item.icon}</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="glow-orb glow-orb-secondary" style={{ width: 600, height: 600, top: -150, right: -200, opacity: 0.3 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h2 className="section-title">Success <span className="gradient-text">Stories</span></h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>Join thousands who found their dream jobs</p>
                    </div>
                    <div className="home-testi-grid">
                        {[...stories.slice(0, 3), ...TESTIMONIALS].slice(0, 3).map((t, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-xl)', padding: 28, transition: 'var(--transition)',
                                position: 'relative', overflow: 'hidden'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(220, 38, 38, 0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} size={16} fill="#FFD700" color="#FFD700" />
                                    ))}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                                    "{t.story || t.text}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: 'var(--gradient-primary)', overflow: 'hidden' }}>
                                        {t.avatar && t.avatar.length > 2
                                            ? <img src={getUploadUrl(t.avatar)} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : (t.name ? t.name.charAt(0) : '?')
                                        }
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48, flexWrap: 'wrap' }}>
                        <Link to="/submit-story" className="btn btn-outline btn-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                            Share Your Success Story
                        </Link>
                        <Link to="/success-stories" className="btn btn-outline btn-lg" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                            See More Stories
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!user && (
                <section style={{ padding: '80px 0', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                    <div className="glow-orb glow-orb-primary" style={{ width: 600, height: 600, top: -100, left: -200, opacity: 0.5 }} />
                    <div className="glow-orb glow-orb-secondary" style={{ width: 400, height: 400, bottom: -100, right: -100, opacity: 0.4 }} />
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            background: 'var(--gradient-cta)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)', padding: '64px 48px', textAlign: 'center',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {/* Gradient top bar */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: 16 }}>
                                    Ready to Land Your <span className="gradient-text">Dream Job?</span>
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
                                    Join over 500,000 professionals who found their perfect career match on Job Sarthi.
                                </p>
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started Free <ArrowRight size={18} />
                                    </Link>
                                    <Link to="/jobs" className="btn btn-secondary btn-lg">
                                        Browse Jobs
                                    </Link>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
                                    {['No credit card required', 'Free forever plan', 'Cancel anytime'].map(item => (
                                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                                            <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
