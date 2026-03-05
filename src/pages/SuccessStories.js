import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Quote, Users, Trophy, Target } from 'lucide-react';
import { getStories } from '../services/api';
const TESTIMONIALS = [];

const SuccessStories = () => {
    const navigate = useNavigate();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await getStories();
                setStories(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch stories:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    const allStories = [...stories, ...TESTIMONIALS];

    return (
        <div style={{ paddingTop: 100, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div style={{ background: 'var(--gradient-navbar)', borderBottom: '1px solid var(--border)', padding: '64px 0', position: 'relative', overflow: 'hidden' }}>
                <div className="glow-orb glow-orb-primary" style={{ width: 400, height: 400, top: -100, left: -100, opacity: 0.15 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '8px 20px', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                        <Trophy size={18} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Community Achievements</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, marginBottom: 20 }}>
                        Real Stories from <span className="gradient-text">Real Achievers</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                        Join thousands of professionals who have accelerated their careers with JobSarthi's AI-powered platform.
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 40 }}>
                    <div style={{ display: 'flex', gap: 24, color: 'var(--text-muted)', fontSize: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={16} /> 50k+ Users
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Target size={16} /> 12k+ Hired
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 32 }}>
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 300 }}></div>)
                    ) : (
                        allStories.map((t, i) => (
                            <div key={i} className="card" style={{ padding: 32, transition: 'var(--transition)', position: 'relative' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Quote size={40} style={{ position: 'absolute', top: 32, right: 32, color: 'var(--primary)', opacity: 0.1 }} />


                                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} size={16} fill="var(--accent)" color="var(--accent)" />
                                    ))}
                                </div>

                                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 28, fontStyle: 'italic' }}>
                                    "{t.story || t.text}"
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                                    <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, background: 'var(--gradient-primary)', fontWeight: 700 }}>
                                        {t.avatar || (t.name ? t.name.charAt(0) : '?')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                            <span style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</span>
                                            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>•</span>
                                            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{t.role}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.location || t.company || 'Member'}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer CTA */}
                <div style={{ marginTop: 80, textAlign: 'center', padding: '60px 40px', background: 'var(--gradient-cta)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Ready to write your own story?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 18 }}>
                        Don't let your dream job wait. Let our AI guide you to the right opportunity today.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg btn-static">Get Started Now</button>
                        <button onClick={() => navigate('/submit-story')} className="btn btn-secondary btn-lg">
                            Share Your Story
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessStories;

