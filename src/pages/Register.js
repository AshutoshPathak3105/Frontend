import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LogoImage from '../components/common/Logo';
import MathCaptcha from '../components/common/MathCaptcha';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Briefcase, Search, Globe, MapPin, Building2, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Media', 'Consulting', 'Real Estate', 'Other'];

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginUser, user, loading: authLoading } = useAuth();
    const [animDir, setAnimDir] = useState('');
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'jobseeker',
        companyName: '', companyWebsite: '', companyLocation: '', companyIndustry: '', companyDescription: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaKey, setCaptchaKey] = useState(0);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const handleCaptcha = useCallback((v) => setCaptchaVerified(v), []);

    // Redirect already-logged-in users away from register page
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate, location.state]);

    const isEmployer = form.role === 'employer';

    const switchRole = (newRole) => {
        if (newRole === form.role) return;
        setAnimDir(newRole === 'employer' ? 'right' : 'left');
        setForm(f => ({ ...f, role: newRole }));
    };

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
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

            navigate('/dashboard', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
            setCaptchaKey(prev => prev + 1);
            setCaptchaVerified(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className={`auth-glow auth-glow-1${isEmployer ? ' employer' : ''}`} />
            <div className={`auth-glow auth-glow-2${isEmployer ? ' employer' : ''}`} />

            <div className="auth-card">
                <div className="auth-logo">
                    <LogoImage height={34} withText={true} />
                </div>

                {/* Role Switcher */}
                <div className="auth-role-switcher">
                    <div className={`auth-role-pill${isEmployer ? ' employer' : ''}`} />
                    <button
                        type="button"
                        className={`auth-role-btn${!isEmployer ? ' active' : ''}`}
                        onClick={() => switchRole('jobseeker')}
                    >
                        <Search size={14} /> Job Seeker
                    </button>
                    <button
                        type="button"
                        className={`auth-role-btn${isEmployer ? ' active' : ''}`}
                        onClick={() => switchRole('employer')}
                    >
                        <Briefcase size={14} /> Employer
                    </button>
                </div>

                {/* Hero — animates when role changes */}
                <div
                    key={form.role}
                    className={`auth-hero${animDir ? ` slide-${animDir}` : ''}`}
                >
                    <div className={`auth-hero-icon${isEmployer ? ' employer' : ''}`}>
                        {isEmployer ? <Briefcase size={26} /> : <Search size={26} />}
                    </div>
                    <h1 className="auth-title">
                        {isEmployer ? 'Hire Top Talent' : 'Land Your Dream Job'}
                    </h1>
                    <p className="auth-subtitle">
                        {isEmployer
                            ? 'Create your employer account and start posting jobs today'
                            : 'Join thousands of job seekers finding their perfect role'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Animated form body */}
                    <div
                        key={`form-${form.role}`}
                        className={`auth-form-body${animDir ? ` slide-${animDir}` : ''}`}
                    >
                        <div className="auth-field">
                            <label className="auth-label">{isEmployer ? 'Your Name' : 'Full Name'}</label>
                            <div className="auth-input-wrap">
                                <User size={15} className="auth-input-icon" />
                                <input
                                    type="text" name="name" value={form.name} onChange={handleChange}
                                    placeholder={isEmployer ? 'Your full name' : 'John Doe'}
                                    required className="auth-input"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-wrap">
                                <Mail size={15} className="auth-input-icon" />
                                <input
                                    type="email" name="email" value={form.email} onChange={handleChange}
                                    placeholder="you@example.com" required className="auth-input"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap">
                                <Lock size={15} className="auth-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'} name="password"
                                    value={form.password} onChange={handleChange}
                                    placeholder="Min. 6 characters" required
                                    className="auth-input" style={{ paddingRight: 42 }}
                                />
                                <button type="button" className="auth-eye" onClick={() => setShowPassword(s => !s)}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Employer-only company section */}
                        {isEmployer && (
                            <div className="auth-company-section">
                                <div className="auth-section-label">
                                    <Building2 size={13} /> Company Details
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Company Name *</label>
                                    <div className="auth-input-wrap">
                                        <Building2 size={15} className="auth-input-icon" />
                                        <input
                                            type="text" name="companyName" value={form.companyName}
                                            onChange={handleChange} placeholder="Acme Corp"
                                            required={isEmployer} className="auth-input"
                                        />
                                    </div>
                                </div>

                                <div className="auth-grid-2">
                                    <div className="auth-field">
                                        <label className="auth-label">Industry</label>
                                        <select name="companyIndustry" value={form.companyIndustry}
                                            onChange={handleChange} className="auth-select">
                                            <option value="">Select...</option>
                                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                    </div>
                                    <div className="auth-field">
                                        <label className="auth-label">Location</label>
                                        <div className="auth-input-wrap">
                                            <MapPin size={14} className="auth-input-icon" />
                                            <input
                                                type="text" name="companyLocation" value={form.companyLocation}
                                                onChange={handleChange} placeholder="City, Country"
                                                className="auth-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Website</label>
                                    <div className="auth-input-wrap">
                                        <Globe size={15} className="auth-input-icon" />
                                        <input
                                            type="url" name="companyWebsite" value={form.companyWebsite}
                                            onChange={handleChange} placeholder="https://yourcompany.com"
                                            className="auth-input"
                                        />
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Description</label>
                                    <div className="auth-input-wrap" style={{ alignItems: 'flex-start' }}>
                                        <AlignLeft size={14} style={{
                                            position: 'absolute', left: 14, top: 12,
                                            color: 'var(--text-muted)', pointerEvents: 'none'
                                        }} />
                                        <textarea
                                            name="companyDescription" value={form.companyDescription}
                                            onChange={handleChange}
                                            placeholder="Brief description of your company..."
                                            rows={2} className="auth-textarea"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="auth-captcha">
                        <MathCaptcha key={captchaKey} onVerify={handleCaptcha} />
                    </div>

                    <button
                        type="submit"
                        className={`auth-submit${isEmployer ? ' employer' : ''}`}
                        disabled={loading || !captchaVerified}
                    >
                        {loading ? (
                            <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</>
                        ) : (
                            <>{isEmployer ? 'Create Employer Account' : 'Create Account'} <ArrowRight size={15} /></>
                        )}
                    </button>
                </form>

                <div className="auth-divider" />

                <p className="auth-switch-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
