import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Loader2, Building, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
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

      {/* Events List */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {filteredEvents.map((ev, idx) => (
                <motion.article 
                  key={ev._id || ev.id || idx}
                  style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: idx * 0.05 }}
                >
                  {ev.poster && (
                    <div style={{ width: '100%', height: '200px', overflow: 'hidden', backgroundColor: '#0F172A' }}>
                      <img
                        src={ev.poster}
                        alt={ev.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', backgroundColor: '#F0F9FF', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {ev.category || 'Event'}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: ev.status === 'Completed' || ev.status === 'Past' ? '#64748B' : '#15803D', backgroundColor: ev.status === 'Completed' || ev.status === 'Past' ? '#F1F5F9' : '#DCFCE7', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {ev.status || 'Upcoming'}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      <FormattedText text={ev.title} />
                    </h2>

                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                      <FormattedText text={ev.description} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginTop: 'auto', fontSize: '0.825rem', color: '#64748B' }}>
                      {ev.date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Calendar size={14} color="var(--primary-blue)" /> {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      )}
                      {(ev.startTime || ev.start_time) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} color="var(--primary-blue)" /> {ev.startTime || ev.start_time} {ev.endTime || ev.end_time ? `– ${ev.endTime || ev.end_time}` : ''}
                        </div>
                      )}
                      {ev.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="var(--primary-blue)" /> {ev.location}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                        {ev.unitId?.name || 'MAGIC Youth'} &bull; {ev.academicYearId?.year || '2025-26'}
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                      <Link to="/join" className="btn-primary" style={{ display: 'block', textAlign: 'center', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                        Participate in Activity &rarr;
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
