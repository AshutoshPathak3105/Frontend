import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword, verifyOTP } from '../services/api';
import MathCaptcha from '../components/common/MathCaptcha';
import { Mail, Phone, ShieldCheck, KeySquare, ChevronRight, Hash } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState(''); // can be email or mobile
    const [method, setMethod] = useState('link'); // 'link' or 'otp'
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input & Method, 2: Verification/Success
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const handleCaptcha = useCallback((v) => setCaptchaVerified(v), []);

    const handleSendReset = async (e) => {
        e.preventDefault();
        if (!identifier) return toast.error('Please enter your email or mobile number');
        if (!captchaVerified) return toast.error('Please complete the CAPTCHA verification.');

        setLoading(true);
        try {
            const { data } = await forgotPassword({ identifier, method });
            if (data.success) {
                toast.success(data.message);
                setStep(2);
                setCaptchaVerified(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to process request.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Please enter a valid 6-digit OTP');
        if (!captchaVerified) return toast.error('Please complete the CAPTCHA verification.');

        setLoading(true);
        try {
            const { data } = await verifyOTP({ identifier, otp });
            if (data.success) {
                toast.success('OTP verified! Set your new password.');
                navigate(`/reset-password/${data.resetToken}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-hero)', padding: '24px', overflowY: 'auto'
        }}>
            <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, margin: '20px 0' }}>
                <div style={{
                    background: 'var(--bg-glass)', backdropFilter: 'blur(24px)',
                    border: '1px solid var(--border)', borderRadius: '16px',
                    padding: '32px 28px', boxShadow: 'var(--shadow-lg)'
                }}>
                    {step === 1 ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '16px',
                                    background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                                }}>
                                    <KeySquare size={32} />
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Reset Password</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    Choose how you'd like to recover your access.
                                </p>
                            </div>

                            <form onSubmit={handleSendReset}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label" style={{ marginBottom: '6px', fontSize: '12px' }}>Email or Mobile Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                            display: 'flex', gap: '4px', color: 'var(--text-muted)'
                                        }}>
                                            <Mail size={15} />
                                            <div style={{ width: '1px', height: '12px', background: 'var(--border)', opacity: 0.5 }} />
                                            <Phone size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="you@email.com or 9876..."
                                            required
                                            style={{ paddingLeft: '64px', paddingTop: '10px', paddingBottom: '10px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                                    <div
                                        onClick={() => setMethod('link')}
                                        style={{
                                            padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                            border: `2px solid ${method === 'link' ? 'var(--primary)' : 'var(--border)'}`,
                                            background: method === 'link' ? 'rgba(99,102,241,0.05)' : 'transparent',
                                            display: 'flex', alignItems: 'center', gap: '12px'
                                        }}
                                    >
                                        <div style={{ color: method === 'link' ? 'var(--primary-light)' : 'var(--text-muted)' }}>
                                            <Mail size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>Get Reset Link</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sent to your registered email</div>
                                        </div>
                                        {method === 'link' && <ChevronRight size={14} color="var(--primary-light)" />}
                                    </div>

                                    <div
                                        onClick={() => setMethod('otp')}
                                        style={{
                                            padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                            border: `2px solid ${method === 'otp' ? 'var(--primary)' : 'var(--border)'}`,
                                            background: method === 'otp' ? 'rgba(99,102,241,0.05)' : 'transparent',
                                            display: 'flex', alignItems: 'center', gap: '12px'
                                        }}
                                    >
                                        <div style={{ color: method === 'otp' ? 'var(--primary-light)' : 'var(--text-muted)' }}>
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>OTP Verification</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fastest way to reset securely</div>
                                        </div>
                                        {method === 'otp' && <ChevronRight size={14} color="var(--primary-light)" />}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <MathCaptcha onVerify={handleCaptcha} />
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={loading || !captchaVerified} style={{ padding: '12px' }}>
                                    {loading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <span className="spinner" style={{ width: '16px', height: '16px' }} /> Processing...
                                        </span>
                                    ) : 'Continue'}
                                </button>
                            </form>
                        </>
                    ) : (
                        method === 'otp' ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '16px',
                                        background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                                    }}>
                                        <Hash size={32} />
                                    </div>
                                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Verify OTP</h1>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                        Enter the 6-digit code sent to your registered contact.
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOTP}>
                                    <div className="form-group" style={{ marginBottom: '24px' }}>
                                        <input
                                            type="text"
                                            maxLength="6"
                                            className="form-input"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Enter 6-digit OTP"
                                            required
                                            style={{
                                                textAlign: 'center', fontSize: '20px',
                                                letterSpacing: '12px', fontWeight: 700,
                                                padding: '14px'
                                            }}
                                            autoFocus
                                        />
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <MathCaptcha onVerify={handleCaptcha} />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-full" disabled={loading || !captchaVerified} style={{ padding: '12px' }}>
                                        {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : 'Verify Code'}
                                    </button>
                                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Haven't received it? <button type="button" onClick={() => { setStep(1); setCaptchaVerified(false); }} style={{ color: 'var(--primary-light)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Resend</button>
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Check your email</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                                    If <strong>{identifier}</strong> is registered, we've sent a secure reset link.
                                    Please check your inbox and spam folder.
                                </p>
                                <button className="btn btn-secondary btn-full" onClick={() => { setStep(1); setCaptchaVerified(false); }}>Try another identifier</button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
