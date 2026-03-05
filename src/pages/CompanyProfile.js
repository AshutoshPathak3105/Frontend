import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Globe, Users, Phone, Mail, Save, Plus, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyCompany, createCompany, updateCompany } from '../services/api';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Media', 'Consulting', 'Real Estate', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const CompanyProfile = () => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);

    const [form, setForm] = useState({
        name: '', description: '', industry: '', size: '', location: '',
        website: '', phone: '', email: '', founded: '', logo: ''
    });

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await getMyCompany();
            const c = res.data.company;
            if (!c) {
                setIsNew(true);
            } else {
                setCompany(c);
                setForm({
                    name: c.name || '', description: c.description || '', industry: c.industry || '',
                    size: c.size || '', location: c.location || '', website: c.website || '',
                    phone: c.phone || '', email: c.email || '', founded: c.founded || '', logo: c.logo || ''
                });
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setIsNew(true);
            } else {
                toast.error('Failed to load company profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name) { toast.error('Company name is required'); return; }
        setSaving(true);
        try {
            if (isNew) {
                const res = await createCompany(form);
                setCompany(res.data.company);
                setIsNew(false);
                toast.success('Company profile created! 🎉');
            } else {
                const res = await updateCompany(form);
                setCompany(res.data.company);
                toast.success('Company profile updated!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save company profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading company profile...</p>
        </div>
    );

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <style>{`
                .cp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media (max-width: 640px) { .cp-grid-2 { grid-template-columns: 1fr; } }
            `}</style>
            <div className="container" style={{ padding: '40px 24px', maxWidth: 900 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                        {isNew ? 'Create Company Profile' : 'Company Profile'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isNew ? 'Set up your company profile to start posting jobs' : 'Manage your company information and branding'}
                    </p>
                </div>

                {isNew && (
                    <div style={{
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 28,
                        display: 'flex', alignItems: 'center', gap: 12
                    }}>
                        <Building2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <p style={{ fontSize: 14, color: 'var(--primary-light)' }}>
                            You haven't set up a company profile yet. Create one to start posting jobs and attracting candidates.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Logo & Basic */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Company Identity</h2>

                            {/* Logo Preview */}
                            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                                <div style={{
                                    width: 80, height: 80, background: 'var(--gradient-primary)',
                                    borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 32, overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0
                                }}>
                                    {form.logo ? <img src={form.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏢'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Logo URL</label>
                                    <input className="form-input" name="logo" value={form.logo} onChange={handleChange} placeholder="https://example.com/logo.png" />
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Enter a URL for your company logo</p>
                                </div>
                            </div>

                            <div className="cp-grid-2">
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Company Name *</label>
                                    <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Your company name" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Industry</label>
                                    <select className="form-select" name="industry" value={form.industry} onChange={handleChange}>
                                        <option value="">Select Industry</option>
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Company Size</label>
                                    <select className="form-select" name="size" value={form.size} onChange={handleChange}>
                                        <option value="">Select Size</option>
                                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Founded Year</label>
                                    <input type="number" className="form-input" name="founded" value={form.founded} onChange={handleChange} placeholder="e.g. 2010" min="1800" max={new Date().getFullYear()} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Headquarters Location</label>
                                    <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Company Description</label>
                                <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange}
                                    placeholder="Tell candidates about your company culture, mission, and what makes you unique..." rows={5} />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Contact Information</h2>
                            <div className="cp-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Website</label>
                                    <div style={{ position: 'relative' }}>
                                        <Globe size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" name="website" value={form.website} onChange={handleChange} placeholder="https://yourcompany.com" style={{ paddingLeft: 38 }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" style={{ paddingLeft: 38 }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contact Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="email" className="form-input" name="email" value={form.email} onChange={handleChange} placeholder="hr@yourcompany.com" style={{ paddingLeft: 38 }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 36px' }}>
                                {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : <><Save size={16} /> {isNew ? 'Create Profile' : 'Save Changes'}</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyProfile;
