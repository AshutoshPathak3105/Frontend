import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LogoImage from '../components/common/Logo';
import MathCaptcha from '../components/common/MathCaptcha';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaKey, setCaptchaKey] = useState(0);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const handleCaptcha = useCallback((v) => setCaptchaVerified(v), []);

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

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-hero)', padding: '32px 16px',
            overflowY: 'auto'
        }}>
            <div className="glow-orb glow-orb-primary" style={{ width: 500, height: 500, top: -100, left: -150 }} />
            <div className="glow-orb glow-orb-secondary" style={{ width: 400, height: 400, bottom: -100, right: -100 }} />

            <div style={{
                width: '100%', maxWidth: 460, position: 'relative', zIndex: 1,
                margin: '20px 0'
            }}>
                <div style={{
                    background: 'var(--bg-glass)', backdropFilter: 'blur(24px)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
                    padding: '20px 28px', boxShadow: 'var(--shadow-lg)'
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                        <div style={{ marginBottom: 16 }}>
                            <LogoImage height={38} withText={true} />
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Welcome back</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0 }}>
                            Sign in to continue your job search
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: 8 }}>
                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Email or Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                    display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)'
                                }}>
                                    <Mail size={15} />
                                    <div style={{ width: '1px', height: '12px', background: 'var(--border)', opacity: 0.5 }} />
                                    <Phone size={14} />
                                </div>
                                <input
                                    type="text"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Email or 10-digit mobile"
                                    required
                                    className="form-input"
                                    style={{ paddingLeft: 64, paddingTop: 8, paddingBottom: 8 }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 8 }}>
                            <label className="form-label" style={{ marginBottom: 3, fontSize: 12 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{
                                    position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto',
                                    height: 15, pointerEvents: 'none', color: 'var(--text-muted)'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    required
                                    className="form-input"
                                    style={{ paddingLeft: 42, paddingRight: 42, paddingTop: 8, paddingBottom: 8 }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: 'absolute', right: 14, top: 0, bottom: 0, margin: 'auto',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 0, lineHeight: 1, width: 20, height: 20, flexShrink: 0, outline: 'none'
                                }}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4, marginBottom: 8 }}>
                            <Link
                                to="/forgot-password"
                                style={{ fontSize: '12px', color: 'var(--primary-light)', fontWeight: 500 }}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <MathCaptcha key={captchaKey} onVerify={handleCaptcha} />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading || !captchaVerified}
                            style={{ padding: '10px', fontSize: 14 }}
                        >
                            {loading ? (
                                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
                            ) : (
                                <>Sign In <ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>

                    <div className="divider" style={{ margin: '12px 0' }} />

                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                        Don't have an account? <br />
                        <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600, display: 'inline-block', marginTop: 4 }}>
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
