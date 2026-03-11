import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, Shield, CheckCircle, AlertTriangle, XCircle,
    Briefcase, Code, MapPin, Clock,
    IndianRupee, Upload, Star, User,
    ArrowRight, Loader, FileText, RefreshCw, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyAndAnalyzeResume, getProfile, getUploadUrl } from '../services/api';
// ─── Score bar color ─────────────────────────────────────────────────────────
const scoreColor = (n) => {
    if (n >= 80) return '#10b981';
    if (n >= 60) return '#f59e0b';
    return '#ef4444';
};

// ─── Salary formatter ────────────────────────────────────────────────────────
const formatSalary = (salary) => {
    if (!salary) return null;
    const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`;
    if (salary.min && salary.max) return `${fmt(salary.min)}–${fmt(salary.max)} ${salary.currency === 'INR' ? '₹' : '$'}`;
    if (salary.min) return `${fmt(salary.min)}+ ${salary.currency === 'INR' ? '₹' : '$'}`;
    return null;
};

// ─── Experience level badge ───────────────────────────────────────────────────
const LEVEL_COLORS = {
    entry: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', label: 'Entry Level' },
    mid: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa', label: 'Mid Level' },
    senior: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', label: 'Senior' },
    lead: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', label: 'Lead' },
    executive: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', label: 'Executive' },
};

const ResumeAI = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Fetch the user's stored profile to check if resume exists
    useEffect(() => {
        (async () => {
            try {
                const res = await getProfile();
                setProfile(res.data.user || res.data.profile);
            } catch {/* ignore */ }
            setProfileLoading(false);
        })();
    }, []);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const res = await verifyAndAnalyzeResume();
            const data = res.data;

            if (!data.success && data.status === 'verification_failed') {
                setError({ type: 'verification', ...data });
            } else if (data.success && data.verified) {
                setResults(data);
                toast.success('Resume verified & analyzed successfully!');
            } else {
                setError({ type: 'general', message: data.message || 'Analysis failed. Please try again.' });
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.status === 'verification_failed') {
                setError({ type: 'verification', ...data });
            } else {
                setError({ type: 'general', message: data?.message || 'Something went wrong. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const hasResume = !profileLoading && profile?.resume;
    const lvl = results?.extractedProfile?.experienceLevel;
    const levelInfo = LEVEL_COLORS[lvl] || LEVEL_COLORS.mid;

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <style>{`
                .rai-hero { background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.08) 100%); border-bottom: 1px solid var(--border); padding: 52px 24px 40px; text-align: center; }
                .rai-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); border-radius: 99px; font-size: 12px; font-weight: 600; color: var(--primary-light); margin-bottom: 18px; }
                .rai-hero h1 { font-size: clamp(26px,5vw,40px); font-weight: 800; margin-bottom: 12px; background: linear-gradient(135deg, var(--text-primary), #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .rai-hero p  { font-size: 16px; color: var(--text-secondary); max-width: 560px; margin: 0 auto; line-height: 1.7; }
                .rai-steps { 
                    display: grid; 
                    grid-template-columns: repeat(6, 1fr); 
                    gap: 12px; 
                    margin-top: 40px; 
                    padding: 0 20px;
                    max-width: 1000px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .rai-step { 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    gap: 10px; 
                    text-align: center;
                    position: relative;
                }
                .rai-step-dot { 
                    width: 36px; height: 36px; 
                    border-radius: 12px; 
                    background: white; 
                    border: 1px solid var(--border); 
                    display: flex; align-items: center; justify-content: center; 
                    font-size: 14px; font-weight: 700; color: var(--primary-light); 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    z-index: 2;
                    transition: all 0.3s ease;
                }
                .rai-step:hover .rai-step-dot {
                    border-color: var(--primary-light);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(99,102,241,0.12);
                }
                .rai-step span {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    line-height: 1.3;
                }
                .rai-step-connector {
                    position: absolute;
                    top: 18px;
                    left: 50%;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, var(--border) 0%, rgba(226, 232, 240, 0.4) 100%);
                    z-index: 1;
                }
                @media(max-width:900px) {
                    .rai-steps { grid-template-columns: repeat(3, 1fr); gap: 24px 12px; }
                    .rai-step-connector { display: none; }
                }
                @media(max-width:500px) {
                    .rai-steps { 
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        max-width: 280px;
                        margin-top: 32px;
                    }
                    .rai-step { 
                        flex-direction: row; 
                        text-align: left;
                        width: 100%;
                        background: var(--bg-card);
                        padding: 10px 14px;
                        border-radius: 12px;
                        border: 1px solid var(--border);
                    }
                    .rai-step-dot { width: 30px; height: 30px; border-radius: 8px; font-size: 13px; flex-shrink: 0; }
                    .rai-step span { font-size: 13px; }
                }
                .rai-card   { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: clamp(16px,4vw,32px); }
                .rai-skill-chip { padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; background: rgba(99,102,241,0.1); color: var(--primary-light); border: 1px solid rgba(99,102,241,0.2); white-space: nowrap; }
                .rai-job-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 22px 24px; transition: var(--transition); cursor: default; }
                .rai-job-card:hover { border-color: rgba(99,102,241,0.4); box-shadow: 0 4px 24px rgba(99,102,241,0.08); }
                .rai-score-bar { height: 8px; border-radius: 99px; background: var(--bg-secondary); overflow: hidden; margin-top: 6px; }
                .rai-score-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
                .rai-verify-ok  { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
                .rai-verify-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 14px; padding: 16px 20px; }
            `}</style>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="rai-hero">
                <div className="rai-badge"><Sparkles size={13} /> AI-Powered Resume Analysis</div>
                <h1>Smart Resume Matcher</h1>
                <p>Upload your resume once. Our AI verifies your identity, parses your skills & experience, then matches you with the top 5 most relevant jobs from our database.</p>
                <div className="rai-steps">
                    {[
                        { label: 'Upload Resume', icon: <Upload size={14} /> },
                        { label: 'Identity Verify', icon: <Shield size={14} /> },
                        { label: 'AI Parsing', icon: <FileText size={14} /> },
                        { label: 'Skill Extraction', icon: <Code size={14} /> },
                        { label: 'Job Matching', icon: <Briefcase size={14} /> },
                        { label: 'Recommendations', icon: <Sparkles size={14} /> }
                    ].map((step, i, arr) => (
                        <div className="rai-step" key={step.label}>
                            <div className="rai-step-dot">
                                {step.icon}
                            </div>
                            <span>{step.label}</span>
                            {i < arr.length - 1 && <div className="rai-step-connector" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="container" style={{ padding: '40px 24px', maxWidth: 860 }}>

                {/* ── Resume Status ─────────────────────────────────────────── */}
                {!profileLoading && (
                    <div className="rai-card" style={{ marginBottom: 24, marginTop: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: hasResume ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${hasResume ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={22} style={{ color: hasResume ? '#10b981' : '#f59e0b' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                                        {hasResume ? (profile.resumeName || 'Your Resume') : 'No Resume Uploaded'}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                        {hasResume
                                            ? 'Resume found on your profile — ready to analyze'
                                            : 'Please upload your resume in Profile → Resume tab first'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                                {!hasResume
                                    ? <Link to="/profile" className="btn btn-primary btn-sm"><Upload size={14} /> Upload Resume</Link>
                                    : <Link to="/profile" className="btn btn-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}><RefreshCw size={14} /> Replace</Link>
                                }
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Analyze Button ────────────────────────────────────────── */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !hasResume}
                        className="btn btn-primary"
                        style={{
                            padding: '14px 36px', fontSize: 16, fontWeight: 700, borderRadius: 14,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            opacity: (!hasResume || loading) ? 0.6 : 1,
                            cursor: (!hasResume || loading) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading
                            ? <><Loader size={18} className="spin" /> Analyzing Resume…</>
                            : <><Sparkles size={18} /> Verify & Analyze My Resume</>
                        }
                    </button>
                    {loading && (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
                            🔒 Verifying identity → 🧠 Parsing resume → 🎯 Matching jobs…
                        </p>
                    )}
                </div>

                {/* ── Verification Error ────────────────────────────────────── */}
                {error?.type === 'verification' && (
                    <div className="rai-verify-err" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <XCircle size={20} style={{ color: '#f87171', flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, fontSize: 15, color: '#f87171' }}>Resume Verification Failed</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>
                            {error.message}
                        </p>
                        {error.extracted && (
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected in resume</div>
                                <div><strong style={{ color: 'var(--text-primary)' }}>Name:</strong> <span style={{ color: 'var(--text-secondary)' }}>{error.extracted.nameFound}</span></div>
                                <div><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> <span style={{ color: 'var(--text-secondary)' }}>{error.extracted.emailFound}</span></div>
                                <div><strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> <span style={{ color: 'var(--text-secondary)' }}>{error.extracted.phoneFound}</span></div>
                            </div>
                        )}
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                            Your registered name, email, and phone must be present in the resume. Go to <Link to="/profile" style={{ color: '#f87171' }}>Profile → Resume</Link> and upload your own resume.
                        </p>
                    </div>
                )}

                {/* ── General Error ─────────────────────────────────────────── */}
                {error?.type === 'general' && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{error.message}</span>
                    </div>
                )}

                {/* ── Results ───────────────────────────────────────────────── */}
                {results && (
                    <>
                        {/* Verification success badge */}
                        <div className="rai-verify-ok" style={{ marginBottom: 24 }}>
                            <Shield size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 700, color: '#10b981', fontSize: 14 }}>Identity Verified ✓</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    Resume belongs to <strong style={{ color: 'var(--text-primary)' }}>{results.candidate_name}</strong>. Analysis complete.
                                </div>
                            </div>
                        </div>

                        {/* Candidate Profile Card */}
                        <div className="rai-card" style={{ marginBottom: 28 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={17} style={{ color: 'var(--primary-light)' }} /> Extracted Candidate Profile
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: 'Industry', value: results.extractedProfile?.industry },
                                    { label: 'Experience', value: `${results.experience_years} yrs` },
                                    { label: 'Level', value: levelInfo.label },
                                    { label: 'Education', value: results.extractedProfile?.educationField },
                                ].map(({ label, value }) => value ? (
                                    <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px' }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{value}</div>
                                    </div>
                                ) : null)}
                            </div>

                            {/* Skills */}
                            {results.skills?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Code size={12} /> Skills Extracted ({results.skills.length})
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {results.skills.map((s, i) => <span key={i} className="rai-skill-chip">{s}</span>)}
                                    </div>
                                </div>
                            )}

                            {/* Certifications */}
                            {results.extractedProfile?.certifications?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Star size={12} /> Certifications
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {results.extractedProfile.certifications.map((c, i) => (
                                            <span key={i} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {results.extractedProfile?.summary && (
                                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                    <strong style={{ color: 'var(--primary-light)' }}>AI Summary: </strong>
                                    {results.extractedProfile.summary}
                                </div>
                            )}
                        </div>

                        {/* Recommended Jobs */}
                        <div style={{ marginBottom: 12 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={18} style={{ color: '#f59e0b' }} />
                                Top {results.recommended_jobs?.length} Job Recommendations
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                                Ranked by AI using skill overlap, experience level, education, and role alignment
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {results.recommended_jobs?.map((job, i) => {
                                    const score = job.matchScoreNum || parseInt(job.match_score) || 0;
                                    const color = scoreColor(score);
                                    const salary = formatSalary(job.salary);
                                    return (
                                        <div key={job.jobId || i} className="rai-job-card">
                                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                                {/* Rank badge */}
                                                <div style={{ width: 34, height: 34, borderRadius: 10, background: i === 0 ? 'rgba(245,158,11,0.15)' : 'var(--bg-secondary)', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: i === 0 ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }}>
                                                    #{i + 1}
                                                </div>

                                                {/* Company logo */}
                                                {job.companyLogo ? (
                                                    <img src={getUploadUrl(job.companyLogo)} alt={job.company} style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid var(--border)', flexShrink: 0 }} />
                                                ) : (
                                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--primary-light)', flexShrink: 0 }}>
                                                        {(job.company || 'C').charAt(0).toUpperCase()}
                                                    </div>
                                                )}

                                                {/* Job info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                                        <div>
                                                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, color: 'var(--text-primary)' }}>{job.job_title}</h3>
                                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={11} /> {job.company}</span>
                                                                {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {job.location}</span>}
                                                                {job.type && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {job.type}</span>}
                                                                {salary && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IndianRupee size={11} /> {salary}</span>}
                                                            </div>
                                                        </div>

                                                        {/* Match score */}
                                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                            <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}%</div>
                                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Match Score</div>
                                                            <div className="rai-score-bar" style={{ width: 80 }}>
                                                                <div className="rai-score-fill" style={{ width: `${score}%`, background: color }} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Why this job */}
                                                    {job.reason && (
                                                        <div style={{ marginTop: 12, background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: `3px solid ${color}` }}>
                                                            <strong style={{ color: 'var(--text-primary)' }}>Why this match: </strong>
                                                            {job.reason}
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                                                        <Link
                                                            to={`/jobs/${job.jobId}`}
                                                            className="btn btn-primary btn-sm"
                                                            style={{ gap: 6, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                                                        >
                                                            Apply Now <ArrowRight size={13} />
                                                        </Link>
                                                        <Link
                                                            to={`/jobs/${job.jobId}`}
                                                            className="btn btn-sm"
                                                            style={{ gap: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                                        >
                                                            View Details <ExternalLink size={12} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Re-analyze */}
                        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                            <button onClick={handleAnalyze} disabled={loading} className="btn btn-sm"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', gap: 6 }}>
                                <RefreshCw size={13} /> Re-analyze Resume
                            </button>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                                Updated your resume? <Link to="/profile" style={{ color: 'var(--primary-light)' }}>Upload the new version</Link> then re-analyze.
                            </p>
                        </div>
                    </>
                )}

                {/* ── Empty / Info state ────────────────────────────────────── */}
                {!results && !error && !loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 10 }}>
                        {[
                            { icon: <Shield size={20} />, color: '#10b981', title: 'Identity Verification', desc: 'We extract your Name, Email & Phone from the resume and match against your registered account.' },
                            { icon: <Code size={20} />, color: '#6366f1', title: 'Deep Skill Extraction', desc: 'NLP powered parsing detects all technical skills, frameworks, tools, certifications & total years of experience.' },
                            { icon: <Sparkles size={20} />, color: '#f59e0b', title: 'Cosine-Based Job Matching', desc: 'AI compares your skill vector against every active job in our database and scores each for relevance.' },
                            { icon: <CheckCircle size={20} />, color: '#a78bfa', title: 'Explainable Recommendations', desc: 'Every job recommendation comes with a clear reason — exactly which skills & experience matched.' },
                        ].map(({ icon, color, title, desc }) => (
                            <div key={title} className="rai-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${color === '#10b981' ? '16,185,129' : color === '#6366f1' ? '99,102,241' : color === '#f59e0b' ? '245,158,11' : '167,139,250'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                                    {icon}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResumeAI;
