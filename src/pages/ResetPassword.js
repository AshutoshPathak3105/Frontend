import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        if (formData.password !== formData.confirm) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            const { data } = await resetPassword(token, { password: formData.password });
            if (data.success) {
                // Auto-login
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Password reset! You are now logged in.');
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ maxWidth: '460px', padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
                    <h2>Invalid Reset Link</h2>
                    <p className="text-secondary">The reset link is missing or invalid.</p>
                    <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '16px' }}>Request New Link</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-hero)', padding: '32px 16px', overflowY: 'auto'
        }}>
            <div className="glow-orb glow-orb-primary" style={{ width: 400, height: 400, top: -50, right: -100 }} />

            <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1, margin: '20px 0' }}>
                <div style={{
                    background: 'var(--bg-glass)', backdropFilter: 'blur(24px)',
                    border: '1px solid var(--border)', borderRadius: '16px',
                    padding: '32px 28px', boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Set New Password</h1>
                    <p className="text-secondary" style={{ fontSize: '15px' }}>
                        Choose a strong password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 6 characters"
                                required
                                autoFocus
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'
                                }}
                            >
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '28px' }}>
                        <label className="form-label">Confirm Password</label>
                        <input
                            type={showPass ? 'text' : 'password'}
                            name="confirm"
                            className="form-input"
                            value={formData.confirm}
                            onChange={handleChange}
                            placeholder="Repeat your password"
                            required
                        />
                    </div>

                    {/* Strength indicator */}
                    {formData.password && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }} className="text-secondary">
                                <span>Password Strength</span>
                                <span>
                                    {formData.password.length < 6 ? '⚠️ Weak' :
                                        formData.password.match(/[A-Z]/) && formData.password.match(/[0-9]/) && formData.password.length >= 8
                                            ? '✅ Strong' : '🟡 Medium'}
                                </span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '2px', transition: 'width 0.3s',
                                    background: formData.password.length < 6 ? '#ef4444' :
                                        formData.password.match(/[A-Z]/) && formData.password.match(/[0-9]/) && formData.password.length >= 8
                                            ? '#10b981' : '#f59e0b',
                                    width: `${Math.min((formData.password.length / 12) * 100, 100)}%`
                                }} />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '14px' }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner" style={{ width: '16px', height: '16px' }} />
                                Resetting...
                            </span>
                        ) : 'Reset Password'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }} className="text-secondary">
                    Didn't request this?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Sign In Securely
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
