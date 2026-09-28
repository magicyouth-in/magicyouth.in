/**
 * src/pages/member/MemberRegistrations.jsx
 * Member's own event registrations history.
 */
import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, MapPin, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export default function MemberRegistrations({ member }) {
  const [regs, setRegs]       = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch('/api/member/events/my-registrations', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setRegs(data.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const statusStyle = {
    Registered: { bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
    Attended:   { bg: '#EFF6FF', color: '#1D4ED8', border: '#BAE6FD' },
    Cancelled:  { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>My Registrations</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            {regs.length} event{regs.length !== 1 ? 's' : ''} registered
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
      ) : regs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px dashed #E2E8F0' }}>
          <ClipboardList size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>No registrations yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Browse Upcoming Events and register to see them here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {regs.map(reg => {
            const ev = reg.event;
            const st = statusStyle[reg.status] || statusStyle.Registered;
            return (
              <div key={reg.id} style={{ background: '#FFFFFF', borderRadius: '0.875rem', border: '1px solid #E2E8F0', padding: '1.125rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {/* Status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '0.625rem', background: st.bg, flexShrink: 0 }}>
                  {reg.status === 'Cancelled'
                    ? <XCircle size={20} color={st.color} />
                    : <CheckCircle size={20} color={st.color} />}
                </div>

                {/* Event info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A', margin: 0 }}>{ev?.title || 'Event'}</h3>
                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                      {reg.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {ev?.date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                        <Calendar size={13} color="#0284C7" />
                        {new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                    {ev?.startTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                        <Clock size={13} color="#0284C7" />
                        {ev.startTime}
                      </div>
                    )}
                    {ev?.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                        <MapPin size={13} color="#0284C7" />
                        {ev.location}
                      </div>
                    )}
                    {ev?.unitName && (
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {ev.unitName}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                    Registered {new Date(reg.registeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
