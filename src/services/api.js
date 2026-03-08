import axios from 'axios';

const getBaseURL = () => {
    if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

    const hostname = window.location.hostname;
    // Localhost: use CRA proxy (proxy target defined in package.json)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
        return '/api';
    }

    // Check if hostname is an IP (local dev with mobile phone)
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    if (isIP) {
        return `http://${hostname}:8000/api`;
    }

    // Production build without REACT_APP_API_URL:
    // Try /api assuming it might be behind a reverse proxy or same-domain hosting
    console.warn('[api] REACT_APP_API_URL not set. Falling back to relative path /api');
    return '/api';
};

// Converts a stored upload path like "/uploads/resumes/file.pdf"
// into the correct absolute URL served by the Express backend.
// CRA's proxy only forwards XHR requests, NOT direct browser navigation,
// so we must always point href/src at the real backend port.
export const getUploadUrl = (filePath) => {
    if (!filePath) return '';

    let path = filePath;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isProduction = !/localhost|127\.0\.0\.1|\[::1\]/.test(hostname) && !/^(?:[192|172|10]\..*|169\.254\..*)$/.test(hostname);

    // Get live backend URL from env
    const backendBaseFromEnv = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
        : null;

    // Hot-fix for database records containing "localhost" urls (common in local dev)
    // when viewing from a different device (mobile IP) or production (Render)
    if (path.startsWith('http://localhost') || path.startsWith('http://127.0.0.1')) {
        if (isProduction && backendBaseFromEnv) {
            // We are on Render/Vercel: replace localhost with the real backend site
            path = path.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:[\d]+)?/, backendBaseFromEnv);
        } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            // We are on Mobile IP: swap localhost with PC's IP (assume backend on port 8000)
            path = path.replace(/localhost:[\d]+/, `${hostname}:8000`);
            path = path.replace(/(localhost|127\.0\.0\.1)/, hostname);
        }
    }

    // If it's already an absolute URL (Cloudinary, AWS S3, or fixed above)
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // Prepend backend base to relative paths (e.g. /uploads/...)
    if (backendBaseFromEnv) {
        return `${backendBaseFromEnv}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    // Fallback for local development
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    const backendBase = (isIP || hostname === 'localhost') ? `${protocol}//${hostname}:8000` : `${protocol}//${hostname}`;

    return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
};

const API = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Skip redirect on public pages (profile, jobs, companies, etc.)
            const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/users/profile', '/jobs', '/companies', '/contact', '/success-stories', '/submit-story'];
            const isPublicPage = publicPaths.some(p => window.location.pathname.startsWith(p)) || window.location.pathname === '/';
            if (!isPublicPage) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updatePassword = (data) => API.put('/auth/update-password', data);
export const deleteAccount = (data) => API.delete('/users/account', { data });
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const resetPassword = (token, data) => API.put(`/auth/reset-password/${token}`, data);

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const getJobs = (params) => API.get('/jobs', { params });
export const getJob = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getMyJobs = () => API.get('/jobs/my-jobs');
export const getFeaturedJobs = () => API.get('/jobs/featured');
export const getJobStats = () => API.get('/jobs/stats');
export const toggleSaveJob = (id) => API.post(`/jobs/${id}/save`);
export const toggleJobStatus = (id) => API.put(`/jobs/${id}/toggle-status`);

// ─── Applications ─────────────────────────────────────────────────────────────
export const applyJob = (data) => API.post('/applications/apply', data);
export const getMyApplications = () => API.get('/applications/my-applications');
export const getJobApplications = (jobId) => API.get(`/applications/job/${jobId}`);
export const getCompanyApplications = (params) => API.get('/applications/company-applications', { params });
export const updateApplicationStatus = (id, data) => API.put(`/applications/${id}/status`, data);
export const withdrawApplication = (id) => API.put(`/applications/${id}/withdraw`);
export const markApplicationRead = (id) => API.put(`/applications/${id}/read`);
export const getApplicationById = (id) => API.get(`/applications/${id}`);
export const scheduleInterviewAPI = (id, data) => API.post(`/applications/${id}/schedule-interview`, data);
export const cancelInterviewAPI = (id, data) => API.delete(`/applications/${id}/interview`, { data });

// ─── Users ────────────────────────────────────────────────────────────────────
export const getProfile = (id) => API.get(id ? `/users/profile/${id}` : '/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const uploadAvatar = (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return API.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const addExperience = (data) => API.post('/users/experience', data);
export const updateExperience = (expId, data) => API.put(`/users/experience/${expId}`, data);
export const deleteExperience = (expId) => API.delete(`/users/experience/${expId}`);
export const addAchievement = (data) => API.post('/users/achievements', data);
export const deleteAchievement = (achId) => API.delete(`/users/achievements/${achId}`);
export const addEducation = (data) => API.post('/users/education', data);
export const updateEducation = (eduId, data) => API.put(`/users/education/${eduId}`, data);
export const deleteEducation = (eduId) => API.delete(`/users/education/${eduId}`);
export const uploadResume = (data) => API.post('/users/resume', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteResume = () => API.delete('/users/resume');
export const getSavedJobs = () => API.get('/users/saved-jobs');
export const getEmployerDashboardStats = () => API.get('/users/employer-stats');
export const getDashboardStats = () => API.get('/users/dashboard-stats');
export const getRecentActivity = () => API.get('/users/recent-activity');

// ─── Companies ────────────────────────────────────────────────────────────────
export const getAllCompanies = (params) => API.get('/companies', { params });
export const getCompany = (id) => API.get(`/companies/${id}`);
export const getCompanyJobs = (id) => API.get(`/companies/${id}/jobs`);
export const getMyCompany = () => API.get('/companies/my-company');
export const createCompany = (data) => API.post('/companies', data);
export const updateCompany = (data) => API.put('/companies', data);
export const deleteCompany = () => API.delete('/companies');

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = () => API.get('/categories');

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiChat = (data) => API.post('/ai/chat', data);
export const analyzeResume = (data) => API.post('/ai/analyze-resume', data);
export const generateCoverLetter = (data) => API.post('/ai/generate-cover-letter', data);
export const recommendJobsFromResume = () => API.post('/ai/recommend-jobs');
export const verifyAndAnalyzeResume = () => API.post('/ai/verify-analyze');

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = (params) => API.get('/notifications', { params });
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/mark-all-read');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
export const clearReadNotifications = () => API.delete('/notifications/clear-read');
export const deleteAllNotifications = () => API.delete('/notifications/delete-all');

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const getAdminUser = (id) => API.get(`/admin/users/${id}`);
export const toggleAdminUserStatus = (id) => API.put(`/admin/users/${id}/toggle-status`);
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminJobs = (params) => API.get('/admin/jobs', { params });
export const toggleAdminFeatureJob = (id) => API.put(`/admin/jobs/${id}/feature`);
export const closeAdminJob = (id) => API.put(`/admin/jobs/${id}/close`);
export const getAdminCompanies = (params) => API.get('/admin/companies', { params });
export const toggleAdminVerifyCompany = (id) => API.put(`/admin/companies/${id}/verify`);
export const toggleAdminCompanyStatus = (id) => API.put(`/admin/companies/${id}/toggle-status`);
export const getAdminApplications = (params) => API.get('/admin/applications', { params });

// ─── Global Search ───────────────────────────────────────────────────────────
export const globalSearch = (q) => API.get('/search', { params: { q } });

// ─── Messages ─────────────────────────────────────────────────────────────────
export const getConversations = () => API.get('/messages/conversations');
export const getOrCreateConversation = (userId) => API.post('/messages/conversations', { userId });
export const getMessages = (conversationId) => API.get(`/messages/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, content) => API.post(`/messages/conversations/${conversationId}/messages`, { content });
export const sendMessageWithAttachment = (conversationId, file, caption = '') => {
    const fd = new FormData();
    fd.append('file', file);
    if (caption) fd.append('content', caption);
    return API.post(`/messages/conversations/${conversationId}/messages/file`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const sendGifMessageAPI = (conversationId, gifUrl, gifTitle) =>
    API.post(`/messages/conversations/${conversationId}/messages/gif`, { gifUrl, gifTitle });
export const deleteConversation = (conversationId) => API.delete(`/messages/conversations/${conversationId}`);
export const editMessage = (messageId, content) => API.put(`/messages/messages/${messageId}`, { content });
export const deleteMessageAPI = (messageId, mode) => API.delete(`/messages/messages/${messageId}`, { data: { mode } });
export const getUnreadMessageCount = () => API.get('/messages/unread');

// ─── Stories ──────────────────────────────────────────────────────────────────
export const getStories = () => API.get('/stories');
export const getMyStory = () => API.get('/stories/my');
export const createStory = (data) => API.post('/stories', data);
export const updateStory = (id, data) => API.put(`/stories/${id}`, data);
export const deleteStory = (id) => API.delete(`/stories/${id}`);

// ─── Social Feed Posts ────────────────────────────────────────────────────────
export const getFeedPosts = (params) => API.get('/posts', { params });
export const createFeedPost = (data) => API.post('/posts', data);
// Note: do NOT set Content-Type manually for FormData — axios sets it automatically
// with the correct multipart boundary, which multer requires to parse the body.
export const deleteFeedPost = (id) => API.delete(`/posts/${id}`);
export const togglePostLike = (id) => API.put(`/posts/${id}/like`);
export const addPostComment = (id, text) => API.post(`/posts/${id}/comment`, { text });
export const deletePostComment = (postId, cid) => API.delete(`/posts/${postId}/comment/${cid}`);
export const sharePostAPI = (id) => API.put(`/posts/${id}/share`);
export const viewPostAPI = (id) => API.put(`/posts/${id}/view`);

// ─── Connections ──────────────────────────────────────────────────────────────
export const sendConnectionRequest = (id) => API.post(`/connections/request/${id}`);
export const getConnectionRequests = () => API.get('/connections/requests');
export const respondToConnectionRequest = (id, status) => API.put(`/connections/respond/${id}`, { status });
export const getConnections = () => API.get('/connections');
export const toggleFollow = (id) => API.post(`/connections/follow/${id}`);
export const removeConnection = (id) => API.delete(`/connections/${id}`);
export const browsePeople = (params) => API.get('/connections/people', { params });
export const cancelConnectionRequest = (id) => API.delete(`/connections/request/${id}`);

export default API;
