import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar  from './components/layout/Navbar';
import Footer  from './components/layout/Footer';

import Home      from './pages/Home';
import About     from './pages/About';
import Mission   from './pages/Mission';
import Events    from './pages/Events';
import Gallery   from './pages/Gallery';
import Documents from './pages/Documents';
import JoinUs    from './pages/JoinUs';
import Contact   from './pages/Contact';
import News      from './pages/News';
import Privacy   from './pages/Privacy';
import Terms     from './pages/Terms';

import AdminLogin     from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#0a0010', color: '#fff', fontFamily: 'Inter, Manrope, system-ui, sans-serif' }}>
        <Routes>

          {/* ── ADMIN — no public nav/footer ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Redirect /admin to /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ── PUBLIC ROUTES ── */}
          <Route path="/"          element={<PublicLayout><Home      /></PublicLayout>} />
          <Route path="/about"     element={<PublicLayout><About     /></PublicLayout>} />
          <Route path="/mission"   element={<PublicLayout><Mission   /></PublicLayout>} />
          <Route path="/events"    element={<PublicLayout><Events    /></PublicLayout>} />
          <Route path="/gallery"   element={<PublicLayout><Gallery   /></PublicLayout>} />
          <Route path="/documents" element={<PublicLayout><Documents /></PublicLayout>} />
          <Route path="/join"      element={<PublicLayout><JoinUs    /></PublicLayout>} />
          <Route path="/contact"   element={<PublicLayout><Contact   /></PublicLayout>} />
          <Route path="/news"      element={<PublicLayout><News      /></PublicLayout>} />
          <Route path="/privacy"   element={<PublicLayout><Privacy   /></PublicLayout>} />
          <Route path="/terms"     element={<PublicLayout><Terms     /></PublicLayout>} />

          {/* Redirect programs or old journey routes to events/home */}
          <Route path="/programs"  element={<Navigate to="/events" replace />} />
          <Route path="/journey"   element={<Navigate to="/" replace />} />

          {/* ── 404 ── */}
          <Route path="*" element={
            <PublicLayout>
              <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="text-8xl font-extrabold text-purple-500/20 mb-4">404</div>
                <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
                <p className="text-purple-200/50 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
                <a href="/" className="btn-purple-glow font-bold px-8 py-3 rounded-full text-sm">← Back to Home</a>
              </div>
            </PublicLayout>
          } />

        </Routes>
      </div>
    </Router>
  );
}
