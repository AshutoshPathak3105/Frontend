import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LogoImage from '../components/common/Logo';
import MathCaptcha from '../components/common/MathCaptcha';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Search, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [role, setRole] = useState('jobseeker');
    const [animDir, setAnimDir] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaKey, setCaptchaKey] = useState(0);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const handleCaptcha = useCallback((v) => setCaptchaVerified(v), []);

    const switchRole = (newRole) => {
        if (newRole === role) return;
        setAnimDir(newRole === 'employer' ? 'right' : 'left');
        setRole(newRole);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!captchaVerified) {
            toast.error('Please complete the CAPTCHA verification.');
            return;
        }
        setLoading(true);
        try {
            const res = await login(form);
            loginUser(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate('/dashboard');
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message;
            if (status === 429) {
                toast.error('Too many login attempts. Please wait 15 minutes and try again.');
            } else {
                toast.error(msg || 'Login failed. Please try again.');
            }
            setCaptchaKey(prev => prev + 1);
            setCaptchaVerified(false);
        } finally {
            setLoading(false);
        }
    };

    const isEmployer = role === 'employer';

    return (
        <div className="auth-page">
            <div className={`auth-glow auth-glow-1${isEmployer ? ' employer' : ''}`} />
            <div className={`auth-glow auth-glow-2${isEmployer ? ' employer' : ''}`} />

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <LogoImage height={36} withText={true} />
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
                    key={role}
                    className={`auth-hero${animDir ? ` slide-${animDir}` : ''}`}
                >
                    <div className={`auth-hero-icon${isEmployer ? ' employer' : ''}`}>
                        {isEmployer ? <Briefcase size={28} /> : <Search size={28} />}
                    </div>
                    <h1 className="auth-title">
                        {isEmployer ? 'Welcome back, Employer' : 'Welcome back'}
                    </h1>
                    <p className="auth-subtitle">
                        {isEmployer
                            ? 'Sign in to manage your listings and discover top talent'
                            : 'Sign in to continue your job search journey'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrap">
                            <Mail size={15} className="auth-input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="auth-input"
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrap">
                            <Lock size={15} className="auth-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="auth-input"
                                style={{ paddingRight: 42 }}
                            />
                            <button
                                type="button"
                                className="auth-eye"
                                onClick={() => setShowPassword(s => !s)}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-forgot">
                        <Link to="/forgot-password">Forgot password?</Link>
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
                            <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
                        ) : (
                            <>Sign In <ArrowRight size={15} /></>
                        )}
                    </button>
                </form>

                <div className="auth-divider" />

                <p className="auth-switch-link">
                    Don't have an account?{' '}
                    <Link to="/register">Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
