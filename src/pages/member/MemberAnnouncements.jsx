/**
 * src/pages/member/MemberAnnouncements.jsx
 * Unit-specific + global announcements for members.
 */
import React, { useState, useEffect } from 'react';
import { Megaphone, Globe, Building2, Loader2, RefreshCw, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function MemberAnnouncements({ member }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch('/api/unit-announcements/my', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const priorityStyle = {
    high:   { icon: AlertTriangle, bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C', badge: '#EA580C' },
    normal: { icon: Info,          bg: '#EFF6FF', border: '#BAE6FD', color: '#1D4ED8', badge: '#0284C7' },
    low:    { icon: CheckCircle2,  bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', badge: '#16A34A' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Announcements</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Notices from your unit and MAGIC Youth network.
          </p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem', color: '#475569', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={36} className="animate-spin" color="#0284C7" />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px dashed #E2E8F0' }}>
          <Megaphone size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>No announcements</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>There are no announcements for your unit right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {items.map(item => {
            const pStyle = priorityStyle[item.priority] || priorityStyle.normal;
            const PIcon  = pStyle.icon;
            return (
              <div key={item.id} style={{ background: '#FFFFFF', borderRadius: '0.875rem', border: `1px solid ${pStyle.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ background: pStyle.bg, padding: '0.75rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.625rem', borderBottom: `1px solid ${pStyle.border}` }}>
                  <PIcon size={16} color={pStyle.color} />
                  <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: pStyle.color, margin: 0, flex: 1 }}>{item.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {item.is_global ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', background: '#1E3A5F', color: '#FFFFFF', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                        <Globe size={10} /> Global
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', background: pStyle.badge, color: '#FFFFFF', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                        <Building2 size={10} /> {item.units?.name || member?.unitName}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} priority
                    </span>
                  </div>
                </div>
                {item.content && (
                  <div style={{ padding: '0.875rem 1.125rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.content}</p>
                  </div>
                )}
                <div style={{ padding: '0.5rem 1.125rem', borderTop: '1px solid #F1F5F9', fontSize: '0.75rem', color: '#94A3B8' }}>
                  {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
