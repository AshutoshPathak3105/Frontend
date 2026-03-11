import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, IndianRupee, Plus, X, Send, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { createJob } from '../services/api';

const JOB_TYPES = [
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
    { label: 'Remote', value: 'remote' },
    { label: 'Freelance', value: 'freelance' },
];
const EXPERIENCE_LEVELS = [
    { label: 'Entry Level', value: 'entry' },
    { label: 'Mid Level', value: 'mid' },
    { label: 'Senior Level', value: 'senior' },
    { label: 'Lead', value: 'lead' },
    { label: 'Executive', value: 'executive' },
];
const CATEGORIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Design', 'Sales', 'Operations', 'HR', 'Legal', 'Other'];

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [requirementInput, setRequirementInput] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'full-time',
        location: '',
        experience: 'mid',
        category: 'Technology',
        skills: [],
        requirements: [],
        salary: { min: '', max: '', currency: 'INR' },
        deadline: '',
        vacancies: 1,
        educationRequirement: '',
        featured: false,
        remote: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('salary.')) {
            const key = name.split('.')[1];
            setForm(prev => ({ ...prev, salary: { ...prev.salary, [key]: value } }));
        } else {
            setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skill) => setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

    const addRequirement = () => {
        if (requirementInput.trim()) {
            setForm(prev => ({ ...prev, requirements: [...prev.requirements, requirementInput.trim()] }));
            setRequirementInput('');
        }
    };

    const removeRequirement = (i) => setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, idx) => idx !== i) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.location) {
            toast.error('Please fill in all required fields'); return;
        }
        setLoading(true);
        try {
            const payload = {
                ...form,
                salary: {
                    min: form.salary.min ? Number(form.salary.min) : undefined,
                    max: form.salary.max ? Number(form.salary.max) : undefined,
                    currency: form.salary.currency
                }
            };
            await createJob(payload);
            toast.success('Job posted successfully! 🎉');
            navigate('/my-jobs');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <style>{`
                .pj-grid-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .pj-grid-3   { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
                @media (max-width: 640px) {
                    .pj-grid-2 { grid-template-columns: 1fr; }
                    .pj-grid-3 { grid-template-columns: 1fr; }
                }
            `}</style>
            <div className="container" style={{ padding: '40px 24px', maxWidth: 900 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Post a New Job</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Fill in the details to attract the best candidates</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Basic Info */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Briefcase size={18} style={{ color: 'var(--primary)' }} /> Basic Information
                            </h2>
                            <div className="pj-grid-2">
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Job Title *</label>
                                    <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior React Developer" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Job Type *</label>
                                    <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                                        {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location *</label>
                                    <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. New York, NY or Remote" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Experience Level *</label>
                                    <select className="form-select" name="experience" value={form.experience} onChange={handleChange}>
                                        {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Application Deadline</label>
                                    <input type="date" className="form-input" name="deadline" value={form.deadline} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Number of Vacancies</label>
                                    <input type="number" className="form-input" name="vacancies" value={form.vacancies} onChange={handleChange} min="1" placeholder="e.g. 2" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Education Requirement</label>
                                    <input className="form-input" name="educationRequirement" value={form.educationRequirement} onChange={handleChange} placeholder="e.g. Bachelor's in Computer Science" />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 28 }}>
                                    <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} />
                                    <label htmlFor="featured" style={{ fontSize: 14, cursor: 'pointer' }}>⭐ Mark as Featured Job</label>
                                </div>
                            </div>
                        </div>

                        {/* Salary */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <IndianRupee size={18} style={{ color: 'var(--primary)' }} /> Salary Range
                            </h2>
                            <div className="pj-grid-3">
                                <div className="form-group">
                                    <label className="form-label">Minimum Salary</label>
                                    <input type="number" className="form-input" name="salary.min" value={form.salary.min} onChange={handleChange} placeholder="e.g. 60000" min="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Maximum Salary</label>
                                    <input type="number" className="form-input" name="salary.max" value={form.salary.max} onChange={handleChange} placeholder="e.g. 100000" min="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Currency</label>
                                    <select className="form-select" name="salary.currency" value={form.salary.currency} onChange={handleChange}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Job Description *</h2>
                            <textarea
                                className="form-textarea"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                                rows={8}
                                required
                            />
                        </div>

                        {/* Requirements */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Requirements</h2>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <input className="form-input" value={requirementInput} onChange={e => setRequirementInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                    placeholder="Add a requirement (press Enter)" style={{ flex: 1 }} />
                                <button type="button" onClick={addRequirement} className="btn btn-primary btn-sm"><Plus size={14} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {form.requirements.map((req, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                                        <span style={{ flex: 1, fontSize: 14, color: 'var(--text-secondary)' }}>• {req}</span>
                                        <button type="button" onClick={() => removeRequirement(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(14px, 4vw, 32px)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Tag size={18} style={{ color: 'var(--primary)' }} /> Required Skills
                            </h2>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <input className="form-input" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="Add a skill (press Enter)" style={{ flex: 1 }} />
                                <button type="button" onClick={addSkill} className="btn btn-primary btn-sm"><Plus size={14} /></button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {form.skills.map((skill, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                        borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: 13, color: 'var(--primary-light)'
                                    }}>
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}><X size={12} /></button>
                                    </span>
                                ))}
                                {form.skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills added yet</p>}
                            </div>
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: isMobile ? 'center' : 'flex-end', width: '100%', marginBottom: 24, marginTop: 24 }}>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 36px' }}>
                                {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Posting...</> : <><Send size={16} /> Post Job</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
