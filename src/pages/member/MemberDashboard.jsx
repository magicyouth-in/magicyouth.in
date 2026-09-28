/**
 * src/pages/member/MemberDashboard.jsx
 * Main Member Portal dashboard — sidebar nav + section routing.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, User, Calendar, ClipboardList, Megaphone,
  Award, Star, LogOut, Menu, X, ChevronRight, Bell,
  Loader2, Home, Handshake, BookOpen, Shield
} from 'lucide-react';
import MemberECard          from './MemberECard';
import MemberProfile        from './MemberProfile';
import MemberEvents         from './MemberEvents';
import MemberRegistrations  from './MemberRegistrations';
import MemberAnnouncements  from './MemberAnnouncements';
import MemberCertificates   from './MemberCertificates';

const NAV = [
  { id: 'ecard',         label: 'My E-Card',         icon: CreditCard },
  { id: 'profile',       label: 'My Profile',         icon: User },
  { id: 'events',        label: 'Upcoming Events',    icon: Calendar },
  { id: 'registrations', label: 'My Registrations',   icon: ClipboardList },
  { id: 'announcements', label: 'Announcements',      icon: Megaphone },
  { id: 'certificates',  label: 'My Certificates',    icon: Award },
];

export default function MemberDashboard() {
  const navigate              = useNavigate();
  const [member, setMember]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('ecard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res  = await fetch('/api/member/auth/status', { credentials: 'include' });
      const data = await res.json();
      if (!data.loggedIn) {
        navigate('/member/login', { replace: true });
        return;
      }
      setMember(data.member);
    } catch {
      navigate('/member/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  async function handleLogout() {
    await fetch('/api/member/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/member/login', { replace: true });
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <Loader2 size={40} className="animate-spin" color="#0284C7" />
      </div>
    );
  }

  if (!member) return null;

  const SectionComponent = {
    ecard:         <MemberECard member={member} />,
    profile:       <MemberProfile member={member} onRefresh={checkAuth} />,
    events:        <MemberEvents member={member} />,
    registrations: <MemberRegistrations member={member} />,
    announcements: <MemberAnnouncements member={member} />,
    certificates:  <MemberCertificates member={member} />,
  }[section] || <MemberECard member={member} />;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = section === item.id;
    return (
      <button
        onClick={() => { setSection(item.id); setSidebarOpen(false); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
          background:  active ? 'linear-gradient(135deg, #EFF6FF, #E0F2FE)' : 'transparent',
          color:       active ? '#0284C7' : '#475569',
          fontWeight:  active ? 700 : 500,
          fontSize:    '0.875rem',
          textAlign:   'left',
          transition:  'all 0.15s',
          borderLeft:  active ? '3px solid #0284C7' : '3px solid transparent',
        }}
      >
        <Icon size={18} />
        {item.label}
        {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
      </button>
    );
  };

  const Sidebar = ({ mobile = false }) => (
    <div style={{
      width: mobile ? '100%' : '260px',
      background: '#FFFFFF',
      borderRight: mobile ? 'none' : '1px solid #E2E8F0',
      display: 'flex', flexDirection: 'column',
      height: mobile ? 'auto' : '100vh',
      position: mobile ? 'relative' : 'sticky',
      top: mobile ? 'auto' : 0,
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      {/* Logo/brand */}
      <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/assets/magic-logo.png" alt="MAGIC Youth" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 900, color: '#0284C7' }}>MAGIC <span style={{ color: '#E11D48' }}>Youth</span></div>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>MEMBER PORTAL</div>
          </div>
        </Link>
      </div>

      {/* Member info */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {member.profilePhoto ? (
            <img src={member.profilePhoto} alt={member.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E0F2FE' }} />
          ) : (
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#0284C7,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.125rem', flexShrink: 0 }}>
              {member.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#0284C7', fontWeight: 600, fontFamily: 'monospace' }}>{member.memberId}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{member.unitName}</div>
          </div>
        </div>
        {/* Status badge */}
        <div style={{ marginTop: '0.75rem' }}>
          <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Shield size={10} /> {member.status || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0.75rem 0.75rem', flex: 1 }}>
        {NAV.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid #F1F5F9' }}>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid #FEE2E2', background: '#FFF1F2', color: '#DC2626', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <LogOut size={18} /> Sign Out
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#64748B', fontSize: '0.8rem', textDecoration: 'none', marginTop: '0.5rem' }}>
          <Home size={14} /> Back to website
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Desktop Sidebar */}
      <div style={{ display: 'none' }} className="member-sidebar-desktop">
        <Sidebar />
      </div>
      <div style={{ display: 'flex' }} className="member-layout">
        {/* Sidebar desktop */}
        <div className="member-sidebar">
          <Sidebar />
        </div>

        {/* Mobile Header */}
        <div className="member-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="/assets/magic-logo.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0284C7' }}>MAGIC <span style={{ color: '#E11D48' }}>Youth</span></div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Member Portal</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
              {sidebarOpen ? <X size={24} color="#374151" /> : <Menu size={24} color="#374151" />}
            </button>
          </div>
          {sidebarOpen && (
            <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'absolute', top: '65px', left: 0, right: 0, zIndex: 100, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
              <Sidebar mobile />
            </div>
          )}
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
          {/* Welcome bar */}
          <div style={{ background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: '#FFFFFF', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Welcome, {member.name?.split(' ')[0]} 👋</h2>
              <p style={{ fontSize: '0.8rem', color: '#BAE6FD', margin: 0, marginTop: '0.2rem' }}>{member.unitName} • {member.memberId}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              {/* Notification bell placeholder */}
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer' }}>
                <Bell size={20} color="#FFFFFF" />
              </div>
            </div>
          </div>

          {/* Section content */}
          <div style={{ padding: '1.5rem', maxWidth: '1100px' }}>
            {SectionComponent}
          </div>
        </main>
      </div>

      {/* Responsive CSS */}
      <style>{`
        .member-layout {
          width: 100%;
          position: relative;
        }
        .member-sidebar {
          display: flex;
        }
        .member-mobile-header {
          display: none;
          position: relative;
        }
        @media (max-width: 768px) {
          .member-sidebar { display: none !important; }
          .member-mobile-header { display: block; }
          .member-layout { flex-direction: column; }
          main > div:first-child { /* welcome bar */ padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
