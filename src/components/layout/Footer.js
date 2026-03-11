import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail, MapPin, Phone, ArrowRight, Briefcase, Users, Building2, Zap, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import LogoImage from '../common/Logo';
import { getJobStats } from '../../services/api';

const Footer = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [statsData, setStatsData] = useState({
        jobs: '0',
        seekers: '0',
        companies: '0',
        rate: '99%'
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getJobStats();
                if (response.data.success) {
                    const { totalJobs, totalCompanies, totalApplications, totalUsers } = response.data.stats;
                    setStatsData({
                        jobs: totalJobs > 0 ? `${totalJobs}` : '0',
                        seekers: totalUsers > 0 ? `${totalUsers}` : '0',
                        companies: totalCompanies > 0 ? `${totalCompanies}` : '0',
                        rate: '99%' // Authentic estimation or based on feedback
                    });
                }
            } catch (err) {
                console.error('Error fetching footer stats:', err);
            }
        };
        fetchStats();
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) { setSubscribed(true); setEmail(''); }
    };

    const colHeadStyle = {
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        marginBottom: 20,
        color: isDark ? '#94a3b8' : 'var(--text-muted)',
    };

    const linkStyle = {
        display: 'flex', alignItems: 'center', gap: 7,
        color: isDark ? '#94a3b8' : 'var(--text-secondary)',
        fontSize: 13, textDecoration: 'none',
        transition: 'all 0.2s ease',
        padding: '4px 0',
    };

    const stats = [
        { icon: <Briefcase size={20} />, value: statsData.jobs, label: 'Active Jobs' },
        { icon: <Users size={20} />, value: statsData.seekers, label: 'Job Seekers' },
        { icon: <Building2 size={20} />, value: statsData.companies, label: 'Companies' },
        { icon: <Zap size={20} />, value: statsData.rate, label: 'Success Rate' },
    ];

    return (
        <footer style={{
            background: isDark
                ? 'linear-gradient(180deg, #08090e 0%, #030408 100%)'
                : 'linear-gradient(180deg, #f8faff 0%, #f1f4fb 100%)',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
            position: 'relative',
            overflow: 'hidden',
        }}>
            <style>{`
                /* top gradient accent line */
                .footer-accent-bar {
                    height: 3px;
                    background: var(--gradient-button);
                }
                /* stats strip */
                .footer-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0;
                    border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'};
                }
                .footer-stat-item {
                    display: flex; align-items: center; gap: 14px;
                    padding: 28px 24px;
                    border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'};
                }
                .footer-stat-item:last-child { border-right: none; }

                /* main grid */
                .footer-main-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1.2fr;
                    gap: 32px;
                    padding: 56px 60px 48px 0;
                }

                /* newsletter input group */
                .footer-newsletter-form {
                    display: flex; gap: 0;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'};
                }
                .footer-newsletter-input {
                    flex: 1; background: ${isDark ? 'rgba(255,255,255,0.04)' : '#fff'};
                    border: none; outline: none; padding: 11px 14px;
                    font-size: 13px; color: ${isDark ? '#e2e8f0' : '#1e293b'};
                    font-family: Inter, sans-serif;
                }
                .footer-newsletter-btn {
                    padding: 11px 18px;
                    background: var(--gradient-button);
                    border: none; cursor: pointer;
                    color: #fff; font-weight: 700; font-size: 13px;
                    display: flex; align-items: center; gap: 6px;
                    transition: opacity 0.2s;
                    font-family: Inter, sans-serif;
                }
                .footer-newsletter-btn:hover { opacity: 0.88; }

                /* footer link hover */
                .footer-nav-link:hover {
                    color: var(--primary-light) !important;
                    padding-left: 4px !important;
                }
                .footer-nav-link:hover .footer-link-arrow { opacity: 1 !important; }
                .footer-link-arrow { opacity: 0; transition: opacity 0.2s; }

                /* social icons */
                .footer-social-btn {
                    width: 40px; height: 40px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.25s ease;
                    text-decoration: none;
                }
                .footer-social-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.25);
                }

                /* bottom bar */
                .footer-bottom-bar {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 0;
                    border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'};
                    gap: 16px; flex-wrap: wrap;
                }

                @media (max-width: 1024px) {
                    .footer-main-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
                    .footer-stats { grid-template-columns: repeat(2, 1fr); }
                    .footer-stat-item:nth-child(2) { border-right: none; }
                    .footer-stat-item:nth-child(3) { border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}; }
                    .footer-stat-item:nth-child(4) { border-right: none; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}; }
                }
                @media (max-width: 640px) {
                    .footer-main-grid { grid-template-columns: 1fr; gap: 28px; padding: 36px 0 32px; }
                    .footer-stats { grid-template-columns: repeat(2, 1fr); }
                    .footer-bottom-bar { flex-direction: column; text-align: center; }
                    .footer-bottom-links { justify-content: center !important; }
                    .footer-newsletter-form {
                        flex-direction: column;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .footer-newsletter-input {
                        width: 100%;
                        box-sizing: border-box;
                        border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'};
                        border-radius: 0;
                    }
                    .footer-newsletter-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 12px 16px;
                        border-radius: 0;
                    }
                }
            `}</style>

            {/* Top accent bar */}
            <div className="footer-accent-bar" />

            {/* Stats Strip */}
            <div className="footer-stats">
                {stats.map((s, i) => (
                    <div key={i} className="footer-stat-item">
                        <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(var(--primary-rgb),0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)',
                        }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: isDark ? '#f1f5f9' : '#0f172a' }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: isDark ? '#64748b' : 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="container">
                <div className="footer-main-grid">
                    {/* Brand column */}
                    {/* Brand column */}
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 18, pointerEvents: 'none', cursor: 'default' }}>
                            <LogoImage height={32} withText={true} />
                        </div>
                        <p style={{ color: isDark ? '#64748b' : 'var(--text-muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 300, marginBottom: 28 }}>
                            The AI-powered job portal connecting talented professionals with their dream careers. Trusted by thousands of employers and job seekers.
                        </p>

                        {/* Social icons */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
                            {[
                                { icon: <Twitter size={17} />, href: '#', label: 'Twitter' },
                                { icon: <Linkedin size={17} />, href: '#', label: 'LinkedIn' },
                                { icon: <Github size={17} />, href: '#', label: 'GitHub' },
                                { icon: <Mail size={17} />, href: '#', label: 'Email' },
                            ].map((s, i) => (
                                <a key={i} href={s.href} aria-label={s.label} className="footer-social-btn" style={{
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                    color: isDark ? '#64748b' : 'var(--text-muted)',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'var(--primary)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#fff';
                                        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                                        e.currentTarget.style.color = isDark ? '#64748b' : 'var(--text-muted)';
                                    }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>

                        {/* Newsletter */}
                        <div style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(var(--primary-rgb),0.04)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(var(--primary-rgb),0.12)'}`,
                            borderRadius: 14, padding: '20px 20px',
                        }}>
                            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: isDark ? '#e2e8f0' : '#0f172a' }}>
                                Get job alerts in your inbox
                            </p>
                            <p style={{ fontSize: 12, color: isDark ? '#64748b' : 'var(--text-muted)', marginBottom: 14 }}>
                                Weekly digest of top opportunities.
                            </p>
                            {subscribed ? (
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    ✓ You're subscribed!
                                </div>
                            ) : (
                                <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                                    <input
                                        className="footer-newsletter-input"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                    <button className="footer-newsletter-btn" type="submit">
                                        Subscribe <ArrowRight size={14} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* For Job Seekers */}
                    <div style={{ paddingLeft: '15px' }}>
                        <h4 style={colHeadStyle}>Job Seekers</h4>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {[
                                { to: '/jobs', label: 'Browse Jobs' },
                                { to: '/companies', label: 'Companies' },
                                { to: '/register', label: 'Create Profile' },
                                { to: '/dashboard', label: 'My Dashboard' },
                                { to: '/success-stories', label: 'Success Stories' },
                            ].map(link => (
                                <Link key={link.to} to={link.to} className="footer-nav-link" style={linkStyle}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary-light)'; e.currentTarget.style.paddingLeft = '4px'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = isDark ? '#94a3b8' : 'var(--text-secondary)'; e.currentTarget.style.paddingLeft = '0'; }}
                                >
                                    <ChevronRight size={13} className="footer-link-arrow" style={{ opacity: 0, transition: 'opacity 0.2s', color: 'var(--primary)', flexShrink: 0 }} />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* For Employers */}
                    <div style={{ paddingLeft: '20px' }}>
                        <h4 style={colHeadStyle}>Employers</h4>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {[
                                { to: '/post-job', label: 'Post a Job' },
                                { to: '/register', label: 'Create Account' },
                                { to: '/my-jobs', label: 'Manage Jobs' },
                                { to: '/applications', label: 'Applications' },
                                { to: '/company-profile', label: 'Company Profile' },
                            ].map(link => (
                                <Link key={link.to} to={link.to} className="footer-nav-link" style={linkStyle}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary-light)'; e.currentTarget.style.paddingLeft = '4px'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = isDark ? '#94a3b8' : 'var(--text-secondary)'; e.currentTarget.style.paddingLeft = '0'; }}
                                >
                                    <ChevronRight size={13} className="footer-link-arrow" style={{ opacity: 0, transition: 'opacity 0.2s', color: 'var(--primary)', flexShrink: 0 }} />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contact */}
                    <div style={{ paddingLeft: '40px' }}>
                        <h4 style={colHeadStyle}>Get In Touch</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                            {[
                                { icon: <Mail size={16} />, text: 'hello@jobsarthi.in', href: 'mailto:hello@jobsarthi.in' },
                                { icon: <Phone size={16} />, text: '+91 90655 53105', href: 'tel:+919065553105' },
                                { icon: <MapPin size={16} />, text: 'Bilaspur, India', href: '#' },
                            ].map((item, i) => (
                                <a key={i} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    color: isDark ? '#94a3b8' : 'var(--text-secondary)', fontSize: 13,
                                    textDecoration: 'none', transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                                    onMouseLeave={e => e.currentTarget.style.color = isDark ? '#94a3b8' : 'var(--text-secondary)'}
                                >
                                    <span style={{
                                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(var(--primary-rgb),0.07)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--primary)',
                                    }}>
                                        {item.icon}
                                    </span>
                                    {item.text}
                                </a>
                            ))}
                        </div>

                        {/* Trust badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '8px 14px', borderRadius: 8,
                            background: isDark ? 'rgba(255,215,0,0.06)' : 'rgba(var(--primary-rgb),0.06)',
                            border: `1px solid ${isDark ? 'rgba(255,215,0,0.15)' : 'rgba(var(--primary-rgb),0.15)'}`,
                        }}>
                            <span style={{ fontSize: 16 }}>🔒</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#fbbf24' : 'var(--primary)' }}>
                                SSL Secured &amp; Privacy Safe
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom-bar" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 3,
                    padding: '12px 0'
                }}>
                    <p style={{ fontSize: 13, color: isDark ? '#475569' : 'var(--text-muted)', margin: 0 }}>
                        All rights reserved. Made with ❤️ in India.
                    </p>

                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i, arr) => (
                            <React.Fragment key={item}>
                                <button type="button" style={{
                                    color: isDark ? '#475569' : 'var(--text-muted)',
                                    fontSize: 10,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                                    onMouseLeave={e => e.currentTarget.style.color = isDark ? '#475569' : 'var(--text-muted)'}
                                >
                                    {item}
                                </button>
                                {i < arr.length - 1 && (
                                    <span style={{ color: isDark ? '#2d3748' : 'var(--border)', userSelect: 'none', fontSize: 10 }}>·</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <p style={{ fontSize: 10, color: isDark ? '#475569' : 'var(--text-muted)', margin: 0 }}>
                        © {new Date().getFullYear()} <span style={{ fontWeight: 700, color: isDark ? '#64748b' : 'var(--text-secondary)' }}>Job Sarthi</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
