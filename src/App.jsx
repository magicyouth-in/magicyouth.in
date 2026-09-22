import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import Navbar  from './components/layout/Navbar';
import Footer  from './components/layout/Footer';

const Home          = React.lazy(() => import('./pages/Home'));
const About         = React.lazy(() => import('./pages/About'));
const Programs      = React.lazy(() => import('./pages/Programs'));
const Chapters      = React.lazy(() => import('./pages/Chapters'));
const Stories       = React.lazy(() => import('./pages/Stories'));
const Resources     = React.lazy(() => import('./pages/Resources'));
const Teams         = React.lazy(() => import('./pages/Teams'));
const Impact        = React.lazy(() => import('./pages/Impact'));
const Media         = React.lazy(() => import('./pages/Media'));
const Documentation = React.lazy(() => import('./pages/Documentation'));
const JoinUs        = React.lazy(() => import('./pages/JoinUs'));
const Contact       = React.lazy(() => import('./pages/Contact'));
const Privacy       = React.lazy(() => import('./pages/Privacy'));
const Terms         = React.lazy(() => import('./pages/Terms'));

const AdminLogin     = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-blue)" />
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="public-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', color: '#1F2937', paddingTop: '68px' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageFallback />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <PublicLayout>
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--bg-secondary)', lineHeight: 1, marginBottom: '1rem' }}>404</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.75rem' }}>Page Not Found</h1>
        <p style={{ fontSize: '0.9375rem', color: '#6B7280', marginBottom: '2rem', maxWidth: '24rem' }}>
          The page you are looking for does not exist or has been removed.
        </p>
        <a href="/" className="btn-primary" style={{ padding: '0.75rem 2rem', textDecoration: 'none' }}>
          &larr; Back to Home
        </a>
      </div>
    </PublicLayout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>

        {/* 🛡️ ADMIN – independent dark theme, no public wrapper 🛡️ */}
        <Route path="/admin/login"     element={<Suspense fallback={<PageFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<Suspense fallback={<PageFallback />}><AdminDashboard /></Suspense>} />
        <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />

        {/* 🌐 PUBLIC ROUTES – wrapped in PublicLayout 🌐 */}
        <Route path="/"              element={<PublicLayout><Home          /></PublicLayout>} />
        <Route path="/about"         element={<PublicLayout><About         /></PublicLayout>} />
        <Route path="/programs"      element={<PublicLayout><Programs      /></PublicLayout>} />
        <Route path="/chapters"      element={<PublicLayout><Chapters      /></PublicLayout>} />
        <Route path="/stories"       element={<PublicLayout><Stories       /></PublicLayout>} />
        <Route path="/impact"        element={<PublicLayout><Impact        /></PublicLayout>} />
        <Route path="/media"         element={<PublicLayout><Media         /></PublicLayout>} />
        <Route path="/teams"         element={<PublicLayout><Teams         /></PublicLayout>} />
        <Route path="/resources"     element={<Navigate to="/media" replace />} />
        <Route path="/documentation" element={<PublicLayout><Documentation /></PublicLayout>} />
        <Route path="/join"          element={<PublicLayout><JoinUs        /></PublicLayout>} />
        <Route path="/contact"       element={<PublicLayout><Contact       /></PublicLayout>} />
        <Route path="/privacy"       element={<PublicLayout><Privacy       /></PublicLayout>} />
        <Route path="/terms"         element={<PublicLayout><Terms         /></PublicLayout>} />

        {/* ⚠️ 404 FALLBACK ⚠️ */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}
