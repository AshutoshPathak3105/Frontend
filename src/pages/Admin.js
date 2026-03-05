import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Briefcase, Building2, FileText, Shield, CheckCircle,
    XCircle, Trash2, Star, Lock, Unlock, BarChart2, RefreshCw
} from 'lucide-react';
import {
    getAdminStats,
    getAdminUsers, toggleAdminUserStatus, deleteAdminUser,
    getAdminJobs, toggleAdminFeatureJob, closeAdminJob,
    getAdminCompanies, toggleAdminVerifyCompany, toggleAdminCompanyStatus,
    getAdminApplications
} from '../services/api';
import toast from 'react-hot-toast';

// ─── Reusable stat card ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={22} color={color} />
        </div>
        <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{value ?? '—'}</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>{label}</div>
        </div>
    </div>
);

// ─── Tab button ───────────────────────────────────────────────────────────────
const TabBtn = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={active ? 'btn btn-primary' : 'btn btn-outline'}
        style={{ borderRadius: 8, padding: '8px 18px', fontSize: 14 }}
    >
        {label}
    </button>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const Badge = ({ text, color }) => (
    <span style={{
        padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        background: `${color}22`, color
    }}>{text}</span>
);

const TABS = ['Overview', 'Users', 'Jobs', 'Companies', 'Applications'];

const Admin = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await getAdminStats();
            setStats(res.data.stats);
        } catch {
            toast.error('Failed to load stats');
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminUsers();
            setUsers(res.data.users || []);
        } catch {
            toast.error('Failed to load users');
        } finally { setLoading(false); }
    }, []);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminJobs();
            setJobs(res.data.jobs || []);
        } catch {
            toast.error('Failed to load jobs');
        } finally { setLoading(false); }
    }, []);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminCompanies();
            setCompanies(res.data.companies || []);
        } catch {
            toast.error('Failed to load companies');
        } finally { setLoading(false); }
    }, []);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminApplications();
            setApplications(res.data.applications || []);
        } catch {
            toast.error('Failed to load applications');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        if (activeTab === 'Users') fetchUsers();
        else if (activeTab === 'Jobs') fetchJobs();
        else if (activeTab === 'Companies') fetchCompanies();
        else if (activeTab === 'Applications') fetchApplications();
    }, [activeTab, fetchUsers, fetchJobs, fetchCompanies, fetchApplications]);

    // ── Action handlers ────────────────────────────────────────────────────────
    const handleToggleUser = async (id) => {
        try {
            await toggleAdminUserStatus(id);
            toast.success('User status updated');
            fetchUsers();
        } catch { toast.error('Failed to update user'); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Permanently delete this user?')) return;
        try {
            await deleteAdminUser(id);
            toast.success('User deleted');
            fetchUsers();
        } catch { toast.error('Failed to delete user'); }
    };

    const handleFeatureJob = async (id) => {
        try {
            await toggleAdminFeatureJob(id);
            toast.success('Job feature status toggled');
            fetchJobs();
        } catch { toast.error('Failed to update job'); }
    };

    const handleCloseJob = async (id) => {
        if (!window.confirm('Close this job posting?')) return;
        try {
            await closeAdminJob(id);
            toast.success('Job closed');
            fetchJobs();
        } catch { toast.error('Failed to close job'); }
    };

    const handleVerifyCompany = async (id) => {
        try {
            await toggleAdminVerifyCompany(id);
            toast.success('Company verification toggled');
            fetchCompanies();
        } catch { toast.error('Failed to update company'); }
    };

    const handleToggleCompany = async (id) => {
        try {
            await toggleAdminCompanyStatus(id);
            toast.success('Company status updated');
            fetchCompanies();
        } catch { toast.error('Failed to update company'); }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Shield size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Admin Panel</h1>
                    <p className="text-secondary" style={{ margin: 0, fontSize: 14 }}>Manage users, jobs, and platform content</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                {TABS.map(tab => (
                    <TabBtn key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
                ))}
            </div>

            {/* ── Overview ── */}
            {activeTab === 'Overview' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="#6366f1" />
                        <StatCard icon={Briefcase} label="Active Jobs" value={stats?.activeJobs} color="#10b981" />
                        <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies} color="#f59e0b" />
                        <StatCard icon={FileText} label="Applications" value={stats?.totalApplications} color="#3b82f6" />
                        <StatCard icon={BarChart2} label="Employers" value={stats?.employers} color="#8b5cf6" />
                        <StatCard icon={CheckCircle} label="Verified Companies" value={stats?.verifiedCompanies} color="#059669" />
                    </div>
                    <p className="text-secondary" style={{ fontSize: 13 }}>
                        Select a tab above to manage platform content.
                    </p>
                </div>
            )}

            {loading && activeTab !== 'Overview' && (
                <div className="loading-container" style={{ paddingTop: 60 }}>
                    <div className="spinner" />
                </div>
            )}

            {/* ── Users ── */}
            {activeTab === 'Users' && !loading && (
                <div className="card" style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{u.name}</td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">{u.email}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <Badge text={u.role} color={u.role === 'admin' ? '#ef4444' : u.role === 'employer' ? '#f59e0b' : '#6366f1'} />
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <Badge text={u.isActive ? 'Active' : 'Inactive'} color={u.isActive ? '#10b981' : '#ef4444'} />
                                    </td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                            onClick={() => handleToggleUser(u._id)}
                                            title={u.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {u.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '4px 10px', fontSize: 12, background: '#ef444420', color: '#ef4444', border: 'none' }}
                                            onClick={() => handleDeleteUser(u._id)}
                                            title="Delete user"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <p className="text-secondary" style={{ padding: 20 }}>No users found.</p>}
                </div>
            )}

            {/* ── Jobs ── */}
            {activeTab === 'Jobs' && !loading && (
                <div className="card" style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Title', 'Company', 'Status', 'Featured', 'Posted', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(j => (
                                <tr key={j._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{j.title}</td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">
                                        {j.company?.name || '—'}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <Badge
                                            text={j.status}
                                            color={j.status === 'active' ? '#10b981' : j.status === 'closed' ? '#ef4444' : '#f59e0b'}
                                        />
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        {j.isFeatured ? <Star size={16} color="#f59e0b" fill="#f59e0b" /> : <span className="text-secondary">—</span>}
                                    </td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">
                                        {new Date(j.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                            onClick={() => handleFeatureJob(j._id)}
                                            title="Toggle featured"
                                        >
                                            <Star size={14} />
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '4px 10px', fontSize: 12, background: '#ef444420', color: '#ef4444', border: 'none' }}
                                            onClick={() => handleCloseJob(j._id)}
                                            title="Close job"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {jobs.length === 0 && <p className="text-secondary" style={{ padding: 20 }}>No jobs found.</p>}
                </div>
            )}

            {/* ── Companies ── */}
            {activeTab === 'Companies' && !loading && (
                <div className="card" style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Name', 'Industry', 'Verified', 'Active', 'Created', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(c => (
                                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.name}</td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">{c.industry}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        {c.isVerified
                                            ? <CheckCircle size={16} color="#10b981" />
                                            : <XCircle size={16} color="#94a3b8" />}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <Badge text={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? '#10b981' : '#ef4444'} />
                                    </td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                            onClick={() => handleVerifyCompany(c._id)}
                                            title="Toggle verified"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '4px 10px', fontSize: 12 }}
                                            onClick={() => handleToggleCompany(c._id)}
                                            title="Toggle active"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {companies.length === 0 && <p className="text-secondary" style={{ padding: 20 }}>No companies found.</p>}
                </div>
            )}

            {/* ── Applications ── */}
            {activeTab === 'Applications' && !loading && (
                <div className="card" style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Applicant', 'Job', 'Company', 'Status', 'Applied'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(a => (
                                <tr key={a._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{a.applicant?.name || '—'}</td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">{a.job?.title || '—'}</td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">{a.company?.name || '—'}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <Badge
                                            text={a.status}
                                            color={
                                                a.status === 'offered' ? '#10b981' :
                                                    a.status === 'rejected' ? '#ef4444' :
                                                        a.status === 'interview' ? '#8b5cf6' : '#6366f1'
                                            }
                                        />
                                    </td>
                                    <td style={{ padding: '10px 14px' }} className="text-secondary">
                                        {new Date(a.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {applications.length === 0 && <p className="text-secondary" style={{ padding: 20 }}>No applications found.</p>}
                </div>
            )}
        </div>
    );
};

export default Admin;
