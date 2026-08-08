import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Calendar, CalendarDays, Image, FileText,
  Settings, LogOut,
  ChevronDown, Menu, X, Loader2, Plus, Check, AlertCircle, Edit, Trash2,
  ShieldCheck, ToggleLeft, ToggleRight, KeyRound, Download, HeartHandshake, MessageSquare,
} from 'lucide-react';
import magicLogo from '../../assets/magic-logo.png';

// ─── API helper ───────────────────────────────────────────────────────────────
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

async function apiForm(url, formData) {
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl border pointer-events-auto ${
          t.type === 'error' ? 'bg-red-950 border-red-700 text-red-200' : 'bg-emerald-950 border-emerald-700 text-emerald-200'
        }`}>
          {t.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [module,  setModule]  = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts,  setToasts]  = useState([]);
  const [units,   setUnits]   = useState([]);
  const [currentUnitId, setCurrentUnitId] = useState('all');

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  // Verify auth on mount
  useEffect(() => {
    api('/api/auth/status')
      .then(d => {
        if (!d.loggedIn) { navigate('/admin/login'); return; }
        setAdmin(d.admin);
        setLoading(false);
      })
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  // Load units
  const fetchUnits = useCallback(() => {
    if (!admin) return;
    const url = admin.role === 'MAIN_ADMIN'
      ? '/api/units?includeInactive=true'
      : `/api/units?includeInactive=false`;
    api(url).then(d => {
      if (d.success) {
        const allUnits = d.data || [];
        const filtered = admin.role === 'MAIN_ADMIN'
          ? allUnits
          : allUnits.filter(u => admin.assignedUnitIds?.includes(u._id));
        setUnits(filtered);
        if (filtered.length > 0 && admin.role === 'SUB_ADMIN' && currentUnitId === 'all') {
          setCurrentUnitId(filtered[0]._id);
        }
      }
    }).catch(() => {});
  }, [admin, currentUnitId]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/admin/login');
  };

  // Navigation modules based on role
  const modules = [
    { key: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { key: 'units',     label: 'Units & Teams', icon: Building2 },
    { key: 'events',    label: 'Events',        icon: Calendar },
    { key: 'gallery',   label: 'Gallery',       icon: Image },
    { key: 'documents', label: 'Documentation', icon: FileText },
    { key: 'join',      label: 'Join Requests', icon: HeartHandshake },
    { key: 'messages',  label: 'Messages',      icon: MessageSquare },
    { key: 'settings',  label: 'Settings',      icon: Settings },
  ];

  if (loading) {
    return (
      <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 36, height: 36, color: '#5B21B6' }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Toast toasts={toasts} />

      {/* Clean Top Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <a href="/" className="admin-brand">
            <div className="admin-brand-icon">
              <ShieldCheck style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <span className="admin-brand-title">MAGIC YOUTH</span>
              <span className="admin-badge">Admin Portal</span>
            </div>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {units.length > 0 && (
              <div style={{ position: 'relative' }}>
                <select
                  value={currentUnitId}
                  onChange={e => setCurrentUnitId(e.target.value)}
                  className="event-filter-select"
                  style={{ paddingRight: '2rem' }}
                >
                  {admin?.role === 'MAIN_ADMIN' && <option value="all">All Units</option>}
                  {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ fontSize: '0.8125rem', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#1F2937' }}>{admin?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{admin?.role === 'MAIN_ADMIN' ? '★ Main Admin' : 'Sub-Admin'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="admin-btn-action"
              style={{ color: '#991B1B', borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Clean Navigation Bar */}
      <nav className="admin-nav-bar">
        <div className="admin-nav-container">
          {modules.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setModule(m.key)}
                className={`admin-nav-item ${module === m.key ? 'active' : ''}`}
              >
                <Icon style={{ width: 16, height: 16 }} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content container */}
      <main className="admin-main-container">
        <div className="admin-module-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
            {modules.find(m => m.key === module)?.label || 'Dashboard'}
          </h1>
        </div>

        {/* Module content */}
        <div>
          {module === 'dashboard' && <DashboardModule admin={admin} currentUnitId={currentUnitId} />}
          {module === 'units'     && <UnitsModule toast={toast} refreshUnits={fetchUnits} />}
          {module === 'events'    && <EventsModule toast={toast} admin={admin} currentUnitId={currentUnitId} units={units} />}
          {module === 'gallery'   && <GalleryModule toast={toast} admin={admin} currentUnitId={currentUnitId} units={units} />}
          {module === 'documents' && <DocumentsModule toast={toast} admin={admin} currentUnitId={currentUnitId} units={units} />}
          {module === 'join'      && <JoinRequestsModule toast={toast} admin={admin} />}
          {module === 'messages'  && <ContactModule toast={toast} admin={admin} />}
          {module === 'settings'  && <SettingsModule toast={toast} admin={admin} />}
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
function DashboardModule({ admin, currentUnitId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/stats').then(d => { if (d.success) setStats(d.data); setLoading(false); }).catch(() => setLoading(false));
  }, [currentUnitId]);

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin w-6 h-6 text-purple-400" /></div>;

  const cards = [
    { label: 'Units',        value: stats?.totalUnits     ?? 0, color: 'from-purple-600 to-violet-600' },
    { label: 'Events',       value: stats?.totalEvents    ?? 0, color: 'from-blue-600 to-indigo-600' },
    { label: 'Gallery',      value: stats?.totalPhotos    ?? 0, color: 'from-pink-600 to-rose-600' },
    { label: 'Documents',    value: stats?.totalDocuments ?? 0, color: 'from-emerald-600 to-teal-600' },
    { label: 'Applications', value: stats?.totalJoinRequests ?? 0, color: 'from-amber-600 to-orange-600' },
    { label: 'Messages',     value: stats?.totalMessages  ?? 0, color: 'from-cyan-600 to-sky-600' },
    ...(admin?.role === 'MAIN_ADMIN' ? [{ label: 'Sub-Admins', value: stats?.totalSubAdmins ?? 0, color: 'from-fuchsia-600 to-purple-600' }] : []),
    ...(stats?.pendingJoinRequests > 0 ? [{ label: 'Pending Apps', value: stats.pendingJoinRequests, color: 'from-red-600 to-pink-600', alert: true }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.375rem' }}>
          Welcome back, {admin?.name?.split(' ')[0]} 👋
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
          {admin?.role === 'MAIN_ADMIN' ? 'You have full platform access.' : 'Manage your assigned units.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {cards.map(c => (
          <div key={c.label} className="admin-card" style={{ padding: '1.25rem', borderLeft: c.alert ? '4px solid #EF4444' : '4px solid #5B21B6' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: c.alert ? '#DC2626' : '#5B21B6', marginBottom: '0.25rem' }}>{c.value}</div>
            <p style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600, margin: 0 }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {stats?.recentEvents?.length > 0 && (
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: '1rem' }}>Recent Events</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.recentEvents.map(e => (
              <div key={e._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 600 }}>{e.title}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Unit Hierarchy Sub-Component ──────────────────────────────────────────────
function UnitHierarchyTree({ unit, toast, onUpdate }) {
  const [years, setYears] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState({}); // teamId -> member list
  const [loading, setLoading] = useState(true);

  // Quick Add states
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearStr, setNewYearStr] = useState('');

  const [activeYearForTeam, setActiveYearForTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('Executive Board');

  const [activeTeamForMember, setActiveTeamForMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', position: 'Lead', biography: '', department: '' });
  const [memberPhoto, setMemberPhoto] = useState(null);   // File object
  const [memberPhotoPreview, setMemberPhotoPreview] = useState(null); // Object URL

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [yRes, tRes] = await Promise.all([
        api(`/api/academic-years?unitId=${unit._id}`),
        api(`/api/teams?unitId=${unit._id}`)
      ]);
      const loadedYears = yRes.data || [];
      const loadedTeams = tRes.data || [];
      setYears(loadedYears);
      setTeams(loadedTeams);

      const memPromises = loadedTeams.map(t =>
        api(`/api/teams/${t._id}/members`).then(m => ({ teamId: t._id, list: m.data || [] }))
      );
      const memResults = await Promise.all(memPromises);
      const map = {};
      memResults.forEach(r => { map[r.teamId] = r.list; });
      setMembers(map);
    } catch (e) { toast(e.message, 'error'); }
    setLoading(false);
  }, [unit._id, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const addYear = async () => {
    if (!newYearStr.trim()) { toast('Please enter a Year (e.g. 2025-2026)', 'error'); return; }
    try {
      await api('/api/academic-years', { method: 'POST', body: JSON.stringify({ unitId: unit._id, year: newYearStr }) });
      toast(`Academic year ${newYearStr} created.`);
      setNewYearStr(''); setShowAddYear(false); loadData(); onUpdate?.();
    } catch (e) { toast(e.message, 'error'); }
  };

  const addTeam = async (academicYearId) => {
    if (!newTeamName.trim()) { toast('Please enter a Team Name', 'error'); return; }
    try {
      await api('/api/teams', { method: 'POST', body: JSON.stringify({ unitId: unit._id, academicYearId, name: newTeamName }) });
      toast(`Team ${newTeamName} created.`);
      setNewTeamName('Executive Board'); setActiveYearForTeam(null); loadData(); onUpdate?.();
    } catch (e) { toast(e.message, 'error'); }
  };

  const addMember = async (teamId) => {
    if (!memberForm.name.trim() || !memberForm.position.trim()) {
      toast('Please enter Member Name and Position (e.g. Lead, President)', 'error'); return;
    }
    try {
      const fd = new FormData();
      fd.append('name', memberForm.name);
      fd.append('position', memberForm.position);
      fd.append('biography', memberForm.biography || '');
      fd.append('department', memberForm.department || '');
      if (memberPhoto) fd.append('photo', memberPhoto);

      await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      }).then(async r => {
        const d = await r.json();
        if (!d.success) throw new Error(d.message);
        return d;
      });

      toast(`Lead/Member ${memberForm.name} added.`);
      setMemberForm({ name: '', position: 'Lead', biography: '', department: '' });
      setMemberPhoto(null);
      setMemberPhotoPreview(null);
      setActiveTeamForMember(null);
      loadData();
    } catch (e) { toast(e.message, 'error'); }
  };

  const deleteMember = async (memberId) => {
    if (!confirm('Remove this lead/member?')) return;
    try {
      await api(`/api/teams/members/${memberId}`, { method: 'DELETE' });
      toast('Lead/Member removed.'); loadData();
    } catch (e) { toast(e.message, 'error'); }
  };

  const editTeam = async (team) => {
    const newName = prompt('Enter new team name:', team.name);
    if (!newName) return;
    try {
      await api(`/api/teams/${team._id}`, { method: 'PATCH', body: JSON.stringify({ name: newName }) });
      toast('Team name updated.');
      loadData(); onUpdate?.();
    } catch (e) { toast(e.message, 'error'); }
  };

  const archiveTeam = async (teamId) => {
    if (!confirm('Archive this team?')) return;
    try {
      await api(`/api/teams/${teamId}/archive`, { method: 'PATCH' });
      toast('Team archived.'); loadData(); onUpdate?.();
    } catch (e) { toast(e.message, 'error'); }
  };

  const unarchiveTeam = async (teamId) => {
    if (!confirm('Unarchive this team?')) return;
    try {
      await api(`/api/teams/${teamId}/unarchive`, { method: 'PATCH' });
      toast('Team unarchived.'); loadData(); onUpdate?.();
    } catch (e) { toast(e.message, 'error'); }
  };

  const deleteTeam = async (teamId) => {
    if (!confirm('Delete this team?')) return;
    try {
      await api(`/api/teams/${teamId}`, { method: 'DELETE' });
      toast('Team deleted.'); loadData(); onUpdate?.();
    } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <CalendarDays style={{ width: 16, height: 16, color: '#5B21B6' }} /> Academic Years &amp; Leads ({years.length})
        </h4>
        <button onClick={() => setShowAddYear(!showAddYear)} className="admin-btn-action">
          <Plus style={{ width: 14, height: 14 }} /> Add Year
        </button>
      </div>

      {showAddYear && (
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#F8F7FC', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}>
          <input placeholder="Year (e.g. 2025-2026)" value={newYearStr} onChange={e => setNewYearStr(e.target.value)}
            className="admin-input" style={{ flex: 1, padding: '0.5rem 0.75rem' }} />
          <button onClick={addYear} className="admin-btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Save</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><Loader2 style={{ width: 20, height: 20, color: '#5B21B6' }} className="animate-spin" /></div>
      ) : years.length === 0 ? (
        <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>No Academic Years created yet for this unit.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {years.map(y => {
            const yearTeams = teams.filter(t => (t.academicYearId?._id || t.academicYearId) === y._id);
            return (
              <div key={y._id} style={{ backgroundColor: '#F8F7FC', border: '1px solid #E5E7EB', borderRadius: '0.875rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#5B21B6', backgroundColor: '#EDE9FE', padding: '0.25rem 0.625rem', borderRadius: '9999px' }}>
                    Academic Year: {y.year}
                  </span>
                  <button onClick={() => setActiveYearForTeam(activeYearForTeam === y._id ? null : y._id)} className="admin-btn-action">
                    <Plus style={{ width: 12, height: 12 }} /> Add Team
                  </button>
                </div>

                {activeYearForTeam === y._id && (
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem', backgroundColor: '#FFFFFF', borderRadius: '0.625rem', border: '1px solid #E5E7EB' }}>
                    <input placeholder="Team Name (e.g. Executive Board)" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                      className="admin-input" style={{ flex: 1, padding: '0.375rem 0.625rem' }} />
                    <button onClick={() => addTeam(y._id)} className="admin-btn-primary" style={{ width: 'auto', padding: '0.375rem 0.875rem' }}>Create Team</button>
                  </div>
                )}

                {yearTeams.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic', margin: 0 }}>No teams in this academic year.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingLeft: '0.5rem', borderLeft: '2px solid #EDE9FE' }}>
                    {yearTeams.map(t => {
                      const teamMems = members[t._id] || [];
                      return (
                        <div key={t._id} style={{ backgroundColor: '#FFFFFF', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: t.status === 'Active' ? '#D1FAE5' : '#F3F4F6', color: t.status === 'Active' ? '#065F46' : '#4B5563' }}>{t.status}</span>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937' }}>{t.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button onClick={() => setActiveTeamForMember(activeTeamForMember === t._id ? null : t._id)} className="admin-btn-action">
                                <Plus style={{ width: 12, height: 12 }} /> Add Lead
                              </button>
                              <button onClick={() => deleteTeam(t._id)} className="admin-btn-danger">
                                <Trash2 style={{ width: 12, height: 12 }} />
                              </button>
                              {t.status === 'Archived' ? (
                                <button onClick={() => unarchiveTeam(t._id)} className="admin-btn-action">Unarchive</button>
                              ) : (
                                <button onClick={() => archiveTeam(t._id)} className="admin-btn-action">Archive</button>
                              )}
                            </div>
                          </div>

                          {activeTeamForMember === t._id && (
                            <div style={{ backgroundColor: '#F8F7FC', padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <input placeholder="Full Name *" value={memberForm.name} onChange={e => setMemberForm(m => ({ ...m, name: e.target.value }))} className="admin-input" style={{ padding: '0.375rem 0.625rem' }} />
                              <input placeholder="Position / Role (e.g. Lead, President) *" value={memberForm.position} onChange={e => setMemberForm(m => ({ ...m, position: e.target.value }))} className="admin-input" style={{ padding: '0.375rem 0.625rem' }} />
                              <input placeholder="Department (e.g. CSE)" value={memberForm.department} onChange={e => setMemberForm(m => ({ ...m, department: e.target.value }))} className="admin-input" style={{ padding: '0.375rem 0.625rem' }} />
                              {/* Photo Upload */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {memberPhotoPreview && (
                                  <img src={memberPhotoPreview} alt="preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #5B21B6', flexShrink: 0 }} />
                                )}
                                <label style={{ flex: 1, cursor: 'pointer' }}>
                                  <div className="admin-input" style={{ padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: memberPhoto ? '#5B21B6' : '#9CA3AF', cursor: 'pointer' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    {memberPhoto ? memberPhoto.name : 'Upload Photo (optional)'}
                                  </div>
                                  <input type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => {
                                      const f = e.target.files?.[0];
                                      if (!f) return;
                                      setMemberPhoto(f);
                                      setMemberPhotoPreview(URL.createObjectURL(f));
                                    }}
                                  />
                                </label>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => addMember(t._id)} className="admin-btn-primary" style={{ width: 'auto', padding: '0.375rem 0.875rem' }}>Add Lead</button>
                                <button onClick={() => { setActiveTeamForMember(null); setMemberPhoto(null); setMemberPhotoPreview(null); }} className="admin-btn-action">Cancel</button>
                              </div>
                            </div>
                          )}

                          {teamMems.length === 0 ? (
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic', margin: 0 }}>No leads/members added yet.</p>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                              {teamMems.map(m => (
                                <div key={m._id} style={{ backgroundColor: '#F8F7FC', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {m.photo ? (
                                      <img src={m.photo} alt={m.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #5B21B6', flexShrink: 0 }} />
                                    ) : (
                                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#5B21B6', flexShrink: 0 }}>
                                        {m.name ? m.name[0].toUpperCase() : 'U'}
                                      </div>
                                    )}
                                    <div>
                                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>{m.name}</p>
                                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{m.position} {m.department ? `(${m.department})` : ''}</p>
                                    </div>
                                  </div>
                                  <button onClick={() => deleteMember(m._id)} className="admin-btn-danger" style={{ padding: '0.2rem 0.4rem' }}>
                                    <Trash2 style={{ width: 12, height: 12 }} />
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Units Module (Main Admin only) ──────────────────────────────────────────
function UnitsModule({ toast, refreshUnits }) {
  const [units,   setUnits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ name: '', code: '', institution: '', location: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [expandedUnitId, setExpandedUnitId] = useState(null);

  const load = () => api('/api/units?includeInactive=true').then(d => { setUnits(d.data || []); setLoading(false); refreshUnits?.(); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api(`/api/units/${editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast('Unit updated.');
      } else {
        await api('/api/units', { method: 'POST', body: JSON.stringify(form) });
        toast('Unit created.');
      }
      setShowForm(false); setEditing(null); setForm({ name: '', code: '', institution: '', location: '', description: '' });
      load();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  };

  const archive = async (id) => {
    if (!confirm('Archive this unit?')) return;
    try { await api(`/api/units/${id}/archive`, { method: 'PATCH' }); toast('Unit archived.'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const unarchive = async (id) => {
    if (!confirm('Unarchive and activate this unit?')) return;
    try { await api(`/api/units/${id}/unarchive`, { method: 'PATCH' }); toast('Unit unarchived and activated.'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Units &amp; Teams</h2>
          <p style={{ fontSize: '0.84375rem', color: '#6B7280', margin: '0.25rem 0 0' }}>Manage Units, Academic Years, Teams, and Leads in one unified view.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', code: '', institution: '', location: '', description: '' }); }}
          className="admin-btn-primary" style={{ width: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} /> New Unit
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>{editing ? 'Edit Unit' : 'Create Unit'}</h3>
          {[['name', 'Unit Name *'], ['code', 'Unit Code *'], ['institution', 'Institution'], ['location', 'Location']].map(([k, l]) => (
            <input key={k} placeholder={l} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="admin-input" />
          ))}
          <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="admin-input" style={{ resize: 'none' }} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={save} disabled={saving} className="admin-btn-primary" style={{ width: 'auto' }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Check style={{ width: 16, height: 16 }} />}
              {editing ? 'Update Unit' : 'Create Unit'}
            </button>
            <button onClick={() => setShowForm(false)} className="admin-btn-action">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {units.map(u => {
            const isExpanded = expandedUnitId === u._id;
            return (
              <div key={u._id} className="admin-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>{u.name}</h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: u.status === 'Active' ? '#D1FAE5' : '#F3F4F6', color: u.status === 'Active' ? '#065F46' : '#4B5563' }}>{u.status}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace', margin: '0.25rem 0 0' }}>Code: {u.code}</p>
                    {u.institution && <p style={{ fontSize: '0.8125rem', color: '#4B5563', margin: '0.25rem 0 0' }}>{u.institution} {u.location ? `— ${u.location}` : ''}</p>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => { setEditing(u); setForm({ name: u.name, code: u.code, institution: u.institution||'', location: u.location||'', description: u.description||'' }); setShowForm(true); }}
                      className="admin-btn-action">Edit</button>

                    {u.status === 'Archived' ? (
                      <button onClick={() => unarchive(u._id)} className="admin-btn-action">Unarchive</button>
                    ) : (
                      <button onClick={() => archive(u._id)} className="admin-btn-action">Archive</button>
                    )}

                    <button onClick={() => setExpandedUnitId(isExpanded ? null : u._id)} className="admin-btn-action" style={{ backgroundColor: isExpanded ? '#EDE9FE' : '#FFFFFF', color: isExpanded ? '#5B21B6' : '#374151' }}>
                      Hierarchy &amp; Leads <ChevronDown style={{ width: 14, height: 14, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                </div>

                {isExpanded && <UnitHierarchyTree unit={u} toast={toast} onUpdate={load} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Academic Years Module ─────────────────────────────────────────────────────
function AcademicYearsModule({ toast, units, currentUnitId }) {
  const [years,   setYears]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ unitId: currentUnitId !== 'all' ? currentUnitId : '', year: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(() => {
    const url = currentUnitId && currentUnitId !== 'all' ? `/api/academic-years?unitId=${currentUnitId}` : '/api/academic-years';
    api(url).then(d => { setYears(d.data || []); setLoading(false); });
  }, [currentUnitId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await api('/api/academic-years', { method: 'POST', body: JSON.stringify(form) });
      toast('Academic year created.');
      setShowForm(false); setForm({ unitId: '', year: '' }); load();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Academic Years</h2>
        <button onClick={() => setShowForm(true)} className="admin-btn-primary" style={{ width: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} /> New Year
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Add Academic Year</h3>
          <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
            className="admin-input">
            <option value="">Select Unit *</option>
            {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <input placeholder="Year (e.g. 2025-2026) *" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
            className="admin-input" />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={save} disabled={saving} className="admin-btn-primary" style={{ width: 'auto' }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Check style={{ width: 16, height: 16 }} />} Create
            </button>
            <button onClick={() => setShowForm(false)} className="admin-btn-action">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {years.map(y => (
                <tr key={y._id}>
                  <td style={{ fontWeight: 600 }}>{y.unitId?.name || '—'}</td>
                  <td style={{ fontWeight: 700, color: '#5B21B6' }}>{y.year}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: y.status === 'Active' ? '#D1FAE5' : '#F3F4F6', color: y.status === 'Active' ? '#065F46' : '#4B5563' }}>{y.status}</span>
                  </td>
                </tr>
              ))}
              {!years.length && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No academic years yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Teams Module ─────────────────────────────────────────────────────────────
function TeamsModule({ toast, admin, currentUnitId, units: propUnits = [], refreshUnits }) {
  const [teams, setTeams] = useState([]);
  const [localUnits, setLocalUnits] = useState(propUnits);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ unitId: '', academicYearId: '', name: 'Executive Board' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (propUnits && propUnits.length > 0) {
      setLocalUnits(propUnits);
    } else {
      api('/api/units?includeInactive=true').then(d => { if (d.success) setLocalUnits(d.data || []); });
    }
  }, [propUnits]);

  const load = useCallback(() => {
    const u = currentUnitId !== 'all' ? `&unitId=${currentUnitId}` : '';
    api(`/api/teams?${u}`).then(d => { setTeams(d.data || []); setLoading(false); });
  }, [currentUnitId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!form.unitId) {
      setYears([]);
      return;
    }
    api(`/api/academic-years?unitId=${form.unitId}`).then(d => setYears(d.data || []));
  }, [form.unitId]);

  const save = async () => {
    if (!form.unitId) { toast('Please select a Unit', 'error'); return; }
    if (!form.academicYearId) { toast('Please select an Academic Year', 'error'); return; }
    if (!form.name.trim()) { toast('Please enter a Team Name', 'error'); return; }

    setSaving(true);
    try {
      await api('/api/teams', { method: 'POST', body: JSON.stringify(form) });
      toast('Team created successfully.');
      setShowForm(false);
      setForm({ unitId: '', academicYearId: '', name: 'Executive Board' });
      load();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete team and all members?')) return;
    try { await api(`/api/teams/${id}`, { method: 'DELETE' }); toast('Team deleted.'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const activeUnits = localUnits.filter(u => u.status !== 'Archived');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', items: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Teams</h2>
        <button onClick={() => { setShowForm(true); refreshUnits?.(); }} className="admin-btn-primary" style={{ width: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} /> New Team
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Create Team</h3>

          <div>
            <label className="admin-label">Unit *</label>
            <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value, academicYearId: '' }))}
              className="admin-input">
              <option value="">Select Unit *</option>
              {activeUnits.map(u => <option key={u._id} value={u._id}>{u.name}{u.institution ? ` (${u.institution})` : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="admin-label">Academic Year *</label>
            <select value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))} disabled={!form.unitId}
              className="admin-input">
              <option value="">Select Academic Year *</option>
              {years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
            </select>
          </div>

          <div>
            <label className="admin-label">Team Name *</label>
            <input placeholder="Team Name (e.g. Executive Board, Core Team)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="admin-input" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={save} disabled={saving || (!!form.unitId && years.length === 0)} className="admin-btn-primary" style={{ width: 'auto' }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Check style={{ width: 16, height: 16 }} />} Create Team
            </button>
            <button onClick={() => setShowForm(false)} className="admin-btn-action">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Unit</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 700, color: '#1F2937' }}>{t.name}</td>
                  <td>{t.unitId?.name || '—'}</td>
                  <td>{t.academicYearId?.year || '—'}</td>
                  <td>
                    <button onClick={() => del(t._id)} className="admin-btn-danger">
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </td>
                </tr>
              ))}
              {!teams.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No teams yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Events Module ─────────────────────────────────────────────────────────────
function EventsModule({ toast, admin, currentUnitId, units = [] }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [years, setYears] = useState([]);
  const [posterFile, setPosterFile] = useState(null);

  const [form, setForm] = useState({
    unitId: currentUnitId !== 'all' ? currentUnitId : '',
    academicYearId: '',
    title: '',
    description: '',
    category: 'Community Service',
    status: 'Upcoming',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    organizers: '',
  });

  const load = useCallback(() => {
    const u = currentUnitId !== 'all' ? `&unitId=${currentUnitId}` : '';
    api(`/api/events?limit=50${u}`).then(d => { setEvents(d.data || []); setLoading(false); });
  }, [currentUnitId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!form.unitId) { setYears([]); return; }
    api(`/api/academic-years?unitId=${form.unitId}`).then(d => setYears(d.data || []));
  }, [form.unitId]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Please enter Event Title', 'error'); return; }
    if (!form.unitId) { toast('Please select a Unit', 'error'); return; }
    if (!form.academicYearId) { toast('Please select an Academic Year', 'error'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (form[k]) fd.append(k, form[k]);
      });
      if (posterFile) {
        fd.append('poster', posterFile);
      }

      await apiForm('/api/events', fd);
      toast('Event created successfully!');
      setShowForm(false);
      setPosterFile(null);
      setForm({
        unitId: currentUnitId !== 'all' ? currentUnitId : '',
        academicYearId: '',
        title: '',
        description: '',
        category: 'Community Service',
        status: 'Upcoming',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        organizers: '',
      });
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this event?')) return;
    try { await api(`/api/events/${id}`, { method: 'DELETE' }); toast('Event deleted.'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Events</h2>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn-primary" style={{ width: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} /> New Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Add New Event</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="admin-label">Unit *</label>
              <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value, academicYearId: '' }))} className="admin-input" required>
                <option value="">Select Unit *</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>

            <div>
              <label className="admin-label">Academic Year *</label>
              <select value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))} disabled={!form.unitId} className="admin-input" required>
                <option value="">Select Academic Year *</option>
                {years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Event Title *</label>
            <input placeholder="Event Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input" required />
          </div>

          <div>
            <label className="admin-label">Description</label>
            <textarea placeholder="Event Description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="admin-input" style={{ resize: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="admin-label">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="admin-input">
                <option value="Program">Program</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Outreach">Outreach</option>
                <option value="Community Service">Community Service</option>
                <option value="Awareness">Awareness</option>
                <option value="Leadership">Leadership</option>
                <option value="Competition">Competition</option>
                <option value="Cultural">Cultural</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="admin-input">
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Event Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="admin-input" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="admin-label">Location</label>
              <input placeholder="Campus / Hall / City" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="admin-input" />
            </div>

            <div>
              <label className="admin-label">Organizers</label>
              <input placeholder="e.g. YES-J Leadership Team" value={form.organizers} onChange={e => setForm(f => ({ ...f, organizers: e.target.value }))} className="admin-input" />
            </div>

            <div>
              <label className="admin-label">Event Poster Image</label>
              <input type="file" accept="image/*" onChange={e => setPosterFile(e.target.files[0])} className="admin-input" style={{ padding: '0.375rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="admin-btn-primary" style={{ width: 'auto' }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Check style={{ width: 16, height: 16 }} />} Create Event
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn-action">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Unit</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e._id}>
                  <td style={{ fontWeight: 700, color: '#1F2937' }}>{e.title}</td>
                  <td>{e.unitId?.name || '—'}</td>
                  <td>{e.category}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>{e.status}</span>
                  </td>
                  <td>
                    <button onClick={() => del(e._id)} className="admin-btn-danger">
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </td>
                </tr>
              ))}
              {!events.length && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Administrators Module ─────────────────────────────────────────────────────
function AdministratorsModule({ toast, units }) {
  const [admins,  setAdmins]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', assignedUnitIds: [] });

  const load = () => api('/api/administrators').then(d => { setAdmins(d.data || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const toggleUnit = (unitId) => {
    setForm(f => ({
      ...f,
      assignedUnitIds: f.assignedUnitIds.includes(unitId)
        ? f.assignedUnitIds.filter(id => id !== unitId)
        : [...f.assignedUnitIds, unitId],
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api('/api/administrators', { method: 'POST', body: JSON.stringify(form) });
      toast('Sub-Admin created.'); setShowForm(false); setForm({ name: '', email: '', password: '', assignedUnitIds: [] }); load();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  };

  const toggleStatus = async (admin) => {
    try {
      await api(`/api/administrators/${admin._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: admin.status === 'Active' ? 'Inactive' : 'Active' }) });
      toast(`Admin ${admin.status === 'Active' ? 'disabled' : 'enabled'}.`); load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const del = async (id) => {
    if (!confirm('Permanently delete this sub-admin?')) return;
    try { await api(`/api/administrators/${id}`, { method: 'DELETE' }); toast('Sub-Admin deleted.'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Administrators</h2>
        <button onClick={() => setShowForm(true)} className="admin-btn-primary" style={{ width: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} /> New Sub-Admin
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Create Sub-Admin</h3>
          {[['name','Full Name *'], ['email','Email *'], ['password','Password *']].map(([k, l]) => (
            <input key={k} type={k === 'password' ? 'password' : 'text'} placeholder={l} value={form[k]}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="admin-input" />
          ))}
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem' }}>Assign Units</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {units.map(u => (
                <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', backgroundColor: form.assignedUnitIds.includes(u._id) ? '#EDE9FE' : '#FFFFFF', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.assignedUnitIds.includes(u._id)} onChange={() => toggleUnit(u._id)} style={{ accentColor: '#5B21B6' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1F2937' }}>{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={save} disabled={saving} className="admin-btn-primary" style={{ width: 'auto' }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Check style={{ width: 16, height: 16 }} />} Create
            </button>
            <button onClick={() => setShowForm(false)} className="admin-btn-action">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {admins.map(a => (
            <div key={a._id} className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>{a.name}</p>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: a.status === 'Active' ? '#D1FAE5' : '#F3F4F6', color: a.status === 'Active' ? '#065F46' : '#4B5563' }}>{a.status}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0.2rem 0 0' }}>{a.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => toggleStatus(a)} className="admin-btn-action">
                  {a.status === 'Active' ? <ToggleLeft style={{ width: 16, height: 16 }} /> : <ToggleRight style={{ width: 16, height: 16 }} />}
                </button>
                <button onClick={() => del(a._id)} className="admin-btn-danger">
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
          {!admins.length && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No sub-admins yet. Create one above.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Join Requests Module ──────────────────────────────────────────────────────
function JoinRequestsModule({ toast, admin, currentUnitId }) {
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = useCallback(() => {
    const u = currentUnitId !== 'all' ? `&unitId=${currentUnitId}` : '';
    const s = filter ? `&status=${filter}` : '';
    api(`/api/join?limit=50${u}${s}`).then(d => { setReqs(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [currentUnitId, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try { await api(`/api/join/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); toast(`Application ${status.toLowerCase()}.`); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Join Requests</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setLoading(true); }}
              className="admin-btn-action" style={{ backgroundColor: filter === s ? '#5B21B6' : '#FFFFFF', color: filter === s ? '#FFFFFF' : '#374151', borderRadius: '9999px', padding: '0.375rem 0.875rem' }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reqs.map(r => (
            <div key={r._id} className="admin-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>{r.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0.2rem 0 0' }}>{r.email} · {r.college}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '0.1rem 0 0' }}>{r.department} · Year {r.year}</p>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: r.status === 'Approved' ? '#D1FAE5' : r.status === 'Pending' ? '#FEF3C7' : '#FEE2E2', color: r.status === 'Approved' ? '#065F46' : r.status === 'Pending' ? '#92400E' : '#991B1B' }}>{r.status}</span>
              </div>
              {r.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6' }}>
                  <button onClick={() => updateStatus(r._id, 'Approved')} className="admin-btn-action" style={{ backgroundColor: '#10B981', color: '#FFFFFF', borderColor: '#10B981' }}>Approve</button>
                  <button onClick={() => updateStatus(r._id, 'Rejected')} className="admin-btn-danger">Reject</button>
                </div>
              )}
            </div>
          ))}
          {!reqs.length && <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No applications found.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Contact Messages Module ───────────────────────────────────────────────────
function ContactModule({ toast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/contact?limit=50').then(d => { setMessages(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try { await api(`/api/contact/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Read' }) }); setMessages(m => m.map(x => x._id === id ? { ...x, status: 'Read' } : x)); }
    catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Contact Messages</h2>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {messages.map(m => (
            <div key={m._id} className="admin-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>{m.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0.1rem 0 0' }}>{m.email} {m.phone ? `· ${m.phone}` : ''}</p>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: m.status === 'New' ? '#EDE9FE' : '#F3F4F6', color: m.status === 'New' ? '#5B21B6' : '#4B5563' }}>{m.status}</span>
              </div>
              {m.subject && <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>{m.subject}</p>}
              <p style={{ fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>{m.message}</p>
              {m.status === 'New' && (
                <button onClick={() => markRead(m._id)} className="admin-btn-action" style={{ marginTop: '0.75rem' }}>Mark as Read</button>
              )}
            </div>
          ))}
          {!messages.length && <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No messages yet.</div>}
        </div>
      )}
    </div>
  );
}

// ─── Settings Module ───────────────────────────────────────────────────────────
function SettingsModule({ toast, admin }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (form.newPassword !== form.confirmPassword) { toast('Passwords do not match.', 'error'); return; }
    if (form.newPassword.length < 8) { toast('Password must be at least 8 characters.', 'error'); return; }
    setSaving(true);
    try {
      await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
      toast('Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Settings</h2>

      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1F2937', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Change Password</h3>
        {[['currentPassword','Current Password'], ['newPassword','New Password'], ['confirmPassword','Confirm New Password']].map(([k, l]) => (
          <input key={k} type="password" placeholder={l} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
            className="admin-input" />
        ))}
        <button onClick={changePassword} disabled={saving} className="admin-btn-primary">
          {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <KeyRound style={{ width: 16, height: 16 }} />} Update Password
        </button>
      </div>
    </div>
  );
}

// ─── Gallery Module ────────────────────────────────────────────────────────────
function GalleryModule({ toast, admin, currentUnitId, units = [] }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [years, setYears] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState({
    unitId: currentUnitId !== 'all' ? currentUnitId : '',
    academicYearId: '',
    album: '',
    category: 'General',
    title: '',
    description: '',
  });

  const load = useCallback(() => {
    const u = currentUnitId !== 'all' ? `&unitId=${currentUnitId}` : '';
    api(`/api/gallery?limit=30${u}`).then(d => { setPhotos(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [currentUnitId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!form.unitId) { setYears([]); return; }
    api(`/api/academic-years?unitId=${form.unitId}`).then(d => setYears(d.data || []));
  }, [form.unitId]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.unitId) { toast('Please select a Unit', 'error'); return; }
    if (!form.academicYearId) { toast('Please select an Academic Year', 'error'); return; }
    if (!selectedFiles || selectedFiles.length === 0) { toast('Please select at least one photo file', 'error'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (form[k]) fd.append(k, form[k]);
      });
      for (let i = 0; i < selectedFiles.length; i++) {
        fd.append('photos', selectedFiles[i]);
      }

      await apiForm('/api/gallery', fd);
      toast('Photo(s) uploaded successfully!');
      setShowForm(false);
      setSelectedFiles([]);
      setForm({
        unitId: currentUnitId !== 'all' ? currentUnitId : '',
        academicYearId: '',
        album: '',
        category: 'General',
        title: '',
        description: '',
      });
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this photo?')) return;
    try { await api(`/api/gallery/${id}`, { method: 'DELETE' }); toast('Photo deleted.'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Gallery</h2>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn-primary" style={{ width: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} /> Add Photos
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Upload Photos to Gallery</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="admin-label">Unit *</label>
              <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value, academicYearId: '' }))} className="admin-input" required>
                <option value="">Select Unit *</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>

            <div>
              <label className="admin-label">Academic Year *</label>
              <select value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))} disabled={!form.unitId} className="admin-input" required>
                <option value="">Select Academic Year *</option>
                {years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="admin-label">Album Name</label>
              <input placeholder="e.g. Annual Convention 2026" value={form.album} onChange={e => setForm(f => ({ ...f, album: e.target.value }))} className="admin-input" />
            </div>

            <div>
              <label className="admin-label">Photo Title</label>
              <input placeholder="Caption / Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input" />
            </div>
          </div>

          <div>
            <label className="admin-label">Select Photo File(s) *</label>
            <input type="file" accept="image/*" multiple onChange={e => setSelectedFiles(Array.from(e.target.files))} className="admin-input" style={{ padding: '0.375rem' }} required />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="admin-btn-primary" style={{ width: 'auto' }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Check style={{ width: 16, height: 16 }} />} Upload Photos
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn-action">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <>
          {!photos.length && <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No photos yet. Click "+ Add Photos" above to upload images.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {photos.map(p => (
              <div key={p._id} style={{ position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', backgroundColor: '#F8F7FC', aspectRatio: '1/1', border: '1px solid #E5E7EB' }}>
                <img src={p.file_path || p.filePath} alt={p.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <button onClick={() => del(p._id)} className="admin-btn-danger" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.375rem' }}>
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Documents Module ──────────────────────────────────────────────────────────
function DocumentsModule({ toast, admin, currentUnitId, units = [] }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [years, setYears] = useState([]);
  const [docFile, setDocFile] = useState(null);

  const [form, setForm] = useState({
    unitId: currentUnitId !== 'all' ? currentUnitId : '',
    academicYearId: '',
    title: '',
    description: '',
    documentType: 'Event Reports',
    visibility: 'Public',
  });

  const load = useCallback(() => {
    const u = currentUnitId !== 'all' ? `&unitId=${currentUnitId}` : '';
    api(`/api/documents/admin/all?limit=50${u}`).then(d => { setDocs(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [currentUnitId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!form.unitId) { setYears([]); return; }
    api(`/api/academic-years?unitId=${form.unitId}`).then(d => setYears(d.data || []));
  }, [form.unitId]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Please enter Document Title', 'error'); return; }
    if (!form.unitId) { toast('Please select a Unit', 'error'); return; }
    if (!form.academicYearId) { toast('Please select an Academic Year', 'error'); return; }
    if (!docFile) { toast('Please select a document file to upload', 'error'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (form[k]) fd.append(k, form[k]);
      });
      fd.append('file', docFile);

      await apiForm('/api/documents', fd);
      toast('Document uploaded successfully!');
      setShowForm(false);
      setDocFile(null);
      setForm({
        unitId: currentUnitId !== 'all' ? currentUnitId : '',
        academicYearId: '',
        title: '',
        description: '',
        documentType: 'Event Reports',
        visibility: 'Public',
      });
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this document?')) return;
    try { await api(`/api/documents/${id}`, { method: 'DELETE' }); toast('Document deleted.'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Documentation</h2>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn-primary" style={{ width: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} /> Add Document
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Upload New Document</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="admin-label">Unit *</label>
              <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value, academicYearId: '' }))} className="admin-input" required>
                <option value="">Select Unit *</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>

            <div>
              <label className="admin-label">Academic Year *</label>
              <select value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))} disabled={!form.unitId} className="admin-input" required>
                <option value="">Select Academic Year *</option>
                {years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Document Title *</label>
            <input placeholder="Document Title (e.g. Annual Activity Report 2026)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="admin-label">Document Type</label>
              <select value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))} className="admin-input">
                <option value="Event Reports">Event Reports</option>
                <option value="Activity Reports">Activity Reports</option>
                <option value="Annual Reports">Annual Reports</option>
                <option value="Unit Reports">Unit Reports</option>
                <option value="Event Proposals">Event Proposals</option>
                <option value="Meeting Minutes">Meeting Minutes</option>
                <option value="Attendance Sheets">Attendance Sheets</option>
                <option value="Certificates">Certificates</option>
                <option value="Notices">Notices</option>
                <option value="Other Documents">Other Documents</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Visibility</label>
              <select value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))} className="admin-input">
                <option value="Public">Public</option>
                <option value="Unit Only">Unit Leads Only</option>
                <option value="Admin Only">Main Admin Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Document File (PDF, DOCX, XLSX, TXT) *</label>
            <input type="file" onChange={e => setDocFile(e.target.files[0])} className="admin-input" style={{ padding: '0.375rem' }} required />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="admin-btn-primary" style={{ width: 'auto' }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Check style={{ width: 16, height: 16 }} />} Upload Document
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn-action">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}><Loader2 style={{ width: 28, height: 28, color: '#5B21B6' }} className="animate-spin" /></div> : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td>{d.documentType}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: d.visibility === 'Public' ? '#D1FAE5' : '#F3F4F6', color: d.visibility === 'Public' ? '#065F46' : '#4B5563' }}>{d.visibility}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`/api/documents/download/${d._id}`} target="_blank" rel="noopener noreferrer" className="admin-btn-action" style={{ padding: '0.25rem 0.5rem' }}><Download style={{ width: 14, height: 14 }} /></a>
                    <button onClick={() => del(d._id)} className="admin-btn-danger" style={{ padding: '0.25rem 0.5rem' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </td>
                </tr>
              ))}
              {!docs.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No documents yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
