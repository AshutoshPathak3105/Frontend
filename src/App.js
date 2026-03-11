import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './index.css';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIChatbot from './components/ai/AIChatbot';
import ScrollToTop from './components/layout/ScrollToTop';

// Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import Applications from './pages/Applications';
import CompanyProfile from './pages/CompanyProfile';
import SavedJobs from './pages/SavedJobs';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import SubmitStory from './pages/SubmitStory';
import SuccessStories from './pages/SuccessStories';
import Admin from './pages/Admin';
import PublicProfile from './pages/PublicProfile';
import Messages from './pages/Messages';
import Network from './pages/Network';
import FindPeople from './pages/FindPeople';
import ResumeAI from './pages/ResumeAI';
import JobApplicationsPage from './pages/JobApplicationsPage';
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="loading-container" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <p className="text-secondary">Loading...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppContent = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();

  // Hide layout elements on authentication pages
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldHideLayout = authPaths.some(path => location.pathname.startsWith(path));
  // Full-screen pages where footer & chatbot should be hidden
  const noFooterPaths = ['/messages'];
  const shouldHideFooter = noFooterPaths.some(path => location.pathname.startsWith(path));
  // Show chatbot only on the dashboard
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!shouldHideLayout && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
          <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/submit-story" element={<ProtectedRoute><SubmitStory /></ProtectedRoute>} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/users/profile/:id" element={<PublicProfile />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<Navigate to="/dashboard#feed" replace />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/saved-jobs" element={<ProtectedRoute roles={['jobseeker']}><SavedJobs /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/jobs/:jobId/applications" element={<ProtectedRoute roles={['employer', 'admin']}><JobApplicationsPage /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute roles={['employer', 'admin']}><PostJob /></ProtectedRoute>} />
          <Route path="/my-jobs" element={<ProtectedRoute roles={['employer', 'admin']}><MyJobs /></ProtectedRoute>} />
          <Route path="/company-profile" element={<ProtectedRoute roles={['employer', 'admin']}><CompanyProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
          <Route path="/people" element={<ProtectedRoute><FindPeople /></ProtectedRoute>} />
          <Route path="/resume-ai" element={<ProtectedRoute roles={['jobseeker']}><ResumeAI /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!shouldHideLayout && !shouldHideFooter && <Footer />}
      {!shouldHideLayout && isDashboard && <AIChatbot />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? '#16161f' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#0f172a',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: isDark
              ? '0 8px 24px rgba(0,0,0,0.4)'
              : '0 8px 24px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: isDark ? '#10b981' : '#059669',
              secondary: isDark ? '#16161f' : '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: isDark ? '#ef4444' : '#dc2626',
              secondary: isDark ? '#16161f' : '#ffffff',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
