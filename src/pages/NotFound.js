import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Zap } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-hero)', position: 'relative', overflow: 'hidden', paddingTop: 80
        }}>
            <div className="glow-orb glow-orb-primary" style={{ width: 500, height: 500, top: -100, left: -150 }} />
            <div className="glow-orb glow-orb-secondary" style={{ width: 400, height: 400, bottom: -100, right: -100 }} />

            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 24px' }}>
                {/* 404 Number */}
                <div style={{
                    fontSize: 'clamp(100px, 20vw, 180px)', fontWeight: 900, lineHeight: 1,
                    fontFamily: 'Plus Jakarta Sans', marginBottom: 8,
                    background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    opacity: 0.8
                }}>
                    404
                </div>

                <div style={{ fontSize: 48, marginBottom: 24 }}>🔍</div>

                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 16 }}>
                    Page Not Found
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.7 }}>
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/" className="btn btn-primary btn-lg">
                        <Home size={18} /> Go Home
                    </Link>
                    <Link to="/jobs" className="btn btn-secondary btn-lg">
                        <Search size={18} /> Browse Jobs
                    </Link>
                </div>

                {/* Decorative elements */}
                <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: i === 2 ? 'var(--primary)' : 'var(--border)',
                            transition: 'var(--transition)'
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotFound;
