import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Search, X, Clock, ChevronDown, Filter, Building2, CalendarDays, Loader2 } from 'lucide-react';
import '../styles/about.css';
import '../styles/events.css';

const EVENT_CATEGORIES = [
  'Program', 'Workshop', 'Seminar', 'Outreach', 'Community Service',
  'Awareness', 'Leadership', 'Competition', 'Cultural', 'Training', 'Other'
];

const STATUS_TABS = [
  { key: '',          label: 'All Events' },
  { key: 'Upcoming',  label: 'Upcoming'   },
  { key: 'Ongoing',   label: 'Ongoing'    },
  { key: 'Completed', label: 'Completed'  },
];

export default function Events() {
  const [events,  setEvents]  = useState([]);
  const [units,   setUnits]   = useState([]);
  const [years,   setYears]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState(null);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  const [filters, setFilters] = useState({
    status: '', unitId: '', academicYearId: '', category: '', search: ''
  });

  // Load units on mount
  useEffect(() => {
    fetch('/api/units')
      .then(r => r.json())
      .then(d => { if (d.success) setUnits(d.data || []); })
      .catch(() => setUnits([]));
  }, []);

  // Load academic years when unit changes
  useEffect(() => {
    if (!filters.unitId) { setYears([]); return; }
    fetch(`/api/academic-years?unitId=${filters.unitId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setYears(d.data || []); })
      .catch(() => setYears([]));
  }, [filters.unitId]);

  // Fetch events from backend API on filter/page change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (filters.status)         params.set('status',         filters.status);
    if (filters.unitId)         params.set('unitId',         filters.unitId);
    if (filters.academicYearId) params.set('academicYearId', filters.academicYearId);
    if (filters.category)       params.set('category',       filters.category);
    if (filters.search)         params.set('search',         filters.search);

    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEvents(d.data || []);
          setTotal(d.pagination?.total || 0);
        } else {
          setEvents([]);
          setTotal(0);
        }
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setTotal(0);
        setLoading(false);
      });
  }, [filters, page]);

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      {/* ── EVENTS HERO ─────────────────────────────────────────── */}
      <section className="events-hero">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <span className="about-badge">Activities &amp; Programs</span>
          <h1 className="about-title">MAGIC Youth <span className="highlight">Events</span></h1>
          <p className="about-lead">
            Explore official MAGIC Youth events, workshops, campaigns, and student activities across units.
          </p>
        </div>
      </section>

      {/* ── FILTERS & LISTINGS ──────────────────────────────────── */}
      <section className="events-section">
        <div className="events-container">

          {/* Status Tab Bar */}
          <div className="status-tabs">
            {STATUS_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter('status', t.key)}
                className={`status-tab-btn ${filters.status === t.key ? 'active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div className="events-filter-bar">
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search events…"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                className="event-search-input"
              />
            </div>

            {/* Unit Filter */}
            <div style={{ position: 'relative' }}>
              <Building2 style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <select
                value={filters.unitId}
                onChange={e => { setFilter('unitId', e.target.value); setFilter('academicYearId', ''); }}
                className="event-filter-select"
              >
                <option value="">All Units</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5B21B6', pointerEvents: 'none' }} />
            </div>

            {/* Academic Year Filter */}
            <div style={{ position: 'relative' }}>
              <CalendarDays style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <select
                value={filters.academicYearId}
                onChange={e => setFilter('academicYearId', e.target.value)}
                disabled={!filters.unitId}
                className="event-filter-select"
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5B21B6', pointerEvents: 'none' }} />
            </div>

            {/* Category Filter */}
            <div style={{ position: 'relative' }}>
              <Filter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              <select
                value={filters.category}
                onChange={e => setFilter('category', e.target.value)}
                className="event-filter-select"
              >
                <option value="">All Categories</option>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5B21B6', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <Loader2 style={{ width: 36, height: 36, color: '#5B21B6' }} className="animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && events.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#F8F7FC', borderRadius: '1.25rem', border: '1px solid #E5E7EB', margin: '1.5rem 0' }}>
              <Calendar style={{ width: 44, height: 44, color: '#9CA3AF', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937' }}>No events found</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                There are currently no events listed matching your filter criteria.
              </p>
            </div>
          )}

          {/* Events Grid */}
          {!loading && events.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', fontWeight: 500 }}>
                Showing {total} event{total !== 1 ? 's' : ''}
              </div>
              <div className="events-grid">
                {events.map((evt, i) => (
                  <EventCard key={evt._id} evt={evt} i={i} onClick={() => setModal(evt)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="status-tab-btn"
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: '0.875rem', color: '#4B5563', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="status-tab-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {modal && (
          <div className="event-modal-backdrop" onClick={() => setModal(null)}>
            <div className="event-modal-content" onClick={e => e.stopPropagation()}>
              {modal.poster && (
                <div style={{ aspectRatio: '16/9', backgroundColor: '#F8F7FC', overflow: 'hidden' }}>
                  <img src={`/uploads/${modal.poster}`} alt={modal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '9999px', display: 'inline-block', marginBottom: '0.5rem', backgroundColor: '#EDE9FE', color: '#5B21B6' }}>
                      {modal.status}
                    </span>
                    <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>{modal.title}</h2>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                    <X style={{ width: 22, height: 22 }} />
                  </button>
                </div>

                {modal.description && (
                  <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.65, marginBottom: '1.25rem' }}>{modal.description}</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: '#4B5563' }}>
                  {modal.unitId?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 style={{ width: 16, height: 16, color: '#5B21B6' }} /><span>{modal.unitId.name}</span></div>
                  )}
                  {modal.academicYearId?.year && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarDays style={{ width: 16, height: 16, color: '#5B21B6' }} /><span>{modal.academicYearId.year}</span></div>
                  )}
                  {modal.date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar style={{ width: 16, height: 16, color: '#5B21B6' }} /><span>{modal.date}</span></div>
                  )}
                  {(modal.startTime || modal.endTime) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock style={{ width: 16, height: 16, color: '#5B21B6' }} /><span>{modal.startTime}{modal.endTime ? ` – ${modal.endTime}` : ''}</span></div>
                  )}
                  {modal.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin style={{ width: 16, height: 16, color: '#5B21B6' }} /><span>{modal.location}</span></div>
                  )}
                  {modal.category && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter style={{ width: 16, height: 16, color: '#5B21B6' }} /><span>Category: {modal.category}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({ evt, onClick }) {
  const getBadgeClass = (status) => {
    if (status === 'Upcoming') return 'badge-upcoming-light';
    if (status === 'Ongoing') return 'badge-ongoing-light';
    return 'badge-completed-light';
  };

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-poster-box">
        {evt.poster ? (
          <img
            src={`/uploads/${evt.poster}`}
            alt={evt.title}
            className="event-poster"
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            <Calendar style={{ width: 36, height: 36 }} />
          </div>
        )}
      </div>

      <div className="event-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px' }} className={getBadgeClass(evt.status)}>
            {evt.status}
          </span>
          {evt.category && (
            <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>{evt.category}</span>
          )}
        </div>

        <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem', lineHeight: 1.3 }}>{evt.title}</h3>
        
        {evt.description && (
          <p style={{ fontSize: '0.84375rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {evt.description}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem' }}>
          {evt.date && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar style={{ width: 14, height: 14, color: '#5B21B6' }} />{evt.date}</div>}
          {evt.location && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin style={{ width: 14, height: 14, color: '#5B21B6' }} />{evt.location}</div>}
          {evt.unitId?.name && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Building2 style={{ width: 14, height: 14, color: '#5B21B6' }} />{evt.unitId.name}</div>}
        </div>
      </div>
    </div>
  );
}
