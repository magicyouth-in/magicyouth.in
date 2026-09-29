import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BookOpen, Calendar,
  Sparkles, Image, FileText, HelpCircle, HeartHandshake,
  Building, MessageSquare, CalendarDays, Settings, LogOut,
  Plus, Check, AlertCircle, Edit, Trash2, ShieldCheck,
  Filter, Search, X, Loader2, ArrowRight, Eye, EyeOff, Download,
  CheckCircle2, Clock, Globe, User, GraduationCap, Phone, Mail, MapPin, RefreshCw,
  ArrowUp, ArrowDown, ChevronUp, ChevronDown, Upload, ExternalLink, Layers, CreditCard, TrendingUp
} from 'lucide-react';
import magicLogo from '../../assets/magic-logo.png';
import FormattedText from '../../components/common/FormattedText';
import RichTextArea from '../../components/common/RichTextArea';
import '../../styles/admin.css';

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(url, opts = {}) {
  const headers = { ...opts.headers };
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const res = await fetch(url, {
    headers,
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
        { id: 'chapters',   label: 'Chapters',             icon: Building2 },
        { id: 'teams',      label: 'Teams & Leads',        icon: Users },
        { id: 'programs',   label: 'Programs',             icon: BookOpen },
        { id: 'events',     label: 'Events',               icon: Calendar },
        { id: 'stories',    label: 'Stories',              icon: Sparkles },
        { id: 'impact',     label: 'Impact & Outcomes',    icon: TrendingUp },
        { id: 'media',      label: 'Media & Publications', icon: Image },
        { id: 'faqs',       label: 'FAQs',                 icon: HelpCircle }
      ]
    },
    {
      group: 'MEMBER PORTAL',
      items: [
        { id: 'membership-drives', label: 'Membership Drives',  icon: Layers },
        { id: 'members',           label: 'Members',            icon: User },
        { id: 'member-announce',   label: 'Announcements',      icon: Globe },
        { id: 'member-certs',      label: 'Certificates',       icon: GraduationCap },
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
      group: 'SYSTEM & ACCESS',
      items: [
        { id: 'academic-years', label: 'Academic Years', icon: CalendarDays },
        ...(admin?.role === 'MAIN_ADMIN' ? [{ id: 'users', label: 'User Management', icon: ShieldCheck }] : []),
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
              <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>{admin?.role === 'MAIN_ADMIN' ? 'Apex Admin' : admin?.role?.replace('_', ' ') || 'Chapter Admin'}</div>
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
            <a href="/documentation" target="_blank" rel="noopener noreferrer" className="admin-btn-secondary" style={{ fontSize: '0.78125rem', padding: '0.4rem 0.9rem' }}>
              Private Archive <FileText size={13} />
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn-secondary" style={{ fontSize: '0.78125rem', padding: '0.4rem 0.9rem' }}>
              View Public Site <Globe size={13} />
            </a>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content-body">
          {activeTab === 'dashboard'      && <DashboardModule admin={admin} units={units} setActiveTab={setActiveTab} />}
          {activeTab === 'chapters'       && <ChaptersModule toast={showToast} refreshUnits={fetchGlobalData} admin={admin} />}
          {activeTab === 'teams'          && <TeamsModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'programs'       && <ProgramsModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'events'         && <EventsModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'stories'        && <StoriesModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'impact'         && <ImpactModule toast={showToast} units={units} academicYears={academicYears} />}
          {(activeTab === 'media' || activeTab === 'gallery' || activeTab === 'resources') && <MediaModule toast={showToast} units={units} academicYears={academicYears} />}
          {activeTab === 'faqs'           && <FaqModule toast={showToast} />}
          {activeTab === 'join-apps'      && <JoinApplicationsModule toast={showToast} units={units} admin={admin} />}
          {activeTab === 'chapter-apps'   && <ChapterApplicationsModule toast={showToast} />}
          {activeTab === 'enquiries'      && <EnquiriesModule toast={showToast} />}
          {activeTab === 'academic-years' && <AcademicYearsModule toast={showToast} units={units} refreshYears={fetchGlobalData} />}
          {activeTab === 'users'          && <UsersModule toast={showToast} units={units} admin={admin} />}
          {activeTab === 'settings'       && <SettingsModule toast={showToast} admin={admin} units={units} />}
          {activeTab === 'membership-drives' && <MembershipDrivesModule toast={showToast} units={units} academicYears={academicYears} admin={admin} />}
          {activeTab === 'members'        && <AdminMembersModule toast={showToast} units={units} academicYears={academicYears} admin={admin} />}
          {activeTab === 'member-announce' && <AdminMemberAnnouncementsModule toast={showToast} units={units} admin={admin} />}
          {activeTab === 'member-certs'   && <AdminMemberCertificatesModule toast={showToast} units={units} admin={admin} />}
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
function ChaptersModule({ toast, refreshUnits, admin }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', institution: '', location: '', description: '', status: 'Active', isDefault: false });

  const loadData = useCallback(() => {
    setLoading(true);
    api('/api/units?includeInactive=true')
      .then(d => { setUnits(d.data || []); setLoading(false); refreshUnits?.(); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [refreshUnits, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditingUnit(null);
    setForm({ name: '', code: '', institution: '', location: '', description: '', status: 'Active', isDefault: false });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUnit(u);
    setForm({
      name: u.name,
      code: u.code,
      institution: u.institution || '',
      location: u.location || '',
      description: u.description || '',
      status: u.status || 'Active',
      isDefault: !!(u.isDefault || u.is_default)
    });
    setShowModal(true);
  };

  const handleSetDefault = async (unitId, unitName) => {
    try {
      await api(`/api/units/${unitId}/set-default`, { method: 'PATCH' });
      toast(`Default unit set to ${unitName}. Public website now dynamically uses this unit.`);
      loadData();
    } catch (err) {
      toast(err.message, 'error');
    }
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
    u.location?.toLowerCase().includes(search.toLowerCase()) ||
    u.institution?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Collegiate Chapters &amp; Units</h1>
          <p className="admin-module-subtitle">Manage campus chapters, configure status, and set the default public unit dynamically.</p>
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
                <th>Default Unit</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isDef = !!(u.isDefault || u.is_default);
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{u.name}</span>
                        {isDef && (
                          <span style={{ fontSize: '0.6875rem', background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800 }}>
                            ★ Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>{u.code}</span></td>
                    <td>{u.institution || '—'}</td>
                    <td>{u.location || '—'}</td>
                    <td>
                      <span className={`admin-badge ${u.status === 'Active' ? 'badge-active' : u.status === 'Upcoming' ? 'badge-pending' : 'badge-archived'}`} style={{ backgroundColor: u.status === 'Upcoming' ? '#FEF3C7' : undefined, color: u.status === 'Upcoming' ? '#B45309' : undefined }}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {isDef ? (
                        <span style={{ fontSize: '0.8125rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Check size={14} /> Active Default
                        </span>
                      ) : admin?.role === 'MAIN_ADMIN' ? (
                        <button
                          onClick={() => handleSetDefault(u._id, u.name)}
                          className="admin-btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          title="Set this unit as the global default for the website"
                        >
                          Make Default
                        </button>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEdit(u)} className="admin-btn-action">
                        <Edit size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                    <option value="Active">Active (Accepts Applications)</option>
                    <option value="Upcoming">Upcoming (Under Formation)</option>
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
              {admin?.role === 'MAIN_ADMIN' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="isDefaultUnit"
                    checked={form.isDefault}
                    onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isDefaultUnit" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
                    Set as Default/Current Chapter for the Public Website
                  </label>
                </div>
              )}
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
// 3. TEAMS MODULE (Persistent Display Order, Full Member CRUD & Team Body Editing)
// ═════════════════════════════════════════════════════════════════════════════
function TeamsModule({ toast, units, academicYears }) {
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [teams, setTeams] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals state for Team Body
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [addTeamForm, setAddTeamForm] = useState({
    name: 'Executive Board',
    unitId: units[0]?._id || '',
    academicYearId: academicYears[0]?._id || '',
    status: 'Active'
  });

  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamForm, setEditTeamForm] = useState({
    name: '',
    unitId: '',
    academicYearId: '',
    status: 'Active'
  });
  const [teamSaving, setTeamSaving] = useState(false);

  // Modals state for Team Member
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

  // Update default form values when global data loads
  useEffect(() => {
    if (units.length > 0 && !addTeamForm.unitId) {
      setAddTeamForm(f => ({ ...f, unitId: units[0]._id }));
    }
    if (academicYears.length > 0 && !addTeamForm.academicYearId) {
      setAddTeamForm(f => ({ ...f, academicYearId: academicYears[0]._id }));
    }
  }, [units, academicYears]);

  const loadTeamsAndMembers = useCallback(async () => {
    setLoading(true);
    try {
      let q = '/api/teams';
      const params = [];
      if (selectedUnit !== 'all') params.push(`unitId=${selectedUnit}`);
      if (selectedYear !== 'all') params.push(`academicYearId=${selectedYear}`);
      if (params.length > 0) q += `?${params.join('&')}`;

      const res = await api(q);
      const list = res.data || [];
      setTeams(list);

      const memMap = {};
      await Promise.all(list.map(async t => {
        try {
          const m = await api(`/api/teams/${t._id || t.id}/members`);
          memMap[t._id || t.id] = m.data || [];
        } catch {
          memMap[t._id || t.id] = [];
        }
      }));
      setMembersMap(memMap);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedUnit, selectedYear, toast]);

  useEffect(() => {
    loadTeamsAndMembers();
  }, [loadTeamsAndMembers]);

  // Open Create Team Modal
  const openCreateTeamModal = () => {
    setAddTeamForm({
      name: 'Executive Board',
      unitId: selectedUnit !== 'all' ? selectedUnit : (units[0]?._id || ''),
      academicYearId: selectedYear !== 'all' ? selectedYear : (academicYears[0]?._id || ''),
      status: 'Active'
    });
    setShowAddTeam(true);
  };

  // Create Team Body Handler
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!addTeamForm.name || !addTeamForm.unitId || !addTeamForm.academicYearId) {
      toast('Team Name, Chapter, and Academic Year are required.', 'error');
      return;
    }
    setTeamSaving(true);
    try {
      await api('/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          unitId: addTeamForm.unitId,
          academicYearId: addTeamForm.academicYearId,
          name: addTeamForm.name,
          status: addTeamForm.status || 'Active'
        })
      });
      toast(`Team "${addTeamForm.name}" created successfully.`);
      setShowAddTeam(false);
      loadTeamsAndMembers();
    } catch (e) {
      toast(e.message || 'Failed to create team', 'error');
    } finally {
      setTeamSaving(false);
    }
  };

  // Open Edit Team Body Modal
  const openEditTeam = (team) => {
    setEditingTeam(team);
    setEditTeamForm({
      name: team.name || 'Executive Board',
      unitId: team.unitId?._id || team.unitId?.id || team.unit_id || units[0]?._id || '',
      academicYearId: team.academicYearId?._id || team.academicYearId?.id || team.academic_year_id || academicYears[0]?._id || '',
      status: team.status || 'Active'
    });
    setShowEditTeamModal(true);
  };

  // Save Edit Team Body Handler
  const handleSaveEditTeam = async (e) => {
    e.preventDefault();
    if (!editTeamForm.name || !editTeamForm.unitId || !editTeamForm.academicYearId) {
      toast('Team Name, Chapter, and Academic Year are required.', 'error');
      return;
    }
    setTeamSaving(true);
    try {
      await api(`/api/teams/${editingTeam._id || editingTeam.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editTeamForm.name,
          unitId: editTeamForm.unitId,
          academicYearId: editTeamForm.academicYearId,
          status: editTeamForm.status
        })
      });
      toast(`Team Body updated to "${editTeamForm.name}".`);
      setShowEditTeamModal(false);
      setEditingTeam(null);
      loadTeamsAndMembers();
    } catch (e) {
      toast(e.message || 'Failed to update team body', 'error');
    } finally {
      setTeamSaving(false);
    }
  };

  // Delete Team Body Handler
  const handleDeleteTeam = async (teamId, teamName) => {
    const memberCount = (membersMap[teamId] || []).length;
    const msg = memberCount > 0 
      ? `Are you sure you want to delete "${teamName}" and all ${memberCount} team members in it?`
      : `Are you sure you want to delete "${teamName}"?`;
    if (!confirm(msg)) return;
    try {
      await api(`/api/teams/${teamId}`, { method: 'DELETE' });
      toast(`Team "${teamName}" deleted.`);
      loadTeamsAndMembers();
    } catch (e) {
      toast(e.message || 'Failed to delete team', 'error');
    }
  };

  // Member Handlers
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
      experience: '',
      displayOrder: (membersMap[teamId] || []).length 
    });
    setMemberPhoto(null);
    setShowMemberModal(true);
  };

  const openEditMember = (teamId, m) => {
    setActiveTeamId(teamId);
    setEditingMember(m);
    const exp = m.experience || m.biography || '';
    setMemberForm({ 
      name: m.name || '', 
      section: (m.section === 'Animator' || m.section === 'Main Animator' || /animator|faculty advisor|mentor/i.test(m.position)) ? 'Animator' : 'Team Member',
      position: m.position || '', 
      department: m.department || m.organization || '', 
      organization: m.organization || m.department || '',
      batchYear: m.batchYear || '', 
      biography: exp, 
      experience: exp,
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
      const expValue = memberForm.experience !== undefined ? memberForm.experience : (memberForm.biography || '');
      fd.append('name', memberForm.name);
      fd.append('section', memberForm.section === 'Main Animator' ? 'Animator' : memberForm.section);
      fd.append('position', memberForm.position);
      fd.append('organization', memberForm.organization || memberForm.department || '');
      fd.append('department', memberForm.organization || memberForm.department || '');
      fd.append('batchYear', memberForm.batchYear || '');
      fd.append('biography', expValue);
      fd.append('experience', expValue);
      fd.append('displayOrder', memberForm.displayOrder ?? 0);
      if (memberPhoto) fd.append('photo', memberPhoto);

      let url = editingMember ? `/api/teams/members/${editingMember._id || editingMember.id}` : `/api/teams/${activeTeamId}/members`;
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
    const items = list.map((m, idx) => ({ id: m._id || m.id, displayOrder: idx }));

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
          <p className="admin-module-subtitle">Directly manage chapter team rosters, Animators, and student leads displayed on the public /teams page.</p>
        </div>
        <button onClick={openCreateTeamModal} className="admin-btn-primary">
          <Plus size={16} /> Create Team Body
        </button>
      </div>

      {/* Filter bar */}
      <div className="admin-card" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <label className="admin-label">Filter by Chapter</label>
          <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="admin-select" style={{ minWidth: 200 }}>
            <option value="all">All Chapters</option>
            {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>

        <div>
          <label className="admin-label">Filter by Academic Year</label>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="admin-select" style={{ minWidth: 200 }}>
            <option value="all">All Academic Years</option>
            {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={32} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : teams.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No leadership teams found for this selection. Click &quot;+ Create Team Body&quot; above to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {teams.map(team => {
            const teamId = team._id || team.id;
            const teamMembers = membersMap[teamId] || [];
            return (
              <div key={teamId} className="admin-card">
                {/* Team Body Header with Chapter, Academic Year & Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', backgroundColor: '#EFF6FF', padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {team.unitId?.name || 'CAMPUS'}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-pink)', backgroundColor: '#FFF1F2', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                        {team.academicYearId?.year || '2025-26'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                        {team.name}
                      </h3>
                      <button 
                        onClick={() => openEditTeam(team)} 
                        className="admin-btn-action" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78125rem', color: 'var(--primary-blue)', borderColor: 'rgba(2,132,199,0.3)' }}
                        title="Edit Team Body (Name, Academic Year, Chapter)"
                      >
                        <Edit size={13} /> Edit Team Body
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => openAddMember(teamId)}
                      className="admin-btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                    >
                      <Plus size={14} /> Add Team Member
                    </button>
                    {teamMembers.length === 0 && (
                      <button 
                        onClick={() => handleDeleteTeam(teamId, team.name)} 
                        className="admin-btn-danger" 
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }} 
                        title="Delete Empty Team Body"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Members list with persistent reordering */}
                {teamMembers.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontStyle: 'italic', margin: '1rem 0' }}>
                    No members added to this team yet. Use the &quot;Add Team Member&quot; button to add animators and student leads.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {teamMembers.map((m, idx) => {
                      const isAnimator = m.section === 'Animator' || m.section === 'Main Animator' || /^(main\s+)?animator|faculty\s+advisor|mentor/i.test(m.position);
                      const displayRole = m.position && /^main\s+animator$/i.test(m.position.trim()) ? 'ANIMATOR' : m.position;
                      return (
                        <div key={m._id || m.id} style={{ backgroundColor: '#F8FAFC', border: `1.5px solid ${isAnimator ? '#FDA4AF' : 'var(--border-color)'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                {displayRole}
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
                                onClick={() => handleMoveMember(teamId, idx, 'up')} 
                                disabled={idx === 0} 
                                className="admin-btn-action" 
                                style={{ padding: '0.2rem', opacity: idx === 0 ? 0.3 : 1 }} 
                                title="Move Up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button 
                                onClick={() => handleMoveMember(teamId, idx, 'down')} 
                                disabled={idx === teamMembers.length - 1} 
                                className="admin-btn-action" 
                                style={{ padding: '0.2rem', opacity: idx === teamMembers.length - 1 ? 0.3 : 1 }} 
                                title="Move Down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>

                            <button onClick={() => openEditMember(teamId, m)} className="admin-btn-action" style={{ padding: '0.4rem' }} title="Edit Member">
                              <Edit size={13} />
                            </button>
                            <button onClick={() => handleDeleteMember(m._id || m.id)} className="admin-btn-danger" style={{ padding: '0.4rem' }} title="Remove Member">
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CREATE TEAM BODY MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showAddTeam && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Create Team Body</h3>
              <button onClick={() => setShowAddTeam(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Chapter *</label>
                  <select value={addTeamForm.unitId} onChange={e => setAddTeamForm({ ...addTeamForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">Academic Year *</label>
                  <select value={addTeamForm.academicYearId} onChange={e => setAddTeamForm({ ...addTeamForm, academicYearId: e.target.value })} className="admin-select">
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Team Body Name *</label>
                <input required placeholder="e.g. Executive Board, Core Leadership Team" value={addTeamForm.name} onChange={e => setAddTeamForm({ ...addTeamForm, name: e.target.value })} className="admin-input" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddTeam(false)} className="admin-btn-secondary" disabled={teamSaving}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={teamSaving}>
                  {teamSaving ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : 'Create Team Body'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* EDIT TEAM BODY MODAL (Supports Editing Chapter, Year, and Name) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showEditTeamModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Team Body Details</h3>
              <button onClick={() => setShowEditTeamModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveEditTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Chapter *</label>
                  <select value={editTeamForm.unitId} onChange={e => setEditTeamForm({ ...editTeamForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">Academic Year * (Editable)</label>
                  <select value={editTeamForm.academicYearId} onChange={e => setEditTeamForm({ ...editTeamForm, academicYearId: e.target.value })} className="admin-select" style={{ borderColor: 'var(--primary-blue)', borderWidth: '2px' }}>
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Team Body Name * (Editable)</label>
                <input required placeholder="e.g. Executive Board, Core Leadership Team" value={editTeamForm.name} onChange={e => setEditTeamForm({ ...editTeamForm, name: e.target.value })} className="admin-input" />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Status</label>
                <select value={editTeamForm.status} onChange={e => setEditTeamForm({ ...editTeamForm, status: e.target.value })} className="admin-select">
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEditTeamModal(false)} className="admin-btn-secondary" disabled={teamSaving}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={teamSaving}>
                  {teamSaving ? <><Loader2 size={15} className="animate-spin" /> Saving Changes...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ADD / EDIT MEMBER MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
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
                        position: sec === 'Animator' ? 'ANIMATOR' : (memberForm.position === 'ANIMATOR' || memberForm.position === 'Main Animator' ? 'First Lead' : memberForm.position)
                      });
                    }} 
                    className="admin-select"
                  >
                    <option value="Animator">ANIMATOR</option>
                    <option value="Team Member">TEAM MEMBER</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Role / Position Title *</label>
                  <input required placeholder="e.g. ANIMATOR, First Lead, Secretary, President" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} className="admin-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Organization / College / Dept</label>
                  <input placeholder="e.g. ALIET or Mechanical Department" value={memberForm.organization || memberForm.department} onChange={e => setMemberForm({ ...memberForm, organization: e.target.value, department: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Display Order (Optional)</label>
                  <input type="number" value={memberForm.displayOrder} onChange={e => setMemberForm({ ...memberForm, displayOrder: parseInt(e.target.value, 10) || 0 })} className="admin-input" />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Experience &amp; Profile Details (Clickable on Teams page)</label>
                <textarea rows={3} placeholder="Enter the person's experience, background, responsibilities, or bio details displayed when clicking their profile card..." value={memberForm.experience || memberForm.biography} onChange={e => setMemberForm({ ...memberForm, experience: e.target.value, biography: e.target.value })} className="admin-textarea" />
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
// ═════════════════════════════════════════════════════════════════════════════
// 4. FLAGSHIP PROGRAMS MODULE (Connected to /api/programs)
// ═════════════════════════════════════════════════════════════════════════════
function ProgramsModule({ toast, units, academicYears }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const [progForm, setProgForm] = useState({
    title: '',
    category: 'Flagship Initiative',
    description: '',
    unitId: '',
    academicYearId: '',
    status: 'Ongoing'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const loadPrograms = useCallback(() => {
    setLoading(true);
    api('/api/programs?all=1')
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
      status: 'Ongoing'
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProg(p);
    setProgForm({
      title: p.title || '',
      category: p.category || 'Flagship Initiative',
      description: p.description || '',
      unitId: p.unitId?._id || p.unitId?.id || p.unitId || units[0]?._id || '',
      academicYearId: p.academicYearId?._id || p.academicYearId?.id || p.academicYearId || academicYears[0]?._id || '',
      status: p.status || 'Ongoing'
    });
    setImageFile(null);
    setImagePreview(p.poster || null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      toast('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast('Image file size exceeds the 25MB limit.', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!progForm.title) {
      toast('Program Title is required.', 'error');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', progForm.title);
      formData.append('category', progForm.category || 'Flagship Initiative');
      formData.append('description', progForm.description || '');
      if (progForm.unitId) formData.append('unitId', progForm.unitId);
      if (progForm.academicYearId) formData.append('academicYearId', progForm.academicYearId);
      formData.append('status', progForm.status || 'Ongoing');

      if (imageFile) {
        formData.append('poster', imageFile);
      } else if (removeImage) {
        formData.append('removePoster', 'true');
      }

      if (editingProg) {
        await api(`/api/programs/${editingProg._id || editingProg.id}`, { method: 'PUT', body: formData });
        toast('Program updated successfully.');
      } else {
        await api('/api/programs', { method: 'POST', body: formData });
        toast('Program created successfully.');
      }
      setShowModal(false);
      loadPrograms();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this program?')) return;
    try {
      await api(`/api/programs/${id}`, { method: 'DELETE' });
      toast('Program deleted.');
      loadPrograms();
    } catch (e) { toast(e.message, 'error'); }
  };

  const filtered = programs.filter(p => {
    if (statusFilter !== 'All' && (p.status || 'Ongoing').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (unitFilter !== 'All') {
      const uId = p.unitId?._id || p.unitId?.id || p.unitId;
      if (uId !== unitFilter) return false;
    }
    if (yearFilter !== 'All') {
      const yId = p.academicYearId?._id || p.academicYearId?.id || p.academicYearId;
      if (yId !== yearFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (p.title || '').toLowerCase().includes(q) ||
                    (p.category || '').toLowerCase().includes(q) ||
                    (p.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Flagship Programs &amp; Initiatives</h1>
          <p className="admin-module-subtitle">Manage recurring initiatives, mentorship series, and long-term youth projects.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add Program
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '130px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Statuses</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Past">Past</option>
        </select>
        <select
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '150px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Chapters</option>
          {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '140px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Academic Years</option>
          {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No programs found. Click "+ Add Program" to create one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(p => (
            <div key={p._id || p.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', padding: 0 }}>
              {p.poster ? (
                <div style={{ width: '100%', height: '170px', overflow: 'hidden', backgroundColor: '#0F172A', position: 'relative' }}>
                  <img src={p.poster} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '110px', background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={36} color="rgba(255,255,255,0.7)" />
                </div>
              )}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="admin-badge" style={{ backgroundColor: '#F0F9FF', color: 'var(--primary-blue)' }}>{p.category || 'Initiative'}</span>
                  <span className={`admin-badge ${p.status === 'Ongoing' ? 'badge-active' : p.status === 'Upcoming' ? 'badge-pending' : 'badge-approved'}`}>
                    {p.status || 'Ongoing'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.title}</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, flex: 1, marginBottom: '0.75rem' }}>
                  <FormattedText text={p.description || 'No detailed description.'} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                  {p.unitId?.name || (units.find(u => u._id === (p.unitId?._id || p.unitId))?.name) || 'All Chapters'} &bull; {p.academicYearId?.year || (academicYears.find(y => y._id === (p.academicYearId?._id || p.academicYearId))?.year) || 'All Years'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', backgroundColor: '#F8FAFC' }}>
                <button onClick={() => openEdit(p)} className="admin-btn-action"><Edit size={13} /> Edit</button>
                <button onClick={() => handleDelete(p._id || p.id)} className="admin-btn-danger"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingProg ? 'Edit Program' : 'Add Flagship Program'}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Program Title *</label>
                <input required value={progForm.title} onChange={e => setProgForm({ ...progForm, title: e.target.value })} className="admin-input" placeholder="e.g. Compassion Connect" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter</label>
                  <select value={progForm.unitId} onChange={e => setProgForm({ ...progForm, unitId: e.target.value })} className="admin-select">
                    <option value="">All Chapters (Organization-Wide)</option>
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year</label>
                  <select value={progForm.academicYearId} onChange={e => setProgForm({ ...progForm, academicYearId: e.target.value })} className="admin-select">
                    <option value="">All Academic Years</option>
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Category</label>
                  <input placeholder="e.g. Community Outreach" value={progForm.category} onChange={e => setProgForm({ ...progForm, category: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <select value={progForm.status} onChange={e => setProgForm({ ...progForm, status: e.target.value })} className="admin-select">
                    <option value="Ongoing">Ongoing</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past">Past / Completed</option>
                  </select>
                </div>
              </div>

              {/* Program Image Upload */}
              <div className="admin-input-group">
                <label className="admin-label">Program Cover Image (JPG, PNG, WEBP &bull; Max 25MB)</label>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #CBD5E1', marginBottom: '0.5rem' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <label style={{ background: '#0284C7', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Replace Image
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                      <button type="button" onClick={handleRemoveImage} style={{ background: '#BE123C', color: 'white', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed #CBD5E1', borderRadius: '0.5rem', backgroundColor: '#F8FAFC', cursor: 'pointer', textAlign: 'center' }}>
                    <Upload size={24} color="#0284C7" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Choose program image to upload</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Supports JPG, PNG, WEBP up to 25MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Rich Text Area with Bold Support */}
              <div className="admin-input-group">
                <RichTextArea
                  label="Description & Details (Select text and click [B] or press Ctrl+B to bold)"
                  rows={4}
                  required={true}
                  value={progForm.description}
                  onChange={e => setProgForm({ ...progForm, description: e.target.value })}
                />
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
// 5. EVENTS MODULE (Specific Dated Events with Image & Status Controls)
// ═════════════════════════════════════════════════════════════════════════════
function EventsModule({ toast, units, academicYears }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Workshop',
    date: '',
    time: '',
    venue: '',
    description: '',
    unitId: '',
    academicYearId: '',
    status: 'Upcoming'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const loadEvents = useCallback(() => {
    setLoading(true);
    api('/api/events?all=1')
      .then(d => { setEvents(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const openAdd = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      category: 'Workshop',
      date: new Date().toISOString().slice(0, 10),
      time: '',
      venue: '',
      description: '',
      unitId: units[0]?._id || '',
      academicYearId: academicYears[0]?._id || '',
      status: 'Upcoming'
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title || '',
      category: ev.category || 'Workshop',
      date: ev.date || '',
      time: ev.time || '',
      venue: ev.venue || '',
      description: ev.description || '',
      unitId: ev.unitId?._id || ev.unitId?.id || ev.unitId || units[0]?._id || '',
      academicYearId: ev.academicYearId?._id || ev.academicYearId?.id || ev.academicYearId || academicYears[0]?._id || '',
      status: ev.status || 'Upcoming'
    });
    setImageFile(null);
    setImagePreview(ev.poster || null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      toast('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast('Image file size exceeds the 25MB limit.', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!eventForm.title) {
      toast('Event Title is required.', 'error');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('category', eventForm.category || 'Workshop');
      formData.append('date', eventForm.date || '');
      formData.append('time', eventForm.time || '');
      formData.append('venue', eventForm.venue || '');
      formData.append('description', eventForm.description || '');
      if (eventForm.unitId) formData.append('unitId', eventForm.unitId);
      if (eventForm.academicYearId) formData.append('academicYearId', eventForm.academicYearId);
      formData.append('status', eventForm.status || 'Upcoming');

      if (imageFile) {
        formData.append('poster', imageFile);
      } else if (removeImage) {
        formData.append('removePoster', 'true');
      }

      if (editingEvent) {
        await api(`/api/events/${editingEvent._id || editingEvent.id}`, { method: 'PUT', body: formData });
        toast('Event updated successfully.');
      } else {
        await api('/api/events', { method: 'POST', body: formData });
        toast('Event created successfully.');
      }
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

  const filtered = events.filter(ev => {
    if (statusFilter !== 'All' && (ev.status || 'Upcoming').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (unitFilter !== 'All') {
      const uId = ev.unitId?._id || ev.unitId?.id || ev.unitId;
      if (uId !== unitFilter) return false;
    }
    if (yearFilter !== 'All') {
      const yId = ev.academicYearId?._id || ev.academicYearId?.id || ev.academicYearId;
      if (yId !== yearFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (ev.title || '').toLowerCase().includes(q) ||
                    (ev.venue || '').toLowerCase().includes(q) ||
                    (ev.category || '').toLowerCase().includes(q) ||
                    (ev.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Events &amp; Exposure Activities</h1>
          <p className="admin-module-subtitle">Record and schedule specific date-based workshops, campus activities, and seminars.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '130px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Past">Past</option>
        </select>
        <select
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '150px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Chapters</option>
          {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '140px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Academic Years</option>
          {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No events found. Click "+ Add Event" to schedule one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(ev => (
            <div key={ev._id || ev.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', padding: 0 }}>
              {ev.poster ? (
                <div style={{ width: '100%', height: '170px', overflow: 'hidden', backgroundColor: '#0F172A', position: 'relative' }}>
                  <img src={ev.poster} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '110px', background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={36} color="rgba(255,255,255,0.7)" />
                </div>
              )}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="admin-badge" style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}>{ev.category || 'Event'}</span>
                  <span className={`admin-badge ${ev.status === 'Upcoming' ? 'badge-pending' : ev.status === 'Ongoing' ? 'badge-active' : 'badge-approved'}`}>
                    {ev.status || 'Upcoming'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>{ev.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#64748B' }}>
                  {ev.date && <div>📅 <strong>Date:</strong> {ev.date}</div>}
                  {ev.time && <div>⏰ <strong>Time:</strong> {ev.time}</div>}
                  {ev.venue && <div>📍 <strong>Venue:</strong> {ev.venue}</div>}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, flex: 1, marginBottom: '0.75rem' }}>
                  <FormattedText text={ev.description || 'No detailed description.'} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                  {ev.unitId?.name || (units.find(u => u._id === (ev.unitId?._id || ev.unitId))?.name) || 'All Chapters'} &bull; {ev.academicYearId?.year || (academicYears.find(y => y._id === (ev.academicYearId?._id || ev.academicYearId))?.year) || 'All Years'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', backgroundColor: '#F8FAFC' }}>
                <button onClick={() => openEdit(ev)} className="admin-btn-action"><Edit size={13} /> Edit</button>
                <button onClick={() => handleDelete(ev._id || ev.id)} className="admin-btn-danger"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingEvent ? 'Edit Event' : 'Add Event / Activity'}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Event Title *</label>
                <input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="admin-input" placeholder="e.g. World Suicide Prevention Day Seminar" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter</label>
                  <select value={eventForm.unitId} onChange={e => setEventForm({ ...eventForm, unitId: e.target.value })} className="admin-select">
                    <option value="">All Chapters (Organization-Wide)</option>
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year</label>
                  <select value={eventForm.academicYearId} onChange={e => setEventForm({ ...eventForm, academicYearId: e.target.value })} className="admin-select">
                    <option value="">All Academic Years</option>
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Date</label>
                  <input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Time / Schedule</label>
                  <input placeholder="e.g. 10:00 AM - 1:00 PM" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} className="admin-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Venue / Location</label>
                  <input placeholder="e.g. Auditorium, ALIET" value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <input placeholder="e.g. Workshop, Seminar, Awareness" value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} className="admin-input" />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Status</label>
                <select value={eventForm.status} onChange={e => setEventForm({ ...eventForm, status: e.target.value })} className="admin-select">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Past">Past / Completed</option>
                </select>
              </div>

              {/* Event Image Upload */}
              <div className="admin-input-group">
                <label className="admin-label">Event Cover Image (JPG, PNG, WEBP &bull; Max 25MB)</label>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #CBD5E1', marginBottom: '0.5rem' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <label style={{ background: '#0284C7', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Replace Image
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                      <button type="button" onClick={handleRemoveImage} style={{ background: '#BE123C', color: 'white', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed #CBD5E1', borderRadius: '0.5rem', backgroundColor: '#F8FAFC', cursor: 'pointer', textAlign: 'center' }}>
                    <Upload size={24} color="#0284C7" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Choose event poster / image to upload</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Supports JPG, PNG, WEBP up to 25MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Rich Text Area with Bold Support */}
              <div className="admin-input-group">
                <RichTextArea
                  label="Description & Highlights (Select text and click [B] or press Ctrl+B to bold)"
                  rows={4}
                  required={false}
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
// 5B. IMPACT & OUTCOMES MODULE (Verified Statistics & Impact Stories)
// ═════════════════════════════════════════════════════════════════════════════
function ImpactModule({ toast, units, academicYears }) {
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImpact, setEditingImpact] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const [impactForm, setImpactForm] = useState({
    title: '',
    metricValue: '',
    description: '',
    unitId: '',
    academicYearId: '',
    status: 'Published'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const loadImpacts = useCallback(() => {
    setLoading(true);
    api('/api/impact?all=1')
      .then(d => { setImpacts(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadImpacts(); }, [loadImpacts]);

  const openAdd = () => {
    setEditingImpact(null);
    setImpactForm({
      title: '',
      metricValue: '',
      description: '',
      unitId: units[0]?._id || '',
      academicYearId: academicYears[0]?._id || '',
      status: 'Published'
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const openEdit = (imp) => {
    setEditingImpact(imp);
    setImpactForm({
      title: imp.title || '',
      metricValue: imp.metricValue || '',
      description: imp.description || '',
      unitId: imp.unitId?._id || imp.unitId?.id || imp.unitId || units[0]?._id || '',
      academicYearId: imp.academicYearId?._id || imp.academicYearId?.id || imp.academicYearId || academicYears[0]?._id || '',
      status: imp.status || 'Published'
    });
    setImageFile(null);
    setImagePreview(imp.poster || null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      toast('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast('Image file size exceeds the 25MB limit.', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!impactForm.title || !impactForm.metricValue) {
      toast('Title / Metric Label and Impact Number are required.', 'error');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', impactForm.title);
      formData.append('metricValue', impactForm.metricValue);
      formData.append('description', impactForm.description || '');
      if (impactForm.unitId) formData.append('unitId', impactForm.unitId);
      if (impactForm.academicYearId) formData.append('academicYearId', impactForm.academicYearId);
      formData.append('status', impactForm.status || 'Published');

      if (imageFile) {
        formData.append('poster', imageFile);
      } else if (removeImage) {
        formData.append('removePoster', 'true');
      }

      if (editingImpact) {
        await api(`/api/impact/${editingImpact._id || editingImpact.id}`, { method: 'PUT', body: formData });
        toast('Impact metric updated successfully.');
      } else {
        await api('/api/impact', { method: 'POST', body: formData });
        toast('Impact metric recorded successfully.');
      }
      setShowModal(false);
      loadImpacts();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this impact outcome?')) return;
    try {
      await api(`/api/impact/${id}`, { method: 'DELETE' });
      toast('Impact metric deleted.');
      loadImpacts();
    } catch (e) { toast(e.message, 'error'); }
  };

  const filtered = impacts.filter(imp => {
    if (statusFilter !== 'All' && (imp.status || 'Published').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (unitFilter !== 'All') {
      const uId = imp.unitId?._id || imp.unitId?.id || imp.unitId;
      if (uId !== unitFilter) return false;
    }
    if (yearFilter !== 'All') {
      const yId = imp.academicYearId?._id || imp.academicYearId?.id || imp.academicYearId;
      if (yId !== yearFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (imp.title || '').toLowerCase().includes(q) ||
                    (imp.metricValue || '').toLowerCase().includes(q) ||
                    (imp.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Impact Metrics &amp; Verified Outcomes</h1>
          <p className="admin-module-subtitle">Record quantitative achievements, lives touched, and ground impact metrics.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add Impact Metric
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search impact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '130px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '150px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Chapters</option>
          {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="admin-select"
          style={{ width: 'auto', minWidth: '140px', height: '38px', fontSize: '0.85rem' }}
        >
          <option value="All">All Academic Years</option>
          {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No impact metrics recorded. Click "+ Add Impact Metric" to add verified statistics.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(imp => (
            <div key={imp._id || imp.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', padding: 0 }}>
              {imp.poster && (
                <div style={{ width: '100%', height: '150px', overflow: 'hidden', backgroundColor: '#0F172A', position: 'relative' }}>
                  <img src={imp.poster} alt={imp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--primary-blue)', lineHeight: 1 }}>
                    {imp.metricValue}
                  </span>
                  <span className={`admin-badge ${imp.status === 'Published' ? 'badge-active' : 'badge-pending'}`}>
                    {imp.status || 'Published'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {imp.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, flex: 1, marginBottom: '0.75rem' }}>
                  <FormattedText text={imp.description || 'No detailed description.'} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                  {imp.unitId?.name || (units.find(u => u._id === (imp.unitId?._id || imp.unitId))?.name) || 'All Chapters'} &bull; {imp.academicYearId?.year || (academicYears.find(y => y._id === (imp.academicYearId?._id || imp.academicYearId))?.year) || 'All Years'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', backgroundColor: '#F8FAFC' }}>
                <button onClick={() => openEdit(imp)} className="admin-btn-action"><Edit size={13} /> Edit</button>
                <button onClick={() => handleDelete(imp._id || imp.id)} className="admin-btn-danger"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {editingImpact ? 'Edit Impact Metric' : 'Add Impact Metric'}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Metric Value *</label>
                  <input required value={impactForm.metricValue} onChange={e => setImpactForm({ ...impactForm, metricValue: e.target.value })} className="admin-input" placeholder="e.g. 21+, 500+, 100%" />
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">Impact Label / Metric Title *</label>
                  <input required value={impactForm.title} onChange={e => setImpactForm({ ...impactForm, title: e.target.value })} className="admin-input" placeholder="e.g. People Supported" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter</label>
                  <select value={impactForm.unitId} onChange={e => setImpactForm({ ...impactForm, unitId: e.target.value })} className="admin-select">
                    <option value="">All Chapters (Organization-Wide)</option>
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year</label>
                  <select value={impactForm.academicYearId} onChange={e => setImpactForm({ ...impactForm, academicYearId: e.target.value })} className="admin-select">
                    <option value="">All Academic Years</option>
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Status</label>
                <select value={impactForm.status} onChange={e => setImpactForm({ ...impactForm, status: e.target.value })} className="admin-select">
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Impact Image Upload */}
              <div className="admin-input-group">
                <label className="admin-label">Supporting Evidence / Impact Image (JPG, PNG, WEBP &bull; Max 25MB)</label>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #CBD5E1', marginBottom: '0.5rem' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <label style={{ background: '#0284C7', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Replace Image
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                      <button type="button" onClick={handleRemoveImage} style={{ background: '#BE123C', color: 'white', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed #CBD5E1', borderRadius: '0.5rem', backgroundColor: '#F8FAFC', cursor: 'pointer', textAlign: 'center' }}>
                    <Upload size={24} color="#0284C7" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Choose impact evidence photo (optional)</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Supports JPG, PNG, WEBP up to 25MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Rich Text Area with Bold Support */}
              <div className="admin-input-group">
                <RichTextArea
                  label="Description & Narrative (Select text and click [B] or press Ctrl+B to bold)"
                  rows={4}
                  required={true}
                  value={impactForm.description}
                  onChange={e => setImpactForm({ ...impactForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Metric</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. STORIES MODULE (Full CRUD with Image Upload, Status, Academic Year & Chapter)
// ═════════════════════════════════════════════════════════════════════════════
function StoriesModule({ toast, units = [], academicYears = [] }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewStory, setPreviewStory] = useState(null);
  const [editingStory, setEditingStory] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  // Form State
  const [storyForm, setStoryForm] = useState({
    title: '',
    subtitle: '',
    coverImage: '',
    content: '',
    impact: '',
    academicYear: '',
    academicYearId: '',
    chapter: '',
    unitId: '',
    program: '',
    status: 'Published',
    author: 'MAGIC Youth'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const loadStories = useCallback(() => {
    setLoading(true);
    api('/api/stories?all=1')
      .then(d => { setStories(d.data || []); setLoading(false); })
      .catch(e => {
        // Fallback to /api/testimonials if needed
        api('/api/testimonials')
          .then(d => { setStories(d.data || []); setLoading(false); })
          .catch(err => { toast(err.message, 'error'); setLoading(false); });
      });
  }, [toast]);

  useEffect(() => { loadStories(); }, [loadStories]);

  const openAdd = () => {
    setEditingStory(null);
    setImageFile(null);
    setImagePreview('');
    const defaultUnit = units[0]?.name || '';
    const defaultUnitId = units[0]?._id || '';
    const defaultYear = academicYears[0]?.year || '';
    const defaultYearId = academicYears[0]?._id || '';

    setStoryForm({
      title: '',
      subtitle: '',
      coverImage: '',
      content: '',
      impact: '',
      academicYear: defaultYear,
      academicYearId: defaultYearId,
      chapter: defaultUnit,
      unitId: defaultUnitId,
      program: '',
      status: 'Published',
      author: 'MAGIC Youth'
    });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingStory(s);
    setImageFile(null);
    setImagePreview(s.coverImage || '');
    setStoryForm({
      title: s.title || '',
      subtitle: s.subtitle || '',
      coverImage: s.coverImage || '',
      content: s.content || s.fullStory || s.quote || '',
      impact: s.impact || '',
      academicYear: s.academicYear || s.academic_year || academicYears[0]?.year || '',
      academicYearId: s.academicYearId || s.academic_year_id || academicYears[0]?._id || '',
      chapter: s.chapter || s.unit || units[0]?.name || '',
      unitId: s.unitId || s.unit_id || units[0]?._id || '',
      program: s.program || '',
      status: s.status || 'Published',
      author: s.author || s.name || 'MAGIC Youth'
    });
    setShowModal(true);
  };

  const openPreview = (s) => {
    setPreviewStory(s);
    setShowPreviewModal(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validFormats.includes(file.type) && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      toast('Please select a valid image file (JPG, PNG, or WEBP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast('Image file size must be less than 15MB.', 'error');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setImagePreview(loadEvt.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setStoryForm(prev => ({ ...prev, coverImage: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!storyForm.title.trim()) {
      toast('Story Title is required.', 'error');
      return;
    }
    if (!imageFile && !imagePreview && !storyForm.coverImage) {
      toast('Cover Image is required.', 'error');
      return;
    }
    if (!storyForm.content.trim()) {
      toast('Story Content is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', storyForm.title);
      formData.append('subtitle', storyForm.subtitle || '');
      formData.append('content', storyForm.content);
      formData.append('impact', storyForm.impact || '');
      formData.append('academicYear', storyForm.academicYear || '');
      if (storyForm.academicYearId) formData.append('academicYearId', storyForm.academicYearId);
      formData.append('chapter', storyForm.chapter || '');
      if (storyForm.unitId) formData.append('unitId', storyForm.unitId);
      formData.append('program', storyForm.program || '');
      formData.append('status', storyForm.status || 'Published');
      formData.append('author', storyForm.author || 'MAGIC Youth');

      if (imageFile) {
        formData.append('coverImage', imageFile);
      } else if (imagePreview) {
        formData.append('coverImage', imagePreview);
      }

      const url = editingStory 
        ? `/api/stories/${editingStory._id || editingStory.id}`
        : '/api/stories';
      const method = editingStory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Failed to save story.');
      }

      toast(editingStory ? 'Story updated successfully.' : 'Story created successfully.');
      setShowModal(false);
      loadStories();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this story? This cannot be undone.')) return;
    try {
      await api(`/api/stories/${id}`, { method: 'DELETE' });
      toast('Story deleted successfully.');
      loadStories();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // Filtered stories
  const filteredStories = stories.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (unitFilter !== 'All' && s.unitId !== unitFilter && s.chapter !== unitFilter) return false;
    if (yearFilter !== 'All' && s.academicYearId !== yearFilter && s.academicYear !== yearFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (s.title || '').toLowerCase().includes(q);
      const matchSubtitle = (s.subtitle || '').toLowerCase().includes(q);
      const matchProgram = (s.program || '').toLowerCase().includes(q);
      const matchImpact = (s.impact || '').toLowerCase().includes(q);
      const matchAuthor = (s.author || s.name || '').toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchProgram || matchImpact || matchAuthor;
    }
    return true;
  });

  return (
    <div>
      {/* ── MODULE HEADER ─────────────────────────────────────────── */}
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Stories</h1>
          <p className="admin-module-subtitle">Manage and publish impact stories from MAGIC Youth.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add Story
        </button>
      </div>

      {/* ── FILTER & SEARCH BAR ───────────────────────────────────── */}
      <div className="admin-filter-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', color: '#94A3B8' }} />
          <input 
            type="text"
            placeholder="Search stories, programs, impacts..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '2.4rem', height: '2.4rem', fontSize: '0.8125rem' }}
          />
        </div>

        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="admin-select"
          style={{ height: '2.4rem', fontSize: '0.8125rem' }}
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>

        <select 
          value={unitFilter} 
          onChange={e => setUnitFilter(e.target.value)} 
          className="admin-select"
          style={{ height: '2.4rem', fontSize: '0.8125rem' }}
        >
          <option value="All">All Chapters</option>
          {units.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>

        <select 
          value={yearFilter} 
          onChange={e => setYearFilter(e.target.value)} 
          className="admin-select"
          style={{ height: '2.4rem', fontSize: '0.8125rem' }}
        >
          <option value="All">All Academic Years</option>
          {academicYears.map(y => (
            <option key={y._id} value={y._id}>{y.year}</option>
          ))}
        </select>
      </div>

      {/* ── CONTENT AREA ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-blue)" />
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '4.5rem 2rem', backgroundColor: '#FFFFFF', border: '1px dashed var(--border-color)', borderRadius: '1rem' }}>
          <Sparkles size={48} color="var(--primary-blue)" style={{ margin: '0 auto 1.25rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No stories added yet.
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9375rem', marginBottom: '1.75rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
            Create your first story to showcase the impact of MAGIC Youth.
          </p>
          <button onClick={openAdd} className="admin-btn-primary" style={{ margin: '0 auto', display: 'inline-flex' }}>
            <Plus size={16} /> Add Story
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredStories.map(s => {
            const isPublished = s.status === 'Published';
            return (
              <div 
                key={s._id || s.id} 
                className="admin-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  padding: '1.25rem',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Cover Image Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: '#F1F5F9', marginBottom: '1rem' }}>
                    {s.coverImage ? (
                      <img 
                        src={s.coverImage} 
                        alt={s.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                        <Image size={36} />
                      </div>
                    )}
                    <span 
                      style={{ 
                        position: 'absolute', 
                        top: '0.625rem', 
                        right: '0.625rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: isPublished ? '#DCFCE7' : '#FEF3C7',
                        color: isPublished ? '#15803D' : '#B45309',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {s.status || 'Published'}
                    </span>
                  </div>

                  {/* Metadata Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                    {s.academicYear && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#F1F5F9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {s.academicYear}
                      </span>
                    )}
                    {s.chapter && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#F0F9FF', color: 'var(--primary-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {s.chapter}
                      </span>
                    )}
                    {s.program && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#FAF5FF', color: '#7E22CE', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {s.program}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                    {s.title}
                  </h3>
                  {s.subtitle && (
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      {s.subtitle}
                    </p>
                  )}

                  {/* Impact snippet */}
                  {s.impact && (
                    <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                      <Sparkles size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#15803D' }} />
                      <span style={{ fontWeight: 600 }}>{s.impact}</span>
                    </div>
                  )}

                  {/* Content Excerpt */}
                  <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.content || s.fullStory || s.quote || ''}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {s.author || 'MAGIC Youth'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button 
                      onClick={() => openPreview(s)} 
                      className="admin-btn-action" 
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Preview Story"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button 
                      onClick={() => openEdit(s)} 
                      className="admin-btn-action" 
                      style={{ padding: '0.35rem', color: 'var(--primary-blue)' }}
                      title="Edit Story"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s._id || s.id)} 
                      className="admin-btn-danger" 
                      style={{ padding: '0.35rem' }}
                      title="Delete Story"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT STORY MODAL ─────────────────────────────── */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {editingStory ? 'Edit Story' : 'Add Story'}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                  Provide complete narrative and impact details for the public portal.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* 1. Story Title */}
              <div className="admin-input-group">
                <label className="admin-label">Story Title *</label>
                <input 
                  required 
                  placeholder="e.g. Compassion Connect" 
                  value={storyForm.title} 
                  onChange={e => setStoryForm({ ...storyForm, title: e.target.value })} 
                  className="admin-input" 
                />
              </div>

              {/* 2. Short Subtitle / Tagline */}
              <div className="admin-input-group">
                <label className="admin-label">Short Subtitle / Tagline (Optional)</label>
                <input 
                  placeholder="e.g. A Journey of Compassion, Care and Dignity" 
                  value={storyForm.subtitle} 
                  onChange={e => setStoryForm({ ...storyForm, subtitle: e.target.value })} 
                  className="admin-input" 
                />
              </div>

              {/* 3. Cover Image Upload */}
              <div className="admin-input-group">
                <label className="admin-label">Cover Image * (JPG, JPEG, PNG, WEBP up to 15MB)</label>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '0.75rem', overflow: 'hidden', border: '1.5px solid var(--border-color)', backgroundColor: '#F8FAFC', marginBottom: '0.5rem' }}>
                    <img 
                      src={imagePreview} 
                      alt="Cover Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <label 
                        className="admin-btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', backgroundColor: '#FFFFFF', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                      >
                        <RefreshCw size={13} /> Replace Image
                        <input 
                          type="file" 
                          accept="image/jpeg,image/jpg,image/png,image/webp" 
                          onChange={handleImageSelect} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                      <button 
                        type="button" 
                        onClick={handleRemoveImage} 
                        className="admin-btn-danger" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#BE123C', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '2rem 1.5rem', 
                      border: '2px dashed #CBD5E1', 
                      borderRadius: '0.75rem', 
                      cursor: 'pointer',
                      backgroundColor: '#F8FAFC',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <Upload size={28} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>
                      Click to upload cover image
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                      Supports JPG, JPEG, PNG, WEBP
                    </span>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/webp" 
                      onChange={handleImageSelect} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
              </div>

              {/* 4. Story Content */}
              <div className="admin-input-group">
                <label className="admin-label">Story Content * (Paragraphs &amp; Narrative)</label>
                <textarea 
                  required 
                  rows={6} 
                  placeholder="Enter the full narrative reflection. You can use multiple paragraphs to describe the journey, community response, and personal transformation..." 
                  value={storyForm.content} 
                  onChange={e => setStoryForm({ ...storyForm, content: e.target.value })} 
                  className="admin-textarea" 
                  style={{ lineHeight: 1.6 }}
                />
              </div>

              {/* 5. Impact / Highlight */}
              <div className="admin-input-group">
                <label className="admin-label">Impact / Highlight (Optional)</label>
                <textarea 
                  rows={2} 
                  placeholder="e.g. 21 individuals supported through YES-J's Compassion Connect initiative during 2025–26." 
                  value={storyForm.impact} 
                  onChange={e => setStoryForm({ ...storyForm, impact: e.target.value })} 
                  className="admin-textarea" 
                />
              </div>

              {/* 6. Chapter, Academic Year & Program Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Chapter / Unit</label>
                  <select 
                    value={storyForm.unitId} 
                    onChange={e => {
                      const selUnit = units.find(u => u._id === e.target.value);
                      setStoryForm({ 
                        ...storyForm, 
                        unitId: e.target.value,
                        chapter: selUnit?.name || ''
                      });
                    }} 
                    className="admin-select"
                  >
                    <option value="">Select Chapter (Optional)</option>
                    {units.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Academic Year</label>
                  <select 
                    value={storyForm.academicYearId} 
                    onChange={e => {
                      const selYear = academicYears.find(y => y._id === e.target.value);
                      setStoryForm({ 
                        ...storyForm, 
                        academicYearId: e.target.value,
                        academicYear: selYear?.year || ''
                      });
                    }} 
                    className="admin-select"
                  >
                    <option value="">Select Year (Optional)</option>
                    {academicYears.map(y => (
                      <option key={y._id} value={y._id}>{y.year}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Linked Program (Optional)</label>
                  <input 
                    placeholder="e.g. Compassion Connect, Green Footprints" 
                    value={storyForm.program} 
                    onChange={e => setStoryForm({ ...storyForm, program: e.target.value })} 
                    className="admin-input" 
                  />
                </div>
              </div>

              {/* 7. Status & Author Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Publish Status *</label>
                  <select 
                    value={storyForm.status} 
                    onChange={e => setStoryForm({ ...storyForm, status: e.target.value })} 
                    className="admin-select"
                  >
                    <option value="Published">Published (Visible on /stories)</option>
                    <option value="Draft">Draft (Admin Only)</option>
                  </select>
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Author / Attributed By</label>
                  <input 
                    placeholder="e.g. MAGIC Youth or Student Lead" 
                    value={storyForm.author} 
                    onChange={e => setStoryForm({ ...storyForm, author: e.target.value })} 
                    className="admin-input" 
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="admin-btn-secondary" 
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn-primary" 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Story...
                    </>
                  ) : (
                    editingStory ? 'Update Story' : 'Save Story'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STORY PREVIEW MODAL ───────────────────────────────────── */}
      {showPreviewModal && previewStory && (
        <div className="admin-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div 
            className="admin-modal-box" 
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {previewStory.coverImage && (
              <div style={{ width: '100%', maxHeight: '380px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1.25rem', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                <img 
                  src={previewStory.coverImage} 
                  alt={previewStory.title} 
                  style={{ maxWidth: '100%', maxHeight: '380px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="admin-badge" style={{ backgroundColor: '#F0F9FF', color: 'var(--primary-blue)' }}>
                  {previewStory.program || previewStory.category || 'Impact Story'}
                </span>
                {previewStory.academicYear && (
                  <span className="admin-badge" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                    {previewStory.academicYear}
                  </span>
                )}
                {previewStory.chapter && (
                  <span className="admin-badge" style={{ backgroundColor: '#FAF5FF', color: '#7E22CE' }}>
                    {previewStory.chapter}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)} 
                className="admin-btn-action" 
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.35rem', lineHeight: 1.3 }}>
              {previewStory.title}
            </h2>

            {previewStory.subtitle && (
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '1rem', lineHeight: 1.4 }}>
                {previewStory.subtitle}
              </p>
            )}

            {previewStory.impact && (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.75rem 1rem', borderRadius: '0.625rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#166534', fontSize: '0.875rem' }}>
                <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#15803D' }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#15803D', marginBottom: '0.15rem' }}>Impact Highlight</div>
                  <div>{previewStory.impact}</div>
                </div>
              </div>
            )}

            <div style={{ color: '#334155', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              {(previewStory.content || previewStory.fullStory || '').split('\n').filter(Boolean).map((p, idx) => (
                <p key={idx} style={{ marginBottom: '0.85rem' }}>{p}</p>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
              <button 
                onClick={() => setShowPreviewModal(false)} 
                className="admin-btn-secondary"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// 7. MEDIA & PUBLICATIONS MODULE (Unified: Publications, Documents, Toolkits & Gallery)
// ═════════════════════════════════════════════════════════════════════════════
function MediaModule({ toast, units, academicYears }) {
  const [activeSubTab, setActiveSubTab] = useState('documents'); // 'documents' | 'gallery'

  // --- Publications & Documents State ---
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showDocEditModal, setShowDocEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [docUnitFilter, setDocUnitFilter] = useState('All');
  const [docYearFilter, setDocYearFilter] = useState('All');

  const [docForm, setDocForm] = useState({
    title: '',
    description: '',
    documentType: 'Magazines & Publications',
    visibility: 'Public',
    unitId: units[0]?._id || '',
    academicYearId: academicYears[0]?._id || ''
  });
  const [fileToUpload, setFileToUpload] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);

  // --- Gallery State ---
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [showPhotoEditModal, setShowPhotoEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoAlbumFilter, setPhotoAlbumFilter] = useState('All');
  const [photoUnitFilter, setPhotoUnitFilter] = useState('All');
  const [photoYearFilter, setPhotoYearFilter] = useState('All');

  const [galleryForm, setGalleryForm] = useState({
    unitId: units[0]?._id || '',
    academicYearId: academicYears[0]?._id || '',
    album: 'General',
    category: 'Events',
    title: '',
    description: ''
  });
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Load Documents
  const loadDocs = useCallback(() => {
    setDocsLoading(true);
    api('/api/documents/admin/all')
      .then(d => { setDocs(d.data || []); setDocsLoading(false); })
      .catch(e => { toast(e.message, 'error'); setDocsLoading(false); });
  }, [toast]);

  // Load Gallery
  const loadPhotos = useCallback(() => {
    setPhotosLoading(true);
    api('/api/gallery')
      .then(d => { setPhotos(d.data || []); setPhotosLoading(false); })
      .catch(e => { toast(e.message, 'error'); setPhotosLoading(false); });
  }, [toast]);

  useEffect(() => {
    loadDocs();
    loadPhotos();
  }, [loadDocs, loadPhotos]);

  // Keep defaults updated if units/academicYears load after initial render
  useEffect(() => {
    if (units.length > 0 && !docForm.unitId) {
      setDocForm(f => ({ ...f, unitId: units[0]._id }));
      setGalleryForm(f => ({ ...f, unitId: units[0]._id }));
    }
    if (academicYears.length > 0 && !docForm.academicYearId) {
      setDocForm(f => ({ ...f, academicYearId: academicYears[0]._id }));
      setGalleryForm(f => ({ ...f, academicYearId: academicYears[0]._id }));
    }
  }, [units, academicYears]);

  // Document Upload Handler (Direct-to-Supabase signed upload up to 50MB)
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

    const MAX_SIZE = 50 * 1024 * 1024;
    if (fileToUpload.size > MAX_SIZE) {
      toast('File size exceeds the 50MB maximum limit.', 'error');
      return;
    }

    setDocUploading(true);
    try {
      const signData = await api('/api/documents/sign-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: fileToUpload.name,
          fileType: fileToUpload.type || 'application/pdf',
          fileSize: fileToUpload.size,
          unitId: docForm.unitId
        })
      });

      if (!signData.signedUrl) throw new Error('Could not obtain upload authorization.');

      const uploadRes = await fetch(signData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileToUpload.type || 'application/octet-stream' },
        body: fileToUpload
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Storage upload failed (${uploadRes.status}): ${errText || 'Network failure'}`);
      }

      const saveRes = await api('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          title: docForm.title,
          description: docForm.description,
          documentType: docForm.documentType,
          visibility: docForm.visibility,
          unitId: docForm.unitId,
          academicYearId: docForm.academicYearId,
          filePath: signData.publicUrl,
          storagePath: signData.path,
          fileName: fileToUpload.name,
          fileSize: fileToUpload.size,
          mimeType: fileToUpload.type || 'application/pdf'
        })
      });

      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save document metadata.');

      toast(`Document "${docForm.title}" uploaded successfully.`);
      setShowDocUploadModal(false);
      setFileToUpload(null);
      setDocForm({
        title: '',
        description: '',
        documentType: 'Magazines & Publications',
        visibility: 'Public',
        unitId: units[0]?._id || '',
        academicYearId: academicYears[0]?._id || ''
      });
      loadDocs();
    } catch (e) {
      toast(e.message || 'Upload failed', 'error');
    } finally {
      setDocUploading(false);
    }
  };

  // Open Edit Document Modal
  const openEditDoc = (d) => {
    setEditingDoc(d);
    setReplaceFile(null);
    setDocForm({
      title: d.title || '',
      description: d.description || '',
      documentType: d.documentType || d.document_type || 'Magazines & Publications',
      visibility: d.visibility || 'Public',
      unitId: d.unitId?._id || d.unitId?.id || d.unit_id || units[0]?._id || '',
      academicYearId: d.academicYearId?._id || d.academicYearId?.id || d.academic_year_id || academicYears[0]?._id || ''
    });
    setShowDocEditModal(true);
  };

  // Save Edit Document
  const handleEditDoc = async (e) => {
    e.preventDefault();
    if (!docForm.academicYearId) {
      toast('Academic Year is required.', 'error');
      return;
    }
    setDocUploading(true);
    try {
      let filePayload = {};
      if (replaceFile) {
        const MAX_SIZE = 50 * 1024 * 1024;
        if (replaceFile.size > MAX_SIZE) {
          toast('Replacement file exceeds the 50MB limit.', 'error');
          setDocUploading(false);
          return;
        }

        const signData = await api('/api/documents/sign-upload', {
          method: 'POST',
          body: JSON.stringify({
            fileName: replaceFile.name,
            fileType: replaceFile.type || 'application/pdf',
            fileSize: replaceFile.size,
            unitId: docForm.unitId
          })
        });

        const uploadRes = await fetch(signData.signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': replaceFile.type || 'application/octet-stream' },
          body: replaceFile
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Storage upload failed (${uploadRes.status}): ${errText || 'Network failure'}`);
        }

        filePayload = {
          filePath: signData.publicUrl,
          storagePath: signData.path,
          fileSize: replaceFile.size,
          mimeType: replaceFile.type || 'application/pdf'
        };
      }

      await api(`/api/documents/${editingDoc._id || editingDoc.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: docForm.title,
          description: docForm.description,
          documentType: docForm.documentType,
          visibility: docForm.visibility,
          unitId: docForm.unitId,
          academicYearId: docForm.academicYearId,
          ...filePayload
        })
      });

      toast('Document updated successfully.');
      setShowDocEditModal(false);
      setEditingDoc(null);
      setReplaceFile(null);
      loadDocs();
    } catch (e) {
      toast(e.message || 'Update failed', 'error');
    } finally {
      setDocUploading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api(`/api/documents/${id}`, { method: 'DELETE' });
      toast('Document deleted.');
      loadDocs();
    } catch (e) { toast(e.message, 'error'); }
  };

  // Upload Photo Handler
  const handleUploadPhotos = async (e) => {
    e.preventDefault();
    if (!selectedPhotos.length) {
      toast('Please select at least one photo.', 'error');
      return;
    }
    if (!galleryForm.unitId || !galleryForm.academicYearId) {
      toast('Chapter and Academic Year are required.', 'error');
      return;
    }

    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('unitId', galleryForm.unitId);
      fd.append('academicYearId', galleryForm.academicYearId);
      fd.append('album', galleryForm.album);
      fd.append('category', galleryForm.category);
      fd.append('title', galleryForm.title);
      fd.append('description', galleryForm.description);
      for (let i = 0; i < selectedPhotos.length; i++) {
        fd.append('photos', selectedPhotos[i]);
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast(`${selectedPhotos.length} photo(s) uploaded successfully.`);
      setShowPhotoUploadModal(false);
      setSelectedPhotos([]);
      loadPhotos();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Open Edit Photo Modal
  const openEditPhoto = (p) => {
    setEditingPhoto(p);
    setGalleryForm({
      unitId: p.unitId?._id || p.unitId?.id || p.unit_id || units[0]?._id || '',
      academicYearId: p.academicYearId?._id || p.academicYearId?.id || p.academic_year_id || academicYears[0]?._id || '',
      album: p.album || 'General',
      category: p.category || 'Events',
      title: p.title || p.caption || '',
      description: p.description || ''
    });
    setShowPhotoEditModal(true);
  };

  // Save Edit Photo
  const handleEditPhoto = async (e) => {
    e.preventDefault();
    if (!galleryForm.academicYearId) {
      toast('Academic Year is required.', 'error');
      return;
    }
    setPhotoUploading(true);
    try {
      await api(`/api/gallery/${editingPhoto._id || editingPhoto.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: galleryForm.title,
          description: galleryForm.description,
          album: galleryForm.album,
          category: galleryForm.category,
          unitId: galleryForm.unitId,
          academicYearId: galleryForm.academicYearId
        })
      });

      toast('Photo details updated successfully.');
      setShowPhotoEditModal(false);
      setEditingPhoto(null);
      loadPhotos();
    } catch (e) {
      toast(e.message || 'Update failed', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Delete Photo
  const handleDeletePhoto = async (id) => {
    if (!confirm('Remove photo from gallery?')) return;
    try {
      await api(`/api/gallery/${id}`, { method: 'DELETE' });
      toast('Photo deleted.');
      loadPhotos();
    } catch (e) { toast(e.message, 'error'); }
  };

  // Filtered Documents
  const filteredDocs = docs.filter(d => {
    const matchesSearch = !docSearch || d.title?.toLowerCase().includes(docSearch.toLowerCase()) || d.description?.toLowerCase().includes(docSearch.toLowerCase());
    const matchesCategory = docCategoryFilter === 'All' || d.documentType === docCategoryFilter || d.document_type === docCategoryFilter;
    const matchesUnit = docUnitFilter === 'All' || (d.unitId?._id === docUnitFilter || d.unitId?.id === docUnitFilter || d.unit_id === docUnitFilter);
    const matchesYear = docYearFilter === 'All' || (d.academicYearId?._id === docYearFilter || d.academicYearId?.id === docYearFilter || d.academic_year_id === docYearFilter);
    return matchesSearch && matchesCategory && matchesUnit && matchesYear;
  });

  // Unique Albums for filter
  const uniqueAlbums = Array.from(new Set(photos.map(p => p.album || 'General')));

  // Filtered Photos
  const filteredPhotos = photos.filter(p => {
    const matchesAlbum = photoAlbumFilter === 'All' || p.album === photoAlbumFilter;
    const matchesUnit = photoUnitFilter === 'All' || (p.unitId?._id === photoUnitFilter || p.unitId?.id === photoUnitFilter || p.unit_id === photoUnitFilter);
    const matchesYear = photoYearFilter === 'All' || (p.academicYearId?._id === photoYearFilter || p.academicYearId?.id === photoYearFilter || p.academic_year_id === photoYearFilter);
    return matchesAlbum && matchesUnit && matchesYear;
  });

  return (
    <div>
      {/* Header & Sub-Tab Switcher */}
      <div className="admin-module-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="admin-module-title">Media &amp; Publications Hub</h1>
          <p className="admin-module-subtitle">Manage annual magazines, reports, toolkits, documents, and high-resolution photo archives across chapters.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeSubTab === 'documents' ? (
            <button onClick={() => setShowDocUploadModal(true)} className="admin-btn-primary">
              <Upload size={16} /> Upload Document / Publication
            </button>
          ) : (
            <button onClick={() => setShowPhotoUploadModal(true)} className="admin-btn-primary">
              <Upload size={16} /> Upload Media Photos
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveSubTab('documents')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'documents' ? 'var(--primary-blue)' : '#F1F5F9',
            color: activeSubTab === 'documents' ? '#FFFFFF' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FileText size={16} />
          <span>Publications &amp; Documents</span>
          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '999px', backgroundColor: activeSubTab === 'documents' ? 'rgba(255,255,255,0.25)' : '#E2E8F0', color: activeSubTab === 'documents' ? '#FFFFFF' : '#334155' }}>
            {docs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('gallery')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'gallery' ? 'var(--primary-blue)' : '#F1F5F9',
            color: activeSubTab === 'gallery' ? '#FFFFFF' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Image size={16} />
          <span>Photo Gallery &amp; Albums</span>
          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: '999px', backgroundColor: activeSubTab === 'gallery' ? 'rgba(255,255,255,0.25)' : '#E2E8F0', color: activeSubTab === 'gallery' ? '#FFFFFF' : '#334155' }}>
            {photos.length}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. PUBLICATIONS & DOCUMENTS SUB-TAB */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'documents' && (
        <div>
          {/* Filter Bar */}
          <div className="admin-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search publications..."
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  className="admin-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              <div>
                <select value={docCategoryFilter} onChange={e => setDocCategoryFilter(e.target.value)} className="admin-select">
                  <option value="All">All Categories</option>
                  <option value="Magazines & Publications">Magazines &amp; Publications</option>
                  <option value="Toolkits & Manuals">Toolkits &amp; Manuals</option>
                  <option value="Chapter Resources">Chapter Resources</option>
                  <option value="Student Leadership & Formation">Student Leadership &amp; Formation</option>
                  <option value="Publications & Reports">Publications &amp; Reports</option>
                  <option value="Institutional Guide">Institutional Guide</option>
                  <option value="Operational Toolkit">Operational Toolkit</option>
                </select>
              </div>

              <div>
                <select value={docUnitFilter} onChange={e => setDocUnitFilter(e.target.value)} className="admin-select">
                  <option value="All">All Chapters</option>
                  {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>

              <div>
                <select value={docYearFilter} onChange={e => setDocYearFilter(e.target.value)} className="admin-select">
                  <option value="All">All Academic Years</option>
                  {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="admin-table-container">
            {docsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
            ) : filteredDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                No publications found matching your filters. Click &quot;+ Upload Document / Publication&quot; to add one.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Document Title</th>
                    <th>Category</th>
                    <th>Chapter</th>
                    <th>Academic Year</th>
                    <th>Visibility</th>
                    <th>File Size</th>
                    <th>Uploaded</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(d => (
                    <tr key={d._id || d.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div>{d.title}</div>
                        {d.description && <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>{d.description.slice(0, 60)}{d.description.length > 60 ? '...' : ''}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                          {d.documentType || d.document_type || 'Document'}
                        </span>
                      </td>
                      <td>{d.unitId?.name || 'All Chapters'}</td>
                      <td>
                        <span style={{ backgroundColor: '#EFF6FF', color: 'var(--primary-blue)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.78125rem', fontWeight: 700 }}>
                          {d.academicYearId?.year || 'Current'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${d.visibility === 'Public' ? 'badge-approved' : 'badge-archived'}`}>
                          {d.visibility || 'Public'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                        {d.fileSize ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB` : (d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(1)} MB` : '—')}
                      </td>
                      <td>{d.created_at || d.createdAt ? new Date(d.created_at || d.createdAt).toLocaleDateString() : '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {(d.filePath || d.file_path) && (
                            <a href={d.filePath || d.file_path} target="_blank" rel="noopener noreferrer" className="admin-btn-action" title="Open Document">
                              <ExternalLink size={13} /> Open
                            </a>
                          )}
                          <button onClick={() => openEditDoc(d)} className="admin-btn-action" title="Edit Metadata & Academic Year">
                            <Edit size={13} /> Edit
                          </button>
                          <button onClick={() => handleDeleteDoc(d._id || d.id)} className="admin-btn-danger" title="Delete Document">
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. PHOTO GALLERY & ALBUMS SUB-TAB */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'gallery' && (
        <div>
          {/* Gallery Filter Bar */}
          <div className="admin-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <select value={photoAlbumFilter} onChange={e => setPhotoAlbumFilter(e.target.value)} className="admin-select">
                  <option value="All">All Albums</option>
                  {uniqueAlbums.map(alb => <option key={alb} value={alb}>{alb}</option>)}
                </select>
              </div>

              <div>
                <select value={photoUnitFilter} onChange={e => setPhotoUnitFilter(e.target.value)} className="admin-select">
                  <option value="All">All Chapters</option>
                  {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>

              <div>
                <select value={photoYearFilter} onChange={e => setPhotoYearFilter(e.target.value)} className="admin-select">
                  <option value="All">All Academic Years</option>
                  {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                </select>
              </div>
            </div>
          </div>

          {photosLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
          ) : filteredPhotos.length === 0 ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              No gallery photos found. Click &quot;+ Upload Media Photos&quot; above to add images.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
              {filteredPhotos.map(p => (
                <div key={p._id || p.id} className="admin-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0.5rem', height: '160px', marginBottom: '0.625rem', backgroundColor: '#F1F5F9' }}>
                      <img
                        src={p.file_path || p.filePath || p.url}
                        alt={p.caption || p.title || 'Gallery item'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', backgroundColor: 'rgba(15,23,42,0.75)', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '0.25rem' }}>
                        {p.album || 'General'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                      {p.title || p.caption || 'Event Photo'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: 'var(--primary-blue)', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                        {p.academicYearId?.year || 'Current'}
                      </span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px', border: '1px solid #E2E8F0' }}>
                        {p.unitId?.name || 'All Chapters'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.625rem' }}>
                    <button onClick={() => openEditPhoto(p)} className="admin-btn-action" style={{ flex: 1, justifyContent: 'center', padding: '0.4rem' }}>
                      <Edit size={13} /> Edit
                    </button>
                    <button onClick={() => handleDeletePhoto(p._id || p.id)} className="admin-btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '0.4rem' }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* UPLOAD DOCUMENT MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showDocUploadModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Upload Publication / Document</h3>
              <button onClick={() => setShowDocUploadModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleUploadDoc} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Document / Publication Title *</label>
                <input required placeholder="e.g. YES-J MAGIS Magazine 2025-26" value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} className="admin-input" />
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
                    <option value="Magazines & Publications">Magazines &amp; Publications</option>
                    <option value="Toolkits & Manuals">Toolkits &amp; Manuals</option>
                    <option value="Chapter Resources">Chapter Resources</option>
                    <option value="Student Leadership & Formation">Student Leadership &amp; Formation</option>
                    <option value="Publications & Reports">Publications &amp; Reports</option>
                    <option value="Institutional Guide">Institutional Guide</option>
                    <option value="Operational Toolkit">Operational Toolkit</option>
                    <option value="Facilitation Guide">Facilitation Guide</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Visibility</label>
                  <select value={docForm.visibility} onChange={e => setDocForm({ ...docForm, visibility: e.target.value })} className="admin-select">
                    <option value="Public">Public (Visible on /media)</option>
                    <option value="Admin Only">Admin Only (Internal)</option>
                  </select>
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description / Summary</label>
                <textarea rows={2} placeholder="Brief summary of publication contents..." value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} className="admin-textarea" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Select File (PDF, DOCX, PPTX, Images - Max 50MB) *</label>
                <input type="file" required onChange={e => setFileToUpload(e.target.files?.[0] || null)} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowDocUploadModal(false)} className="admin-btn-secondary" disabled={docUploading}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={docUploading}>
                  {docUploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* EDIT DOCUMENT METADATA MODAL (Supports editing Academic Year) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showDocEditModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Publication / Document</h3>
              <button onClick={() => setShowDocEditModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
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
                  <label className="admin-label">Academic Year * (Editable)</label>
                  <select value={docForm.academicYearId} onChange={e => setDocForm({ ...docForm, academicYearId: e.target.value })} className="admin-select" style={{ borderColor: 'var(--primary-blue)', borderWidth: '2px' }}>
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Category</label>
                  <select value={docForm.documentType} onChange={e => setDocForm({ ...docForm, documentType: e.target.value })} className="admin-select">
                    <option value="Magazines & Publications">Magazines &amp; Publications</option>
                    <option value="Toolkits & Manuals">Toolkits &amp; Manuals</option>
                    <option value="Chapter Resources">Chapter Resources</option>
                    <option value="Student Leadership & Formation">Student Leadership &amp; Formation</option>
                    <option value="Publications & Reports">Publications &amp; Reports</option>
                    <option value="Institutional Guide">Institutional Guide</option>
                    <option value="Operational Toolkit">Operational Toolkit</option>
                    <option value="Facilitation Guide">Facilitation Guide</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Visibility</label>
                  <select value={docForm.visibility} onChange={e => setDocForm({ ...docForm, visibility: e.target.value })} className="admin-select">
                    <option value="Public">Public (Visible on /media)</option>
                    <option value="Admin Only">Admin Only (Internal)</option>
                  </select>
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description</label>
                <textarea rows={2} value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} className="admin-textarea" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Replace File (Optional, max 50MB - leave blank to keep current file)</label>
                <input type="file" onChange={e => setReplaceFile(e.target.files?.[0] || null)} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowDocEditModal(false)} className="admin-btn-secondary" disabled={docUploading}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={docUploading}>
                  {docUploading ? <><Loader2 size={15} className="animate-spin" /> Saving Changes...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* UPLOAD PHOTOS MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showPhotoUploadModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Upload Gallery Media Photos</h3>
              <button onClick={() => setShowPhotoUploadModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleUploadPhotos} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <input placeholder="e.g. Leadership Workshop 2026" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Select Photos (Images, Max 30) *</label>
                <input type="file" multiple accept="image/*" required onChange={e => setSelectedPhotos(e.target.files ? Array.from(e.target.files) : [])} className="admin-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowPhotoUploadModal(false)} className="admin-btn-secondary" disabled={photoUploading}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={photoUploading}>
                  {photoUploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : 'Upload Photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* EDIT PHOTO DETAILS MODAL (Supports editing Academic Year) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showPhotoEditModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Photo Details</h3>
              <button onClick={() => setShowPhotoEditModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleEditPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Caption / Title</label>
                <input placeholder="e.g. Leadership Workshop 2026" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Chapter *</label>
                  <select value={galleryForm.unitId} onChange={e => setGalleryForm({ ...galleryForm, unitId: e.target.value })} className="admin-select">
                    {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year * (Editable)</label>
                  <select value={galleryForm.academicYearId} onChange={e => setGalleryForm({ ...galleryForm, academicYearId: e.target.value })} className="admin-select" style={{ borderColor: 'var(--primary-blue)', borderWidth: '2px' }}>
                    {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Album Name</label>
                  <input value={galleryForm.album} onChange={e => setGalleryForm({ ...galleryForm, album: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <input value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} className="admin-input" />
                </div>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description</label>
                <textarea rows={2} value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} className="admin-textarea" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowPhotoEditModal(false)} className="admin-btn-secondary" disabled={photoUploading}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={photoUploading}>
                  {photoUploading ? <><Loader2 size={15} className="animate-spin" /> Saving Changes...</> : 'Save Changes'}
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
function JoinApplicationsModule({ toast, units, admin }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [filterUnit, setFilterUnit] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [assignedRoleInput, setAssignedRoleInput] = useState('');
  const [electionStatusInput, setElectionStatusInput] = useState('PENDING');
  const [showApprovalModal, setShowApprovalModal] = useState(null);
  const [approving, setApproving] = useState(false);

  const leadershipRoleOptions = [
    'First Lead',
    'Second Lead',
    'Secretary',
    'Deputy Secretary',
    'Procurator',
    'Social Media Coordinator',
    'Event Coordinator',
    'Volunteer Coordinator',
    'Cultural Coordinator',
    'Communication Coordinator'
  ];

  const loadRequests = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterUnit) params.set('unitId', filterUnit);
    if (filterStatus) params.set('status', filterStatus);
    if (filterType) params.set('membershipType', filterType);
    if (search) params.set('search', search);

    api(`/api/join?${params.toString()}`)
      .then(d => { setRequests(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [filterUnit, filterStatus, filterType, search, toast]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const openDetail = (r) => {
    setSelectedReq(r);
    setAssignedRoleInput(r.assignedRole || '');
    setElectionStatusInput(r.electionStatus || 'PENDING');
  };

  const updateElectionStatusAndRole = async () => {
    if (!selectedReq) return;
    try {
      await api(`/api/join/${selectedReq._id}/election-status`, {
        method: 'PATCH',
        body: JSON.stringify({ electionStatus: electionStatusInput })
      });
      await api(`/api/join/${selectedReq._id}/assign-role`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedRole: assignedRoleInput })
      });
      toast('Election status and assigned role saved.');
      loadRequests();
      setSelectedReq(prev => ({
        ...prev,
        electionStatus: electionStatusInput,
        assignedRole: assignedRoleInput
      }));
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleApproveMembership = async () => {
    if (!selectedReq) return;
    setApproving(true);
    try {
      const res = await api(`/api/members/approve/${selectedReq._id}`, {
        method: 'POST',
        body: JSON.stringify({
          assignedRole: assignedRoleInput || selectedReq.assignedRole || null,
          electionStatus: electionStatusInput || selectedReq.electionStatus || 'SELECTED'
        })
      });

      toast(`Member account created! ID: ${res.data.memberId}`);
      setShowApprovalModal({
        memberId: res.data.memberId,
        tempPassword: res.data.tempPassword,
        roleLabel: res.data.roleLabel,
        applicantName: selectedReq.name,
      });
      setSelectedReq(null);
      loadRequests();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setApproving(false);
    }
  };

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
      {/* Approval Success Modal */}
      {showApprovalModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 480 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Check size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#166534' }}>
                Membership Approved!
              </h3>
              <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Member account for <strong>{showApprovalModal.applicantName}</strong> has been generated.
              </p>
            </div>

            <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', display: 'block' }}>GENERATED MEMBER ID:</span>
                <code style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                  {showApprovalModal.memberId}
                </code>
              </div>
              <div style={{ marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', display: 'block' }}>TEMPORARY PASSWORD:</span>
                <code style={{ fontSize: '1.1rem', fontWeight: 800, color: '#DC2626', fontFamily: 'monospace', background: '#FEE2E2', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {showApprovalModal.tempPassword}
                </code>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', display: 'block' }}>OFFICIAL ROLE:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{showApprovalModal.roleLabel || 'Member'}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.78125rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              ⚠ Please securely share these credentials with the member. They can log in at <code>/member/login</code> and view their digital E-Card.
            </p>

            <button onClick={() => setShowApprovalModal(null)} className="admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Done / Close
            </button>
          </div>
        </div>
      )}

      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Join MAGIC &amp; Leadership Nominations</h1>
          <p className="admin-module-subtitle">Review incoming collegiate applications, evaluate leadership nominations, and approve member accounts.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label className="admin-label">Search Applicant</label>
            <input
              placeholder="Name, email, college..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Filter Unit</label>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="admin-select">
              <option value="">All Units</option>
              {(units || []).map(u => (
                <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Membership Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="admin-select">
              <option value="">All Types</option>
              <option value="MEMBER">Regular Member</option>
              <option value="LEADERSHIP">Leadership Nomination</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="admin-select">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={30} className="animate-spin" color="var(--primary-blue)" /></div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No applications found matching the selected filters.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Unit / Chapter</th>
                <th>Drive / Period</th>
                <th>Type / Nomination</th>
                <th>Election Status</th>
                <th>Submitted</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const isLeadership = r.membershipType === 'LEADERSHIP';
                return (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{r.email} &bull; {r.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.unitId?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{r.college}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0F172A' }}>{r.driveName || 'Direct / Default'}</div>
                      {r.academicYear && (
                        <div style={{ fontSize: '0.7rem', color: '#0284C7', fontWeight: 700 }}>Period: {r.academicYear}</div>
                      )}
                    </td>
                    <td>
                      {isLeadership ? (
                        <div>
                          <span style={{ fontSize: '0.7rem', background: '#FFE4E6', color: '#BE123C', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800 }}>
                            ★ LEADERSHIP
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600, marginTop: '0.2rem' }}>
                            Pref: {r.preferredLeadershipRole || 'Not specified'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', background: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                          ● MEMBER
                        </span>
                      )}
                    </td>
                    <td>
                      {isLeadership ? (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: r.electionStatus === 'SELECTED' ? '#166534' : r.electionStatus === 'SHORTLISTED' ? '#0369A1' : r.electionStatus === 'REJECTED' ? '#BE123C' : '#D97706'
                        }}>
                          {r.electionStatus || 'PENDING'}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>N/A</span>
                      )}
                    </td>
                    <td>{new Date(r.createdAt || r.created_at || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <span className={`admin-badge ${r.status === 'Accepted' || r.status === 'Approved' ? 'badge-approved' : r.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {r.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openDetail(r)} className="admin-btn-action">
                        <Eye size={13} /> Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Detail & Evaluation Modal */}
      {selectedReq && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Application Review</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Target Unit: <strong>{selectedReq.unitId?.name || 'MAGIC Youth'}</strong></span>
              </div>
              <button onClick={() => setSelectedReq(null)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>

            {/* Leadership Nomination Advisory Banner */}
            {selectedReq.membershipType === 'LEADERSHIP' && (
              <div style={{ backgroundColor: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C2410C', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  ★ LEADERSHIP NOMINATION FOR CONSIDERATION
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#7C2D12', lineHeight: 1.5 }}>
                  Applicant nominated for: <strong>{selectedReq.preferredLeadershipRole}</strong>.
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#9A3412', marginTop: '0.2rem' }}>
                    Note: Preference does not grant official appointment. You may shortlist, conduct selection, and designate an official assigned role below.
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div><strong>Full Name:</strong> {selectedReq.name} ({selectedReq.gender})</div>
                <div><strong>College:</strong> {selectedReq.college}</div>
                <div><strong>Department &amp; Year:</strong> {selectedReq.department} ({selectedReq.year})</div>
                <div><strong>City:</strong> {selectedReq.city}</div>
                <div><strong>Email:</strong> {selectedReq.email}</div>
                <div><strong>Phone:</strong> {selectedReq.phone}</div>
                <div><strong>Drive:</strong> {selectedReq.driveName || 'Direct / General'}</div>
                <div><strong>Membership Period:</strong> {selectedReq.academicYear || '—'}</div>
              </div>

              {selectedReq.skills && selectedReq.skills.length > 0 && (
                <div>
                  <strong>Skills:</strong>{' '}
                  <span style={{ color: '#475569' }}>{Array.isArray(selectedReq.skills) ? selectedReq.skills.join(', ') : selectedReq.skills}</span>
                </div>
              )}

              {selectedReq.interests && selectedReq.interests.length > 0 && (
                <div>
                  <strong>Interests:</strong>{' '}
                  <span style={{ color: '#475569' }}>{Array.isArray(selectedReq.interests) ? selectedReq.interests.join(', ') : selectedReq.interests}</span>
                </div>
              )}

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <strong>Motivation / Reason for Joining:</strong>
                <p style={{ margin: '0.35rem 0 0', color: '#334155', fontStyle: 'italic' }}>"{selectedReq.reason}"</p>
              </div>

              {/* Leadership Evaluation Controls (If Leadership nomination) */}
              {selectedReq.membershipType === 'LEADERSHIP' && (
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', border: '1.5px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0F172A' }}>
                    ELECTION / SELECTION WORKFLOW
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="admin-label">Election Status</label>
                      <select
                        value={electionStatusInput}
                        onChange={e => setElectionStatusInput(e.target.value)}
                        className="admin-select"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="ELECTION">ELECTION / SELECTION</option>
                        <option value="SELECTED">SELECTED</option>
                        <option value="NOT_SELECTED">NOT SELECTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    <div>
                      <label className="admin-label">Official Assigned Role</label>
                      <select
                        value={assignedRoleInput}
                        onChange={e => setAssignedRoleInput(e.target.value)}
                        className="admin-select"
                      >
                        <option value="">None (Regular Member)</option>
                        {leadershipRoleOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={updateElectionStatusAndRole}
                      className="admin-btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      Save Status &amp; Assigned Role
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <button
                  onClick={() => updateStatus(selectedReq._id, 'Rejected')}
                  className="admin-btn-danger"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Reject Application
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>

                <button
                  onClick={handleApproveMembership}
                  disabled={approving || selectedReq.status === 'Approved'}
                  className="admin-btn-primary"
                  style={{ backgroundColor: '#166534' }}
                >
                  {approving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {selectedReq.status === 'Approved' ? 'Already Approved' : 'Approve & Create Member ID'}
                </button>
              </div>
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
  const [newStatusStr, setNewStatusStr] = useState('Active');
  const [editingYear, setEditingYear] = useState(null);
  const [editYearStr, setEditYearStr] = useState('');
  const [editStatusStr, setEditStatusStr] = useState('Active');
  const [saving, setSaving] = useState(false);

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
      const defaultUnit = units[0]?._id || units[0]?.id;
      if (!defaultUnit) { toast('Please create a chapter first.', 'error'); return; }
      await api('/api/academic-years', {
        method: 'POST',
        body: JSON.stringify({ unitId: defaultUnit, year: newYearStr.trim(), status: newStatusStr })
      });
      toast(`Academic year "${newYearStr.trim()}" added.`);
      setNewYearStr('');
      setNewStatusStr('Active');
      loadYears();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleToggleStatus = async (yearObj) => {
    const nextStatus = yearObj.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api(`/api/academic-years/${yearObj._id || yearObj.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      toast(`Academic year "${yearObj.year}" set to ${nextStatus}.`);
      loadYears();
    } catch (e) { toast(e.message, 'error'); }
  };

  const openEdit = (y) => {
    setEditingYear(y);
    setEditYearStr(y.year || '');
    setEditStatusStr(y.status || 'Active');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editYearStr.trim() || !editingYear) return;
    setSaving(true);
    try {
      await api(`/api/academic-years/${editingYear._id || editingYear.id}`, {
        method: 'PUT',
        body: JSON.stringify({ year: editYearStr.trim(), status: editStatusStr })
      });
      toast(`Academic year updated to "${editYearStr.trim()}".`);
      setEditingYear(null);
      loadYears();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (yearObj) => {
    if (!window.confirm(`Are you sure you want to safely remove academic year "${yearObj.year}"?\n\nExisting teams, members, and events will be retained safely.`)) return;
    try {
      await api(`/api/academic-years/${yearObj._id || yearObj.id}`, { method: 'DELETE' });
      toast(`Academic year "${yearObj.year}" deleted.`);
      loadYears();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">Academic Years</h1>
          <p className="admin-module-subtitle">Configure academic sessions for youth formation cycles, leadership tenure tracking, and membership drives.</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingYear && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="admin-card" style={{ maxWidth: 460, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Edit Academic Year</h3>
              <button onClick={() => setEditingYear(null)} className="admin-btn-action"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Academic Year Label</label>
                <input
                  required
                  value={editYearStr}
                  onChange={e => setEditYearStr(e.target.value)}
                  placeholder="e.g. 2026-27"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className="admin-label">Status</label>
                <select
                  value={editStatusStr}
                  onChange={e => setEditStatusStr(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingYear(null)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="admin-btn-primary">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Year Form */}
      <div className="admin-card" style={{ maxWidth: 700, marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Add New Academic Year</h3>
        <form onSubmit={handleAddYear} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            required
            placeholder="e.g. 2026-27"
            value={newYearStr}
            onChange={e => setNewYearStr(e.target.value)}
            className="admin-input"
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            value={newStatusStr}
            onChange={e => setNewStatusStr(e.target.value)}
            className="admin-select"
            style={{ width: 140 }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button type="submit" className="admin-btn-primary">
            <Plus size={16} /> Add Year
          </button>
        </form>
      </div>

      {/* Academic Years Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'auto', maxWidth: 850 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 size={24} className="animate-spin" color="var(--primary-blue)" />
          </div>
        ) : years.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
            No academic years configured yet. Add your first session above.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Academic Session</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {years.map(y => (
                <tr key={y._id || y.id}>
                  <td style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{y.year}</td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(y)}
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        background: y.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                        color: y.status === 'Active' ? '#166534' : '#64748B',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                      title="Click to toggle Active / Inactive"
                    >
                      {y.status || 'Active'} ⇋
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEdit(y)}
                        className="admin-btn-action"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                        title="Edit Academic Year"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(y)}
                        className="admin-btn-danger"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                        title="Safely Delete Academic Year"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
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
// 14. USER MANAGEMENT & ACCESS CONTROL MODULE
// ═════════════════════════════════════════════════════════════════════════════
function UsersModule({ toast, units, admin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Password visibility controls
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [sessionPasswords, setSessionPasswords] = useState({});
  const [revealedRows, setRevealedRows] = useState({});

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SUB_ADMIN',
    assignedUnitIds: [],
    status: 'Active'
  });

  const [newPassword, setNewPassword] = useState('');

  const loadUsers = useCallback(() => {
    setLoading(true);
    api('/api/administrators')
      .then(d => { setUsers(d.data || []); setLoading(false); })
      .catch(e => { toast(e.message, 'error'); setLoading(false); });
  }, [toast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openAdd = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'SUB_ADMIN',
      assignedUnitIds: units.length > 0 ? [units[0]._id] : [],
      status: 'Active'
    });
    setShowAddPassword(false);
    setShowAddModal(true);
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'SUB_ADMIN',
      assignedUnitIds: (u.assigned_unit_ids || u.assignedUnitIds?.map(x => x._id || x.id) || []),
      status: u.status || 'Active'
    });
    setShowEditModal(true);
  };

  const openReset = (u) => {
    setSelectedUser(u);
    setNewPassword('');
    setShowResetPassword(false);
    setShowResetModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast('Name, username/email, and password are required.', 'error');
      return;
    }
    if (userForm.password.length < 8) {
      toast('Password must be at least 8 characters long.', 'error');
      return;
    }
    try {
      const res = await api('/api/administrators', {
        method: 'POST',
        body: JSON.stringify(userForm)
      });
      const newId = res.data?._id || res.data?.id;
      if (newId) {
        setSessionPasswords(prev => ({ ...prev, [newId]: userForm.password }));
      }
      toast(`User account "${userForm.name}" created successfully.`);
      setShowAddModal(false);
      setShowAddPassword(false);
      loadUsers();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api(`/api/administrators/${selectedUser._id || selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(userForm)
      });
      toast('User details updated successfully.');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    if (newPassword.length < 8) {
      toast('Password must be at least 8 characters long.', 'error');
      return;
    }
    try {
      await api(`/api/administrators/${selectedUser._id || selectedUser.id}/reset-password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword })
      });
      const uId = selectedUser._id || selectedUser.id;
      setSessionPasswords(prev => ({ ...prev, [uId]: newPassword }));
      toast(`Password for ${selectedUser.name || selectedUser.email} has been reset.`);
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword('');
      setShowResetPassword(false);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleToggleStatus = async (u) => {
    const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api(`/api/administrators/${u._id || u.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      toast(`Account ${nextStatus === 'Active' ? 'activated' : 'disabled'}.`);
      loadUsers();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleDeleteUser = async (u) => {
    if (!confirm(`Are you sure you want to permanently delete the account for ${u.name || u.email}?`)) return;
    try {
      await api(`/api/administrators/${u._id || u.id}`, { method: 'DELETE' });
      toast('User account deleted.');
      loadUsers();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const toggleUnitSelection = (unitId) => {
    setUserForm(prev => {
      const current = prev.assignedUnitIds || [];
      if (current.includes(unitId)) {
        return { ...prev, assignedUnitIds: current.filter(id => id !== unitId) };
      } else {
        return { ...prev, assignedUnitIds: [...current, unitId] };
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case 'MAIN_ADMIN': return 'Main Admin (Apex)';
      case 'FIRST_LEAD': return 'First Lead';
      case 'SECRETARY': return 'Formation Secretary';
      case 'SOCIAL_MEDIA': return 'Media & Documentation Lead';
      case 'SUB_ADMIN': return 'Chapter Coordinator';
      default: return role || 'Sub Admin';
    }
  };

  return (
    <div>
      <div className="admin-module-header">
        <div>
          <h1 className="admin-module-title">User Management &amp; Role Control</h1>
          <p className="admin-module-subtitle">Manage administrative accounts, role assignments, unit-wise permissions, and credentials.</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus size={16} /> Add Admin / Lead User
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minWidth: 240 }}>
            <Search size={15} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Search by name, username, email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="admin-select" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}>
              <option value="All">All Roles</option>
              <option value="MAIN_ADMIN">Main Admin</option>
              <option value="FIRST_LEAD">First Lead</option>
              <option value="SECRETARY">Formation Secretary</option>
              <option value="SOCIAL_MEDIA">Media Lead</option>
              <option value="SUB_ADMIN">Chapter Coordinator</option>
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-select" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary-blue)" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            No administrative accounts found matching your filters.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username / Login ID</th>
                <th>Password</th>
                <th>Role</th>
                <th>Assigned Chapter(s)</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id || u.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{u.name}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)', wordBreak: 'break-all' }}>
                      {u.email}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {revealedRows[u._id || u.id]
                          ? (sessionPasswords[u._id || u.id] || '•••••••• (Protected)')
                          : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRevealedRows(prev => ({ ...prev, [u._id || u.id]: !prev[u._id || u.id] }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#64748B' }}
                        title={revealedRows[u._id || u.id] ? "Hide password" : "Show password"}
                      >
                        {revealedRows[u._id || u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge" style={{
                      backgroundColor: u.role === 'MAIN_ADMIN' ? '#F0F9FF' : u.role === 'FIRST_LEAD' ? '#FEF3C7' : '#F1F5F9',
                      color: u.role === 'MAIN_ADMIN' ? 'var(--primary-blue)' : u.role === 'FIRST_LEAD' ? '#B45309' : '#334155',
                      fontWeight: 800
                    }}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td>
                    {u.role === 'MAIN_ADMIN' ? (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 700 }}>● All Chapters (Apex Access)</span>
                    ) : u.assignedUnitIds?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {u.assignedUnitIds.map((au, i) => (
                          <span key={i} style={{ fontSize: '0.75rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                            {au.name || 'Chapter'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78125rem', color: '#94A3B8', fontStyle: 'italic' }}>None assigned</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={u._id === admin?.id || u.id === admin?.id}
                      className={`admin-badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}
                      style={{ cursor: u._id === admin?.id || u.id === admin?.id ? 'default' : 'pointer', border: 'none' }}
                      title="Click to toggle status"
                    >
                      {u.status || 'Active'}
                    </button>
                  </td>
                  <td style={{ fontSize: '0.78125rem', color: '#64748B' }}>
                    {u.lastLoginAt || u.last_login_at ? new Date(u.lastLoginAt || u.last_login_at).toLocaleString() : 'Never'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button onClick={() => openReset(u)} className="admin-btn-action" title="Reset Password" style={{ padding: '0.35rem' }}>
                        <Settings size={13} />
                      </button>
                      <button onClick={() => openEdit(u)} className="admin-btn-action" title="Edit User" style={{ padding: '0.35rem' }}>
                        <Edit size={13} />
                      </button>
                      {u._id !== admin?.id && u.id !== admin?.id && (
                        <button onClick={() => handleDeleteUser(u)} className="admin-btn-danger" title="Delete User" style={{ padding: '0.35rem' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── CREATE USER MODAL ── */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add Administrator / Lead Account</h3>
              <button onClick={() => setShowAddModal(false)} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Full Name *</label>
                <input required placeholder="e.g. John Doe" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Username / Login ID (Email) *</label>
                <input type="email" required placeholder="lead@magicyouth.in" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Password (Min. 8 characters) *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showAddPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    value={userForm.password} 
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })} 
                    className="admin-input" 
                    style={{ paddingRight: '2.5rem', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                    title={showAddPassword ? "Hide password" : "Show password"}
                  >
                    {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">User Role</label>
                  <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="admin-select">
                    <option value="MAIN_ADMIN">Main Admin (Apex)</option>
                    <option value="FIRST_LEAD">First Lead</option>
                    <option value="SECRETARY">Formation Secretary</option>
                    <option value="SOCIAL_MEDIA">Media &amp; Documentation</option>
                    <option value="SUB_ADMIN">Chapter Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Account Status</label>
                  <select value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })} className="admin-select">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {userForm.role !== 'MAIN_ADMIN' && (
                <div className="admin-input-group">
                  <label className="admin-label">Assigned Campus Chapter(s)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 150, overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: '#F8FAFC' }}>
                    {units.map(u => (
                      <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={userForm.assignedUnitIds.includes(u._id)}
                          onChange={() => toggleUnitSelection(u._id)}
                        />
                        <span>{u.name} ({u.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {showEditModal && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit User Account</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Full Name *</label>
                <input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="admin-input" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Username / Login ID (Email) *</label>
                <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="admin-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">User Role</label>
                  <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="admin-select">
                    <option value="MAIN_ADMIN">Main Admin (Apex)</option>
                    <option value="FIRST_LEAD">First Lead</option>
                    <option value="SECRETARY">Formation Secretary</option>
                    <option value="SOCIAL_MEDIA">Media &amp; Documentation</option>
                    <option value="SUB_ADMIN">Chapter Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Account Status</label>
                  <select value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })} className="admin-select">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {userForm.role !== 'MAIN_ADMIN' && (
                <div className="admin-input-group">
                  <label className="admin-label">Assigned Campus Chapter(s)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 150, overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: '#F8FAFC' }}>
                    {units.map(u => (
                      <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={userForm.assignedUnitIds?.includes(u._id)}
                          onChange={() => toggleUnitSelection(u._id)}
                        />
                        <span>{u.name} ({u.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESET PASSWORD MODAL ── */}
      {showResetModal && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Reset User Password</h3>
              <button onClick={() => { setShowResetModal(false); setSelectedUser(null); }} className="admin-btn-action" style={{ padding: '0.35rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                Set a new password for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
              </p>
              <div className="admin-input-group">
                <label className="admin-label">New Password (Min. 8 characters) *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showResetPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="admin-input"
                    style={{ paddingRight: '2.5rem', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                    title={showResetPassword ? "Hide password" : "Show password"}
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setShowResetModal(false); setSelectedUser(null); }} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 15. ADMIN SETTINGS MODULE
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

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN MEMBERS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function AdminMembersModule({ toast, units, academicYears = [], admin }) {
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterUnit, setFUnit]  = useState('');
  const [filterStatus, setFSt]  = useState('');
  const [filterType, setFType]  = useState('');
  const [filterYear, setFYear]  = useState('');
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(25);
  const [total, setTotal]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [tempPwd, setTempPwd]   = useState('');
  const [editRoleInput, setEditRoleInput] = useState('');

  const leadershipRoles = [
    'First Lead',
    'Second Lead',
    'Secretary',
    'Deputy Secretary',
    'Procurator',
    'Social Media Coordinator',
    'Event Coordinator',
    'Volunteer Coordinator',
    'Cultural Coordinator',
    'Communication Coordinator'
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search)       params.set('search', search);
      if (filterUnit)   params.set('unitId', filterUnit);
      if (filterStatus) params.set('status', filterStatus);
      if (filterType)   params.set('membershipType', filterType);
      if (filterYear)   params.set('academicYearId', filterYear);
      const d = await api(`/api/members?${params}`);
      if (d.success) { setMembers(d.data || []); setTotal(d.pagination?.total || 0); }
    } catch (e) { toast(e.message, 'error'); }
    setLoading(false);
  }, [page, limit, filterUnit, filterStatus, filterType, filterYear, search, toast]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const openMemberDetail = (m) => {
    setSelected(m);
    setEditRoleInput(m.assignedRole || m.roleLabel || 'Member');
  };

  const handleUpdateRole = async () => {
    if (!selected) return;
    try {
      await api(`/api/members/${selected.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedRole: editRoleInput === 'Member' ? null : editRoleInput })
      });
      toast(`Official role updated to ${editRoleInput}.`);
      load();
      setSelected(prev => ({ ...prev, assignedRole: editRoleInput === 'Member' ? null : editRoleInput, roleLabel: editRoleInput }));
    } catch (e) { toast(e.message, 'error'); }
  };

  const changeStatus = async (memberId, status) => {
    try {
      await api(`/api/members/${memberId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast(`Member ${status.toLowerCase()} successfully.`);
      load();
      if (selected?.id === memberId) {
        setSelected(prev => ({ ...prev, status }));
      }
    } catch (e) { toast(e.message, 'error'); }
  };

  const resetPassword = async (memberId) => {
    try {
      const d = await api(`/api/members/${memberId}/reset-password`, { method: 'POST' });
      setTempPwd(d.tempPassword);
      toast('Password reset. Share the temporary password securely.');
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleExportCsv = () => {
    if (!members.length) {
      toast('No member records to export.', 'error');
      return;
    }
    const headers = ['Member ID', 'Name', 'Email', 'Phone', 'Unit / Chapter', 'College', 'Department', 'Year', 'Membership Type', 'Assigned Role', 'Drive', 'Academic Year', 'Status', 'Joined Date'];
    const rows = members.map(m => [
      `"${m.memberId || ''}"`,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${m.email || ''}"`,
      `"${m.phone || ''}"`,
      `"${(m.unitName || '').replace(/"/g, '""')}"`,
      `"${(m.college || '').replace(/"/g, '""')}"`,
      `"${(m.department || '').replace(/"/g, '""')}"`,
      `"${m.year || ''}"`,
      `"${m.membershipType || 'MEMBER'}"`,
      `"${m.assignedRole || m.roleLabel || 'Member'}"`,
      `"${(m.driveName || 'Direct / General').replace(/"/g, '""')}"`,
      `"${m.academicYear || ''}"`,
      `"${m.status || ''}"`,
      `"${m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `magic_youth_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${members.length} member records to CSV.`);
  };

  const statusColor = { Active: '#166534', Suspended: '#C2410C', Expired: '#475569', Deactivated: '#BE123C' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Password reset modal */}
      {tempPwd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="admin-card" style={{ maxWidth: 420, width: '100%' }}>
            <h3 style={{ marginBottom: '1rem' }}>Temporary Password</h3>
            <code style={{ display: 'block', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '0.5rem', padding: '1rem', fontSize: '1.125rem', letterSpacing: '0.1em', marginBottom: '1rem', textAlign: 'center', color: '#166534', fontWeight: 800 }}>
              {tempPwd}
            </code>
            <p style={{ fontSize: '0.8rem', color: '#DC2626', marginBottom: '1rem' }}>Share this securely with the member. They should change it after logging in.</p>
            <button className="admin-btn-primary" onClick={() => setTempPwd('')} style={{ width: '100%', justifyContent: 'center' }}>Done</button>
          </div>
        </div>
      )}

      {/* Member detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div className="admin-card" style={{ maxWidth: 600, width: '100%', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Member Profile</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>{selected.memberId}</span>
              </div>
              <button onClick={() => setSelected(null)} className="admin-btn-action"><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              {[
                ['Member ID', selected.memberId],
                ['Name', selected.name],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Unit', selected.unitName],
                ['College', selected.college],
                ['Department & Year', `${selected.department || ''} (${selected.year || ''})`],
                ['Membership Type', selected.membershipType || 'MEMBER'],
                ['Membership Drive', selected.driveName || 'Direct / General'],
                ['Membership Period', selected.academicYear || '—'],
                ['Preferred Role (Nomination)', selected.preferredLeadershipRole || 'None'],
                ['Official Assigned Role', selected.assignedRole || selected.roleLabel || 'Member'],
                ['Status', selected.status],
                ['Joined', selected.joinedAt ? new Date(selected.joinedAt).toLocaleDateString() : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ gridColumn: k === 'Email' || k === 'College' || k === 'Preferred Role (Nomination)' ? 'span 2' : undefined }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.2rem' }}>{k.toUpperCase()}</div>
                  <div style={{ color: '#0F172A', fontWeight: k.includes('Role') || k.includes('ID') ? 700 : 500 }}>{v || '—'}</div>
                </div>
              ))}
            </div>

            {/* Role Assignment Control */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #CBD5E1', marginBottom: '1.25rem' }}>
              <label className="admin-label">Assign / Update Official Leadership Role</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                <select
                  value={editRoleInput}
                  onChange={e => setEditRoleInput(e.target.value)}
                  className="admin-select"
                  style={{ flex: 1 }}
                >
                  <option value="Member">Member (General)</option>
                  {leadershipRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  className="admin-btn-primary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Save Role
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', display: 'block' }}>
                This updates the official title printed on their digital E-Card and public verification page.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selected.status !== 'Active'      && <button className="admin-btn-primary" onClick={() => changeStatus(selected.id, 'Active')}>Activate</button>}
                {selected.status === 'Active'      && <button className="admin-btn-secondary" style={{ color: '#C2410C' }} onClick={() => changeStatus(selected.id, 'Suspended')}>Suspend</button>}
                {selected.status !== 'Deactivated' && <button className="admin-btn-secondary" style={{ color: '#BE123C' }} onClick={() => changeStatus(selected.id, 'Deactivated')}>Deactivate</button>}
              </div>
              <button className="admin-btn-secondary" onClick={() => resetPassword(selected.id)}><RefreshCw size={13} /> Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Registered Members Register</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>{total} member{total !== 1 ? 's' : ''} active across chapters</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={handleExportCsv} className="admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
            <FileText size={14} /> Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label className="admin-label">Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, Member ID…" className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Unit / Chapter</label>
            <select value={filterUnit} onChange={e => { setFUnit(e.target.value); setPage(1); }} className="admin-select">
              <option value="">All Units</option>
              {(units || []).map(u => <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Academic Year</label>
            <select value={filterYear} onChange={e => { setFYear(e.target.value); setPage(1); }} className="admin-select">
              <option value="">All Academic Years</option>
              {(academicYears || []).map(y => <option key={y.id || y._id} value={y.id || y._id}>{y.year}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Type</label>
            <select value={filterType} onChange={e => { setFType(e.target.value); setPage(1); }} className="admin-select">
              <option value="">All Types</option>
              <option value="MEMBER">Member</option>
              <option value="LEADERSHIP">Leadership</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select value={filterStatus} onChange={e => { setFSt(e.target.value); setPage(1); }} className="admin-select">
              <option value="">All Statuses</option>
              {['Active','Suspended','Expired','Deactivated'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Per Page</label>
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="admin-select">
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
          <button type="submit" className="admin-btn-primary" style={{ justifySelf: 'start', height: '40px' }}><Search size={15} /> Filter</button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={32} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : members.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No members found. Approve a join application to create a member account.</div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Type</th>
                <th>Designation / Role</th>
                <th>Drive</th>
                <th>Period</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td><code style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 700 }}>{m.memberId}</code></td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>{m.unitName || '—'}</td>
                  <td>
                    {m.membershipType === 'LEADERSHIP' ? (
                      <span style={{ fontSize: '0.7rem', background: '#FFE4E6', color: '#BE123C', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800 }}>
                        LEADERSHIP
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', background: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                        MEMBER
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: m.assignedRole ? '#C2410C' : '#334155' }}>
                      {m.assignedRole || m.roleLabel || 'Member'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>{m.driveName || 'Direct / General'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7' }}>{m.academicYear || '—'}</span>
                  </td>
                  <td>
                    <span style={{ background: m.status === 'Active' ? '#DCFCE7' : '#FFF1F2', color: statusColor[m.status] || '#475569', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-btn-action" onClick={() => openMemberDetail(m)}><Eye size={15} /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {total > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-btn-secondary">← Prev</button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#475569' }}>Page {page} of {Math.ceil(total / limit)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)} className="admin-btn-secondary">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN MEMBER ANNOUNCEMENTS MODULE
// ═════════════════════════════════════════════════════════════════════════════
function AdminMemberAnnouncementsModule({ toast, units, admin }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', unitId: '', isGlobal: false, isActive: true });

  async function load() {
    setLoading(true);
    try {
      const d = await api('/api/unit-announcements');
      if (d.success) setItems(d.data || []);
    } catch (e) { toast(e.message, 'error'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ title: '', content: '', priority: 'normal', unitId: units[0]?.id || units[0]?._id || '', isGlobal: false, isActive: true });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({ title: item.title, content: item.content || '', priority: item.priority, unitId: item.unit_id || '', isGlobal: item.is_global, isActive: item.is_active });
    setEditing(item);
    setShowForm(true);
  }

  async function handleSave() {
    try {
      const body = { ...form };
      if (editing) {
        await api(`/api/unit-announcements/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast('Announcement updated.');
      } else {
        await api('/api/unit-announcements', { method: 'POST', body: JSON.stringify(body) });
        toast('Announcement created.');
      }
      setShowForm(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api(`/api/unit-announcements/${id}`, { method: 'DELETE' });
      toast('Announcement deleted.');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  const priorityBg = { high: '#FFF7ED', normal: '#EFF6FF', low: '#F0FDF4' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="admin-card" style={{ maxWidth: 520, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>{editing ? 'Edit' : 'New'} Announcement</h3>
              <button onClick={() => setShowForm(false)} className="admin-btn-action"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input" placeholder="Announcement title" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="admin-input" rows={4} placeholder="Announcement body…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="admin-input">
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">Unit</label>
                  <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))} className="admin-input">
                    <option value="">— Select Unit —</option>
                    {units.map(u => <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              {admin?.role === 'MAIN_ADMIN' && (
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={form.isGlobal} onChange={e => setForm(f => ({ ...f, isGlobal: e.target.checked }))} />
                  Mark as Global (visible to all units)
                </label>
              )}
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                Active (visible to members)
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="admin-btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
              <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Member Announcements</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.875rem' }}>Publish notices to your members by unit.</p>
        </div>
        <button className="admin-btn-primary" onClick={openNew}><Plus size={15} /> New Announcement</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={32} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : items.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No announcements yet. Create one to notify your members.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {items.map(item => (
            <div key={item.id} className="admin-card" style={{ borderLeft: `4px solid ${item.priority === 'high' ? '#EA580C' : item.priority === 'low' ? '#16A34A' : '#0284C7'}`, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>{item.title}</h3>
                    <span style={{ background: priorityBg[item.priority], fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>{item.priority}</span>
                    {item.is_global && <span style={{ background: '#1E3A5F', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>Global</span>}
                    {!item.is_active && <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>Inactive</span>}
                  </div>
                  {item.content && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569' }}>{item.content}</p>}
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                    {item.units?.name || 'No unit'} · {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button className="admin-btn-action" onClick={() => openEdit(item)}><Edit size={15} /></button>
                  <button className="admin-btn-action" style={{ color: '#DC2626' }} onClick={() => handleDelete(item.id)}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN MEMBER CERTIFICATES MODULE
// ═════════════════════════════════════════════════════════════════════════════
function AdminMemberCertificatesModule({ toast, units, admin }) {
  const [certs, setCerts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ memberId: '', title: '', description: '', eventId: '' });
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving]     = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api('/api/member/certificates');
      if (d.success) setCerts(d.data || []);
    } catch (e) { toast(e.message, 'error'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleIssue(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('memberId',    form.memberId);
      fd.append('title',       form.title);
      fd.append('description', form.description);
      if (form.eventId) fd.append('eventId', form.eventId);
      if (certFile)    fd.append('certificate', certFile);

      const res  = await fetch('/api/member/certificates', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (data.success) {
        toast('Certificate issued successfully.');
        setShowForm(false);
        setForm({ memberId: '', title: '', description: '', eventId: '' });
        setCertFile(null);
        load();
      } else {
        throw new Error(data.message || 'Failed.');
      }
    } catch (err) { toast(err.message, 'error'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await api(`/api/member/certificates/${id}`, { method: 'DELETE' });
      toast('Deleted.');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="admin-card" style={{ maxWidth: 520, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Issue Certificate</h3>
              <button onClick={() => setShowForm(false)} className="admin-btn-action"><X size={18} /></button>
            </div>
            <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-input-group">
                <label className="admin-label">Member ID (database UUID) *</label>
                <input required value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))} className="admin-input" placeholder="Member's database UUID" />
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Find the ID in the Members table above.</span>
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Certificate Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input" placeholder="e.g. Certificate of Participation" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-input" rows={3} placeholder="Event name, date, or notes…" />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Certificate File (PDF or image)</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setCertFile(e.target.files[0])} className="admin-input" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="admin-btn-primary" disabled={saving}>{saving ? 'Issuing…' : 'Issue Certificate'}</button>
                <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Member Certificates</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.875rem' }}>Issue and manage digital certificates for members.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Issue Certificate</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={32} className="animate-spin" color="var(--primary-blue)" /></div>
      ) : certs.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No certificates issued yet.</div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Member</th>
                <th>Event</th>
                <th>Issued</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>{c.members?.name} <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>({c.members?.member_id})</span></td>
                  <td>{c.events?.title || '—'}</td>
                  <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{new Date(c.issued_at).toLocaleDateString()}</td>
                  <td>{c.file_url ? <a href={c.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-blue)' }}><ExternalLink size={15} /></a> : '—'}</td>
                  <td>
                    <button className="admin-btn-action" style={{ color: '#DC2626' }} onClick={() => handleDelete(c.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MEMBERSHIP DRIVES MODULE
// ═════════════════════════════════════════════════════════════════════════════
function MembershipDrivesModule({ toast, units, academicYears, admin }) {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnit, setFilterUnit] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    unitId: '',
    academicYearId: '',
    startDate: '',
    endDate: '',
    idFormat: 'MAGIC-{UNIT}-{NUMBER}',
    startNumber: 1,
    paddingDigits: 3,
    status: 'DRAFT',
    description: ''
  });

  const loadDrives = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterUnit) params.set('unitId', filterUnit);
      if (filterStatus) params.set('status', filterStatus);
      if (filterYear) params.set('academicYearId', filterYear);
      const d = await api(`/api/membership-drives?${params.toString()}`);
      if (d.success) setDrives(d.data || []);
    } catch (e) {
      toast(e.message, 'error');
    }
    setLoading(false);
  }, [filterUnit, filterStatus, filterYear, toast]);

  useEffect(() => { loadDrives(); }, [loadDrives]);

  const openCreateModal = () => {
    setEditingDrive(null);
    const defUnit = units?.[0]?._id || units?.[0]?.id || '';
    const defYear = academicYears?.[0]?._id || academicYears?.[0]?.id || '';
    setForm({
      name: '',
      unitId: defUnit,
      academicYearId: defYear,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      idFormat: 'MAGIC-{UNIT}-{NUMBER}',
      startNumber: 1,
      paddingDigits: 3,
      status: 'DRAFT',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (d) => {
    setEditingDrive(d);
    setForm({
      name: d.name || '',
      unitId: d.unit_id || d.unitId?._id || d.unitId?.id || '',
      academicYearId: d.academic_year_id || d.academicYearId?._id || d.academicYearId?.id || '',
      startDate: d.start_date || '',
      endDate: d.end_date || '',
      idFormat: d.id_format || 'MAGIC-{UNIT}-{NUMBER}',
      startNumber: d.start_number || 1,
      paddingDigits: d.padding_digits || 3,
      status: d.status || 'DRAFT',
      description: d.description || ''
    });
    setShowModal(true);
  };

  const handleStatusChange = async (driveId, newStatus) => {
    try {
      await api(`/api/membership-drives/${driveId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      toast(`Drive status updated to ${newStatus}.`);
      loadDrives();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleDelete = async (driveId, name) => {
    if (!window.confirm(`Are you sure you want to delete membership drive "${name}"?`)) return;
    try {
      await api(`/api/membership-drives/${driveId}`, { method: 'DELETE' });
      toast('Membership drive deleted.');
      loadDrives();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Drive name is required.', 'error'); return; }
    if (!form.unitId) { toast('Please select a unit/chapter.', 'error'); return; }
    if (!form.academicYearId) { toast('Please select an academic year.', 'error'); return; }

    setSubmitting(true);
    try {
      if (editingDrive) {
        await api(`/api/membership-drives/${editingDrive.id || editingDrive._id}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        toast('Membership drive updated successfully.');
      } else {
        await api('/api/membership-drives', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        toast('Membership drive created successfully.');
      }
      setShowModal(false);
      loadDrives();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute live ID preview
  const getSelectedUnitCode = () => {
    const u = (units || []).find(item => (item._id || item.id) === form.unitId);
    return u?.code || 'UNIT';
  };

  const getSelectedYear = () => {
    const y = (academicYears || []).find(item => (item._id || item.id) === form.academicYearId);
    return y?.year || '2026';
  };

  const computeIdPreview = () => {
    const unitCode = getSelectedUnitCode();
    const yearStr = getSelectedYear();
    const pad = Math.max(1, parseInt(form.paddingDigits) || 3);
    const num = String(form.startNumber || 1).padStart(pad, '0');
    let fmt = form.idFormat || 'MAGIC-{UNIT}-{NUMBER}';
    return fmt
      .replace(/\{UNIT\}/gi, unitCode)
      .replace(/\{NUMBER\}/gi, num)
      .replace(/\{YEAR\}/gi, yearStr);
  };

  const statusBadgeStyle = {
    OPEN:     { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', label: 'OPEN' },
    UPCOMING: { bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC', label: 'UPCOMING' },
    DRAFT:    { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: 'DRAFT' },
    CLOSED:   { bg: '#FFE4E6', text: '#BE123C', border: '#FDA4AF', label: 'CLOSED' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div className="admin-card" style={{ maxWidth: 640, width: '100%', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  {editingDrive ? 'Edit Membership Drive' : 'Create Membership Drive'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Configure drive parameters, ID format series, and intake session.
                </span>
              </div>
              <button onClick={() => setShowModal(false)} className="admin-btn-action"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="admin-label">Drive Name *</label>
                <input
                  required
                  placeholder="e.g. MAGIC Youth Membership Drive 2026-27"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="admin-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="admin-label">Target Unit / Chapter *</label>
                  <select
                    required
                    value={form.unitId}
                    onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="">Select Chapter...</option>
                    {(units || []).map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Academic Year / Period *</label>
                  <select
                    required
                    value={form.academicYearId}
                    onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="">Select Academic Year...</option>
                    {(academicYears || []).map(y => (
                      <option key={y._id || y.id} value={y._id || y.id}>
                        {y.year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="admin-label">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* ID Series Configuration */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', border: '1.5px solid #CBD5E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="admin-label" style={{ margin: 0, fontWeight: 800 }}>Member ID Series Format</label>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Tokens: {'{UNIT}'}, {'{NUMBER}'}, {'{YEAR}'}</span>
                </div>

                <input
                  required
                  value={form.idFormat}
                  onChange={e => setForm(f => ({ ...f, idFormat: e.target.value }))}
                  placeholder="e.g. MAGIC-{UNIT}-{NUMBER} or MY-ALIET-2027-{NUMBER}"
                  className="admin-input"
                  style={{ fontFamily: 'monospace', fontWeight: 700 }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div>
                    <label className="admin-label">Starting Number</label>
                    <input
                      type="number"
                      min="1"
                      value={form.startNumber}
                      onChange={e => setForm(f => ({ ...f, startNumber: parseInt(e.target.value) || 1 }))}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Number Padding Digits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={form.paddingDigits}
                      onChange={e => setForm(f => ({ ...f, paddingDigits: parseInt(e.target.value) || 3 }))}
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* Live ID Preview */}
                <div style={{ marginTop: '0.85rem', background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px dashed #0284C7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Live Generated ID Sample:</span>
                  <code style={{ fontSize: '0.9375rem', fontWeight: 900, color: 'var(--primary-blue)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {computeIdPreview()}
                  </code>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="admin-label">Initial Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="DRAFT">DRAFT (Not accepting)</option>
                    <option value="UPCOMING">UPCOMING (Announced)</option>
                    <option value="OPEN">OPEN (Accepting Applications)</option>
                    <option value="CLOSED">CLOSED (Intake Finished)</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Description / Remarks</label>
                  <input
                    placeholder="e.g. Spring 2026 Batch Intake"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingDrive ? 'Update Drive' : 'Create Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Membership Drives</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Manage active and upcoming membership drives, automated ID format series, and academic session linkages.
          </p>
        </div>
        <button className="admin-btn-primary" onClick={openCreateModal}>
          <Plus size={15} /> Create Membership Drive
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label className="admin-label">Filter Unit</label>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="admin-select">
              <option value="">All Units</option>
              {(units || []).map(u => (
                <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Filter Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="admin-select">
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN (Active)</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Filter Academic Year</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="admin-select">
              <option value="">All Academic Years</option>
              {(academicYears || []).map(y => (
                <option key={y._id || y.id} value={y._id || y.id}>{y.year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drives Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-blue)" />
        </div>
      ) : drives.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          No membership drives found. Click <strong>Create Membership Drive</strong> above to configure your first drive.
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Drive Name</th>
                <th>Unit / Chapter</th>
                <th>Period / Academic Year</th>
                <th>ID Format Series</th>
                <th>Next Available Number</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drives.map(d => {
                const st = statusBadgeStyle[d.status] || statusBadgeStyle.DRAFT;
                const pad = Math.max(1, parseInt(d.padding_digits) || 3);
                const nextFormatted = String(d.next_number || d.start_number || 1).padStart(pad, '0');
                const samplePreview = (d.id_format || 'MAGIC-{UNIT}-{NUMBER}')
                  .replace(/\{UNIT\}/gi, d.unit?.code || 'UNIT')
                  .replace(/\{NUMBER\}/gi, nextFormatted)
                  .replace(/\{YEAR\}/gi, d.academic_year?.year || '2026');

                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{d.name}</div>
                      {d.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{d.description}</div>
                      )}
                      {(d.start_date || d.end_date) && (
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                          {d.start_date ? new Date(d.start_date).toLocaleDateString() : '—'} &rarr; {d.end_date ? new Date(d.end_date).toLocaleDateString() : 'Ongoing'}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.unit?.name || '—'}</div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Code: {d.unit?.code}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#0369A1', background: '#F0F9FF', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem' }}>
                        {d.academic_year?.year || '—'}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 700, display: 'block' }}>
                        {d.id_format}
                      </code>
                      <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600 }}>
                        Next: {samplePreview}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.875rem', color: '#0F172A' }}>
                        #{nextFormatted}
                      </span>
                    </td>
                    <td>
                      <select
                        value={d.status}
                        onChange={e => handleStatusChange(d.id, e.target.value)}
                        style={{
                          background: st.bg,
                          color: st.text,
                          border: `1px solid ${st.border}`,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          borderRadius: '999px',
                          padding: '0.25rem 0.6rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="OPEN">OPEN (Active)</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button className="admin-btn-action" title="Edit Drive" onClick={() => openEditModal(d)}>
                          <Edit size={14} />
                        </button>
                        <button className="admin-btn-action" title="Delete Drive" style={{ color: '#BE123C' }} onClick={() => handleDelete(d.id, d.name)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
