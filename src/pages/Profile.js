import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase, GraduationCap, Plus, Trash2, Save, Upload, Tag, Camera, Users, UserCheck, UserPlus, FileText, ExternalLink, CheckCircle, Sparkles, Zap, Building2, IndianRupee, ChevronRight, Trophy, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, uploadAvatar, addExperience, deleteExperience, addEducation, deleteEducation, updatePassword, uploadResume, deleteResume, recommendJobsFromResume, getUploadUrl, addAchievement, deleteAchievement, deleteAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser, logoutUser } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const avatarInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [skillInput, setSkillInput] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

    const [profileForm, setProfileForm] = useState({
        name: '', email: '', headline: '', bio: '', location: '', phone: '', website: '', skills: []
    });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [expForm, setExpForm] = useState({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' });
    const [eduForm, setEduForm] = useState({ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false });
    const [showExpForm, setShowExpForm] = useState(false);
    const [showEduForm, setShowEduForm] = useState(false);
    const [showAchForm, setShowAchForm] = useState(false);
    const [achForm, setAchForm] = useState({ title: '', issuer: '', date: '', description: '' });
    const [resumeUploading, setResumeUploading] = useState(false);
    const [resumeDeleting, setResumeDeleting] = useState(false);
    const resumeInputRef = useRef(null);
    const [scanLoading, setScanLoading] = useState(false);
    const [recommendedJobs, setRecommendedJobs] = useState(null);
    const [scanMeta, setScanMeta] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener('resize', handleResize);
        fetchProfile();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            const p = res.data.user || res.data.profile;
            setProfile(p);
            setAvatarPreview(p.avatar ? getUploadUrl(p.avatar) : null);
            setProfileForm({
                name: p.name || '', email: p.email || '', headline: p.headline || '', bio: p.bio || '',
                location: p.location || '', phone: p.phone || '', website: p.website || '',
                skills: p.skills || []
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSave = async () => {
        setSaving(true);
        try {
            const res = await updateProfile(profileForm);
            updateUser(res.data.user);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
        // Show instant local preview
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
        // Upload to server
        setAvatarUploading(true);
        try {
            const res = await uploadAvatar(file);
            updateUser(res.data.user);
            setAvatarPreview(getUploadUrl(res.data.user.avatar));
            toast.success('Profile picture updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setAvatarPreview(profile?.avatar ? getUploadUrl(profile.avatar) : null);
        } finally {
            setAvatarUploading(false);
            e.target.value = '';
        }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    const handleDeleteAccount = async () => {
        if (!deletePassword) { toast.error('Please enter your password'); return; }
        setDeleting(true);
        try {
            await deleteAccount({ password: deletePassword });
            toast.success('Account deleted successfully');
            logoutUser();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete account');
        } finally {
            setDeleting(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match'); return;
        }
        setSaving(true);
        try {
            await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
            toast.success('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !profileForm.skills.includes(skillInput.trim())) {
            setProfileForm(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skill) => {
        setProfileForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleAddExperience = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addExperience(expForm);
            toast.success('Experience added!');
            setShowExpForm(false);
            setExpForm({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' });
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add experience');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExperience = async (expId) => {
        try {
            await deleteExperience(expId);
            toast.success('Experience removed');
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove experience');
        }
    };

    const handleAddAchievement = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addAchievement(achForm);
            toast.success('Achievement added!');
            setAchForm({ title: '', issuer: '', date: '', description: '' });
            setShowAchForm(false);
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add achievement');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAchievement = async (achId) => {
        try {
            await deleteAchievement(achId);
            toast.success('Achievement removed');
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove achievement');
        }
    };

    const handleAddEducation = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addEducation(eduForm);
            toast.success('Education added!');
            setShowEduForm(false);
            setEduForm({ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false });
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add education');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEducation = async (eduId) => {
        try {
            await deleteEducation(eduId);
            toast.success('Education removed');
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove education');
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) { toast.error('Only PDF, DOC, or DOCX files are allowed'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Resume must be under 5 MB'); return; }
        setResumeUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);
            await uploadResume(formData);
            toast.success('Resume uploaded successfully!');
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setResumeUploading(false);
            e.target.value = '';
        }
    };

    const handleScanResume = async () => {
        setScanLoading(true);
        setRecommendedJobs(null);
        setScanMeta(null);
        try {
            const res = await recommendJobsFromResume();
            setRecommendedJobs(res.data.jobs || []);
            setScanMeta(res.data.extractedData || null);
            if (res.data.jobs?.length) {
                toast.success(`Found ${res.data.jobs.length} matching jobs for you!`);
            } else {
                toast(res.data.message || 'No matching jobs found right now.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Scan failed. Please try again.');
        } finally {
            setScanLoading(false);
        }
    };

    const handleResumeDelete = async () => {
        if (!window.confirm('Remove your resume?')) return;
        setResumeDeleting(true);
        try {
            await deleteResume();
            toast.success('Resume removed');
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove resume');
        } finally {
            setResumeDeleting(false);
        }
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading profile...</p>
        </div>
    );

    const isEmployer = user?.role === 'employer';
    const TABS = isEmployer
        ? [
            { id: 'profile', label: 'Profile Info' },
            { id: 'company', label: 'My Company' },
            { id: 'security', label: 'Security' },
        ]
        : [
            { id: 'profile', label: 'Profile Info' },
            { id: 'experience', label: 'Experience' },
            { id: 'resume', label: 'Resume' },
            { id: 'education', label: 'Education' },
            { id: 'security', label: 'Security' },
        ];

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <style>{`
                .profile-main-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .profile-form-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                @media (max-width: 760px) {
                    .profile-main-grid  { grid-template-columns: 1fr; }
                    .profile-form-grid  { grid-template-columns: 1fr; }
                }

                /* Profile hero banner */
                .profile-hero {
                    background: var(--bg-card); border: 1px solid var(--border);
                    border-radius: var(--radius-xl); margin-bottom: 8px; overflow: hidden;
                }
                .profile-hero-banner {
                    height: 90px;
                    background: linear-gradient(135deg, #6c63ff 0%, #a78bfa 50%, #8b7cf8 100%);
                }
                .profile-hero-body {
                    padding: 0 28px 24px;
                    display: flex; align-items: flex-start; justify-content: space-between;
                    margin-top: -40px; gap: 24px;
                }
                .profile-hero-avatar {
                    width: 80px; height: 80px; border-radius: 50%;
                    border: 3px solid var(--bg-card);
                    background: var(--gradient-primary);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; font-weight: 700; color: #fff;
                    flex-shrink: 0; overflow: hidden;
                    cursor: pointer; position: relative;
                    text-decoration: none; box-sizing: border-box;
                    -webkit-tap-highlight-color: transparent;
                }
                .profile-hero-avatar:hover { transform: scale(1.02); }
                .profile-hero-info { flex: 1; min-width: 0; padding-bottom: 4px; margin-top: 48px; text-align: left; transition: all 0.3s; }
                .profile-hero-info h1 { font-size: 24px; font-weight: 800; margin: 0 0 6px; color: var(--text-primary); }
                .profile-hero-info p  { font-size: 15px; color: var(--text-secondary); margin: 0; }

                /* Underline tabs */
                .profile-tabs-bar {
                    display: flex; width: 100%;
                    border-bottom: 2px solid var(--border);
                    margin-bottom: 28px; gap: 0;
                    overflow-x: auto; -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }
                .profile-tabs-bar::-webkit-scrollbar { display: none; }
                .profile-tab-btn {
                    padding: 12px 20px; border: none; background: transparent;
                    cursor: pointer; font-size: 14px; font-weight: 600; font-family: Inter;
                    color: var(--text-secondary); white-space: nowrap; flex-shrink: 0;
                    position: relative; transition: color 0.2s;
                    border-bottom: 3px solid transparent; margin-bottom: -2px;
                }
                .profile-tab-btn:hover  { color: var(--text-primary); }
                .profile-tab-btn.active { color: #6c63ff; border-bottom-color: #6c63ff; }

                /* About section card */
                .about-section-card {
                    display: flex; flex-direction: column; gap: 16px;
                    background: var(--bg-card); border: 1px solid var(--border);
                    border-radius: var(--radius-xl); padding: 24px 28px; margin-bottom: 24px;
                    box-sizing: border-box; width: 100%;
                }
                .about-section-info h2 { font-size: 16px; font-weight: 700; margin: 0 0 8px; }

                @media (max-width: 600px) {
                    .profile-hero-body { padding: 0 16px 24px; flex-direction: column; align-items: center; text-align: center; margin-top: -32px; gap: 12px; }
                    .profile-hero-avatar { width: 72px; height: 72px; font-size: 24px; border-width: 4px; }
                    .profile-hero-info { margin-top: 2px; text-align: center; width: 100%; }
                    .profile-hero-info h1 { font-size: 22px; margin-bottom: 4px; font-weight: 800; }
                    .profile-hero-banner { height: 110px; }
                    .about-section-card { padding: 20px 16px; margin-bottom: 16px; }
                    .about-section-info h2 { font-size: 16px; }
                    .profile-page-container { padding: 16px 12px 80px !important; }
                    .profile-tab-btn { font-size: 13px; padding: 12px 14px; }
                }
            `}</style>
            <div className="container profile-page-container" style={{ padding: '40px 24px 72px' }}>
                {/* Profile Hero */}
                <div className="profile-hero">
                    <div className="profile-hero-banner" />
                    <div className="profile-hero-body">
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 12 : 24,
                            alignItems: isMobile ? 'center' : 'flex-start',
                            flex: 1,
                            width: '100%'
                        }}>
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label
                                    htmlFor="profile-avatar-upload"
                                    className="profile-hero-avatar"
                                    onClick={e => { if (avatarUploading) e.preventDefault(); }}
                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: avatarUploading ? 'default' : 'pointer' }}
                                >
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="avatar" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        : getInitials(profileForm.name || user?.name)
                                    }
                                    {avatarUploading && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#fff' }} />
                                        </div>
                                    )}
                                </label>
                                <label
                                    htmlFor="profile-avatar-upload"
                                    onClick={e => { if (avatarUploading) e.preventDefault(); }}
                                    style={{
                                        marginTop: 10,
                                        background: 'var(--gradient-button)', borderRadius: 20,
                                        padding: '6px 16px', fontSize: 12, fontWeight: 700,
                                        cursor: avatarUploading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        color: '#fff', transition: 'all 0.2s', zIndex: 10
                                    }}
                                >
                                    {avatarUploading ? <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <Camera size={14} />}
                                    <span>Edit</span>
                                </label>
                            </div>

                            <div className="profile-hero-info">
                                <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? 20 : 24 }}>{profileForm.name || user?.name || 'Your Name'}</h1>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: isMobile ? '3px 10px' : '4px 12px', borderRadius: 20,
                                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    ...(user?.role === 'employer'
                                        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }
                                        : { background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }
                                    )
                                }}>
                                    {user?.role === 'employer'
                                        ? <><Briefcase size={10} /> Employer</>
                                        : <><User size={10} /> Job Seeker</>
                                    }
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, fontSize: 13, color: 'var(--text-muted)', marginTop: 15, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                    {profileForm.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{profileForm.location}</span>}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={14} />Joined {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : ''}</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Stats — Top Right Area */}
                        {!isMobile && (
                            <div style={{ display: 'flex', gap: 12, marginTop: 48, marginRight: 24 }}>
                                <div
                                    onClick={() => navigate('/network?tab=connections')}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(99, 102, 241, 0.08)', padding: '6px 12px', borderRadius: 10, color: 'var(--text-secondary)', border: '1px solid rgba(99,102,241,0.1)', transition: 'all 0.2s' }}
                                    className="social-stat-link"
                                >
                                    <Users size={15} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.connections?.length || 0}</span>
                                    <span>Connections</span>
                                </div>
                                <div
                                    onClick={() => navigate('/network?tab=followers')}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: 10, color: 'var(--text-secondary)', border: '1px solid rgba(16,185,129,0.1)', transition: 'all 0.2s' }}
                                    className="social-stat-link"
                                >
                                    <UserCheck size={15} style={{ color: '#10b981' }} />
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.followers?.length || 0}</span>
                                    <span>Followers</span>
                                </div>
                                <div
                                    onClick={() => navigate('/network?tab=following')}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(245, 158, 11, 0.08)', padding: '6px 12px', borderRadius: 10, color: 'var(--text-secondary)', border: '1px solid rgba(245,158,11,0.1)', transition: 'all 0.2s' }}
                                    className="social-stat-link"
                                >
                                    <UserPlus size={15} style={{ color: '#f59e0b' }} />
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.following?.length || 0}</span>
                                    <span>Following</span>
                                </div>
                            </div>
                        )}

                        {/* For Mobile: Stats at bottom of hero */}
                        {isMobile && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                                <div
                                    onClick={() => navigate('/network?tab=connections')}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(99, 102, 241, 0.08)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-secondary)' }}
                                >
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.connections?.length || 0}</span>
                                    <span>Connections</span>
                                </div>
                                <div
                                    onClick={() => navigate('/network?tab=followers')}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-secondary)' }}
                                >
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.followers?.length || 0}</span>
                                    <span>Followers</span>
                                </div>
                                <div
                                    onClick={() => navigate('/network?tab=following')}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(245, 158, 11, 0.08)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-secondary)' }}
                                >
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.following?.length || 0}</span>
                                    <span>Following</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Hidden file input lives here */}
                <input
                    ref={avatarInputRef}
                    id="profile-avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                />
                <div className="profile-tabs-bar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`profile-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                        >{tab.label}</button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div>
                        {/* ── About section ── */}
                        <div className="about-section-card">
                            <div className="about-section-info">
                                <h2>About Me</h2>
                                <textarea
                                    className="form-textarea"
                                    style={{ marginTop: 4, minHeight: 90 }}
                                    value={profileForm.bio}
                                    onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                    placeholder="Share a short headline or summary about yourself..."
                                />
                            </div>
                        </div>

                        <div className="profile-main-grid">
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Basic Information</h2>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input className="form-input" value={profileForm.email} readOnly disabled style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-secondary)' }} />
                                    <small style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4, display: 'block' }}>Email cannot be changed</small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Professional Headline</label>
                                    <input className="form-input" value={profileForm.headline} onChange={e => setProfileForm(p => ({ ...p, headline: e.target.value }))} placeholder="e.g. Senior React Developer" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input className="form-input" value={profileForm.location} onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mobile Number</label>
                                    <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. 9876543210" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Website / Portfolio</label>
                                    <input className="form-input" value={profileForm.website} onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))} placeholder="https://yourwebsite.com" />
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Skills</h2>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                    <input className="form-input" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="Add a skill (press Enter)" style={{ flex: 1 }} />
                                    <button onClick={addSkill} className="btn btn-primary btn-sm"><Plus size={14} /></button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {profileForm.skills.map((skill, i) => (
                                        <span key={i} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                            borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: 13, color: 'var(--primary-light)'
                                        }}>
                                            {skill}
                                            <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    {profileForm.skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills added yet</p>}
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={handleProfileSave} disabled={saving} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                                    {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : <><Save size={16} /> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Work Experience</h2>
                            <button onClick={() => setShowExpForm(!showExpForm)} className="btn btn-primary btn-sm"><Plus size={14} /> Add Experience</button>
                        </div>

                        {showExpForm && (
                            <form onSubmit={handleAddExperience} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 24 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Add Experience</h3>
                                <div className="profile-form-grid">
                                    <div className="form-group"><label className="form-label">Job Title *</label><input className="form-input" required value={expForm.title} onChange={e => setExpForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Software Engineer" /></div>
                                    <div className="form-group"><label className="form-label">Company *</label><input className="form-input" required value={expForm.company} onChange={e => setExpForm(p => ({ ...p, company: e.target.value }))} placeholder="Company name" /></div>
                                    <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={expForm.location} onChange={e => setExpForm(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" /></div>
                                    <div className="form-group"><label className="form-label">Start Date *</label><input type="date" className="form-input" required value={expForm.from} onChange={e => setExpForm(p => ({ ...p, from: e.target.value }))} /></div>
                                    {!expForm.current && <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" value={expForm.to} onChange={e => setExpForm(p => ({ ...p, to: e.target.value }))} /></div>}
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28 }}>
                                        <input type="checkbox" id="currentJob" checked={expForm.current} onChange={e => setExpForm(p => ({ ...p, current: e.target.checked, to: '' }))} />
                                        <label htmlFor="currentJob" style={{ fontSize: 14, cursor: 'pointer' }}>I currently work here</label>
                                    </div>
                                </div>
                                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your responsibilities and achievements..." rows={3} /></div>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowExpForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">
                                        {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Adding...</> : <><Plus size={14} /> Add</>}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {(profile?.experience || []).length > 0 ? profile.experience.map((exp, i) => (
                                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}><Briefcase size={18} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{exp.title}</div>
                                        <div style={{ color: 'var(--primary-light)', fontSize: 14, marginBottom: 4 }}>{exp.company}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{exp.location} • {new Date(exp.from).getFullYear()} - {exp.current ? 'Present' : (exp.to ? new Date(exp.to).getFullYear() : '')}</div>
                                        {exp.description && <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{exp.description}</p>}
                                    </div>
                                    <button onClick={() => handleDeleteExperience(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}><Trash2 size={16} /></button>
                                </div>
                            )) : (
                                <div className="empty-state"><div className="empty-state-icon">💼</div><h3>No experience added</h3><p>Add your work history to stand out to employers</p></div>
                            )}
                        </div>

                        {/* ── Achievements Section ── */}
                        <div style={{ marginTop: 36 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, background: 'rgba(245,158,11,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                        <Trophy size={18} />
                                    </div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Achievements</h2>
                                </div>
                                <button onClick={() => setShowAchForm(!showAchForm)} className="btn btn-primary btn-sm">
                                    <Plus size={14} /> Add Achievement
                                </button>
                            </div>

                            {showAchForm && (
                                <form onSubmit={handleAddAchievement} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Add Achievement</h3>
                                    <div className="profile-form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Title *</label>
                                            <input className="form-input" required value={achForm.title} onChange={e => setAchForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Best Employee of the Year" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Issued by</label>
                                            <input className="form-input" value={achForm.issuer} onChange={e => setAchForm(p => ({ ...p, issuer: e.target.value }))} placeholder="e.g. Google, HackerRank" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date</label>
                                            <input type="date" className="form-input" value={achForm.date} onChange={e => setAchForm(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-textarea" value={achForm.description} onChange={e => setAchForm(p => ({ ...p, description: e.target.value }))} placeholder="Briefly describe the achievement..." rows={3} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setShowAchForm(false)} className="btn btn-secondary">Cancel</button>
                                        <button type="submit" disabled={saving} className="btn btn-primary">
                                            {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Adding...</> : <><Plus size={14} /> Add</>}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {(profile?.achievements || []).length > 0 ? profile.achievements.map((ach, i) => (
                                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, background: 'rgba(245,158,11,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                                            <Trophy size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 16 }}>{ach.title}</div>
                                            {ach.issuer && <div style={{ color: 'var(--primary-light)', fontSize: 14, marginBottom: 4 }}>{ach.issuer}</div>}
                                            {ach.date && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(ach.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>}
                                            {ach.description && <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{ach.description}</p>}
                                        </div>
                                        <button onClick={() => handleDeleteAchievement(ach._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}><Trash2 size={16} /></button>
                                    </div>
                                )) : (
                                    <div className="empty-state"><div className="empty-state-icon">🏆</div><h3>No achievements added</h3><p>Showcase your awards, certifications, and accomplishments</p></div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Resume Tab */}
                {activeTab === 'resume' && (
                    <div>
                        <input
                            ref={resumeInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={handleResumeUpload}
                        />
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)', maxWidth: 640 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Resume / CV</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>PDF, DOC or DOCX &mdash; max 5 MB</p>
                                </div>
                            </div>

                            {profile?.resume ? (
                                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'nowrap' }}>
                                    <div style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={20} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {profile.resumeName || 'resume.pdf'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'nowrap' }}>
                                            <CheckCircle size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, whiteSpace: 'nowrap' }}>Uploaded</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: isMobile ? 6 : 8, flexShrink: 0, flexWrap: isMobile ? 'nowrap' : 'nowrap', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 12 : 0 }}>
                                        <a
                                            href={getUploadUrl(profile.resume)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: isMobile ? '4px 6px' : '6px 12px', fontSize: isMobile ? 10 : 11, height: isMobile ? 28 : 32, fontWeight: 700, flex: isMobile ? 1 : 'unset', justifyContent: 'center' }}
                                        >
                                            <ExternalLink size={12} /> {isMobile ? 'View' : 'View'}
                                        </a>
                                        <button
                                            onClick={() => resumeInputRef.current?.click()}
                                            disabled={resumeUploading}
                                            className="btn btn-primary"
                                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: isMobile ? '4px 6px' : '6px 12px', fontSize: isMobile ? 10 : 11, height: isMobile ? 28 : 32, fontWeight: 700, flex: isMobile ? 1 : 'unset', justifyContent: 'center' }}
                                        >
                                            <Upload size={12} /> {isMobile ? 'Replace' : 'Replace Resume'}
                                        </button>
                                        <button
                                            onClick={handleResumeDelete}
                                            disabled={resumeDeleting}
                                            className="btn"
                                            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: 'var(--radius-md)', padding: isMobile ? '4px 6px' : '6px 12px', cursor: 'pointer', fontSize: isMobile ? 10 : 11, height: isMobile ? 28 : 32, fontWeight: 700, flex: isMobile ? 1 : 'unset', justifyContent: 'center' }}
                                        >
                                            {resumeDeleting ? <div className="spinner" style={{ width: 11, height: 11, borderWidth: 2 }} /> : <Trash2 size={12} />}
                                            {isMobile ? 'Remove' : 'Remove'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => !resumeUploading && resumeInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                                        padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                                        marginBottom: 24, transition: 'border-color 0.2s, background 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ width: 56, height: 56, background: 'rgba(99,102,241,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                                        {resumeUploading ? <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} /> : <Upload size={24} />}
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                                        {resumeUploading ? 'Uploading...' : 'Upload your Resume'}
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                        {resumeUploading ? 'Please wait' : 'Click to browse — PDF, DOC or DOCX, max 5 MB'}
                                    </p>
                                </div>
                            )}

                            {!profile?.resume && (
                                <button
                                    onClick={() => resumeInputRef.current?.click()}
                                    disabled={resumeUploading}
                                    className="btn btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
                                >
                                    {resumeUploading
                                        ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading...</>
                                        : <><Upload size={16} /> Upload Resume</>
                                    }
                                </button>
                            )}
                        </div>

                        {/* AI Scan Section */}
                        {profile?.resume && (
                            <div style={{ marginTop: 24 }}>
                                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Sparkles size={22} color="#fff" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Job Recommendations</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Scan your resume and find the best matching jobs instantly</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleScanResume}
                                        disabled={scanLoading}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 15, fontWeight: 700 }}
                                    >
                                        {scanLoading
                                            ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 3, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Scanning your resume...</>
                                            : <><Sparkles size={18} /> Scan &amp; Find Matching Jobs</>
                                        }
                                    </button>

                                    {/* Extracted profile summary */}
                                    {scanMeta && (
                                        <div style={{ marginTop: 20 }}>
                                            {/* Domain + level badges */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                                                {scanMeta.industry && (
                                                    <span style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))', color: 'var(--primary)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)' }}>
                                                        🏷 {scanMeta.industry}
                                                    </span>
                                                )}
                                                {scanMeta.experienceLevel && (
                                                    <span style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                                                        📊 {scanMeta.experienceLevel} level
                                                    </span>
                                                )}
                                                {scanMeta.educationField && (
                                                    <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                                                        🎓 {scanMeta.educationField}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Skills */}
                                            {scanMeta.skills?.length > 0 && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Detected Skills</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {scanMeta.skills.slice(0, 10).map(s => (
                                                            <span key={s} style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Certifications */}
                                            {scanMeta.certifications?.length > 0 && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Certifications</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {scanMeta.certifications.map(c => (
                                                            <span key={c} style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>🏆 {c}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Summary */}
                                            {scanMeta.summary && (
                                                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', margin: '6px 0 0', lineHeight: 1.5 }}>"{scanMeta.summary}"</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Job Results */}
                                {recommendedJobs !== null && (
                                    <div style={{ marginTop: 24 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
                                            {recommendedJobs.length > 0 ? `${recommendedJobs.length} Jobs Matched for You` : 'No matching jobs found right now'}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {recommendedJobs.map(job => (
                                                <div
                                                    key={job._id}
                                                    onClick={() => navigate(`/jobs/${job._id}`)}
                                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.12)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                                                        {/* Company logo */}
                                                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {job.company?.logo
                                                                ? <img
                                                                    src={getUploadUrl(job.company.logo)}
                                                                    alt={job.company.name}
                                                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                                />
                                                                : null}
                                                            <Building2 size={20} style={{ color: 'var(--text-muted)', display: job.company?.logo ? 'none' : 'flex' }} />
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                                                <span style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</span>
                                                                {job.matchScore && (
                                                                    <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                                                        <Zap size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />{job.matchScore}% match
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{job.company?.name}</div>
                                                            {job.matchReason && (
                                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 8 }}>{job.matchReason}</div>
                                                            )}
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                                                {job.location && (
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                                                        <MapPin size={12} />{job.location}
                                                                    </span>
                                                                )}
                                                                {job.type && (
                                                                    <span style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{job.type}</span>
                                                                )}
                                                                {job.level && (
                                                                    <span style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{job.level}</span>
                                                                )}
                                                                {job.salary?.min && (
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: 'var(--text-muted)' }}>
                                                                        <IndianRupee size={12} />{(job.salary.min / 1000).toFixed(0)}k – {(job.salary.max / 1000).toFixed(0)}k
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 4 }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {recommendedJobs.length > 0 && (
                                            <button
                                                onClick={() => navigate('/jobs')}
                                                className="btn btn-secondary"
                                                style={{ marginTop: 16, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
                                            >
                                                View All Jobs <ChevronRight size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Education</h2>
                            <button onClick={() => setShowEduForm(!showEduForm)} className="btn btn-primary btn-sm"><Plus size={14} /> Add Education</button>
                        </div>

                        {showEduForm && (
                            <form onSubmit={handleAddEducation} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 24 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Add Education</h3>
                                <div className="profile-form-grid">
                                    <div className="form-group"><label className="form-label">School / University *</label><input className="form-input" required value={eduForm.school} onChange={e => setEduForm(p => ({ ...p, school: e.target.value }))} placeholder="University name" /></div>
                                    <div className="form-group"><label className="form-label">Degree</label><input className="form-input" value={eduForm.degree} onChange={e => setEduForm(p => ({ ...p, degree: e.target.value }))} placeholder="e.g. Bachelor's" /></div>
                                    <div className="form-group"><label className="form-label">Field of Study</label><input className="form-input" value={eduForm.fieldOfStudy} onChange={e => setEduForm(p => ({ ...p, fieldOfStudy: e.target.value }))} placeholder="e.g. Computer Science" /></div>
                                    <div className="form-group"><label className="form-label">Start Year</label><input type="date" className="form-input" value={eduForm.from} onChange={e => setEduForm(p => ({ ...p, from: e.target.value }))} /></div>
                                    {!eduForm.current && <div className="form-group"><label className="form-label">End Year</label><input type="date" className="form-input" value={eduForm.to} onChange={e => setEduForm(p => ({ ...p, to: e.target.value }))} /></div>}
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28 }}>
                                        <input type="checkbox" id="currentEdu" checked={eduForm.current} onChange={e => setEduForm(p => ({ ...p, current: e.target.checked, to: '' }))} />
                                        <label htmlFor="currentEdu" style={{ fontSize: 14, cursor: 'pointer' }}>Currently studying here</label>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button type="button" onClick={() => setShowEduForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">
                                        {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Adding...</> : <><Plus size={14} /> Add</>}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {(profile?.education || []).length > 0 ? profile.education.map((edu, i) => (
                                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}><GraduationCap size={18} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{edu.school}</div>
                                        <div style={{ color: 'var(--primary-light)', fontSize: 14, marginBottom: 4 }}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{edu.from ? new Date(edu.from).getFullYear() : ''} - {edu.current ? 'Present' : (edu.to ? new Date(edu.to).getFullYear() : '')}</div>
                                    </div>
                                    <button onClick={() => handleDeleteEducation(edu._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}><Trash2 size={16} /></button>
                                </div>
                            )) : (
                                <div className="empty-state"><div className="empty-state-icon">🎓</div><h3>No education added</h3><p>Add your educational background</p></div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── About + Education + Skills Overview ─────────────────── */}

                {/* About */}
                {profileForm.bio && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginTop: 24, display: 'flex' }}>
                        <div style={{ width: 4, flexShrink: 0, background: 'var(--gradient-primary)' }} />
                        <div style={{ padding: '18px 22px', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={14} color="var(--primary-light)" />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>About</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{profileForm.bio}</p>
                        </div>
                    </div>
                )}

                {/* Education + Skills — stacked */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, marginBottom: 8 }}>
                    {/* Education timeline */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={15} color="var(--primary-light)" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>Education</span>
                        </div>
                        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {(profile?.education || []).length > 0 ? profile.education.map((edu, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i < profile.education.length - 1 ? 18 : 0 }}>
                                    {i < profile.education.length - 1 && (
                                        <div style={{ position: 'absolute', left: 13, top: 30, bottom: 0, width: 2, background: 'var(--border)' }} />
                                    )}
                                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                        <GraduationCap size={13} color="var(--primary-light)" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                                        <div style={{ fontSize: 12, color: 'var(--primary-light)', marginBottom: 2 }}>{edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {edu.from && new Date(edu.from).getFullYear()} — {edu.current ? 'Present' : (edu.to && new Date(edu.to).getFullYear())}
                                        </div>
                                    </div>
                                </div>
                            )) : <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No education added yet.</p>}
                        </div>
                    </div>

                    {/* Skills colorful chips */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Tag size={15} color="var(--primary-light)" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>Skills &amp; Expertise</span>
                        </div>
                        <div style={{ padding: '14px 18px' }}>
                            {(profile?.skills || []).length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                    {profile.skills.map((s, i) => {
                                        const colors = [
                                            { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
                                            { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
                                            { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
                                            { bg: 'rgba(236,72,153,0.1)', color: '#f472b6', border: 'rgba(236,72,153,0.25)' },
                                            { bg: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: 'rgba(14,165,233,0.25)' },
                                        ];
                                        const c = colors[i % colors.length];
                                        return (
                                            <span key={i} style={{ padding: '5px 12px', borderRadius: 20, background: c.bg, border: `1px solid ${c.border}`, fontSize: 12, fontWeight: 600, color: c.color, whiteSpace: 'nowrap' }}>{s}</span>
                                        );
                                    })}
                                </div>
                            ) : <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No skills listed yet.</p>}
                        </div>
                    </div>
                </div>

                {/* My Company Tab (employer-only) */}
                {activeTab === 'company' && (
                    <div style={{ maxWidth: 560 }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Building2 size={26} style={{ color: 'var(--primary-light)' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Company Profile</h2>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Manage your company information, logo, and hiring details</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                                Your company profile is visible to job seekers browsing your postings. Keep it up to date to attract the right talent — add your logo, company description, industry, website, and social links.
                            </p>
                            <a
                                href="/company-profile"
                                className="btn btn-primary"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                                    borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 14,
                                    textDecoration: 'none', width: 'fit-content', transition: 'opacity 0.15s'
                                }}
                            >
                                <Building2 size={15} /> Open Company Profile
                            </a>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Change Password</h2>
                            <form onSubmit={handlePasswordChange}>
                                <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" required value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" /></div>
                                <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" required value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" /></div>
                                <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-input" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" /></div>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary-subtle)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text-accent)' }}>Danger Zone</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
                            <button type="button" className="btn btn-primary" onClick={() => setShowDeleteModal(true)}
                                style={{ borderRadius: 'var(--radius-md)', padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                                Delete My Account
                            </button>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                                onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeletePassword(''); } }}>
                                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-accent)' }}>Delete Account</h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>This will permanently delete your account and all associated data. Enter your password to confirm.</p>
                                    <div className="form-group">
                                        <label className="form-label">Your Password</label>
                                        <input type="password" className="form-input" value={deletePassword}
                                            onChange={e => setDeletePassword(e.target.value)}
                                            placeholder="Enter your password" autoFocus />
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                        <button type="button" className="btn btn-static" onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                                            style={{ flex: 1, padding: '9px 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                        <button type="button" disabled={deleting} onClick={handleDeleteAccount}
                                            className="btn btn-primary"
                                            style={{ flex: 1, padding: '9px 0', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
                                            {deleting ? 'Deleting...' : 'Yes, Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Profile;
