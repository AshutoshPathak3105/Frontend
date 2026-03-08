import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    User, MapPin, Briefcase, GraduationCap, Calendar,
    MessageCircle, ThumbsUp, Tag,
    MoreHorizontal, Users, UserCheck, X, Clock, Camera
} from 'lucide-react';
import {
    getProfile, getOrCreateConversation, getFeedPosts,
    togglePostLike, sendConnectionRequest, uploadAvatar,
    addPostComment, toggleFollow, getMe, getUploadUrl
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
    const [followHover, setFollowHover] = useState(false);
    const fileInputRef = useRef(null);
    const moreMenuRef = useRef(null);

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
                // Check if following — use String() to handle ObjectId vs string mismatch
                const myId = String(currentUser?._id || currentUser?.id || '');
                if (myId && loadedProfile?.followers?.some(f => String(f?._id || f) === myId)) {
                    setIsFollowing(true);
                } else {
                    setIsFollowing(false);
                }
            } catch {
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
        if (!isFriend) {
            toast.error('You can only message friends.');
            return;
        }
        setMsgLoading(true);
        try {
            const res = await getOrCreateConversation(id);
            const conv = res.data.conversation;
            // Pass the full conversation object so Messages page can open it
            // immediately without waiting for the conversations list to load
            navigate('/messages', { state: { convId: conv._id, targetUserId: id, conversation: conv } });
        } catch {
            toast.error('Could not open conversation. Please try again.');
        } finally {
            setMsgLoading(false);
        }
    };

    const handleFriend = async () => {
        if (!currentUser) return navigate('/login');
        try {
            await sendConnectionRequest(id);
            setFriendSent(true);
            toast.success('Friend request sent! 🎉');
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
                return { ...prev, followers: updated };
            });
            toast.success(nowFollowing ? 'Followed! 🔔' : 'Unfollowed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update follow status');
            return;
        }
        // Sync global auth user separately — don't let this failure affect follow state
        try {
            const me = await getMe();
            if (updateUser && me.data?.user) updateUser(me.data.user);
        } catch {
            // non-critical, ignore
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

    // Compute data
    const currentExp = profile.experience?.find(e => e.current) || profile.experience?.[0];
    const memberFor = profile.createdAt ? memberDuration(profile.createdAt) : '—';
    const joinYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : '';

    return (
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '88px 20px 72px' }}>
            {/* ─── HEADER CARD ──────────────────────────────────────────────── */}
            <div className="card" style={{ padding: 0, overflow: 'visible', marginBottom: 20, borderRadius: 16, position: 'relative' }}>
                {/* Gradient banner */}
                <div style={{ height: 100, background: 'var(--gradient-primary)', borderRadius: '16px 16px 0 0' }} />
                {/* Avatar — outside banner so overflow:hidden never clips it */}
                <div style={{ position: 'absolute', top: 48, left: 28, border: '4px solid var(--bg-card)', borderRadius: '50%', lineHeight: 0, zIndex: 2 }}>
                    <Avatar user={profile} size={108} />
                    {isMe && (
                        <div style={{ position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                            <input
                                type="file"
                                id="public-profile-avatar-upload"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="public-profile-avatar-upload"
                                onClick={e => { if (uploading) e.preventDefault(); }}
                                style={{
                                    background: 'var(--gradient-button)', borderRadius: 20,
                                    padding: '6px 16px', fontSize: 12, fontWeight: 700,
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: '#fff',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                className="edit-avatar-btn"
                            >
                                {uploading ? <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <Camera size={14} />}
                                <span>Edit</span>
                            </label>
                        </div>
                    )}
                </div>
                {/* Info row */}
                <div style={{ padding: '80px 28px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{profile.name}</h1>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '3px 10px', borderRadius: 20,
                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                ...(profile.role === 'employer'
                                    ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                                    : { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }
                                )
                            }}>
                                {profile.role === 'employer'
                                    ? <><Briefcase size={10} /> Employer</>
                                    : <><User size={10} /> Job Seeker</>
                                }
                            </span>
                        </div>
                        <p style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {profile.headline || (currentExp ? `${currentExp.title} at ${currentExp.company}` : profile.role)}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: 13, color: 'var(--text-muted)' }}>
                            {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{profile.location}</span>}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={14} />Joined {joinYear}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={14} />Member for {memberFor}</span>
                            {profile.connections?.length > 0 && (
                                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{profile.connections.length} friends</span>
                            )}
                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{(profile.followers?.length || 0) + (isFollowing ? 1 : 0)} followers</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{profile.following?.length || 0} following</span>
                        </div>
                    </div>
                    {/* Action buttons */}
                    {!isMe && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center', position: 'relative' }}>
                            <button
                                onClick={handleFollow}
                                onMouseEnter={() => setFollowHover(true)}
                                onMouseLeave={() => setFollowHover(false)}
                                className={`btn ${isFollowing ? (followHover ? 'btn-danger-outline' : 'btn-secondary') : 'btn-outline'}`}
                                style={{
                                    height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                                    ...(isFollowing && followHover ? {
                                        background: 'rgba(239,68,68,0.08)',
                                        borderColor: 'rgba(239,68,68,0.5)',
                                        color: '#f87171',
                                    } : {})
                                }}
                            >
                                {isFollowing
                                    ? (followHover ? 'Unfollow' : 'Following')
                                    : 'Follow'}
                            </button>

                            {isFriend ? (
                                <button
                                    onClick={handleMessage}
                                    disabled={msgLoading}
                                    className="btn btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}
                                >
                                    <MessageCircle size={15} />{msgLoading ? 'Opening…' : 'Message'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleFriend}
                                    disabled={friendSent}
                                    className="btn btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}
                                    title="Connect first to enable messaging"
                                >
                                    {friendSent ? <UserCheck size={16} /> : <Users size={16} />}
                                    {friendSent ? 'Request Sent' : 'Add Friend'}
                                </button>
                            )}

                            <div ref={moreMenuRef}>
                                <button
                                    onClick={() => setShowMoreMenu(s => !s)}
                                    className="btn btn-outline"
                                    style={{ height: 38, width: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            {/* ── Bottom Action Sheet ── */}
                            {showMoreMenu && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        onClick={() => setShowMoreMenu(false)}
                                        style={{
                                            position: 'fixed', inset: 0,
                                            background: 'rgba(0,0,0,0.45)',
                                            backdropFilter: 'blur(3px)',
                                            WebkitBackdropFilter: 'blur(3px)',
                                            zIndex: 99998,
                                        }}
                                    />
                                    {/* Sheet */}
                                    <div style={{
                                        position: 'fixed', bottom: 0, left: 0, right: 0,
                                        background: 'var(--bg-card)',
                                        borderRadius: '24px 24px 0 0',
                                        padding: '0 16px 32px',
                                        zIndex: 99999,
                                        boxShadow: '0 -12px 48px rgba(0,0,0,0.35)',
                                        border: '1px solid var(--border)',
                                        borderBottom: 'none',
                                    }}>
                                        {/* Drag handle */}
                                        <div style={{ width: 44, height: 4, background: 'var(--border)', borderRadius: 99, margin: '14px auto 18px' }} />
                                        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Options</p>

                                        {[{
                                            label: 'Share Profile',
                                            emoji: '🔗',
                                            onClick: handleShareProfile,
                                            danger: false,
                                        }, {
                                            label: 'Report User',
                                            emoji: '🚩',
                                            onClick: () => { toast.error('Coming soon!'); setShowMoreMenu(false); },
                                            danger: false,
                                        }, {
                                            label: 'Block User',
                                            emoji: '🚫',
                                            onClick: () => { toast.error('Coming soon!'); setShowMoreMenu(false); },
                                            danger: true,
                                        }].map((item, i) => (
                                            <button key={i} onClick={item.onClick} style={{
                                                display: 'flex', alignItems: 'center', gap: 14,
                                                width: '100%', textAlign: 'left', background: 'none',
                                                border: 'none', borderRadius: 14,
                                                padding: '14px 16px', fontSize: 16,
                                                cursor: 'pointer', fontWeight: 600,
                                                color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
                                                marginBottom: 4,
                                                transition: 'background 0.15s',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >
                                                <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                                                {item.label}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setShowMoreMenu(false)}
                                            style={{
                                                width: '100%', marginTop: 10, padding: '14px',
                                                borderRadius: 14, background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border)', fontSize: 15,
                                                fontWeight: 700, cursor: 'pointer',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >Cancel</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── SECTION 0: About + Education + Skills ───────────────────── */}

            {/* About — full-width accent card */}
            {profile.bio && (
                <div className="card" style={{ marginBottom: 16, padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: 4, flexShrink: 0, background: 'var(--gradient-primary)' }} />
                        <div style={{ padding: '20px 24px', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={15} color="var(--primary-light)" />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>About</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{profile.bio}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Education + Skills — stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>

                {/* Education — timeline style */}
                <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={16} color="var(--primary-light)" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Education</span>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {profile.education?.length > 0 ? profile.education.map((edu, i) => (
                            <div key={i} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: i < profile.education.length - 1 ? 20 : 0 }}>
                                {/* Timeline line */}
                                {i < profile.education.length - 1 && (
                                    <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'var(--border)' }} />
                                )}
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                    <GraduationCap size={14} color="var(--primary-light)" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{edu.school}</div>
                                    <div style={{ fontSize: 12, color: 'var(--primary-light)', marginBottom: 2 }}>{edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={10} />
                                        {edu.from && new Date(edu.from).getFullYear()} — {edu.current ? 'Present' : (edu.to && new Date(edu.to).getFullYear())}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No education added yet.</p>
                        )}
                    </div>
                </div>

                {/* Skills — colorful chips */}
                <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tag size={16} color="var(--primary-light)" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Skills &amp; Expertise</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        {profile.skills?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
                                        <span key={i} style={{
                                            padding: '5px 13px', borderRadius: 20,
                                            background: c.bg, border: `1px solid ${c.border}`,
                                            fontSize: 12, fontWeight: 600, color: c.color,
                                            whiteSpace: 'nowrap'
                                        }}>{s}</span>
                                    );
                                })}
                            </div>
                        ) : <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No skills listed yet.</p>}
                    </div>
                </div>
            </div>

            {/* ─── SECTION 1: CURRENT WORKING STATUS ───────────────────────── */}
            {currentExp && (
                <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                    <div style={{ padding: '14px 24px', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Briefcase size={16} />
                        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Current Working Status</span>
                    </div>
                    <div style={{ padding: '20px 24px', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Company</div>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>{currentExp.company}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Position</div>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>{currentExp.title}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Using This Platform</div>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>{memberFor}</div>
                        </div>
                        {currentExp.location && (
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Location</div>
                                <div style={{ fontSize: 18, fontWeight: 800 }}>{currentExp.location}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── SECTION 2: ALL POSTS ─────────────────────────────────────── */}
            <div className="card" style={{ marginBottom: 16, padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                {/* Custom header with controlled equal padding top & bottom */}
                <div style={{ padding: '16px 20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 4, height: 22, background: 'var(--gradient-primary)', borderRadius: 4 }} />
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Posts</h2>
                    </div>
                    {posts.length > 0 && (
                        <p style={{ margin: '2px 0 0 14px', fontSize: 13, color: 'var(--text-muted)' }}>{timeAgo(posts[0].createdAt)}</p>
                    )}
                </div>
                {postsLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', marginTop: 0 }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                        <p style={{ margin: 0, fontSize: 14 }}>No posts yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} currentUser={currentUser} onLike={handleLike} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default PublicProfile;
