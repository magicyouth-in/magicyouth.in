import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar  from './components/layout/Navbar';
import Footer  from './components/layout/Footer';

import Home          from './pages/Home';
import About         from './pages/About';
import Mission       from './pages/Mission';
import Teams         from './pages/Teams';
import Events        from './pages/Events';
import Gallery       from './pages/Gallery';
import Documentation from './pages/Documentation';
import JoinUs        from './pages/JoinUs';
import Contact       from './pages/Contact';
import Privacy       from './pages/Privacy';
import Terms         from './pages/Terms';

import AdminLogin     from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function PublicLayout({ children }) {
  return (
    <div className="public-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', color: '#1F2937' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <PublicLayout>
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ fontSize: '6rem', fontWeight: 900, color: '#EDE9FE', lineHeight: 1, marginBottom: '1rem' }}>404</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.75rem' }}>Page Not Found</h1>
        <p style={{ fontSize: '0.9375rem', color: '#6B7280', marginBottom: '2rem', maxWidth: '24rem' }}>
          The page you are looking for does not exist or has been removed.
        </p>
        <a href="/" className="btn-primary-purple" style={{ padding: '0.75rem 2rem', textDecoration: 'none' }}>
          ← Back to Home
        </a>
      </div>
    </PublicLayout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ── ADMIN — independent dark theme, no public wrapper ── */}
        <Route path="/admin/login"     element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />

        {/* ── PUBLIC ROUTES — wrapped in PublicLayout ── */}
        <Route path="/"              element={<PublicLayout><Home          /></PublicLayout>} />
        <Route path="/about"         element={<PublicLayout><About         /></PublicLayout>} />
        <Route path="/mission"       element={<PublicLayout><Mission       /></PublicLayout>} />
        <Route path="/teams"         element={<PublicLayout><Teams         /></PublicLayout>} />
        <Route path="/gallery"       element={<PublicLayout><Gallery       /></PublicLayout>} />
        <Route path="/events"        element={<PublicLayout><Events        /></PublicLayout>} />
        <Route path="/documentation" element={<PublicLayout><Documentation /></PublicLayout>} />
        <Route path="/join"          element={<PublicLayout><JoinUs        /></PublicLayout>} />
        <Route path="/contact"       element={<PublicLayout><Contact       /></PublicLayout>} />
        <Route path="/privacy"       element={<PublicLayout><Privacy       /></PublicLayout>} />
        <Route path="/terms"         element={<PublicLayout><Terms         /></PublicLayout>} />

        {/* ── 404 FALLBACK ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}
