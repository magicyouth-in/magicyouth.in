import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, Loader2, Building2, CalendarDays, ChevronDown, File, Lock, KeyRound, AlertCircle, ShieldCheck, LogOut } from 'lucide-react';
import '../styles/about.css';
import '../styles/documentation.css';

const DOCUMENT_TYPES = [
  'Event Reports', 'Activity Reports', 'Annual Reports', 'Unit Reports',
  'Event Proposals', 'Meeting Minutes', 'Attendance Sheets', 'Certificates',
  'Notices', 'Other Documents',
];

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeIcon(mime) {
  if (!mime) return <File style={{ width: 20, height: 20 }} />;
  if (mime.includes('pdf'))   return <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.75rem' }}>PDF</span>;
  if (mime.includes('word'))  return <span style={{ color: '#3B82F6', fontWeight: 800, fontSize: '0.75rem' }}>DOC</span>;
  if (mime.includes('sheet')) return <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.75rem' }}>XLS</span>;
  if (mime.includes('image')) return <span style={{ color: '#8B5CF6', fontWeight: 800, fontSize: '0.75rem' }}>IMG</span>;
  return <File style={{ width: 20, height: 20 }} />;
}

export default function Documentation() {
  const [docs, setDocs]         = useState([]);
  const [units, setUnits]       = useState([]);
  const [years, setYears]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);

  // Authentication gate states
  const [authenticated, setAuthenticated] = useState(false);
  const [authAdmin, setAuthAdmin]         = useState(null);
  const [authChecking, setAuthChecking]   = useState(true);
  const [loginForm, setLoginForm]         = useState({ email: '', password: '' });
  const [loginError, setLoginError]       = useState('');
  const [loggingIn, setLoggingIn]         = useState(false);

  const [filters, setFilters] = useState({
    unitId: '', academicYearId: '', documentType: '', search: ''
  });

  const fetchDocs = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 16 });
    if (filters.unitId)         params.set('unitId',         filters.unitId);
    if (filters.academicYearId) params.set('academicYearId', filters.academicYearId);
    if (filters.documentType)   params.set('documentType',   filters.documentType);
    if (filters.search)         params.set('search',         filters.search);

    fetch(`/api/documents?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setAuthChecking(false);
        if (d.authenticated) {
          setAuthenticated(true);
          setAuthAdmin(d.admin || null);
          setDocs(d.data || []);
          setTotal(d.pagination?.total || 0);
        } else {
          setAuthenticated(false);
        }
        setLoading(false);
      })
      .catch(() => { setAuthChecking(false); setLoading(false); });
  };

  useEffect(() => {
    fetchDocs();
  }, [filters, page]);

  useEffect(() => {
    if (authenticated) {
      fetch('/api/units', { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) setUnits(d.data || []); });
    }
  }, [authenticated]);

  useEffect(() => {
    if (!filters.unitId) { setYears([]); return; }
    fetch(`/api/academic-years?unitId=${filters.unitId}`, { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) setYears(d.data || []); });
  }, [filters.unitId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Email / ID and Password are required.');
      return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        setAuthAdmin(data.admin);
        fetchDocs();
      } else {
        setLoginError(data.message || 'Invalid credentials.');
      }
    } catch {
      setLoginError('Authentication failed. Check connection.');
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setAuthenticated(false);
    setAuthAdmin(null);
  };

  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };
  const totalPages = Math.ceil(total / 16);

  if (authChecking) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 36, height: 36, color: '#5B21B6' }} className="animate-spin" />
      </div>
    );
  }

  /* ── AUTHENTICATION GATE SCREEN ── */
  if (!authenticated) {
    return (
      <div>
        <section className="docs-hero">
          <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <span className="about-badge">Protected Archive</span>
            <h1 className="about-title">Documentation <span className="highlight">Center</span></h1>
            <p className="about-lead">
              Restricted to authorized Unit Leads and Administrators. Authenticate below to access reports and official files.
            </p>
          </div>
        </section>

        <section className="docs-section">
          <div className="doc-auth-card">
            <div style={{ width: 48, height: 48, borderRadius: '1rem', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#5B21B6' }}>
              <Lock style={{ width: 24, height: 24 }} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', textAlign: 'center', marginBottom: '0.5rem' }}>Documentation Unlock</h2>
            <p style={{ fontSize: '0.84375rem', color: '#6B7280', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Please sign in with your Unit Lead or Admin credentials to unlock this archive.
            </p>

            {loginError && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Lead Email or ID *</label>
                <input
                  type="text"
                  placeholder="admin@magicyouth.in or Lead ID"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', backgroundColor: '#5B21B6', color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                {loggingIn ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> : <Lock style={{ width: 18, height: 18 }} />}
                Authenticate &amp; Unlock
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* ── DOCS HERO ───────────────────────────────────────────── */}
      <section className="docs-hero">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', backgroundColor: '#D1FAE5', color: '#065F46', fontSize: '0.8125rem', fontWeight: 700, borderRadius: '9999px', marginBottom: '1.25rem' }}>
            <ShieldCheck style={{ width: 16, height: 16 }} />
            <span>Lead Access Active: {authAdmin?.name || authAdmin?.email}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 800, cursor: 'pointer', marginLeft: '0.5rem', fontSize: '0.75rem' }}>[Lock Archive]</button>
          </div>
          <h1 className="about-title">Documentation <span className="highlight">Center</span></h1>
          <p className="about-lead">
            Access event reports, annual records, certificates, meeting minutes, and official files.
          </p>
        </div>
      </section>

      {/* ── FILTERS & LISTINGS ──────────────────────────────────── */}
      <section className="docs-section">
        <div className="docs-container">
          <div className="docs-filter-bar">
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search documents…"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', border: '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Unit */}
            <div style={{ position: 'relative' }}>
              <Building2 style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <select
                value={filters.unitId}
                onChange={e => setFilter('unitId', e.target.value)}
                style={{ padding: '0.625rem 2rem 0.625rem 2.25rem', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#1F2937', appearance: 'none', outline: 'none' }}
              >
                <option value="">All Units</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5B21B6', pointerEvents: 'none' }} />
            </div>

            {/* Year */}
            <div style={{ position: 'relative' }}>
              <CalendarDays style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <select
                value={filters.academicYearId}
                onChange={e => setFilter('academicYearId', e.target.value)}
                disabled={!filters.unitId}
                style={{ padding: '0.625rem 2rem 0.625rem 2.25rem', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#1F2937', appearance: 'none', outline: 'none' }}
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5B21B6', pointerEvents: 'none' }} />
            </div>

            {/* Document Type */}
            <div style={{ position: 'relative' }}>
              <Filter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <select
                value={filters.documentType}
                onChange={e => setFilter('documentType', e.target.value)}
                style={{ padding: '0.625rem 2rem 0.625rem 2.25rem', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#1F2937', appearance: 'none', outline: 'none' }}
              >
                <option value="">All Document Types</option>
                {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5B21B6', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <Loader2 style={{ width: 36, height: 36, color: '#5B21B6' }} className="animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && docs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <FileText style={{ width: 48, height: 48, color: '#9CA3AF', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937' }}>No documents found</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Try adjusting your filters or search terms.</p>
            </div>
          )}

          {/* Docs Grid */}
          {!loading && docs.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', fontWeight: 500 }}>
                Showing {total} document{total !== 1 ? 's' : ''}
              </div>

              <div className="docs-grid">
                {docs.map(doc => (
                  <DocumentCard key={doc._id} doc={doc} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: '0.875rem', color: '#4B5563', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DocumentCard({ doc }) {
  return (
    <div className="doc-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div className="doc-icon-box">
          {mimeIcon(doc.mimeType)}
        </div>
        <span className="doc-type-tag">{doc.documentType}</span>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.375rem', lineHeight: 1.3 }}>{doc.title}</h3>
        {doc.description && (
          <p style={{ fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.description}</p>
        )}
        <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {doc.unitId?.name && <div>Unit: {doc.unitId.name}</div>}
          {doc.academicYearId?.year && <div>Year: {doc.academicYearId.year}</div>}
          {doc.fileSize && <div>Size: {formatFileSize(doc.fileSize)}</div>}
        </div>
      </div>

      <a
        href={`/api/documents/download/${doc._id}`}
        className="doc-download-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Download style={{ width: 14, height: 14 }} />
        Download Document
      </a>
    </div>
  );
}
