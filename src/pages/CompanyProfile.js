import React, { useState, useEffect, useRef } from 'react';
import { Building2, Globe, Phone, Mail, Save, Upload, Link as LinkIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyCompany, createCompany, updateCompany, deleteCompany, getUploadUrl } from '../services/api';
import API from '../services/api';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Media', 'Consulting', 'Real Estate', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const CompanyProfile = () => {
    const [, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Logo state
    const [logoFile, setLogoFile] = useState(null);        // selected File object
    const [logoPreview, setLogoPreview] = useState('');    // local object URL for preview
    const [isDragging, setIsDragging] = useState(false);
    const [logoInputMode, setLogoInputMode] = useState('url'); // 'url' | 'file'
    const [logoError, setLogoError] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [form, setForm] = useState({
        name: '', description: '', industry: '', size: '', location: '',
        website: '', phone: '', email: '', founded: '', logo: ''
    });

    useEffect(() => {
        fetchCompany();
    }, []);

    // Clean up object URL on unmount
    useEffect(() => {
        return () => { if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview); };
    }, [logoPreview]);

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

    // Handle file selection (from input or drop)
    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file (PNG, JPG, GIF, WebP, SVG)'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
        setLogoFile(file);
        if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
        setLogoPreview(URL.createObjectURL(file));
        // Clear URL field so we're using file upload
        setForm(prev => ({ ...prev, logo: '' }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const clearLogoFile = () => {
        setLogoFile(null);
        if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
        setLogoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Effective logo preview URL (blob > URL field > existing stored logo)
    const effectiveLogoPreview = logoPreview || (form.logo ? getUploadUrl(form.logo) : '');

    // Reset logo error when preview source changes
    useEffect(() => {
        setLogoError(false);
    }, [effectiveLogoPreview]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name) { toast.error('Company name is required'); return; }
        setSaving(true);
        try {
            let savedLogo = form.logo;

            // Upload logo file first if one was selected
            if (logoFile) {
                const fd = new FormData();
                // Append all form fields + logo file for multipart
                Object.keys(form).forEach(k => { if (k !== 'logo' && form[k] !== '') fd.append(k, form[k]); });
                fd.append('logo', logoFile);

                let res;
                if (isNew) {
                    res = await API.post('/companies', fd);
                    setCompany(res.data.company);
                    setIsNew(false);
                    toast.success('Company profile created! 🎉');
                } else {
                    res = await API.put('/companies', fd);
                    setCompany(res.data.company);
                    toast.success('Company profile updated!');
                }
                // Refresh form with saved data
                const c = res.data.company;
                setForm(prev => ({ ...prev, logo: c.logo || '' }));
                clearLogoFile();
                setSaving(false);
                return;
            }

            // No file — send JSON (logo might be a URL)
            const payload = { ...form, logo: savedLogo };
            if (isNew) {
                const res = await createCompany(payload);
                setCompany(res.data.company);
                setIsNew(false);
                toast.success('Company profile created! 🎉');
            } else {
                const res = await updateCompany(payload);
                setCompany(res.data.company);
                toast.success('Company profile updated!');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteCompany();
            toast.success('Company profile deleted successfully');
            window.location.href = '/profile';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete company profile');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
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
                .logo-drop-zone {
                    border: 2px dashed var(--border);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    cursor: pointer;
                    transition: var(--transition);
                    background: var(--bg-secondary);
                    text-align: center;
                }
                .logo-drop-zone:hover, .logo-drop-zone.dragging {
                    border-color: var(--primary);
                    background: rgba(99,102,241,0.05);
                }
                .logo-mode-tab {
                    padding: 6px 16px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-full);
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: var(--transition);
                    background: transparent;
                    color: var(--text-secondary);
                    font-family: var(--font-family);
                }
                .logo-mode-tab.active {
                    background: var(--gradient-primary);
                    border-color: var(--primary);
                    color: white;
                }
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

                            {/* Logo Section */}
                            <div style={{ marginBottom: 24 }}>
                                <label className="form-label" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'block' }}>
                                    Company Logo
                                </label>

                                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    {/* Logo Preview */}
                                    <div style={{
                                        width: 88, height: 88, background: 'var(--gradient-primary)',
                                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 32, flexShrink: 0, position: 'relative',
                                        border: '2px solid var(--border)', overflow: 'hidden'
                                    }}>
                                        {(effectiveLogoPreview && !logoError)
                                            ? <img
                                                src={effectiveLogoPreview}
                                                alt="Logo"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={() => setLogoError(true)}
                                            />
                                            : '🏢'
                                        }
                                    </div>

                                    {/* Input mode toggle + inputs */}
                                    <div style={{ flex: 1, minWidth: 240 }}>
                                        {/* Mode tabs */}
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className={`logo-mode-tab ${logoInputMode === 'file' ? 'active' : ''}`}
                                                onClick={() => setLogoInputMode('file')}
                                            >
                                                <Upload size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                Upload File
                                            </button>
                                            <button
                                                type="button"
                                                className={`logo-mode-tab ${logoInputMode === 'url' ? 'active' : ''}`}
                                                onClick={() => setLogoInputMode('url')}
                                            >
                                                <LinkIcon size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                Logo URL
                                            </button>

                                            {(logoFile || form.logo) && (
                                                <button
                                                    type="button"
                                                    onClick={() => { clearLogoFile(); setForm(prev => ({ ...prev, logo: '' })); }}
                                                    style={{
                                                        marginLeft: 'auto', background: 'none', border: 'none',
                                                        color: 'var(--danger)', fontSize: 12, fontWeight: 600,
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                                    }}
                                                >
                                                    <X size={14} /> Remove
                                                </button>
                                            )}
                                        </div>

                                        {logoInputMode === 'file' ? (
                                            <div
                                                className={`logo-drop-zone ${isDragging ? 'dragging' : ''}`}
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                                />
                                                {logoFile ? (
                                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>✓ {logoFile.name}</span>
                                                        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                                                            ({(logoFile.size / 1024).toFixed(0)} KB)
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={22} style={{ color: 'var(--primary)', marginBottom: 8 }} />
                                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                                                            <strong style={{ color: 'var(--primary)' }}>Click to upload</strong> or drag & drop
                                                        </p>
                                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                                            PNG, JPG, GIF, WebP, SVG — max 5 MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <input
                                                    className="form-input"
                                                    name="logo"
                                                    value={form.logo}
                                                    onChange={(e) => { handleChange(e); clearLogoFile(); }}
                                                    placeholder="https://example.com/logo.png"
                                                />
                                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                                    Paste a direct image URL (PNG, JPG, SVG) — e.g. your Clearbit logo or CDN link
                                                </p>
                                            </div>
                                        )}
                                    </div>
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

                        <div style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-end', width: '100%', marginBottom: 24, marginTop: 24 }}>
                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 36px' }}>
                                {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : <><Save size={16} /> {isNew ? 'Create Profile' : 'Save Changes'}</>}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Danger Zone */}
                {!isNew && (
                    <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 40, marginBottom: 24 }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary-subtle)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text-accent)' }}>Danger Zone</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                                Deleting your company profile will also close all your active job postings. This action cannot be undone.
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setShowDeleteModal(true)}
                                style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600 }}
                            >
                                Delete Company Profile
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                        onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-accent)' }}>Delete Company Profile?</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                                Are you sure you want to delete <strong>{form.name}</strong>? This will permanently remove your branding, history, and close all active jobs.
                            </p>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" className="btn btn-static" onClick={() => setShowDeleteModal(false)}
                                    style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button type="button" disabled={deleting} onClick={handleDelete}
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 700, opacity: deleting ? 0.7 : 1 }}>
                                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyProfile;
