/**
 * src/pages/member/MemberEvents.jsx
 * Upcoming events for members with registration capability.
 */
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle, Loader2, Search, ChevronRight } from 'lucide-react';

function EventCard({ event, onRegister, onCancel, registering }) {
  const myReg    = event.myRegistration;
  const isFull   = event.capacity && event.registeredCount >= event.capacity;
  const isPast   = event.status === 'Completed' || event.status === 'Cancelled';
  const canReg   = event.registrationEnabled && !isPast;

  const statusBadge = {
    Upcoming: { bg: '#EFF6FF', color: '#1D4ED8', text: 'Upcoming' },
    Ongoing:  { bg: '#F0FDF4', color: '#166534', text: 'Ongoing'  },
    Completed:{ bg: '#F8FAFC', color: '#64748B', text: 'Completed' },
    Cancelled:{ bg: '#FFF1F2', color: '#BE123C', text: 'Cancelled' },
  }[event.status] || { bg: '#F8FAFC', color: '#64748B', text: event.status };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}>
      {/* Poster */}
      {event.poster && (
        <img src={event.poster} alt={event.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
      )}

      <div style={{ padding: '1.125rem' }}>
        {/* Status + unit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: statusBadge.bg, color: statusBadge.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>{statusBadge.text}</span>
          {event.unitId && <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{event.unitId.name}</span>}
          {event.category && <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>• {event.category}</span>}
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.625rem', lineHeight: 1.3 }}>{event.title}</h3>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
          {event.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
              <Calendar size={14} color="#0284C7" />
              {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          )}
          {event.startTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
              <Clock size={14} color="#0284C7" />
              {event.startTime}{event.endTime ? ` — ${event.endTime}` : ''}
            </div>
          )}
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
              <MapPin size={14} color="#0284C7" />
              {event.location}
            </div>
          )}
          {event.capacity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
              <Users size={14} color="#0284C7" />
              {isFull ? <span style={{ color: '#DC2626', fontWeight: 600 }}>Registration Full</span> : `Capacity: ${event.capacity}`}
            </div>
          )}
        </div>

        {event.description && (
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.875rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>
        )}

        {/* Register button */}
        {canReg && (
          myReg === 'Registered' ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '0.5rem', color: '#166534', fontSize: '0.8125rem', fontWeight: 700 }}>
                <CheckCircle size={15} /> Registered
              </div>
              <button
                onClick={() => onCancel(event.id)}
                disabled={registering === event.id}
                style={{ padding: '0.625rem 0.75rem', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '0.5rem', color: '#BE123C', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          ) : myReg === 'Cancelled' ? (
            <button
              onClick={() => onRegister(event.id)}
              disabled={registering === event.id || isFull}
              style={{ width: '100%', padding: '0.625rem', background: isFull ? '#F1F5F9' : '#0284C7', color: isFull ? '#94A3B8' : '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', cursor: isFull ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {registering === event.id ? <Loader2 size={15} className="animate-spin" /> : null}
              {isFull ? 'Registration Full' : 'Re-Register'}
            </button>
          ) : (
            <button
              onClick={() => onRegister(event.id)}
              disabled={registering === event.id || isFull}
              style={{ width: '100%', padding: '0.625rem', background: isFull ? '#F1F5F9' : 'linear-gradient(135deg,#0284C7,#0369A1)', color: isFull ? '#94A3B8' : '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', cursor: isFull ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {registering === event.id ? <Loader2 size={15} className="animate-spin" /> : null}
              {isFull ? 'Registration Full' : 'Register'}
            </button>
          )
        )}

        {!canReg && !isPast && (
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '0.5rem', background: '#F8FAFC', borderRadius: '0.5rem' }}>
            Registration not required
          </div>
        )}

        {isPast && (
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '0.5rem', background: '#F8FAFC', borderRadius: '0.5rem' }}>
            Event {event.status.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberEvents({ member }) {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [registering, setReg]   = useState(null);
  const [toast, setToast]       = useState(null);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);

  async function loadEvents() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      const res  = await fetch(`/api/member/events?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadEvents(); }, [page, search]);

  function showToast(text, type = 'success') {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRegister(eventId) {
    setReg(eventId);
    try {
      const res  = await fetch(`/api/member/events/${eventId}/register`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        showToast('Successfully registered!');
        setEvents(ev => ev.map(e => e.id === eventId ? { ...e, myRegistration: 'Registered' } : e));
      } else {
        showToast(data.message || 'Registration failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setReg(null);
  }

  async function handleCancel(eventId) {
    setReg(eventId);
    try {
      const res  = await fetch(`/api/member/events/${eventId}/register`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        showToast('Registration cancelled.', 'info');
        setEvents(ev => ev.map(e => e.id === eventId ? { ...e, myRegistration: 'Cancelled' } : e));
      } else {
        showToast(data.message || 'Cancellation failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setReg(null);
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: toast.type === 'error' ? '#FFF1F2' : toast.type === 'info' ? '#EFF6FF' : '#F0FDF4', border: `1px solid ${toast.type === 'error' ? '#FECDD3' : toast.type === 'info' ? '#BAE6FD' : '#86EFAC'}`, color: toast.type === 'error' ? '#BE123C' : toast.type === 'info' ? '#1D4ED8' : '#166534', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          {toast.text}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Upcoming Events</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            {total} event{total !== 1 ? 's' : ''} available
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search events…"
            style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', border: '1.5px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', minWidth: '200px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={36} className="animate-spin" color="#0284C7" />
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px dashed #E2E8F0' }}>
          <Calendar size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>No upcoming events</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Check back soon for new events from your unit.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {events.map(event => (
            <EventCard key={event.id} event={event} onRegister={handleRegister} onCancel={handleCancel} registering={registering} />
          ))}
        </div>
      )}
    </div>
  );
}
