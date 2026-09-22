import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BookOpen, Calendar,
  Sparkles, Image, FileText, HelpCircle, HeartHandshake,
  Building, MessageSquare, CalendarDays, Settings, LogOut,
  Plus, Check, AlertCircle, Edit, Trash2, ShieldCheck,
  Filter, Search, X, Loader2, ArrowRight, Eye, Download,
  CheckCircle2, Clock, Globe, User, GraduationCap, Phone, Mail, MapPin, RefreshCw,
  ArrowUp, ArrowDown, ChevronUp, ChevronDown, Upload, ExternalLink
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
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      if (res.status === 413) throw new Error('File or payload is too large (Request Entity Too Large).');
      throw new Error(`Server error (${res.status}): ${text.slice(0, 120) || res.statusText}`);
    }
    throw new Error('Invalid response from server.');
  }
  if (!res.ok) throw new Error(data?.message || 'Request failed');
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

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

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
        { id: 'teams',      label: 'Teams & Leads',   icon: Users },
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
          {activeTab === 'programs'       && <ProgramsModule toast={showToast} units={units} academicYears={academicYears} />}
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
    { label: 'Active Chapters', count: stats?.totalUnits || units.length, icon: Building2, color: 'var(--primary-blue)', tab: 'chapters' },
    { label: 'Total Events', count: stats?.totalEvents || 0, icon: Calendar, color: '#059669', tab: 'events' },
    { label: 'Pending Applications', count: stats?.pendingJoinRequests || 0, icon: HeartHandshake, color: '#D97706', tab: 'join-apps' },
    { label: 'Unread Enquiries', count: stats?.newMessages || 0, icon: MessageSquare, color: 'var(--primary-pink)', tab: 'enquiries' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {statCards.map((sc, i) => {
          const IconComp = sc.icon;
          return (
            <div key={i} className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab(sc.tab)}>
              <div style={{ width: 50, height: 50, borderRadius: '0.75rem', backgroundColor: `${sc.color}15`, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{sc.count}</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', marginTop: '0.25rem' }}>{sc.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Recent Join Requests</h3>
            <button onClick={() => setActiveTab('join-apps')} className="admin-btn-action">View All &rarr;</button>
          </div>
          {(!stats?.recentJoinRequests || stats.recentJoinRequests.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No recent applications.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>College</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentJoinRequests.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 700 }}>{r.name}</td>
                    <td>{r.college}</td>
                    <td>
                      <span className={`admin-badge ${r.status === 'Approved' || r.status === 'Accepted' ? 'badge-approved' : r.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {r.status || 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(r.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', institution: '', location: '', description: '', status: 'Active' });

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
    setForm({ name: u.name, code: u.code, institution: u.institution || '', location: u.location || '', description: u.description || '', status: u.status || 'Active' });
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
                <textarea rows={3} placeholder="Chapter description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="admin-textarea" />
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
// 3. TEAMS MODULE (Persistent Display Order & Full Member CRUD)
// ═════════════════════════════════════════════════════════════════════════════
function TeamsModule({ toast, units, academicYears }) {
  const [selectedUnit, setSelectedUnit] = useState(units[0]?._id || 'all');
  const [teams, setTeams] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('Executive Board');
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [memberForm, setMemberForm] = useState({ 
    name: '', 
    section: 'Team Member',
    position: 'First Lead', 
    department: '', 
    organization: '',
    batchYear: '', 
    biography: '', 
    displayOrder: 0 
  });
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

  const openAddMember = (teamId) => {
    setActiveTeamId(teamId);
    setEditingMember(null);
    setMemberForm({ 
      name: '', 
      section: 'Team Member',
      position: 'First Lead', 
      department: '', 
      organization: '',
      batchYear: '', 
      biography: '', 
      displayOrder: (membersMap[teamId] || []).length 
    });
    setMemberPhoto(null);
    setShowMemberModal(true);
  };

  const openEditMember = (teamId, m) => {
    setActiveTeamId(teamId);
    setEditingMember(m);
    setMemberForm({ 
      name: m.name || '', 
      section: m.section || (/animator|faculty advisor|mentor/i.test(m.position) ? 'Main Animator' : 'Team Member'),
      position: m.position || '', 
      department: m.department || '', 
      organization: m.organization || m.department || '',
      batchYear: m.batchYear || '', 
      biography: m.biography || '', 
      displayOrder: m.displayOrder ?? 0 
    });
    setMemberPhoto(null);
    setShowMemberModal(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.position) {
      toast('Member Name and Position are required.', 'error');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('name', memberForm.name);
      fd.append('section', memberForm.section);
      fd.append('position', memberForm.position);
      fd.append('organization', memberForm.organization || memberForm.department || '');
      fd.append('department', memberForm.organization || memberForm.department || '');
      fd.append('batchYear', memberForm.batchYear || '');
      fd.append('biography', memberForm.biography || '');
      fd.append('displayOrder', memberForm.displayOrder ?? 0);
      if (memberPhoto) fd.append('photo', memberPhoto);

      let url = editingMember ? `/api/teams/members/${editingMember._id}` : `/api/teams/${activeTeamId}/members`;
      let method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast(editingMember ? `Updated ${memberForm.name}.` : `Added ${memberForm.name} to team.`);
      setShowMemberModal(false);
      setEditingMember(null);
      setMemberPhoto(null);
      loadTeamsAndMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleMoveMember = async (teamId, index, direction) => {
    const list = [...(membersMap[teamId] || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap elements
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    // Update local state immediately for instant feedback
    setMembersMap({ ...membersMap, [teamId]: list });

    // Prepare payload with new displayOrder values
    const items = list.map((m, idx) => ({ id: m._id, displayOrder: idx }));

    try {
      await api('/api/teams/members/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items })
      });
      toast('Display order updated.');
    } catch (e) {
      toast('Failed to save order: ' + e.message, 'error');
      loadTeamsAndMembers();
    }
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
          <p className="admin-module-subtitle">Directly manage chapter team rosters, Main Animators, and student leads displayed on the public /teams page.</p>
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
                    onClick={() => openAddMember(team._id)}
                    className="admin-btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                  >
                    <Plus size={14} /> Add Team Member
                  </button>
                </div>

                {/* Members list with persistent reordering */}
                {teamMembers.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontStyle: 'italic', margin: '1rem 0' }}>
                    No members added to this team yet. Use the "Add Team Member" button to add animators and student leads.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {teamMembers.map((m, idx) => {
                      const isAnimator = m.section === 'Main Animator' || /^(main\s+)?animator|faculty\s+advisor|mentor/i.test(m.position);
                      return (
                        <div key={m._id} style={{ backgroundColor: '#F8FAFC', border: `1.5px solid ${isAnimator ? '#FDA4AF' : 'var(--border-color)'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', width: '20px' }}>
                              #{idx + 1}
                            </span>
                            {m.photo ? (
                              <img src={m.photo} alt={m.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: isAnimator ? '#FFF1F2' : '#F0F9FF', color: isAnimator ? 'var(--primary-pink)' : 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                                {m.name?.[0] || 'M'}
                              </div>
                            )}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.name}</span>
                                {isAnimator && (
                                  <span style={{ fontSize: '0.625rem', fontWeight: 900, backgroundColor: '#FFE4E6', color: '#BE123C', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    ANIMATOR
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isAnimator ? 'var(--primary-pink)' : 'var(--primary-blue)', textTransform: 'uppercase' }}>
                                {m.position}
                              </div>
                              {(m.organization || m.department) && (
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                  {m.organization || m.department}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {/* Reorder Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button 
                                onClick={() => handleMoveMember(team._id, idx, 'up')} 
                                disabled={idx === 0} 
                                className="admin-btn-action" 
                                style={{ padding: '0.2rem', opacity: idx === 0 ? 0.3 : 1 }} 
                                title="Move Up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button 
                                onClick={() => handleMoveMember(team._id, idx, 'down')} 
                                disabled={idx === teamMembers.length - 1} 
                                className="admin-btn-action" 
                                style={{ padding: '0.2rem', opacity: idx === teamMembers.length - 1 ? 0.3 : 1 }} 
                                title="Move Down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>

                            <button onClick={() => openEditMember(team._id, m)} className="admin-btn-action" style={{ padding: '0.4rem' }} title="Edit Member">
                              <Edit size={13} />
                            </button>
                            <button onClick={() => handleDeleteMember(m._id)} className="admin-btn-danger" style={{ padding: '0.4rem' }} title="Remove Member">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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

      {/* Add / Edit Member Modal */}
      {showMemberModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingMember ? 'Edit Team Member' : 'Add Team Member / Lead'}
              </h3>
              <button onClick={() => setShowMemberModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Full Name *</label>
                <input required placeholder="e.g. Lokesh Sai or Dr. Name" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="admin-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Section *</label>
                  <select 
                    value={memberForm.section} 
                    onChange={e => {
                      const sec = e.target.value;
                      setMemberForm({ 
                        ...memberForm, 
                        section: sec,
                        position: sec === 'Main Animator' ? 'Main Animator' : (memberForm.position === 'Main Animator' ? 'First Lead' : memberForm.position)
                      });
                    }} 
                    className="admin-select"
                  >
                    <option value="Main Animator">MAIN ANIMATOR</option>
                    <option value="Team Member">TEAM MEMBER</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Role / Position Title *</label>
                  <input required placeholder="e.g. Main Animator, First Lead, President" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} className="admin-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Organization / College / Dept</label>
                  <input placeholder="e.g. ALIET or EEE Department" value={memberForm.organization || memberForm.department} onChange={e => setMemberForm({ ...memberForm, organization: e.target.value, department: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Display Order (Optional)</label>
                  <input type="number" value={memberForm.displayOrder} onChange={e => setMemberForm({ ...memberForm, displayOrder: parseInt(e.target.value, 10) || 0 })} className="admin-input" />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Biography / Role Summary</label>
                <textarea rows={2} placeholder="Brief summary of member responsibilities..." value={memberForm.biography} onChange={e => setMemberForm({ ...memberForm, biography: e.target.value })} className="admin-textarea" />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Photo Upload (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setMemberPhoto(e.target.files?.[0] || null)} className="admin-input" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">{editingMember ? 'Save Changes' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. FLAGSHIP PROGRAMS MODULE (Connected to /api/events)
// ═════════════════════════════════════════════════════════════════════════════
function ProgramsModule({ toast, units, academicYears }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [progForm, setProgForm] = useState({ title: '', category: 'Flagship Initiative', description: '', unitId: '', academicYearId: '', status: 'Upcoming' });

  const loadPrograms = useCallback(() => {
    setLoading(true);
    api('/api/events')
      .then(d => { setPrograms(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadPrograms(); }, [loadPrograms]);

  const openAdd = () => {
    setEditingProg(null);
    setProgForm({
      title: '',
      category: 'Flagship Initiative',
      description: '',
      unitId: units[0]?._id || '',
      academicYearId: academicYears[0]?._id || '',
      status: 'Upcoming'
    });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProg(p);
    setProgForm({
      title: p.title,
      category: p.category || 'Flagship Initiative',
      description: p.description || '',
      unitId: p.unitId?._id || p.unitId?.id || units[0]?._id || '',
      academicYearId: p.academicYearId?._id || p.academicYearId?.id || academicYears[0]?._id || '',
      status: p.status || 'Upcoming'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!progForm.title || !progForm.unitId || !progForm.academicYearId) {
      toast('Title, Chapter, and Academic Year are required.', 'error');
      return;
    }
    try {
      if (editingProg) {
        await api(`/api/events/${editingProg._id}`, { method: 'PUT', body: JSON.stringify(progForm) });
        toast('Program updated.');
      } else {
        await api('/api/events', { method: 'POST', body: JSON.stringify(progForm) });
        toast('Program created.');
      }
      setShowModal(false);
      loadPrograms();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this program?')) return;
    try {
      await api(`/api/events/${id}`, { method: 'DELETE' });
      toast('Program deleted.');
      loadPrograms();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Flagship Programs &amp; Initiatives</h1>
          <p className="admin-module-subtitle">Manage official programs, community campaigns, and campus events displayed across the public portal.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add Program
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : programs.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No programs recorded yet. Click "+ Add Program" to create one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {programs.map(p => (
            <div key={p._id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="admin-badge" style={{ backgroundColor: '#F0F9FF', color: 'var(--primary-blue)' }}>{p.category}</span>
                  <span className={`admin-badge ${p.status === 'Completed' ? 'badge-approved' : 'badge-active'}`}>
                    {p.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6 }}>{p.description || 'No detailed description.'}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                <button onClick={() => openEdit(p)} className="admin-btn-action"><Edit size={13} /> Edit</button>
                <button onClick={() => handleDelete(p._id)} className="admin-btn-danger"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingProg ? 'Edit Program' : 'Add Flagship Program'}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Program Title *</label>
                <input required value={progForm.title} onChange={e => setProgForm({ ...progForm, title: e.target.value })} className="admin-input" placeholder="e.g. Project Shiksha" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter *</label>
                  <select value={progForm.unitId} onChange={e => setProgForm({ ...progForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year *</label>
                  <select value={progForm.academicYearId} onChange={e => setProgForm({ ...progForm, academicYearId: e.target.value })} className="admin-select">
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Category</label>
                  <input placeholder="e.g. Education Outreach" value={progForm.category} onChange={e => setProgForm({ ...progForm, category: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <select value={progForm.status} onChange={e => setProgForm({ ...progForm, status: e.target.value })} className="admin-select">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description &amp; Impact</label>
                <textarea rows={3} required value={progForm.description} onChange={e => setProgForm({ ...progForm, description: e.target.value })} className="admin-textarea" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
  const [eventForm, setEventForm] = useState({ title: '', category: 'Event', date: '', venue: '', description: '', unitId: units[0]?._id || '', academicYearId: academicYears[0]?._id || '' });

  const loadEvents = useCallback(() => {
    setLoading(true);
    api('/api/events')
      .then(d => { setEvents(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.unitId || !eventForm.academicYearId) {
      toast('Title, Chapter, and Academic Year are required.', 'error');
      return;
    }
    try {
      await api('/api/events', { method: 'POST', body: JSON.stringify(eventForm) });
      toast('Event saved.');
      setShowModal(false);
      loadEvents();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api(`/api/events/${id}`, { method: 'DELETE' });
      toast('Event deleted.');
      loadEvents();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Events &amp; Exposure Camps</h1>
          <p className="admin-module-subtitle">Record and schedule youth workshops, rural immersion camps, and leadership summits.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="admin-btn-primary">
          <Plus size={16} /> Add Event
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No events recorded.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Chapter</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ev.title}</td>
                  <td>{ev.unitId?.name || '—'}</td>
                  <td>{ev.category}</td>
                  <td>{ev.date || '—'}</td>
                  <td><span className="admin-badge badge-active">{ev.status || 'Upcoming'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(ev._id)} className="admin-btn-danger">
                      <Trash2 size={13} /> Delete
                    </button>
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
                  <input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="admin-input" />
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
// 6. STORIES MODULE (Connected directly to /api/testimonials CRUD)
// ═════════════════════════════════════════════════════════════════════════════
function StoriesModule({ toast, units }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyForm, setStoryForm] = useState({
    title: '',
    author: '',
    unit: '',
    category: 'Leadership Journey',
    excerpt: '',
    fullStory: '',
    tag: 'Conscience & Action',
    isFeatured: true
  });

  const loadStories = useCallback(() => {
    setLoading(true);
    api('/api/testimonials')
      .then(d => { setStories(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadStories(); }, [loadStories]);

  const openAdd = () => {
    setEditingStory(null);
    setStoryForm({
      title: '',
      author: '',
      unit: units[0]?.name || 'Student Member',
      category: 'Leadership Journey',
      excerpt: '',
      fullStory: '',
      tag: 'Conscience & Action',
      isFeatured: true
    });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingStory(s);
    setStoryForm({
      title: s.title || '',
      author: s.author || s.name || '',
      unit: s.unit || s.role || '',
      category: s.category || 'Student Experience',
      excerpt: s.excerpt || s.quote || '',
      fullStory: s.fullStory || s.full_story || s.quote || '',
      tag: s.tag || 'Verified Story',
      isFeatured: s.isFeatured ?? s.is_featured ?? true
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!storyForm.author || !storyForm.excerpt) {
      toast('Author name and excerpt are required.', 'error');
      return;
    }
    try {
      if (editingStory) {
        await api(`/api/testimonials/${editingStory._id || editingStory.id}`, {
          method: 'PUT',
          body: JSON.stringify(storyForm)
        });
        toast('Story updated successfully.');
      } else {
        await api('/api/testimonials', {
          method: 'POST',
          body: JSON.stringify(storyForm)
        });
        toast('Story created successfully.');
      }
      setShowModal(false);
      loadStories();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this story?')) return;
    try {
      await api(`/api/testimonials/${id}`, { method: 'DELETE' });
      toast('Story deleted.');
      loadStories();
    } catch (e) { toast(e.message, 'error'); }
  };

  const toggleFeatured = async (s) => {
    try {
      const newStatus = !(s.isFeatured ?? s.is_featured);
      await api(`/api/testimonials/${s._id || s.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isFeatured: newStatus })
      });
      toast('Featured status updated.');
      loadStories();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Transformation Stories</h1>
          <p className="admin-module-subtitle">Manage student voice testimonials and inspirational changemaker journeys displayed on /stories.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add Story
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : stories.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No transformation stories added yet. Click "+ Add Story" to create one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {stories.map(s => (
            <div key={s._id || s.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="admin-badge" style={{ backgroundColor: '#F0F9FF', color: 'var(--primary-blue)' }}>
                    {s.category || 'Story'}
                  </span>
                  <button 
                    onClick={() => toggleFeatured(s)}
                    className={`admin-badge ${s.isFeatured || s.is_featured ? 'badge-featured' : 'badge-archived'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {s.isFeatured || s.is_featured ? '★ Featured' : 'Normal'}
                  </button>
                </div>
                {s.title && <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{s.title}</h3>}
                <p style={{ fontStyle: 'italic', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  "{s.excerpt || s.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '0.875rem' }}>{s.author || s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{s.unit || s.role}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button onClick={() => openEdit(s)} className="admin-btn-action" style={{ padding: '0.35rem' }}><Edit size={13} /></button>
                  <button onClick={() => handleDelete(s._id || s.id)} className="admin-btn-danger" style={{ padding: '0.35rem' }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingStory ? 'Edit Transformation Story' : 'Add Transformation Story'}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Story Title *</label>
                <input required placeholder="e.g. From Passive Student to Community Advocate" value={storyForm.title} onChange={e => setStoryForm({ ...storyForm, title: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Student Name / Author *</label>
                  <input required placeholder="e.g. Student Coordinator" value={storyForm.author} onChange={e => setStoryForm({ ...storyForm, author: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Chapter / Unit *</label>
                  <input required placeholder="e.g. ALIET Chapter" value={storyForm.unit} onChange={e => setStoryForm({ ...storyForm, unit: e.target.value })} className="admin-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Category</label>
                  <input placeholder="e.g. Leadership Journey" value={storyForm.category} onChange={e => setStoryForm({ ...storyForm, category: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Tag</label>
                  <input placeholder="e.g. Conscience & Action" value={storyForm.tag} onChange={e => setStoryForm({ ...storyForm, tag: e.target.value })} className="admin-input" />
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Short Excerpt (2–3 lines) *</label>
                <textarea rows={2} required placeholder="Brief highlight displayed on the card..." value={storyForm.excerpt} onChange={e => setStoryForm({ ...storyForm, excerpt: e.target.value })} className="admin-textarea" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Full Narrative Story</label>
                <textarea rows={4} placeholder="Complete reflection story opened in modal reader..." value={storyForm.fullStory} onChange={e => setStoryForm({ ...storyForm, fullStory: e.target.value })} className="admin-textarea" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">{editingStory ? 'Save Changes' : 'Create Story'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. GALLERY & MEDIA MODULE (Multi-photo upload & delete)
// ═════════════════════════════════════════════════════════════════════════════
function GalleryModule({ toast, units, academicYears }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ unitId: units[0]?._id || '', academicYearId: academicYears[0]?._id || '', album: 'General', category: 'Events', title: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const loadPhotos = useCallback(() => {
    setLoading(true);
    api('/api/gallery')
      .then(d => { setPhotos(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      toast('Please select at least one photo.', 'error');
      return;
    }
    if (!galleryForm.unitId || !galleryForm.academicYearId) {
      toast('Chapter and Academic Year are required.', 'error');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('unitId', galleryForm.unitId);
      fd.append('academicYearId', galleryForm.academicYearId);
      fd.append('album', galleryForm.album);
      fd.append('category', galleryForm.category);
      fd.append('title', galleryForm.title);
      fd.append('description', galleryForm.description);
      for (let i = 0; i < selectedFiles.length; i++) {
        fd.append('photos', selectedFiles[i]);
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast(`${selectedFiles.length} photo(s) uploaded successfully.`);
      setShowModal(false);
      setSelectedFiles([]);
      loadPhotos();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

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
          <p className="admin-module-subtitle">Manage high-resolution photo archives and media publications from chapters displayed on /media.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="admin-btn-primary">
          <Upload size={16} /> Upload Media Photos
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : photos.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No gallery images uploaded yet. Click "+ Upload Media Photos" above to add pictures.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {photos.map(p => (
            <div key={p._id} className="admin-card" style={{ padding: '0.75rem', position: 'relative' }}>
              <img src={p.file_path || p.filePath || p.url} alt={p.caption || p.title || 'Gallery'} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {p.title || p.caption || 'Event Photo'}
              </div>
              <button onClick={() => handleDelete(p._id)} className="admin-btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                <Trash2 size={13} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Upload Gallery Media</h3>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter *</label>
                  <select value={galleryForm.unitId} onChange={e => setGalleryForm({ ...galleryForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year *</label>
                  <select value={galleryForm.academicYearId} onChange={e => setGalleryForm({ ...galleryForm, academicYearId: e.target.value })} className="admin-select">
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Album Name</label>
                  <input placeholder="e.g. Rural Immersion 2026" value={galleryForm.album} onChange={e => setGalleryForm({ ...galleryForm, album: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <input placeholder="e.g. Events, Camps, Formation" value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} className="admin-input" />
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Caption / Title</label>
                <input placeholder="e.g. Orientation workshop at Andhra Loyola" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Select Photos (Max 30) *</label>
                <input type="file" multiple accept="image/*" required onChange={e => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary" disabled={uploading}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={uploading}>
                  {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : 'Upload Photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. RESOURCES & DOCUMENTS MODULE (Complete Upload, Edit, Download, Delete)
// ═════════════════════════════════════════════════════════════════════════════
function ResourcesModule({ toast, units, academicYears }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [docForm, setDocForm] = useState({
    title: '',
    description: '',
    documentType: 'Institutional Guide',
    visibility: 'Public',
    unitId: units[0]?._id || '',
    academicYearId: academicYears[0]?._id || ''
  });
  const [fileToUpload, setFileToUpload] = useState(null);

  const loadDocs = useCallback(() => {
    setLoading(true);
    api('/api/documents/admin/all')
      .then(d => { setDocs(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!fileToUpload) {
      toast('Please select a file to upload.', 'error');
      return;
    }
    if (!docForm.title || !docForm.unitId || !docForm.academicYearId) {
      toast('Title, Chapter, and Academic Year are required.', 'error');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', docForm.title);
      fd.append('description', docForm.description);
      fd.append('documentType', docForm.documentType);
      fd.append('visibility', docForm.visibility);
      fd.append('unitId', docForm.unitId);
      fd.append('academicYearId', docForm.academicYearId);
      fd.append('file', fileToUpload);

      const res = await fetch('/api/documents', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast(`Document "${docForm.title}" uploaded successfully.`);
      setShowUploadModal(false);
      setFileToUpload(null);
      setDocForm({
        title: '',
        description: '',
        documentType: 'Institutional Guide',
        visibility: 'Public',
        unitId: units[0]?._id || '',
        academicYearId: academicYears[0]?._id || ''
      });
      loadDocs();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const [replaceFile, setReplaceFile] = useState(null);

  const openEdit = (d) => {
    setEditingDoc(d);
    setReplaceFile(null);
    setDocForm({
      title: d.title,
      description: d.description || '',
      documentType: d.documentType || d.document_type || 'Institutional Guide',
      visibility: d.visibility || 'Public',
      unitId: d.unitId?._id || d.unitId?.id || units[0]?._id || '',
      academicYearId: d.academicYearId?._id || d.academicYearId?.id || academicYears[0]?._id || ''
    });
    setShowEditModal(true);
  };

  const handleEditDoc = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (replaceFile) {
        const fd = new FormData();
        fd.append('title', docForm.title);
        fd.append('description', docForm.description);
        fd.append('documentType', docForm.documentType);
        fd.append('visibility', docForm.visibility);
        fd.append('unitId', docForm.unitId);
        fd.append('academicYearId', docForm.academicYearId);
        fd.append('file', replaceFile);

        const res = await fetch(`/api/documents/${editingDoc._id || editingDoc.id}`, {
          method: 'PUT',
          credentials: 'include',
          body: fd
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error(res.status === 413 ? 'File too large.' : 'Server error'); }
        if (!data.success) throw new Error(data.message || 'Update failed');
      } else {
        await api(`/api/documents/${editingDoc._id || editingDoc.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: docForm.title,
            description: docForm.description,
            documentType: docForm.documentType,
            visibility: docForm.visibility,
            unitId: docForm.unitId,
            academicYearId: docForm.academicYearId
          })
        });
      }
      toast('Document updated successfully.');
      setShowEditModal(false);
      setEditingDoc(null);
      setReplaceFile(null);
      loadDocs();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api(`/api/documents/${id}`, { method: 'DELETE' });
      toast('Document deleted.');
      loadDocs();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Resources, Guides &amp; Toolkits</h1>
          <p className="admin-module-subtitle">Upload official formation materials, annual magazines, and chapter guidelines displayed on /resources.</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="admin-btn-primary">
          <Upload size={16} /> Upload New Document
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            No documents uploaded yet. Click "+ Upload New Document" to add files.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Chapter / Year</th>
                <th>Visibility</th>
                <th>Uploaded</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d._id || d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.title}</td>
                  <td>{d.documentType || d.document_type || 'Guide'}</td>
                  <td>{d.unitId?.name || 'All'} &bull; {d.academicYearId?.year || 'Current'}</td>
                  <td>
                    <span className={`admin-badge ${d.visibility === 'Public' ? 'badge-approved' : 'badge-archived'}`}>
                      {d.visibility || 'Public'}
                    </span>
                  </td>
                  <td>{d.created_at || d.createdAt ? new Date(d.created_at || d.createdAt).toLocaleDateString() : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      {d.filePath && (
                        <a href={d.filePath} target="_blank" rel="noopener noreferrer" className="admin-btn-action" title="Open Document">
                          <ExternalLink size={13} /> Open
                        </a>
                      )}
                      <button onClick={() => openEdit(d)} className="admin-btn-action" title="Edit Metadata">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(d._id || d.id)} className="admin-btn-danger" title="Delete Document">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Upload Document / Toolkit</h3>
              <button onClick={() => setShowUploadModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleUploadDoc} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Document Title *</label>
                <input required placeholder="e.g. MAGIC Youth Handbook 2026" value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter *</label>
                  <select value={docForm.unitId} onChange={e => setDocForm({ ...docForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year *</label>
                  <select value={docForm.academicYearId} onChange={e => setDocForm({ ...docForm, academicYearId: e.target.value })} className="admin-select">
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Document Category</label>
                  <select value={docForm.documentType} onChange={e => setDocForm({ ...docForm, documentType: e.target.value })} className="admin-select">
                    <option value="Student Leadership & Formation">Student Leadership &amp; Formation</option>
                    <option value="Publications & Reports">Publications &amp; Reports</option>
                    <option value="Institutional Guide">Institutional Guide</option>
                    <option value="Operational Toolkit">Operational Toolkit</option>
                    <option value="Facilitation Guide">Facilitation Guide</option>
                    <option value="Annual Publication">Annual Publication</option>
                    <option value="Program Framework">Program Framework</option>
                    <option value="Action Manual">Action Manual</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Visibility</label>
                  <select value={docForm.visibility} onChange={e => setDocForm({ ...docForm, visibility: e.target.value })} className="admin-select">
                    <option value="Public">Public (Visible on /resources)</option>
                    <option value="Admin Only">Admin Only (Internal)</option>
                  </select>
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description / Summary</label>
                <textarea rows={2} placeholder="Brief summary of the document..." value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} className="admin-textarea" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Select File (PDF, DOCX, PPTX, Images - Max 50MB) *</label>
                <input type="file" required onChange={e => setFileToUpload(e.target.files?.[0] || null)} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="admin-btn-secondary" disabled={uploading}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={uploading}>
                  {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Metadata Modal */}
      {showEditModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Document Details</h3>
              <button onClick={() => setShowEditModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleEditDoc} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Document Title *</label>
                <input required value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter *</label>
                  <select value={docForm.unitId} onChange={e => setDocForm({ ...docForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year *</label>
                  <select value={docForm.academicYearId} onChange={e => setDocForm({ ...docForm, academicYearId: e.target.value })} className="admin-select">
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Category</label>
                  <select value={docForm.documentType} onChange={e => setDocForm({ ...docForm, documentType: e.target.value })} className="admin-select">
                    <option value="Student Leadership & Formation">Student Leadership &amp; Formation</option>
                    <option value="Publications & Reports">Publications &amp; Reports</option>
                    <option value="Institutional Guide">Institutional Guide</option>
                    <option value="Operational Toolkit">Operational Toolkit</option>
                    <option value="Facilitation Guide">Facilitation Guide</option>
                    <option value="Annual Publication">Annual Publication</option>
                    <option value="Program Framework">Program Framework</option>
                    <option value="Action Manual">Action Manual</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Visibility</label>
                  <select value={docForm.visibility} onChange={e => setDocForm({ ...docForm, visibility: e.target.value })} className="admin-select">
                    <option value="Public">Public (Visible on /resources)</option>
                    <option value="Admin Only">Admin Only (Internal)</option>
                  </select>
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description</label>
                <textarea rows={2} value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} className="admin-textarea" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Replace File (Optional, leave blank to keep current file)</label>
                <input type="file" onChange={e => setReplaceFile(e.target.files?.[0] || null)} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="admin-btn-secondary" disabled={uploading}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={uploading}>
                  {uploading ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
                    <span className={`admin-badge ${r.status === 'Accepted' || r.status === 'Approved' ? 'badge-approved' : r.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                      {r.status === 'Approved' || r.status === 'Accepted' ? 'Approved' : r.status || 'Pending'}
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
              <div>
                <strong>Current Status:</strong>{' '}
                <span className={`admin-badge ${selectedReq.status === 'Accepted' || selectedReq.status === 'Approved' ? 'badge-approved' : selectedReq.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                  {selectedReq.status || 'Pending'}
                </span>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <strong>Reason for Joining:</strong>
                <p style={{ margin: '0.35rem 0 0', color: '#334155' }}>{selectedReq.reason}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => updateStatus(selectedReq._id, 'Approved')} className="admin-btn-primary" style={{ backgroundColor: '#166534' }}>Accept</button>
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api(`/api/contact/${id}`, { method: 'DELETE' });
      toast('Message deleted.');
      if (selectedMsg?._id === id) setSelectedMsg(null);
      loadMessages();
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
                  <td>{new Date(m.createdAt || m.created_at || Date.now()).toLocaleDateString()}</td>
                  <td>
                    <span className={`admin-badge ${m.status === 'Resolved' || m.status === 'Replied' ? 'badge-approved' : 'badge-pending'}`}>
                      {m.status || 'New'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button onClick={() => setSelectedMsg(m)} className="admin-btn-action">
                        <Eye size={13} /> View
                      </button>
                      <button onClick={() => handleDelete(m._id)} className="admin-btn-danger">
                        <Trash2 size={13} />
                      </button>
                    </div>
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
              <button onClick={() => handleDelete(selectedMsg._id)} className="admin-btn-danger">Delete Message</button>
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
