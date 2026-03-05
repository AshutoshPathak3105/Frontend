import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Star, MessageSquare, Quote, CheckCircle2 } from 'lucide-react';
import { createStory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SubmitStory = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        company: '',
        story: '',
        rating: 5
    });

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please login to share your story');
            navigate('/login');
            return;
        }
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                role: user.title || (user.role === 'employer' ? 'Recruiter' : 'Professional')
            }));
        }
        setFetching(false);
    }, [user, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createStory(formData);
            toast.success('Thank you for sharing your story!');
            setSubmitted(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit story');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
                <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: 'clamp(28px, 6vw, 60px) clamp(20px, 5vw, 40px)' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'var(--gradient-button)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        color: 'white'
                    }}>
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
                        Story Submitted!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
                        Your success story has been received. We might feature it on our homepage to inspire others!
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/success-stories')} className="btn btn-secondary btn-full">
                            View Gallery
                        </button>
                        <button onClick={() => navigate('/')} className="btn btn-primary btn-full">
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 100, paddingBottom: 80 }}>
            <style>{`
                .submit-story-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 48px;
                    align-items: start;
                }
                .submit-story-sidebar {
                    position: sticky;
                    top: 100px;
                }
                .submit-story-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                @media (max-width: 768px) {
                    .submit-story-grid {
                        grid-template-columns: 1fr;
                        gap: 28px;
                    }
                    .submit-story-sidebar {
                        position: static;
                        order: -1;
                    }
                    .submit-story-fields {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 480px) {
                    .submit-story-card {
                        padding: 24px 18px !important;
                    }
                    .submit-story-title {
                        font-size: 24px !important;
                    }
                }
            `}</style>

            <div className="submit-story-grid">
                {/* Form Side */}
                <div className="card submit-story-card" style={{ padding: 40 }}>
                    <div style={{ marginBottom: 32 }}>
                        <h1 className="submit-story-title" style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
                            Share Your <span className="gradient-text">Success Story</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Found your dream job through JobSarthi? We'd love to hear about it!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="submit-story-fields">
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Your Name</label>
                                <input
                                    className="input"
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Current Role</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="e.g. Senior Developer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Where did you get hired?</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Company Name"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Your Story</label>
                            <textarea
                                className="input"
                                rows="6"
                                required
                                placeholder="Describe your journey with JobSarthi..."
                                value={formData.story}
                                onChange={e => setFormData({ ...formData, story: e.target.value })}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Experience Rating</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: 4, transition: 'var(--transition-fast)'
                                        }}
                                    >
                                        <Star
                                            size={28}
                                            fill={star <= formData.rating ? 'var(--accent)' : 'none'}
                                            color={star <= formData.rating ? 'var(--accent)' : 'var(--border)'}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ marginTop: 12, justifyContent: 'center' }}
                        >
                            {loading ? 'Publishing...' : (
                                <>
                                    Publish Story <Send size={18} style={{ marginLeft: 10 }} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="submit-story-sidebar">
                    <div className="card" style={{
                        background: 'var(--gradient-cta)',
                        border: '1px solid rgba(124,58,237,0.2)',
                        padding: 32, marginBottom: 32
                    }}>
                        <Quote size={40} style={{ color: 'var(--primary)', marginBottom: 20, opacity: 0.5 }} />
                        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Your story inspires others</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                            By sharing your journey, you help fellow job seekers stay motivated
                            and navigate their own career paths more effectively.
                        </p>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-button)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                                    flexShrink: 0
                                }}>
                                    <MessageSquare size={16} />
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>Join the community of achievers</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '0 4px' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>What to include:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, listStyle: 'none' }}>
                            {[
                                'Your career background',
                                'How JobSarthi helped you find roles',
                                'Tips for other job seekers',
                                'Your interview experience'
                            ].map((tip, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gradient-button)', flexShrink: 0 }} />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitStory;
