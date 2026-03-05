import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkX, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSavedJobs, toggleSaveJob } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import '../components/jobs/JobCard.css';

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            const res = await getSavedJobs();
            setSavedJobs(res.data.savedJobs || res.data.jobs || []);
        } catch (err) {
            toast.error('Failed to load saved jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (jobId) => {
        try {
            await toggleSaveJob(jobId);
            setSavedJobs(prev => prev.filter(j => j._id !== jobId));
            toast.success('Job removed from saved');
        } catch (err) {
            toast.error('Failed to remove job');
        }
    };

    if (loading) return (
        <div className="loading-container" style={{ minHeight: '100vh', paddingTop: 80 }}>
            <div className="spinner" />
            <p className="text-secondary">Loading saved jobs...</p>
        </div>
    );

    return (
        <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="container" style={{ padding: '40px 24px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Saved Jobs</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {savedJobs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                        {savedJobs.map(job => (
                            <div key={job._id} style={{ position: 'relative' }}>
                                <JobCard job={job} />
                                <button
                                    onClick={() => handleUnsave(job._id)}
                                    title="Remove from saved"
                                    style={{
                                        position: 'absolute', top: 54, right: 16, width: 32, height: 32,
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'var(--danger)', transition: 'var(--transition)',
                                        zIndex: 2
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                >
                                    <BookmarkX size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔖</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No saved jobs yet</h3>
                        <p>Save jobs you're interested in to revisit them later</p>
                        <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 24 }}>
                            <Briefcase size={16} /> Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;
