import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoImage from '../components/common/Logo';
import MathCaptcha from '../components/common/MathCaptcha';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Briefcase, Search, Phone, Globe, MapPin, Building2, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Media', 'Consulting', 'Real Estate', 'Other'];

const Register = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', role: 'jobseeker',
        companyName: '', companyWebsite: '', companyLocation: '', companyIndustry: '', companyDescription: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaKey, setCaptchaKey] = useState(0);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const handleCaptcha = useCallback((v) => setCaptchaVerified(v), []);

    const isEmployer = form.role === 'employer';

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone || !form.password) {
            toast.error('All fields are required');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (isEmployer && !form.companyName) {
            toast.error('Company name is required for employer accounts');
            return;
        }
        if (!captchaVerified) {
            toast.error('Please complete the CAPTCHA verification.');
            return;
        }
        setLoading(true);
        try {
            const res = await register(form);
            loginUser(res.data.user, res.data.token);
            toast.success(isEmployer
                ? 'Employer account created! Your company profile is ready. 🏢'
                : 'Account created successfully! Welcome to Job Sarthi 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
            setCaptchaKey(prev => prev + 1);
            setCaptchaVerified(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-hero)', padding: '24px',
            overflowY: 'auto'
        }}>
            <div className="glow-orb glow-orb-primary" style={{ width: 400, height: 400, top: -50, right: -100 }} />
            <div className="glow-orb glow-orb-secondary" style={{ width: 300, height: 300, bottom: -50, left: -50 }} />

            <div style={{
                width: '100%', maxWidth: 480, position: 'relative', zIndex: 1,
                margin: '20px 0'
            }}>
                <div style={{
                    background: 'var(--bg-glass)', backdropFilter: 'blur(24px)',
                    border: '1px solid var(--border)', borderRadius: '16px',
                    padding: '24px 28px', boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div style={{ marginBottom: 16 }}>
                            <LogoImage height={34} withText={true} />
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Create account</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Join the future of job search</p>
                    </div>

                    {/* Role Selection */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                        {[
                            { value: 'jobseeker', label: 'Job Seeker', icon: <Search size={14} />, desc: 'Find dreams' },
                            { value: 'employer', label: 'Employer', icon: <Briefcase size={14} />, desc: 'Hire talent' },
                        ].map((role) => (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => setForm({ ...form, role: role.value })}
                                style={{
                                    padding: '10px 6px', borderRadius: '10px', cursor: 'pointer',
                                    border: `2px solid ${form.role === role.value ? 'var(--primary)' : 'var(--border)'}`,
                                    background: form.role === role.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                                    color: form.role === role.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                                    transition: 'var(--transition)', textAlign: 'center', fontFamily: 'Inter'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>{role.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: 11 }}>{role.label}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* ── Personal Fields ── */}
                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>
                                {isEmployer ? 'Employer Name' : 'Full Name'}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={14} style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', height: 14, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                <input type="text" name="name" value={form.name} onChange={handleChange}
                                    placeholder={isEmployer ? 'Your full name' : 'John Doe'} required
                                    className="form-input" style={{ paddingLeft: 42, paddingTop: 9, paddingBottom: 9 }} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={14} style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', height: 14, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                                    placeholder="e.g. 9876543210" required className="form-input" style={{ paddingLeft: 42, paddingTop: 9, paddingBottom: 9 }} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', height: 14, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                <input type="email" name="email" value={form.email} onChange={handleChange}
                                    placeholder="you@example.com" required className="form-input" style={{ paddingLeft: 42, paddingTop: 9, paddingBottom: 9 }} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', height: 14, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                                    onChange={handleChange} placeholder="Min. 6 chars" required
                                    className="form-input" style={{ paddingLeft: 42, paddingRight: 42, paddingTop: 9, paddingBottom: 9 }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: 'absolute', right: 14, top: 0, bottom: 0, margin: 'auto',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 0, lineHeight: 1, width: 20, height: 20, flexShrink: 0, outline: 'none'
                                }}>
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* ── Employer-only Company Fields ── */}
                        {isEmployer && (
                            <>
                                <div style={{
                                    borderTop: '1px solid var(--border)', margin: '14px 0 12px',
                                    paddingTop: 12
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                        <Building2 size={13} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company Details</span>
                                    </div>

                                    {/* Company Name */}
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                        <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Company Name *</label>
                                        <div style={{ position: 'relative' }}>
                                            <Building2 size={14} style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', height: 14, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                            <input type="text" name="companyName" value={form.companyName} onChange={handleChange}
                                                placeholder="Acme Corp" required={isEmployer}
                                                className="form-input" style={{ paddingLeft: 42, paddingTop: 9, paddingBottom: 9 }} />
                                        </div>
                                    </div>

                                    {/* Industry + Location row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Industry</label>
                                            <select name="companyIndustry" value={form.companyIndustry} onChange={handleChange}
                                                className="form-select" style={{ paddingTop: 9, paddingBottom: 9, fontSize: 13 }}>
                                                <option value="">Select...</option>
                                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Location</label>
                                            <div style={{ position: 'relative' }}>
                                                <MapPin size={13} style={{ position: 'absolute', left: 12, top: 0, bottom: 0, margin: 'auto', height: 13, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                                <input type="text" name="companyLocation" value={form.companyLocation} onChange={handleChange}
                                                    placeholder="City, Country"
                                                    className="form-input" style={{ paddingLeft: 36, paddingTop: 9, paddingBottom: 9, fontSize: 13 }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Website */}
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                        <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Company Website</label>
                                        <div style={{ position: 'relative' }}>
                                            <Globe size={14} style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', height: 14, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                            <input type="url" name="companyWebsite" value={form.companyWebsite} onChange={handleChange}
                                                placeholder="https://yourcompany.com"
                                                className="form-input" style={{ paddingLeft: 42, paddingTop: 9, paddingBottom: 9 }} />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                        <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Company Description</label>
                                        <div style={{ position: 'relative' }}>
                                            <AlignLeft size={14} style={{ position: 'absolute', left: 14, top: 12, pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                            <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange}
                                                placeholder="Brief description of your company..."
                                                rows={2}
                                                className="form-textarea" style={{ paddingLeft: 42, paddingTop: 10, paddingBottom: 10, fontSize: 13, resize: 'none' }} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div style={{ marginBottom: 10 }}>
                            <MathCaptcha key={captchaKey} onVerify={handleCaptcha} />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading || !captchaVerified}
                            style={{ marginTop: 4, padding: '12px', fontSize: 14 }}>
                            {loading ? (
                                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</>
                            ) : (
                                <>{isEmployer ? 'Create Employer Account' : 'Create Account'} <ArrowRight size={14} /></>
                            )}
                        </button>
                    </form>

                    <div className="divider" style={{ margin: '16px 0' }} />
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
