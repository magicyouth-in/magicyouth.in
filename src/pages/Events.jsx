import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Loader2, Building, Filter, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import FormattedText from '../components/common/FormattedText';
import '../styles/home.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsRes, unitsRes, yearsRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/units?includeInactive=false'),
          fetch('/api/academic-years')
        ]);
        const eventsData = await eventsRes.json();
        const unitsData = await unitsRes.json();
        const yearsData = await yearsRes.json();

        if (eventsData.success && Array.isArray(eventsData.data)) {
          setEvents(eventsData.data);
        }

        if (unitsData.success && Array.isArray(unitsData.data)) {
          const uList = unitsData.data;
          setUnits(uList);
          const defaultUnit = uList.find(u => u.isDefault || u.is_default) || uList[0];
          if (defaultUnit) {
            setSelectedUnit(defaultUnit._id || defaultUnit.id);
          }
        }

        if (yearsData.success && Array.isArray(yearsData.data)) {
          setAcademicYears(yearsData.data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const filteredEvents = events.filter(e => {
    const unitMatch = selectedUnit === 'All' ||
      e.unitId?._id === selectedUnit ||
      e.unitId?.id === selectedUnit ||
      e.unit_id === selectedUnit;

    const yearMatch = selectedYear === 'All' ||
      e.academicYearId?._id === selectedYear ||
      e.academicYearId?.id === selectedYear ||
      e.academic_year_id === selectedYear ||
      (e.academicYearId?.year && e.academicYearId.year === selectedYear);

    const statusMatch = statusFilter === 'All' ||
      (statusFilter === 'Upcoming' && (/upcoming|scheduled/i.test(e.status) || (!e.status && new Date(e.date) >= new Date()))) ||
      (statusFilter === 'Ongoing' && /ongoing|active/i.test(e.status)) ||
      (statusFilter === 'Past' && (/past|completed|finished/i.test(e.status) || new Date(e.date) < new Date()));

    return unitMatch && yearMatch && statusMatch;
  });

  return (
    <div className="events-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <style>{`
        .event-editorial-card {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          background-color: #FFFFFF;
          border-radius: 1.25rem;
          border: 1px solid var(--border-color);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          margin-bottom: 2.75rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .event-editorial-card:hover {
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }
        .event-editorial-card.reverse {
          flex-direction: row-reverse;
        }
        .event-editorial-image {
          flex: 0 0 48%;
          position: relative;
          min-height: 320px;
          background-color: #0F172A;
          overflow: hidden;
        }
        .event-editorial-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .event-editorial-image-placeholder {
          width: 100%;
          height: 100%;
          min-height: 280px;
          background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: white;
          text-align: center;
        }
        .event-editorial-content {
          flex: 0 0 52%;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @media (max-width: 880px) {
          .event-editorial-card,
          .event-editorial-card.reverse {
            flex-direction: column !important;
          }
          .event-editorial-image {
            flex: none;
            width: 100%;
            height: 240px;
            min-height: 240px;
          }
          .event-editorial-content {
            flex: none;
            width: 100%;
            padding: 1.75rem;
          }
        }
      `}</style>

      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Date-Specific Activities
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Events &amp; Exposure Camps
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto', marginBottom: '2rem' }}>
            Workshops, campus awareness drives, rural exposure camps, and youth summits organized on specific dates.
          </p>

          {/* Unit & Academic Year Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
            {units.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <Building size={15} style={{ color: 'var(--primary-blue)' }} />
                <select
                  aria-label="Filter by Campus Unit"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <option value="All">All Chapters</option>
                  {units.map(u => (
                    <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}

            {academicYears.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <Filter size={14} style={{ color: 'var(--primary-blue)' }} />
                <select
                  aria-label="Filter by Academic Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <option value="All">All Academic Years</option>
                  {Array.from(new Set(academicYears.map(y => y.year))).map(yr => {
                    const match = academicYears.find(y => y.year === yr);
                    return <option key={match._id || match.id} value={match._id || match.id}>{yr}</option>;
                  })}
                </select>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Status Filter Tabs */}
      <section style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Upcoming', 'Ongoing', 'Past'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '999px',
                border: '1.5px solid',
                borderColor: statusFilter === st ? 'var(--primary-blue)' : '#E2E8F0',
                backgroundColor: statusFilter === st ? '#F0F9FF' : '#FFFFFF',
                color: statusFilter === st ? 'var(--primary-blue)' : '#64748B',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {st === 'All' ? 'All Events' : st}
            </button>
          ))}
        </div>
      </section>

      {/* Alternating Editorial Events List */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={36} color="var(--primary-blue)" className="animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4.5rem 2rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              border: '1px dashed var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              maxWidth: '650px',
              margin: '0 auto'
            }}>
              <Calendar size={48} color="var(--primary-blue)" style={{ margin: '0 auto 1.25rem', opacity: 0.6 }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No events found for this filter.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Check back soon for newly scheduled chapter activities, or register to receive notifications.
              </p>
              <Link to="/join" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800 }}>
                Join MAGIC Youth <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div>
              {filteredEvents.map((ev, idx) => {
                const isCompleted = ev.status === 'Completed' || ev.status === 'Past' || (ev.date && new Date(ev.date) < new Date() && ev.status !== 'Ongoing');
                const isOngoing = ev.status === 'Ongoing';
                const statusBadgeText = isCompleted ? 'COMPLETED' : isOngoing ? 'ONGOING' : (ev.status || 'UPCOMING');

                return (
                  <motion.article 
                    key={ev._id || ev.id || idx}
                    className={`event-editorial-card ${idx % 2 === 1 ? 'reverse' : ''}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={fadeUp}
                    transition={{ delay: 0.05 }}
                  >
                    {/* Image Column (45–50%) */}
                    <div className="event-editorial-image">
                      {ev.poster ? (
                        <img
                          src={ev.poster}
                          alt={ev.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="event-editorial-image-placeholder">
                          <Calendar size={48} color="rgba(255,255,255,0.4)" style={{ marginBottom: '1rem' }} />
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>
                            {ev.category || 'MAGIC Youth Event'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Column (50–55%) */}
                    <div className="event-editorial-content">
                      {/* Eyebrow & Category & Status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-blue)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                            EVENT
                          </span>
                          {ev.category && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', backgroundColor: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                              {ev.category}
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          textTransform: 'uppercase',
                          backgroundColor: isCompleted ? '#F1F5F9' : isOngoing ? '#DCFCE7' : '#EFF6FF',
                          color: isCompleted ? '#64748B' : isOngoing ? '#15803D' : 'var(--primary-blue)',
                          border: `1px solid ${isCompleted ? '#E2E8F0' : isOngoing ? '#BBF7D0' : '#BFDBFE'}`
                        }}>
                          {statusBadgeText}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h2 style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.65rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        <FormattedText text={ev.title} />
                      </h2>

                      {/* Subtitle / Summary */}
                      {(ev.subtitle || ev.organizers) && (
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                          {ev.subtitle || ev.organizers}
                        </p>
                      )}

                      {/* Metadata Strip: Date, Time, Venue, Unit, Academic Year */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', rowGap: '0.4rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', alignItems: 'center' }}>
                        {ev.date && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#0F172A' }}>
                            <Calendar size={15} style={{ color: 'var(--primary-blue)' }} />
                            {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                        {(ev.startTime || ev.start_time || ev.time) && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                            <Clock size={14} style={{ color: 'var(--primary-blue)' }} />
                            {ev.startTime || ev.start_time || ev.time} {ev.endTime || ev.end_time ? `– ${ev.endTime || ev.end_time}` : ''}
                          </div>
                        )}
                        {(ev.venue || ev.location) && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                            <MapPin size={15} style={{ color: 'var(--primary-pink)' }} />
                            {ev.venue || ev.location}
                          </div>
                        )}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontWeight: 600 }}>
                          {ev.unitId?.name || (units.find(u => u._id === (ev.unitId?._id || ev.unit_id))?.name) || 'All Chapters'} &bull; {ev.academicYearId?.year || (academicYears.find(y => y._id === (ev.academicYearId?._id || ev.academic_year_id))?.year) || '2025-26'}
                        </div>
                      </div>

                      {/* Description */}
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                        <FormattedText text={ev.description || 'No detailed description provided.'} />
                      </div>

                      {/* Action Button: Registration if applicable */}
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                        {!isCompleted ? (
                          <Link 
                            to="/join" 
                            className="btn-primary" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.5rem', 
                              backgroundColor: 'var(--primary-blue)', 
                              color: 'white', 
                              padding: '0.65rem 1.35rem', 
                              borderRadius: '0.625rem', 
                              textDecoration: 'none', 
                              fontWeight: 800, 
                              fontSize: '0.875rem' 
                            }}
                          >
                            <Ticket size={15} /> REGISTER FOR EVENT &rarr;
                          </Link>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                            <CheckCircle2 size={15} color="#10B981" /> Activity Concluded &bull; Archive Record
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
