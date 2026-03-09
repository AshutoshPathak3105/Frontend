import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    User, MapPin, Briefcase, GraduationCap, Calendar,
    MessageCircle, ThumbsUp, Tag, UserPlus,
    MoreHorizontal, Users, UserCheck, X, Clock, Camera
} from 'lucide-react';
import {
    getProfile, getOrCreateConversation, getFeedPosts,
    togglePostLike, sendConnectionRequest, uploadAvatar,
    addPostComment, toggleFollow, getMe, getUploadUrl, respondToConnectionRequest, removeConnection,
    cancelConnectionRequest
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';


// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const memberDuration = (date) => {
    const months = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'Less than a month';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return `${years}yr${years > 1 ? 's' : ''}${rem > 0 ? ` ${rem}mo` : ''}`;
};


// ── Media Grid ────────────────────────────────────────────────────────────────
const MediaGrid = ({ media }) => {
    const [lightbox, setLightbox] = useState(null);
    if (!media?.length) return null;
    const isSingle = media.length === 1;
    return (
        <>
            <div style={{
                display: 'grid',
                gap: 4,
                overflow: 'hidden',
                gridTemplateColumns: isSingle ? '1fr' : '1fr 1fr',
                width: '100%'
            }}>
                {media.slice(0, 4).map((m, i) => (
                    <div
                        key={i}
                        onClick={() => setLightbox(i)}
                        style={{
                            cursor: 'pointer',
                            width: '100%',
                            height: isSingle ? 280 : 180,
                            overflow: 'hidden',
                            background: 'var(--bg-secondary)'
                        }}
                    >
                        {m.type === 'video'
                            ? <video src={getUploadUrl(m.url)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : <img src={getUploadUrl(m.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                    </div>
                ))}
            </div>
            {lightbox !== null && (
                <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                    <img src={getUploadUrl(media[lightbox].url)} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} alt="" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </>
    );
};

// ── Post Card (mini) ─────────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, onLike }) => {
    const liked = post.likes?.includes(currentUser?._id);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await addPostComment(post._id, commentText);
            // Backend returns { success: true, comment: ... }, 
            // but we need to update the list. Let's look for comments in the response or fetch them.
            if (res.data.success) {
                // If backend only returns the single comment, add it to our local list
                setComments(prev => [...prev, res.data.comment]);
                setCommentText('');
                setShowComments(false); // Close the comment box after posting
                toast.success('Comment added!');
            }
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
            {/* Text content with padding */}
            {post.text && (
                <div style={{ padding: '14px 20px 8px', maxHeight: 70, overflowY: 'auto', background: 'rgba(99,102,241,0.03)', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{post.text}</p>
                </div>
            )}

            {/* Media — flush to card edges (no inner padding, card has overflow:hidden) */}
            {post.media?.length > 0 && (
                <div style={{ width: '100%', overflow: 'hidden' }}>
                    <MediaGrid media={post.media} />
                </div>
            )}

            {/* Engagement Bar */}
            <div style={{ display: 'flex', gap: 16, padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                <button onClick={() => onLike(post._id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: liked ? 'var(--primary)' : 'var(--text-muted)', fontSize: 13, fontWeight: liked ? 700 : 400 }}>
                    <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} /> {post.likes?.length || 0}
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: showComments ? 'var(--primary)' : 'var(--text-muted)', fontSize: 13 }}
                >
                    <MessageCircle size={16} fill={showComments ? 'currentColor' : 'none'} /> {comments.length || 0}
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
                    {/* Comment List */}
                    {comments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                            {comments.map((c, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8 }}>
                                    <Avatar user={c.user} size={24} />
                                    <div style={{ flex: 1, background: 'var(--bg-card)', padding: '6px 10px', borderRadius: 10, border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700 }}>{c.user?.name || 'User'}</span>
                                            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4 }}>{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comment Input */}
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                className="form-input"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                style={{ padding: '8px 12px', fontSize: 12, borderRadius: 20, height: 36 }}
                                disabled={isSubmitting}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={!commentText.trim() || isSubmitting}
                            style={{ borderRadius: 20, height: 36, padding: '0 16px' }}
                        >
                            {isSubmitting ? '...' : 'Post'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, updateUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [friendSent, setFriendSent] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const fileInputRef = useRef(null);
    const moreMenuRef = useRef(null);

    // Handle responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show edit button if it's the current user's profile
    const isMe = currentUser && (!id || String(currentUser._id) === String(id) || String(currentUser.id) === String(id));
    // Handle both populated objects and raw IDs in connections array
    const isFriend = currentUser?.connections?.some(friendId =>
        String(friendId?._id || friendId) === String(id)
    );

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const { data } = await uploadAvatar(file);
            setProfile(prev => ({ ...prev, avatar: data.user.avatar }));
            if (updateUser) updateUser(data.user);
            toast.success('Profile picture updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const handler = (e) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    getProfile(id),
                    getFeedPosts({ author: id, limit: 20 })
                ]);

                const loadedProfile = profileRes.data.user || profileRes.data.profile;
                setProfile(loadedProfile);
                setPosts(postsRes.data.posts || []);

                // Use isFollowing from backend if available, fallback to local check
                if (loadedProfile.isFollowing !== undefined) {
                    setIsFollowing(loadedProfile.isFollowing);
                } else {
                    const myId = String(currentUser?._id || currentUser?.id || '');
                    setIsFollowing(myId && loadedProfile?.followers?.some(f => String(f?._id || f) === myId));
                }

                // Handle friend request status
                if (loadedProfile.connectionStatus === 'sent') {
                    setFriendSent(true);
                } else {
                    setFriendSent(false);
                }

            } catch (err) {
                console.error("Error loading profile:", err);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
                setPostsLoading(false);
            }
        };
        load();
    }, [id, currentUser]);

    const handleMessage = async () => {
        if (!currentUser) return navigate('/login');
        if (profile.connectionStatus !== 'connected') {
            toast.error('You can only message friends.');
            return;
        }
        setMsgLoading(true);
        try {
            const res = await getOrCreateConversation(id);
            const conv = res.data.conversation;
            navigate('/messages', { state: { convId: conv._id, targetUserId: id, conversation: conv } });
        } catch {
            toast.error('Could not open conversation. Please try again.');
        } finally {
            setMsgLoading(false);
        }
    };

    const handleFriend = async () => {
        if (!currentUser) return navigate('/login');
        if (friendSent) return;

        try {
            await sendConnectionRequest(id);
            setFriendSent(true);
            toast.success('Friend request sent! 🎉');

            // Update local profile state to reflect "sent" status
            setProfile(prev => ({ ...prev, connectionStatus: 'sent' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not send request');
        }
    };

    const handleFollow = async () => {
        if (!currentUser) return navigate('/login');
        try {
            const { data } = await toggleFollow(id);
            const nowFollowing = data.isFollowing;
            setIsFollowing(nowFollowing);

            // Update local follower count on the rendered profile
            setProfile(prev => {
                if (!prev) return prev;
                const myId = String(currentUser._id || currentUser.id);
                const followers = prev.followers || [];
                const updated = nowFollowing
                    ? [...followers, myId]
                    : followers.filter(f => String(f) !== myId);
                return { ...prev, followers: updated, isFollowing: nowFollowing };
            });
            toast.success(nowFollowing ? 'Followed! 🔔' : 'Unfollowed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update follow status');
            return;
        }
    };

    const handleAccept = async () => {
        if (!currentUser || !profile.requestId) return;
        try {
            await respondToConnectionRequest(profile.requestId, 'accepted');
            toast.success('Connection request accepted! 🤝');
            // Refresh profile to update UI
            setProfile(prev => ({
                ...prev,
                connectionStatus: 'connected',
                connections: [...(prev.connections || []), currentUser._id]
            }));
        } catch (err) {
            toast.error('Failed to accept request');
        }
    };

    const handleCancelRequest = async () => {
        if (!currentUser) return;
        try {
            await cancelConnectionRequest(id);
            toast.success('Request cancelled');
            setProfile(prev => ({ ...prev, connectionStatus: 'none' }));
        } catch (err) {
            toast.error('Failed to cancel request');
        }
    };

    const handleUnfriend = async () => {
        if (!currentUser) return;
        try {
            await removeConnection(id);
            toast.success('Connection removed');
            // Update local state
            setProfile(prev => ({
                ...prev,
                connectionStatus: 'none',
                connections: (prev.connections || []).filter(c => String(c) !== String(currentUser._id || currentUser.id))
            }));
        } catch (err) {
            toast.error('Failed to remove connection');
        }
    };

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Profile link copied to clipboard!');
        setShowMoreMenu(false);
    };

    const handleLike = async (postId) => {
        if (!currentUser) return navigate('/login');
        try {
            const { data } = await togglePostLike(postId);
            setPosts(prev => prev.map(p => {
                if (p._id !== postId) return p;
                const likes = data.liked
                    ? [...(p.likes || []), currentUser._id]
                    : (p.likes || []).filter(l => l !== currentUser._id);
                return { ...p, likes };
            }));
        } catch { toast.error('Failed to like'); }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
        </div>
    );
    if (!profile) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <User size={56} color="var(--text-muted)" />
            <h2>Profile not found</h2>
            <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
    );

    // Render Action Buttons
    const renderActions = () => {
        if (isMe) return null;

        const connectionStatus = profile.connectionStatus;

        return (
            <div style={{
                position: isMobile ? 'static' : 'absolute',
                bottom: 24,
                right: 28,
                display: 'flex',
                gap: 8,
                padding: isMobile ? '0 16px 24px' : 0,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'center' : 'flex-end',
                zIndex: 10
            }}>
                {/* Follow Button */}
                <button
                    onClick={handleFollow}
                    className="btn btn-primary"
                    style={{
                        height: 38,
                        padding: '0 14px',
                        fontSize: 13,
                        fontWeight: 700,
                        ...(isFollowing ? { opacity: 0.95 } : {})
                    }}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>

                {/* Connection Action Button */}
                {connectionStatus === 'connected' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleMessage} disabled={msgLoading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700 }}>
                            <MessageCircle size={15} />
                            {msgLoading ? 'Opening…' : 'Message'}
                        </button>
                        <button onClick={handleUnfriend} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
                            <UserPlus size={15} style={{ transform: 'rotate(45deg)' }} />
                            Unfriend
                        </button>
                    </div>
                ) : connectionStatus === 'sent' ? (
                    <button onClick={handleCancelRequest} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
                        <Clock size={15} />
                        Request Sent
                    </button>
                ) : connectionStatus === 'received' ? (
                    <button onClick={handleAccept} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700 }}>
                        <UserCheck size={16} />
                        Accept Request
                    </button>
                ) : (
                    <button onClick={handleFriend} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700 }}>
                        <Users size={16} />
                        Add Friend
                    </button>
                )}

                {/* More Menu */}
                <div ref={moreMenuRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowMoreMenu(s => !s)} className="btn btn-primary" style={{ height: 38, width: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MoreHorizontal size={18} />
                    </button>

                    {showMoreMenu && !isMobile && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: 0,
                            marginBottom: 8,
                            background: 'var(--bg-card)',
                            borderRadius: 12,
                            padding: '8px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            border: '1px solid var(--border)',
                            minWidth: 180,
                            zIndex: 100
                        }}>
                            {[
                                { label: 'Share Profile', icon: '🔗', onClick: handleShareProfile },
                                { label: 'Report User', icon: '🚩', onClick: () => toast.error('Coming soon!') },
                                { label: 'Block User', icon: '🚫', onClick: () => toast.error('Coming soon!'), danger: true }
                            ].map((item, i) => (
                                <button key={i} onClick={item.onClick} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    width: '100%',
                                    padding: '10px 12px',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: 6,
                                    textAlign: 'left',
                                    transition: 'background 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <span>{item.icon}</span>{item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {showMoreMenu && isMobile && (
                    <>
                        <div onClick={() => setShowMoreMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 99998 }} />
                        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '0 16px 32px', zIndex: 99999, boxShadow: '0 -12px 48px rgba(0,0,0,0.35)', border: '1px solid var(--border)', borderBottom: 'none' }}>
                            <div style={{ width: 44, height: 4, background: 'var(--border)', borderRadius: 99, margin: '14px auto 18px' }} />
                            <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Options</p>
                            {[
                                { label: 'Share Profile', emoji: '🔗', onClick: handleShareProfile },
                                { label: 'Report User', emoji: '🚩', onClick: () => toast.error('Coming soon!') },
                                { label: 'Block User', emoji: '🚫', onClick: () => toast.error('Coming soon!'), danger: true }
                            ].map((item, i) => (
                                <button key={i} onClick={item.onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', fontSize: 16, cursor: 'pointer', fontWeight: 600, color: item.danger ? 'var(--danger)' : 'var(--text-primary)', background: 'none', border: 'none' }}>
                                    <span style={{ fontSize: 22 }}>{item.emoji}</span>{item.label}
                                </button>
                            ))}
                            <button onClick={() => setShowMoreMenu(false)} style={{ width: '100%', marginTop: 10, padding: '14px', borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-secondary)' }}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Compute data
    const currentExp = profile.experience?.find(e => e.current) || profile.experience?.[0];
    const memberFor = profile.createdAt ? memberDuration(profile.createdAt) : '—';
    const joinYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : '';

    return (
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '70px 0 72px' : '88px 20px 72px' }}>
            {/* ─── HEADER CARD ──────────────────────────────────────────────── */}
            <div className="card" style={{ padding: 0, overflow: 'visible', marginBottom: 20, borderRadius: 16, border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ height: 140, background: 'var(--gradient-primary)', borderRadius: '16px 16px 0 0' }} />

                <div style={{
                    padding: isMobile ? '0 16px 24px' : '0 28px 28px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    marginTop: -60,
                    position: 'relative',
                    zIndex: 5
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 12 : 24,
                        alignItems: isMobile ? 'center' : 'flex-start',
                        flex: 1,
                        textAlign: isMobile ? 'center' : 'left'
                    }}>
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ border: '4px solid var(--bg-card)', borderRadius: '50%', background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                <Avatar user={profile} size={isMobile ? 100 : 120} />
                            </div>
                            {isMe && (
                                <label
                                    htmlFor="public-profile-avatar-upload"
                                    onClick={e => { if (uploading) e.preventDefault(); }}
                                    style={{
                                        marginTop: 10,
                                        background: 'var(--gradient-button)', borderRadius: 20,
                                        padding: '6px 16px', fontSize: 12, fontWeight: 700,
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)', color: '#fff'
                                    }}
                                >
                                    <input type="file" id="public-profile-avatar-upload" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" disabled={uploading} />
                                    {uploading ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Camera size={14} />}
                                    <span>Edit</span>
                                </label>
                            )}
                        </div>

                        <div style={{ marginTop: isMobile ? 0 : 70 }}>
                            <h1 style={{ margin: '0 0 6px 0', fontSize: isMobile ? 24 : 28, fontWeight: 800 }}>{profile.name}</h1>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '4px 12px', borderRadius: 20,
                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                ...(profile.role === 'employer'
                                    ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                                    : { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }
                                )
                            }}>
                                {profile.role === 'employer' ? <><Briefcase size={10} /> Employer</> : <><User size={10} /> Job Seeker</>}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, fontSize: 13, color: 'var(--text-muted)', marginTop: 15, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{profile.location}</span>}
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={14} />Joined {joinYear}</span>
                            </div>
                        </div>
                    </div>

                    {!isMobile && (
                        <div style={{ display: 'flex', gap: 12, marginTop: 70 }}>
                            <div
                                onClick={() => isMe ? navigate('/network?tab=connections') : navigate(`/users/profile/${profile._id}`)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(99, 102, 241, 0.08)', padding: '6px 12px', borderRadius: 10, color: 'var(--text-secondary)', border: '1px solid rgba(99,102,241,0.1)', transition: 'all 0.2s' }}
                                title={isMe ? 'View your connections' : `${profile.connections?.length || 0} connections`}
                            >
                                <Users size={15} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile.connections?.length || 0}</span>
                                <span>Connections</span>
                            </div>
                            <div
                                onClick={() => isMe ? navigate('/network?tab=followers') : navigate(`/users/profile/${profile._id}`)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: 10, color: 'var(--text-secondary)', border: '1px solid rgba(16,185,129,0.1)', transition: 'all 0.2s' }}
                                title={isMe ? 'View your followers' : `${profile.followers?.length || 0} followers`}
                            >
                                <UserCheck size={15} style={{ color: '#10b981' }} />
                                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile.followers?.length || 0}</span>
                                <span>Followers</span>
                            </div>
                            <div
                                onClick={() => isMe ? navigate('/network?tab=following') : navigate(`/users/profile/${profile._id}`)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(245, 158, 11, 0.08)', padding: '6px 12px', borderRadius: 10, color: 'var(--text-secondary)', border: '1px solid rgba(245,158,11,0.1)', transition: 'all 0.2s' }}
                                title={isMe ? 'View who you follow' : `${profile.following?.length || 0} following`}
                            >
                                <UserPlus size={15} style={{ color: '#f59e0b' }} />
                                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile.following?.length || 0}</span>
                                <span>Following</span>
                            </div>
                        </div>
                    )}
                </div>

                {isMobile && (
                    <div style={{ display: 'flex', gap: 10, padding: '0 16px 20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <div
                            onClick={() => isMe ? navigate('/network?tab=connections') : navigate(`/users/profile/${profile._id}`)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(99, 102, 241, 0.08)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-secondary)' }}
                        >
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile.connections?.length || 0}</span>
                            <span>Connections</span>
                        </div>
                        <div
                            onClick={() => isMe ? navigate('/network?tab=followers') : navigate(`/users/profile/${profile._id}`)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-secondary)' }}
                        >
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile.followers?.length || 0}</span>
                            <span>Followers</span>
                        </div>
                        <div
                            onClick={() => isMe ? navigate('/network?tab=following') : navigate(`/users/profile/${profile._id}`)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(245, 158, 11, 0.08)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-secondary)' }}
                        >
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{profile.following?.length || 0}</span>
                            <span>Following</span>
                        </div>
                    </div>
                )}

                {renderActions()}
            </div>

            {/* About */}
            {
                profile.bio && (
                    <div className="card" style={{ marginBottom: 16, padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ width: 4, flexShrink: 0, background: 'var(--gradient-primary)' }} />
                            <div style={{ padding: '20px 24px', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={15} color="var(--primary-light)" /></div>
                                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>About</span>
                                </div>
                                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{profile.bio}</p>
                            </div>
                        </div>
                    </div>
                )
            }

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                {/* Education */}
                <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={16} color="var(--primary-light)" /></div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Education</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        {profile.education?.length > 0 ? profile.education.map((edu, i) => (
                            <div key={i} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: i < profile.education.length - 1 ? 20 : 0 }}>
                                {i < profile.education.length - 1 && <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'var(--border)' }} />}
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}><GraduationCap size={14} color="var(--primary-light)" /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{edu.school}</div>
                                    <div style={{ fontSize: 12, color: 'var(--primary-light)' }}>{edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} />{edu.from && new Date(edu.from).getFullYear()} — {edu.current ? 'Present' : (edu.to && new Date(edu.to).getFullYear())}</div>
                                </div>
                            </div>
                        )) : <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No education added yet.</p>}
                    </div>
                </div>

                {/* Skills */}
                <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={16} color="var(--primary-light)" /></div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Skills &amp; Expertise</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        {profile.skills?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {profile.skills.map((s, i) => {
                                    const colors = [{ bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' }, { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.25)' }, { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' }, { bg: 'rgba(236,72,153,0.1)', color: '#f472b6', border: 'rgba(236,72,153,0.25)' }, { bg: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: 'rgba(14,165,233,0.25)' }];
                                    const c = colors[i % colors.length];
                                    return <span key={i} style={{ padding: '5px 13px', borderRadius: 20, background: c.bg, border: `1px solid ${c.border}`, fontSize: 12, fontWeight: 600, color: c.color }}>{s}</span>;
                                })}
                            </div>
                        ) : <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No skills listed yet.</p>}
                    </div>
                </div>
            </div>

            {/* Current Working Status */}
            {
                currentExp && (
                    <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                        <div style={{ padding: '14px 24px', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={16} /><span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Current Working Status</span></div>
                        <div style={{ padding: '20px 24px', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Company</div><div style={{ fontSize: 18, fontWeight: 800 }}>{currentExp.company}</div></div>
                            <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Position</div><div style={{ fontSize: 18, fontWeight: 800 }}>{currentExp.title}</div></div>
                            <div style={{ flex: 1, minWidth: 180 }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Platform Use</div><div style={{ fontSize: 18, fontWeight: 800 }}>{memberFor}</div></div>
                            {currentExp.location && <div style={{ flex: 1, minWidth: 160 }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Location</div><div style={{ fontSize: 18, fontWeight: 800 }}>{currentExp.location}</div></div>}
                        </div>
                    </div>
                )
            }

            {/* Posts */}
            <div className="card" style={{ marginBottom: 16, padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 4, height: 22, background: 'var(--gradient-primary)', borderRadius: 4 }} /><h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Posts</h2></div>
                    {posts.length > 0 && <p style={{ margin: '2px 0 0 14px', fontSize: 13, color: 'var(--text-muted)' }}>{timeAgo(posts[0].createdAt)}</p>}
                </div>
                {postsLoading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div> : posts.length === 0 ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}><div style={{ fontSize: 36, marginBottom: 10 }}>📭</div><p style={{ margin: 0, fontSize: 14 }}>No posts yet.</p></div> : <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>{posts.map(post => <PostCard key={post._id} post={post} currentUser={currentUser} onLike={handleLike} />)}</div>}
            </div>
        </div >
    );
};

export default PublicProfile;
