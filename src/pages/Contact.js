import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        // Simulate API call
        setTimeout(() => {
            toast.success('Message sent successfully! We will get back to you soon. 🚀');
            setForm({ name: '', email: '', subject: '', message: '' });
            setSending(false);
        }, 1500);
    };

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: 16 }}>
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                        Have questions about JobSarthi? We're here to help you navigate your career journey.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 40, alignItems: 'start' }}>
                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Contact Information</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{ width: 48, height: 48, background: 'rgba(99,102,241,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                        <Mail size={22} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Email Us</div>
                                        <div style={{ fontSize: 16, fontWeight: 600 }}>support@jobsarthi.com</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{ width: 48, height: 48, background: 'rgba(52,211,153,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                                        <Phone size={22} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Call Us</div>
                                        <div style={{ fontSize: 16, fontWeight: 600 }}>+91 (800) 123-4567</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{ width: 48, height: 48, background: 'rgba(244,114,182,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                                        <MapPin size={22} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Visit Us</div>
                                        <div style={{ fontSize: 16, fontWeight: 600 }}>Digital Tower, Sector 62, Noida, India</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: 1, background: 'var(--border)', margin: '32px 0' }} />

                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ width: 40, height: 40, background: 'rgba(147,197,253,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                                    <Clock size={18} />
                                </div>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                    Our team typically responds within <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>2-4 hours</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)', padding: 'clamp(18px, 5vw, 40px)',
                        boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden'
                    }}>
                        <div className="glow-orb glow-orb-secondary" style={{ width: 300, height: 300, top: -150, right: -150, opacity: 0.3 }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Send us a Message</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>We'd love to hear from you!</p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input
                                            className="form-input"
                                            required
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            required
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Subject</label>
                                    <input
                                        className="form-input"
                                        required
                                        value={form.subject}
                                        onChange={e => setForm({ ...form, subject: e.target.value })}
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        className="form-textarea"
                                        required
                                        rows={5}
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                        placeholder="Type your message here..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={sending}
                                    style={{ width: '100%', padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                                >
                                    {sending ? (
                                        <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending...</>
                                    ) : (
                                        <><Send size={18} /> Send Message</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    [style*="grid-template-columns: 1fr 1.5fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 540px) {
                    [style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Contact;
