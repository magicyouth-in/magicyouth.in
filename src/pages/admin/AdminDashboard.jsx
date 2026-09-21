import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BookOpen, Calendar,
  Sparkles, Image, FileText, HelpCircle, HeartHandshake,
  Building, MessageSquare, CalendarDays, Settings, LogOut,
  Plus, Check, AlertCircle, Edit, Trash2, ShieldCheck,
  Filter, Search, X, Loader2, ArrowRight, Eye, Download,
  CheckCircle2, Clock, Globe, User, GraduationCap, Phone, Mail, MapPin, RefreshCw
} from 'lucide-react';
import magicLogo from '../../assets/magic-logo.png';
import '../../styles/admin.css';

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'include',
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Toast Notification Component ─────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div 
          key={t.id} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            pointerEvents: 'auto',
            backgroundColor: t.type === 'error' ? '#FFF1F2' : '#F0FDF4',
            color: t.type === 'error' ? '#BE123C' : '#15803D',
            border: `1.5px solid ${t.type === 'error' ? '#FDA4AF' : '#86EFAC'}`
          }}
        >
          {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD COMPONENT ──────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Shared global data
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentUnitId, setCurrentUnitId] = useState('all');

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  };

  // 1. Verify Authentication
  useEffect(() => {
    api('/api/auth/status')
      .then(d => {
        if (!d.loggedIn) { navigate('/admin/login'); return; }
        setAdmin(d.admin);
        setLoading(false);
      })
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  // 2. Fetch Chapters and Academic Years
  const fetchGlobalData = useCallback(async () => {
    if (!admin) return;
    try {
      const unitsUrl = admin.role === 'MAIN_ADMIN' ? '/api/units?includeInactive=true' : '/api/units?includeInactive=false';
      const [uData, yData] = await Promise.all([
        api(unitsUrl),
        api('/api/academic-years')
      ]);
      if (uData.success) {
        const list = uData.data || [];
        const filtered = admin.role === 'MAIN_ADMIN' ? list : list.filter(u => admin.assignedUnitIds?.includes(u._id));
        setUnits(filtered);
      }
      if (yData.success) {
        setAcademicYears(yData.data || []);
      }
    } catch {}
  }, [admin]);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    navigate('/admin/login');
  };

  // Sidebar Menu Items Definition
  const sidebarGroups = [
    {
      group: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'CONTENT',
      items: [
        { id: 'chapters',   label: 'Chapters',        icon: Building2 },
        { id: 'teams',      label: 'Teams',           icon: Users },
        { id: 'programs',   label: 'Programs',        icon: BookOpen },
        { id: 'events',     label: 'Events & Impact', icon: Calendar },
        { id: 'stories',    label: 'Stories',         icon: Sparkles },
        { id: 'gallery',    label: 'Media / Gallery', icon: Image },
        { id: 'resources',  label: 'Resources',       icon: FileText },
        { id: 'faqs',       label: 'FAQs',            icon: HelpCircle }
      ]
    },
    {
      group: 'APPLICATIONS',
      items: [
        { id: 'join-apps',    label: 'Join MAGIC Apps',    icon: HeartHandshake },
        { id: 'chapter-apps', label: 'Chapter Apps',       icon: Building },
        { id: 'enquiries',    label: 'Contact Enquiries',  icon: MessageSquare }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'academic-years', label: 'Academic Years', icon: CalendarDays },
        { id: 'settings',       label: 'Admin Settings', icon: Settings }
      ]
    }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <Loader2 size={36} color="var(--primary-blue)" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="admin-layout-root">
      <Toast toasts={toasts} />

      {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <img src={magicLogo} alt="MAGIC Youth" className="admin-sidebar-logo" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-blue)', lineHeight: 1.1 }}>
              MAGIC <span style={{ color: 'var(--primary-pink)' }}>Youth</span>
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em' }}>
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="admin-sidebar-nav">
          {sidebarGroups.map(grp => (
            <div key={grp.group}>
              <div className="admin-nav-group-title">{grp.group}</div>
              <ul className="admin-nav-group-list">
                {grp.items.map(item => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`admin-sidebar-btn ${isActive ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <IconComp size={17} className="admin-btn-icon" />
                          <span>{item.label}</span>
                        </div>
                        {isActive && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-pink)' }} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F0F9FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem' }}>
              {admin?.name ? admin.name[0].toUpperCase() : 'A'}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A' }}>{admin?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>{admin?.role === 'MAIN_ADMIN' ? 'Apex Admin' : 'Chapter Admin'}</div>
            </div>
          </div>
          <button onClick={handleLogout} title="Sign Out" className="admin-btn-action" style={{ color: '#BE123C', padding: '0.35rem' }}>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────── */}
      <div className="admin-main-wrapper">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="admin-btn-action lg:hidden"
              style={{ padding: '0.5rem' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Filter size={18} />}
            </button>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {sidebarGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Dashboard'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {admin?.role === 'MAIN_ADMIN' && (
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', backgroundColor: '#F0F9FF', padding: '0.3rem 0.75rem', borderRadius: '999px' }}>
                <span style={{ color: 'var(--primary-pink)', marginRight: '4px' }}>●</span> All Chapters
              </span>
            )}
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn-secondary" style={{ fontSize: '0.78125rem', padding: '0.4rem 0.9rem' }}>
              View Public Site <Globe size={13} />
            </a>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content-body">
          {activeTab === 'dashboard'      && <DashboardModule admin={admin} units={units} setActiveTab={setActiveTab} />}
          {activeTab === 'chapters'       && <ChaptersModule toast={showToast} refreshUnits={fetchGlobalData} />}
          {activeTab === 'teams'          && <TeamsModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'programs'       && <ProgramsModule toast={showToast} />}
          {activeTab === 'events'         && <EventsModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'stories'        && <StoriesModule toast={showToast} units={units} />}
          {activeTab === 'gallery'        && <GalleryModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'resources'      && <ResourcesModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'faqs'           && <FaqModule toast={showToast} />}
          {activeTab === 'join-apps'      && <JoinApplicationsModule toast={showToast} />}
          {activeTab === 'chapter-apps'   && <ChapterApplicationsModule toast={showToast} />}
          {activeTab === 'enquiries'      && <EnquiriesModule toast={showToast} />}
          {activeTab === 'academic-years' && <AcademicYearsModule toast={showToast} units={units} refreshYears={fetchGlobalData} />}
          {activeTab === 'settings'       && <SettingsModule toast={showToast} admin={admin} units={units} />}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. DASHBOARD MODULE
// ═════════════════════════════════════════════════════════════════════════════
function DashboardModule({ admin, units, setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/stats')
      .then(d => { if (d.success) setStats(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={32} className="animate-spin" color="var(--primary-blue)" /></div>;
  }

  const statCards = [
    { label: 'Active Chapters',   value: stats?.totalUnits ?? units.length,   tab: 'chapters',  icon: Building2 },
    { label: 'Upcoming Events',   value: stats?.totalEvents ?? 0,             tab: 'events',    icon: Calendar },
    { label: 'Formed Teams',      value: stats?.totalTeams ?? (units.length * 2), tab: 'teams', icon: Users },
    { label: 'Flagship Programs', value: 4,                                   tab: 'programs',  icon: BookOpen },
    { label: 'Student Stories',   value: 3,                                   tab: 'stories',   icon: Sparkles },
    { label: 'Gallery Media',     value: stats?.totalPhotos ?? 0,             tab: 'gallery',   icon: Image },
    { label: 'New Join Requests', value: stats?.pendingJoinRequests ?? 0,     tab: 'join-apps', icon: HeartHandshake, alert: stats?.pendingJoinRequests > 0 },
    { label: 'New Enquiries',     value: stats?.newMessages ?? 0,             tab: 'enquiries', icon: MessageSquare, alert: stats?.newMessages > 0 },
  ];

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Welcome back, {admin?.name || 'Administrator'} 👋</h1>
          <p className="admin-module-subtitle">Content management and youth movement administration under YES-J.</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid">
        {statCards.map((sc, i) => {
          const IconComp = sc.icon;
          return (
            <div 
              key={i} 
              className="admin-stat-card"
              style={{ cursor: 'pointer', borderLeft: sc.alert ? '4px solid var(--primary-pink)' : '4px solid var(--primary-blue)' }}
              onClick={() => setActiveTab(sc.tab)}
            >
              <div>
                <div className="admin-stat-val" style={{ color: sc.alert ? 'var(--primary-pink)' : 'var(--text-primary)' }}>
                  {sc.value}
                </div>
                <div className="admin-stat-lbl">{sc.label}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '0.75rem', backgroundColor: '#F0F9FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Submissions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Quick Actions Card */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)' }}>●</span> Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button onClick={() => setActiveTab('chapters')} className="admin-sidebar-btn" style={{ backgroundColor: '#F8FAFC', padding: '0.75rem' }}>
              <span style={{ fontWeight: 700 }}>+ Manage Chapters</span> <ArrowRight size={14} />
            </button>
            <button onClick={() => setActiveTab('teams')} className="admin-sidebar-btn" style={{ backgroundColor: '#F8FAFC', padding: '0.75rem' }}>
              <span style={{ fontWeight: 700 }}>+ Add / Edit Team Members</span> <ArrowRight size={14} />
            </button>
            <button onClick={() => setActiveTab('events')} className="admin-sidebar-btn" style={{ backgroundColor: '#F8FAFC', padding: '0.75rem' }}>
              <span style={{ fontWeight: 700 }}>+ Post New Event &amp; Impact</span> <ArrowRight size={14} />
            </button>
            <button onClick={() => setActiveTab('join-apps')} className="admin-sidebar-btn" style={{ backgroundColor: '#F8FAFC', padding: '0.75rem' }}>
              <span style={{ fontWeight: 700 }}>Review Join Applications ({stats?.pendingJoinRequests ?? 0})</span> <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Recent Applications List */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)' }}>●</span> Recent Submissions
          </h3>
          {stats?.recentJoinRequests && stats.recentJoinRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentJoinRequests.map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{req.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{req.college}</div>
                  </div>
                  <span className="admin-badge badge-pending">{req.status || 'Pending'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>No pending submissions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. CHAPTERS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function ChaptersModule({ toast, refreshUnits }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    code: '',
    institution: '',
    location: '',
    description: '',
    status: 'Active'
  });

  const loadData = useCallback(() => {
    setLoading(true);
    api('/api/units?includeInactive=true')
      .then(d => { setUnits(d.data || []); setLoading(false); refreshUnits?.(); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [refreshUnits, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditingUnit(null);
    setForm({ name: '', code: '', institution: '', location: '', description: '', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUnit(u);
    setForm({
      name: u.name || '',
      code: u.code || '',
      institution: u.institution || '',
      location: u.location || '',
      description: u.description || '',
      status: u.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast('Chapter Name and Code are required.', 'error');
      return;
    }
    try {
      if (editingUnit) {
        await api(`/api/units/${editingUnit._id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast('Chapter updated successfully.');
      } else {
        await api('/api/units', { method: 'POST', body: JSON.stringify(form) });
        toast('Chapter created successfully.');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = units.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.code?.toLowerCase().includes(search.toLowerCase()) ||
    u.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Collegiate Chapters</h1>
          <p className="admin-module-subtitle">Manage higher education institutions and chartered MAGIC Youth campus wings.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add New Chapter
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minWidth: 260 }}>
            <Search size={15} color="#94A3B8" />
            <input 
              placeholder="Search chapters by name, code, location..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%' }}
            />
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>
            Total Chapters: {filtered.length}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No chapters found matching search.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chapter Name</th>
                <th>Code</th>
                <th>Institution</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td><span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>{u.code}</span></td>
                  <td>{u.institution || '—'}</td>
                  <td>{u.location || '—'}</td>
                  <td>
                    <span className={`admin-badge ${u.status === 'Active' ? 'badge-active' : 'badge-archived'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => openEdit(u)} className="admin-btn-action">
                      <Edit size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Chapter Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingUnit ? 'Edit Chapter' : 'Add New Chapter'}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Chapter Name *</label>
                <input required placeholder="e.g. ALIET MAGIC YOUTH" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Short Code *</label>
                  <input required placeholder="e.g. ALIET" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="admin-select">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Institution / College Name</label>
                <input placeholder="e.g. Andhra Loyola Institute of Engineering and Technology" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Location (City / State)</label>
                <input placeholder="e.g. Vijayawada, Andhra Pradesh" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description / Remarks</label>
                <textarea rows={3} placeholder="Chapter description or faculty coordinator remarks..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="admin-textarea" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Chapter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. TEAMS MODULE (Hierarchy: Chapter → Academic Year → Team → Members)
// ═════════════════════════════════════════════════════════════════════════════
function TeamsModule({ toast, units, academicYears }) {
  const [selectedUnit, setSelectedUnit] = useState(units[0]?._id || 'all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [teams, setTeams] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('Executive Body');
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', position: 'President', department: '', batchYear: '', biography: '', displayOrder: 0 });
  const [memberPhoto, setMemberPhoto] = useState(null);

  const loadTeamsAndMembers = useCallback(async () => {
    setLoading(true);
    try {
      let q = '/api/teams';
      if (selectedUnit !== 'all') q += `?unitId=${selectedUnit}`;
      const res = await api(q);
      const list = res.data || [];
      setTeams(list);

      const memMap = {};
      await Promise.all(list.map(async t => {
        try {
          const m = await api(`/api/teams/${t._id}/members`);
          memMap[t._id] = m.data || [];
        } catch {
          memMap[t._id] = [];
        }
      }));
      setMembersMap(memMap);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedUnit, toast]);

  useEffect(() => {
    loadTeamsAndMembers();
  }, [loadTeamsAndMembers]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!selectedUnit || selectedUnit === 'all') {
      toast('Please select a specific Chapter first.', 'error');
      return;
    }
    const currentYearObj = academicYears.find(y => y.isCurrent) || academicYears[0];
    if (!currentYearObj) {
      toast('Please create an Academic Year first.', 'error');
      return;
    }
    try {
      await api('/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          unitId: selectedUnit,
          academicYearId: currentYearObj._id,
          name: newTeamName,
          status: 'Active'
        })
      });
      toast(`Team ${newTeamName} created.`);
      setShowAddTeam(false);
      loadTeamsAndMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.position) {
      toast('Member Name and Position are required.', 'error');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('name', memberForm.name);
      fd.append('position', memberForm.position);
      fd.append('department', memberForm.department);
      fd.append('batchYear', memberForm.batchYear);
      fd.append('biography', memberForm.biography);
      fd.append('displayOrder', memberForm.displayOrder);
      if (memberPhoto) fd.append('photo', memberPhoto);

      const res = await fetch(`/api/teams/${activeTeamId}/members`, {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast(`Added ${memberForm.name} to team roster.`);
      setShowMemberModal(false);
      setMemberForm({ name: '', position: 'President', department: '', batchYear: '', biography: '', displayOrder: 0 });
      setMemberPhoto(null);
      loadTeamsAndMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDeleteMember = async (mId) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await api(`/api/teams/members/${mId}`, { method: 'DELETE' });
      toast('Member removed.');
      loadTeamsAndMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Teams &amp; Student Leaders</h1>
          <p className="admin-module-subtitle">Directly manage team rosters, executive leadership, and coordinators displayed on the public /teams page.</p>
        </div>
        <button onClick={() => setShowAddTeam(true)} className="admin-btn-primary">
          <Plus size={16} /> Create Team Body
        </button>
      </div>

      {/* Filter bar */}
      <div className="admin-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label className="admin-label">Filter by Chapter</label>
          <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="admin-select" style={{ minWidth: 200 }}>
            <option value="all">All Chapters</option>
            {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={32} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : teams.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No leadership teams created for this selection. Click "+ Create Team Body" above to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {teams.map(team => {
            const teamMembers = membersMap[team._id] || [];
            return (
              <div key={team._id} className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {team.unitId?.name || 'CAMPUS'} &bull; {team.academicYearId?.year || '2025-26'}
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                      {team.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => { setActiveTeamId(team._id); setShowMemberModal(true); }}
                    className="admin-btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                  >
                    <Plus size={14} /> Add Team Member
                  </button>
                </div>

                {/* Members list */}
                {teamMembers.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontStyle: 'italic', margin: '1rem 0' }}>
                    No members added to this team yet. Use the "Add Team Member" button to add students.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {teamMembers.map(m => (
                      <div key={m._id} style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F0F9FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                              {m.name?.[0]}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.name}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{m.position}</div>
                            {m.department && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.department}</div>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteMember(m._id)} className="admin-btn-danger" style={{ padding: '0.3rem' }} title="Remove Member">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Create Team Body</h3>
            <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Select Chapter</label>
                <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="admin-select">
                  {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Team Body Name *</label>
                <input required placeholder="e.g. Executive Board, Core Committee" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddTeam(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add Student Member / Lead</h3>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Full Name *</label>
                <input required placeholder="e.g. Lokesh Sai" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Position / Role *</label>
                  <input required placeholder="e.g. President, Lead, Coordinator" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Department / Branch</label>
                  <input placeholder="e.g. CSE, EEE, B.Com" value={memberForm.department} onChange={e => setMemberForm({ ...memberForm, department: e.target.value })} className="admin-input" />
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Photo Upload (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setMemberPhoto(e.target.files?.[0] || null)} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. FLAGSHIP PROGRAMS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function ProgramsModule({ toast }) {
  const [programs, setPrograms] = useState([
    { id: '1', name: 'Project Shiksha', category: 'Education Outreach', desc: 'Academic support, literacy campaigns, and mentoring for underprivileged students.', featured: true },
    { id: '2', name: 'Green Footprints', category: 'Environmental Action', desc: 'Promoting eco-conservation, campus clean drives, and climate awareness initiatives.', featured: true },
    { id: '3', name: 'MAGIS / YES-J Yuvotsavaalu', category: 'Youth Gathering', desc: 'Annual convention celebrating student culture, social reflection, and solidarity.', featured: true },
    { id: '4', name: 'Elevate X', category: 'Social Innovation', desc: 'Student-led social entrepreneurship incubation addressing grassroots challenges.', featured: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [progForm, setProgForm] = useState({ name: '', category: '', desc: '', featured: true });

  const handleSave = (e) => {
    e.preventDefault();
    setPrograms([...programs, { id: Date.now().toString(), ...progForm }]);
    toast(`Program ${progForm.name} saved.`);
    setShowModal(false);
  };

  const toggleFeatured = (id) => {
    setPrograms(programs.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
    toast('Homepage featured status updated.');
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Flagship Programs</h1>
          <p className="admin-module-subtitle">Manage official action frameworks and control which flagship initiatives appear on the homepage.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="admin-btn-primary">
          <Plus size={16} /> Add Program
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {programs.map(p => (
          <div key={p.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="admin-badge" style={{ backgroundColor: '#F0F9FF', color: 'var(--primary-blue)' }}>{p.category}</span>
                <button 
                  onClick={() => toggleFeatured(p.id)}
                  className={`admin-badge ${p.featured ? 'badge-featured' : 'badge-archived'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {p.featured ? '★ Featured on Home' : 'Not Featured'}
                </button>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{p.name}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add Flagship Program</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Program Name *</label>
                <input required value={progForm.name} onChange={e => setProgForm({ ...progForm, name: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Category *</label>
                <input required placeholder="e.g. Education, Environment, Leadership" value={progForm.category} onChange={e => setProgForm({ ...progForm, category: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description *</label>
                <textarea rows={3} required value={progForm.desc} onChange={e => setProgForm({ ...progForm, desc: e.target.value })} className="admin-textarea" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Program</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. EVENTS & IMPACT MODULE
// ═════════════════════════════════════════════════════════════════════════════
function EventsModule({ toast, units, academicYears }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    startDate: '',
    venue: '',
    unitId: units[0]?._id || '',
    category: 'Community Service',
    description: '',
    status: 'Upcoming'
  });

  const loadEvents = useCallback(() => {
    setLoading(true);
    api('/api/events')
      .then(d => { setEvents(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
      const payload = { ...eventForm, academicYearId: currentYear?._id };
      if (editingEvent) {
        await api(`/api/events/${editingEvent._id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Event updated.');
      } else {
        await api('/api/events', { method: 'POST', body: JSON.stringify(payload) });
        toast('Event published.');
      }
      setShowModal(false);
      loadEvents();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api(`/api/events/${id}`, { method: 'DELETE' });
      toast('Event removed.');
      loadEvents();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Events &amp; Impact Reports</h1>
          <p className="admin-module-subtitle">Manage campus interventions, workshops, and featured impact stories.</p>
        </div>
        <button onClick={() => { setEditingEvent(null); setShowModal(true); }} className="admin-btn-primary">
          <Plus size={16} /> Add Event
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No events recorded yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Venue / Location</th>
                <th>Chapter</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ev.title}</td>
                  <td>{ev.startDate || ev.date || '—'}</td>
                  <td>{ev.venue || '—'}</td>
                  <td>{ev.unitId?.name || '—'}</td>
                  <td><span className="admin-badge badge-active">{ev.status || 'Active'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(ev._id)} className="admin-btn-danger" style={{ padding: '0.3rem' }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add Event</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Event Title *</label>
                <input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Date</label>
                  <input type="date" value={eventForm.startDate} onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Chapter</label>
                  <select value={eventForm.unitId} onChange={e => setEventForm({ ...eventForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Venue / Location</label>
                <input placeholder="e.g. Auditorium, ALIET" value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description &amp; Impact</label>
                <textarea rows={3} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="admin-textarea" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. STORIES MODULE
// ═════════════════════════════════════════════════════════════════════════════
function StoriesModule({ toast, units }) {
  const [stories, setStories] = useState([
    {
      id: '1',
      author: 'Student Coordinator',
      chapter: 'ALIET Chapter',
      quote: 'MAGIC taught me that youth leadership is not about occupying titles, but about listening deeply to marginalized communities.',
      featured: true
    },
    {
      id: '2',
      author: 'Core Committee Member',
      chapter: 'Vijayawada Unit',
      quote: 'Through rural immersion visits, I experienced realities that textbooks never touched.',
      featured: true
    },
    {
      id: '3',
      author: 'Volunteer Lead',
      chapter: 'Campus Executive',
      quote: 'Participating in Project Shiksha transformed our entire campus culture into one of active volunteerism.',
      featured: true
    }
  ]);

  const toggleFeatured = (id) => {
    setStories(stories.map(s => s.id === id ? { ...s, featured: !s.featured } : s));
    toast('Featured status updated.');
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Transformation Stories</h1>
          <p className="admin-module-subtitle">Manage student voice testimonials and inspirational changemaker journeys.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {stories.map(s => (
          <div key={s.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              "{s.quote}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '0.875rem' }}>{s.author}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{s.chapter}</div>
              </div>
              <button onClick={() => toggleFeatured(s.id)} className={`admin-badge ${s.featured ? 'badge-featured' : 'badge-archived'}`} style={{ cursor: 'pointer', border: 'none' }}>
                {s.featured ? '★ Featured' : 'Normal'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. GALLERY & MEDIA MODULE
// ═════════════════════════════════════════════════════════════════════════════
function GalleryModule({ toast, units, academicYears }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPhotos = useCallback(() => {
    setLoading(true);
    api('/api/gallery')
      .then(d => { setPhotos(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleDelete = async (id) => {
    if (!confirm('Remove photo from gallery?')) return;
    try {
      await api(`/api/gallery/${id}`, { method: 'DELETE' });
      toast('Photo deleted.');
      loadPhotos();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Media &amp; Gallery</h1>
          <p className="admin-module-subtitle">Manage high-resolution photo archives and media publications from chapters.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : photos.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No gallery images uploaded yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {photos.map(p => (
            <div key={p._id} className="admin-card" style={{ padding: '0.75rem', position: 'relative' }}>
              <img src={p.file_path || p.url} alt={p.caption || 'Gallery'} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {p.caption || 'Event Highlight'}
              </div>
              <button onClick={() => handleDelete(p._id)} className="admin-btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                <Trash2 size={13} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. RESOURCES MODULE
// ═════════════════════════════════════════════════════════════════════════════
function ResourcesModule({ toast, units }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = useCallback(() => {
    setLoading(true);
    api('/api/documents')
      .then(d => { setDocs(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Resources &amp; Toolkits</h1>
          <p className="admin-module-subtitle">Official formation materials, annual magazines, and chapter guidelines.</p>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No documents uploaded.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Visibility</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.title}</td>
                  <td>{d.documentType || d.category || 'Toolkit'}</td>
                  <td><span className="admin-badge badge-active">{d.visibility || 'Public'}</span></td>
                  <td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 9. FAQ MODULE
// ═════════════════════════════════════════════════════════════════════════════
function FaqModule({ toast }) {
  const [faqs, setFaqs] = useState([
    { id: '1', q: 'What is MAGIC Youth and how is it connected to YES-J?', a: 'MAGIC Youth (Men and Women Aiming at Greater Initiatives for Change) is the collegiate youth movement operating under the institutional umbrella of YES-J.' },
    { id: '2', q: 'Who can join MAGIC Youth and how do I register?', a: 'Any student enrolled in higher education institutions can join through their campus chapter or our online Join Us portal.' },
    { id: '3', q: 'How can an institution start a MAGIC chapter?', a: 'Colleges can start an official chapter by identifying a faculty mentor, forming a student committee, and submitting a formal request.' },
    { id: '4', q: 'What kind of activities do student members lead?', a: 'Student members organize remedial tutoring (Project Shiksha), environmental action (Green Footprints), leadership summits (MAGIS), and grassroots innovation.' }
  ]);

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Frequently Asked Questions</h1>
          <p className="admin-module-subtitle">Manage questions and answers displayed on the public homepage FAQ section.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map(f => (
          <div key={f.id} className="admin-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>{f.q}</h4>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 10. JOIN MAGIC APPLICATIONS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function JoinApplicationsModule({ toast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  const loadRequests = useCallback(() => {
    setLoading(true);
    api('/api/join')
      .then(d => { setRequests(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const updateStatus = async (id, status) => {
    try {
      await api(`/api/join/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast(`Application marked as ${status}.`);
      loadRequests();
      if (selectedReq?._id === id) setSelectedReq(null);
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Join MAGIC Applications</h1>
          <p className="admin-module-subtitle">Review incoming collegiate membership applications submitted through the public website.</p>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No membership applications submitted yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>College / Dept</th>
                <th>Contact</th>
                <th>Submitted</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</td>
                  <td>
                    <div>{r.college}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{r.department} &bull; {r.year}</div>
                  </td>
                  <td>
                    <div>{r.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{r.phone}</div>
                  </td>
                  <td>{new Date(r.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td>
                    <span className={`admin-badge ${r.status === 'Accepted' ? 'badge-approved' : r.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setSelectedReq(r)} className="admin-btn-action">
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedReq && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Application Details</h3>
              <button onClick={() => setSelectedReq(null)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div><strong>Name:</strong> {selectedReq.name} ({selectedReq.gender})</div>
              <div><strong>College:</strong> {selectedReq.college}</div>
              <div><strong>Department &amp; Year:</strong> {selectedReq.department} — {selectedReq.year}</div>
              <div><strong>Email:</strong> {selectedReq.email} | <strong>Phone:</strong> {selectedReq.phone}</div>
              <div><strong>City:</strong> {selectedReq.city}</div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <strong>Reason for Joining:</strong>
                <p style={{ margin: '0.35rem 0 0', color: '#334155' }}>{selectedReq.reason}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => updateStatus(selectedReq._id, 'Accepted')} className="admin-btn-primary" style={{ backgroundColor: '#166534' }}>Accept</button>
              <button onClick={() => updateStatus(selectedReq._id, 'Rejected')} className="admin-btn-danger">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 11. CHAPTER APPLICATIONS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function ChapterApplicationsModule({ toast }) {
  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Chapter Establishment Inquiries</h1>
          <p className="admin-module-subtitle">Requests from colleges and educational institutions seeking to charter a new MAGIC Youth chapter.</p>
        </div>
      </div>
      <div className="admin-card" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
        <Building size={36} color="var(--primary-blue)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ margin: 0, fontWeight: 700 }}>No pending chapter applications at this moment.</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem' }}>Institutions can submit charter requests through the Start a Chapter portal.</p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 12. CONTACT ENQUIRIES MODULE
// ═════════════════════════════════════════════════════════════════════════════
function EnquiriesModule({ toast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const loadMessages = useCallback(() => {
    setLoading(true);
    api('/api/contact')
      .then(d => { setMessages(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const updateStatus = async (id, status) => {
    try {
      await api(`/api/contact/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast(`Message marked as ${status}.`);
      loadMessages();
      if (selectedMsg?._id === id) setSelectedMsg(null);
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Contact Enquiries</h1>
          <p className="admin-module-subtitle">Direct messages and general questions submitted from the website Contact page.</p>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No contact inquiries received yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <tr key={m._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{m.subject || 'General Inquiry'}</td>
                  <td>{new Date(m.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td>
                    <span className={`admin-badge ${m.status === 'Resolved' || m.status === 'Replied' ? 'badge-approved' : 'badge-pending'}`}>
                      {m.status || 'New'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setSelectedMsg(m)} className="admin-btn-action">
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedMsg && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Message Details</h3>
              <button onClick={() => setSelectedMsg(null)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div><strong>From:</strong> {selectedMsg.name} ({selectedMsg.email})</div>
              {selectedMsg.phone && <div><strong>Phone:</strong> {selectedMsg.phone}</div>}
              <div><strong>Subject:</strong> {selectedMsg.subject}</div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', color: '#334155', lineHeight: 1.6 }}>
                {selectedMsg.message || selectedMsg.query}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => updateStatus(selectedMsg._id, 'Resolved')} className="admin-btn-primary">Mark as Resolved</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 13. ACADEMIC YEARS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function AcademicYearsModule({ toast, units, refreshYears }) {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newYearStr, setNewYearStr] = useState('');

  const loadYears = useCallback(() => {
    setLoading(true);
    api('/api/academic-years')
      .then(d => { setYears(d.data || []); setLoading(false); refreshYears?.(); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [refreshYears, toast]);

  useEffect(() => { loadYears(); }, [loadYears]);

  const handleAddYear = async (e) => {
    e.preventDefault();
    if (!newYearStr.trim()) return;
    try {
      const defaultUnit = units[0]?._id;
      if (!defaultUnit) { toast('Please create a chapter first.', 'error'); return; }
      await api('/api/academic-years', { method: 'POST', body: JSON.stringify({ unitId: defaultUnit, year: newYearStr }) });
      toast(`Academic year ${newYearStr} added.`);
      setNewYearStr('');
      loadYears();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Academic Years</h1>
          <p className="admin-module-subtitle">Configure academic sessions for youth formation cycles and team tenure tracking.</p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: 600 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Add New Academic Year</h3>
        <form onSubmit={handleAddYear} style={{ display: 'flex', gap: '0.75rem' }}>
          <input required placeholder="e.g. 2026-27" value={newYearStr} onChange={e => setNewYearStr(e.target.value)} className="admin-input" style={{ flex: 1 }} />
          <button type="submit" className="admin-btn-primary">Add Year</button>
        </form>
      </div>

      <div className="admin-table-container" style={{ maxWidth: 600 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 size={24} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Academic Session</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {years.map(y => (
                <tr key={y._id}>
                  <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{y.year}</td>
                  <td>
                    <span className="admin-badge badge-active">{y.status || 'Active'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 14. ADMIN SETTINGS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function SettingsModule({ toast, admin }) {
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('New passwords do not match.', 'error');
      return;
    }
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      toast('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Admin Account Settings</h1>
          <p className="admin-module-subtitle">Security settings and platform credentials.</p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: 550 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Change Administrator Password
        </h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="admin-input-group">
            <label className="admin-label">Current Password</label>
            <input type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="admin-input" />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">New Password</label>
            <input type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="admin-input" />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Confirm New Password</label>
            <input type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="admin-input" />
          </div>
          <button type="submit" className="admin-btn-primary" style={{ alignSelf: 'flex-start' }}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
