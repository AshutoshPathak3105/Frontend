import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    MessageCircle, Share2, Send, Trash2, Image, Video,
    X, MoreHorizontal, ThumbsUp, Loader2, Users, UserCheck, UserPlus, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getFeedPosts, createFeedPost, deleteFeedPost,
    togglePostLike, addPostComment, deletePostComment, sharePostAPI,
    viewPostAPI, sendConnectionRequest, toggleFollow, getMe, removeConnection
} from '../../services/api';
import './SocialFeed.css';

// ── helpers ─────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const Avatar = ({ user, size = 40 }) => {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return user?.avatar
        ? <img src={user.avatar} alt={user.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{
            width: size, height: size, borderRadius: '50%', background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, color: '#fff', fontWeight: 700, flexShrink: 0
        }}>
            {initials}
        </div>
};

// ── Media Preview Grid ────────────────────────────────────────────────────────
const MediaGrid = ({ media }) => {
    const [lightbox, setLightbox] = useState(null);
    if (!media?.length) return null;
    const count = media.length;
    const isSingle = count === 1;

    const gridStyle = {
        display: 'grid',
        gap: 3,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 12,
        gridTemplateColumns: isSingle ? '1fr' : count === 2 ? '1fr 1fr' : '1fr 1fr',
        gridTemplateRows: count === 3 ? 'auto auto' : 'auto',
    };
    return (
        <>
            <div style={gridStyle}>
                {media.slice(0, 4).map((m, i) => (
                    <div
                        key={i}
                        onClick={() => setLightbox(i)}
                        style={{
                            position: 'relative', cursor: 'pointer',
                            gridColumn: count === 3 && i === 0 ? '1 / 2' : 'auto',
                            gridRow: count === 3 && i === 0 ? '1 / 3' : 'auto',
                            maxHeight: isSingle ? 450 : 220,
                            overflow: 'hidden',
                            background: m.type === 'video' ? '#000' : 'var(--bg-secondary)',
                            borderRadius: 'inherit'
                        }}
                    >
                        {m.type === 'video'
                            ? <video src={m.url} style={{ width: '100%', height: isSingle ? 'auto' : '100%', objectFit: isSingle ? 'contain' : 'cover', display: 'block' }} />
                            : <img src={m.url} alt="" style={{ width: '100%', height: isSingle ? 'auto' : '100%', objectFit: isSingle ? 'contain' : 'cover', display: 'block' }} />
                        }
                        {i === 3 && count > 4 && (
                            <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: 24, fontWeight: 800
                            }}>+{count - 4}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox !== null && (
                <div
                    onClick={() => setLightbox(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: 20
                    }}
                >
                    <button onClick={() => setLightbox(null)} style={{
                        position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)',
                        border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><X size={20} /></button>
                    {media[lightbox].type === 'video'
                        ? <video controls src={media[lightbox].url} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }} onClick={e => e.stopPropagation()} />
                        : <img src={media[lightbox].url} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
                    }
                    {media.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 20, display: 'flex', gap: 8 }}>
                            {media.map((_, i) => (
                                <div key={i} onClick={e => { e.stopPropagation(); setLightbox(i); }} style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: i === lightbox ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer'
                                }} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

// ── Single Post Card ───────────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, onDelete, onLike, onComment, onDeleteComment, onShare, onConnect, onFollow }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const menuRef = useRef(null);

    const liked = post.likes?.includes(currentUser?._id);
    const isOwner = post.author?._id === currentUser?._id;
    const isConnected = currentUser?.connections?.includes(post.author?._id);
    const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(post.author?._id));

    useEffect(() => {
        setIsFollowing(currentUser?.following?.includes(post.author?._id));
    }, [currentUser?.following, post.author?._id]);

    const handleFollowLocal = async () => {
        setIsFollowing(!isFollowing);
        await onFollow(post.author?._id);
    };

    useEffect(() => {
        // Track view once per mount
        const trackView = async () => {
            try { await viewPostAPI(post._id); } catch (e) { /* ignore */ }
        };
        trackView();
    }, [post._id]);

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmitting(true);
        const comment = await onComment(post._id, commentText);
        if (comment) setCommentText('');
        setSubmitting(false);
    };

    return (
        <div className="post-card">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <Avatar user={post.author} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{post.author?.name}</div>
                    {(post.author?.headline || post.author?.role) && (
                        <span style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                            border: '1px solid rgba(99,102,241,0.25)',
                            color: 'var(--primary-light)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 10px',
                            borderRadius: 20,
                            whiteSpace: 'nowrap',
                            marginTop: 4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                        }}>
                            {post.author?.headline || post.author?.role}
                        </span>
                    )}
                </div>

                {/* Right side: follow button + time below */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                    <button
                        onClick={handleFollowLocal}
                        className={`follow-btn-small ${isFollowing ? 'following' : ''}`}
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: isFollowing ? 'var(--text-muted)' : 'var(--primary)',
                            background: isFollowing ? 'rgba(0,0,0,0.05)' : 'rgba(99, 102, 241, 0.08)',
                            border: isFollowing ? '1px solid var(--border)' : '1px solid var(--primary)',
                            borderRadius: 20,
                            padding: '4px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.2s'
                        }}
                    >
                        {isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                    </button>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} />{timeAgo(post.createdAt)}
                    </span>
                </div>

                <div ref={menuRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowMenu(!showMenu)} className="post-icon-btn">
                        <MoreHorizontal size={18} />
                    </button>
                    {showMenu && (
                        <div className="post-menu">
                            {isOwner ? (
                                <button onClick={() => { setShowMenu(false); onDelete(post._id); }} style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={14} /> Delete Post
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => { setShowMenu(false); onShare(post._id); }}>
                                        <Share2 size={14} /> Share Post
                                    </button>
                                    <button onClick={() => { setShowMenu(false); toast('Reported successfully'); }} style={{ color: 'var(--danger)' }}>
                                        🚩 Report Post
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Text body */}
            {post.text && (
                <p style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap', marginBottom: 4 }}>{post.text}</p>
            )}

            {/* Media */}
            <MediaGrid media={post.media} />

            {/* Counts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 6px', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                {post.likes?.length > 0 && <span>👍 {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>}
                {post.comments?.length > 0 && <span role="button" onClick={() => setShowComments(v => !v)} style={{ cursor: 'pointer' }}>{post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}</span>}
                {post.shares > 0 && <span>{post.shares} share{post.shares !== 1 ? 's' : ''}</span>}
            </div>

            {/* Action buttons */}
            <div className="post-actions">

                <button className={`post-action-btn ${liked ? 'liked' : ''}`} onClick={() => onLike(post._id)}>
                    <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
                    <span>Like</span>
                </button>
                <button className="post-action-btn" onClick={() => setShowComments(v => !v)}>
                    <MessageCircle size={16} />
                    <span>Comment</span>
                </button>
                <button className="post-action-btn" onClick={() => onShare(post._id)}>
                    <Share2 size={16} />
                    <span>Share</span>
                </button>
                                <button
                        className={`post-action-btn connect-btn ${isConnected ? 'connected' : ''}`}
                        onClick={() => onConnect(post.author?._id, isConnected)}
                        disabled={connecting}
                        title={isConnected ? 'Unfriend' : 'Send friend request'}
                    >
                        {isConnected ? <UserCheck size={16} /> : <Users size={16} />}
                        <span>{isConnected ? 'Friends' : 'Friend'}</span>
                    </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    {/* Comment Input */}
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
                        <Avatar user={currentUser} size={34} />
                        <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                            <input
                                className="form-input"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                style={{ fontSize: 13, padding: '8px 14px', flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" disabled={!commentText.trim() || submitting}
                                style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}>
                                {submitting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {post.comments?.map(c => (
                            <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                                <Avatar user={c.user} size={32} />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        background: 'var(--bg-secondary)', borderRadius: '0 12px 12px 12px',
                                        padding: '10px 14px', position: 'relative'
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{c.user?.name}</div>
                                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{c.text}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, paddingLeft: 4 }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</span>
                                        {(c.user?._id === currentUser?._id || currentUser?.role === 'admin') && (
                                            <button onClick={() => onDeleteComment(post._id, c._id)} style={{
                                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                                cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3
                                            }}>
                                                <Trash2 size={11} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Create Post Box ────────────────────────────────────────────────────────────
const CreatePost = ({ currentUser, onCreated }) => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef(null);

    const handleFiles = (e) => {
        const picked = Array.from(e.target.files).slice(0, 5);
        setFiles(picked);
        setPreviews(picked.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' })));
    };

    const removeFile = (i) => {
        setFiles(f => f.filter((_, idx) => idx !== i));
        setPreviews(p => p.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && files.length === 0) return toast.error('Add some text or media');
        setSubmitting(true);
        try {
            const fd = new FormData();
            if (text.trim()) fd.append('text', text.trim());
            files.forEach(f => fd.append('media', f));
            const { data } = await createFeedPost(fd);
            if (data.success) {
                onCreated(data.post);
                setText('');
                setFiles([]);
                setPreviews([]);
                toast.success('Post shared!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="post-card create-post-card">
            {/* User header: avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar user={currentUser} size={40} />
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{currentUser?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{currentUser?.headline || currentUser?.role || 'Member'}</div>
                </div>
            </div>

            {/* Textarea */}
            <textarea
                className="post-textarea"
                placeholder="What's on your mind? Share an update, photo or video..."
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
            />

            {/* Preview */}
            {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {previews.map((p, i) => (
                        <div key={i} style={{ position: 'relative', width: 96, height: 96, borderRadius: 8, overflow: 'hidden' }}>
                            {p.type === 'video'
                                ? <video src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            }
                            <button onClick={() => removeFile(i)} style={{
                                position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)',
                                border: 'none', borderRadius: '50%', width: 22, height: 22, color: '#fff',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}><X size={12} /></button>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="create-post-actions">
                <div style={{ display: 'flex', gap: 4 }}>
                    <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
                    <button onClick={() => fileRef.current?.click()} className="post-media-btn" title="Add Photo">
                        <Image size={17} style={{ color: '#22c55e' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Photo</span>
                    </button>
                    <button onClick={() => fileRef.current?.click()} className="post-media-btn" title="Add Video">
                        <Video size={17} style={{ color: '#6366f1' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Video</span>
                    </button>
                </div>
                <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={(!text.trim() && files.length === 0) || submitting}
                    style={{ padding: '8px 20px', fontSize: 13 }}
                >
                    {submitting ? <><Loader2 size={14} className="spin" /> Posting...</> : <><Send size={14} /> Post</>}
                </button>
            </div>
        </div>
    );
};

// ── Main SocialFeed ────────────────────────────────────────────────────────────
const SocialFeed = () => {
    const { user, updateUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = useCallback(async (p = 1) => {
        try {
            const { data } = await getFeedPosts({ page: p, limit: 10 });
            if (p === 1) setPosts(data.posts);
            else setPosts(prev => [...prev, ...data.posts]);
            setHasMore(p < data.pages);
            setPage(p);
        } catch (err) {
            toast.error('Could not load posts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPosts(1); }, [loadPosts]);

    const handleCreated = (newPost) => setPosts(prev => [newPost, ...prev]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await deleteFeedPost(id);
            setPosts(prev => prev.filter(p => p._id !== id));
            toast.success('Post deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleLike = async (id) => {
        try {
            const { data } = await togglePostLike(id);
            setPosts(prev => prev.map(p => {
                if (p._id !== id) return p;
                const likes = data.liked
                    ? [...(p.likes || []), user._id]
                    : (p.likes || []).filter(l => l !== user._id);
                return { ...p, likes };
            }));
        } catch { toast.error('Failed'); }
    };

    const handleComment = async (id, text) => {
        try {
            const { data } = await addPostComment(id, text);
            if (data.success) {
                setPosts(prev => prev.map(p => p._id === id
                    ? { ...p, comments: [...(p.comments || []), data.comment] }
                    : p
                ));
                return data.comment;
            }
        } catch { toast.error('Failed to comment'); }
    };

    const handleDeleteComment = async (postId, cid) => {
        try {
            await deletePostComment(postId, cid);
            setPosts(prev => prev.map(p => p._id === postId
                ? { ...p, comments: p.comments.filter(c => c._id !== cid) }
                : p
            ));
        } catch { toast.error('Failed to delete comment'); }
    };

    const handleShare = async (id) => {
        try {
            const postUrl = `${window.location.origin}/posts/${id}`;
            if (navigator.share) {
                await navigator.share({ title: 'Check this out!', url: postUrl });
            } else {
                navigator.clipboard.writeText(postUrl);
                toast.success('Link copied to clipboard!');
            }
            const { data } = await sharePostAPI(id);
            setPosts(prev => prev.map(p => p._id === id ? { ...p, shares: data.shares } : p));
        } catch { /* cancelled */ }
    };

    const handleFollow = async (userId) => {
        try {
            const res = await toggleFollow(userId);
            toast.success(res.data.isFollowing ? 'Following user' : 'Unfollowed user');

            // Refresh current user in context to update following list
            if (updateUser && res.data.user) {
                updateUser(res.data.user);
            } else {
                // Fallback: re-fetch me if backend didn't return full user
                const me = await getMe();
                if (updateUser) updateUser(me.data.user);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to follow');
        }
    };

    const handleConnect = async (userId, alreadyConnected) => {
        try {
            if (alreadyConnected) {
                await removeConnection(userId);
                toast.success('Removed from friends');
                // refresh user context so connections list updates
                const me = await getMe();
                if (updateUser) updateUser(me.data.user);
            } else {
                const { data } = await sendConnectionRequest(userId);
                if (data.success) toast.success('Connection request sent!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="social-feed">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 4, height: 28, background: 'var(--gradient-primary)', borderRadius: 4 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Community Feed</h2>
            </div>

            <CreatePost currentUser={user} onCreated={handleCreated} />

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <div className="spinner" />
                </div>
            ) : posts.length === 0 ? (
                <div className="post-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
                    <h3 style={{ fontWeight: 700 }}>No posts yet</h3>
                    <p style={{ fontSize: 14, marginTop: 4 }}>Be the first to share something with the community!</p>
                </div>
            ) : (
                <>
                    {posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            currentUser={user}
                            onDelete={handleDelete}
                            onLike={handleLike}
                            onComment={handleComment}
                            onDeleteComment={handleDeleteComment}
                            onShare={handleShare}
                            onConnect={handleConnect}
                            onFollow={handleFollow}
                        />
                    ))}

                    {hasMore && (
                        <div style={{ textAlign: 'center', paddingTop: 8 }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => loadPosts(page + 1)}
                                style={{ fontSize: 13 }}
                            >
                                Load more
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SocialFeed;
