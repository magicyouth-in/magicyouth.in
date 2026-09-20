import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building2, Filter, Loader2, ArrowRight } from 'lucide-react';
import '../styles/home.css';

export default function Impact() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(res => res.json()),
      fetch('/api/units').then(res => res.json()),
      fetch('/api/academic-years').then(res => res.json())
    ])
    .then(([eventsData, unitsData, yearsData]) => {
      if (eventsData.success) {
        // Sort by date descending
        const sorted = eventsData.data.sort((a, b) => new Date(b.startDate || b.start_date) - new Date(a.startDate || a.start_date));
        setEvents(sorted);
      }
      if (unitsData.success) setUnits(unitsData.data);
      if (yearsData.success) setAcademicYears(yearsData.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredEvents = events.filter(evt => {
    const unitMatch = selectedUnit === 'All' || (evt.unitId && evt.unitId._id === selectedUnit);
    const yearMatch = selectedYear === 'All' || (evt.academicYearId && evt.academicYearId._id === selectedYear);
    return unitMatch && yearMatch;
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section">
        <div className="page-bg-glow"></div>
        <div className="page-header-content">
          <div className="section-eyebrow">Service & Change</div>
          <h1 className="page-header-title">Impact</h1>
          <p className="page-header-subtitle">
            People, activities, stories, service, and change driven by MAGIC Youth chapters across campuses and communities.
          </p>
        </div>
      </section>

      {/* IMPACT AT A GLANCE (Data Driven) */}
      <section className="inner-section bg-light">
        <div className="section-header">
          <div className="section-eyebrow">Overview</div>
          <h2 className="section-title">Impact At A Glance</h2>
        </div>
        <div className="impact-grid" style={{ marginTop: '3rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="impact-number">{events.length > 0 ? events.length : 'Youth'}</div>
            <div className="impact-label">{events.length > 0 ? 'Initiatives Completed' : 'In Action'}</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
            <div className="impact-number">{units.length > 0 ? units.length : 'Campus'}</div>
            <div className="impact-label">{units.length > 0 ? 'Active Units' : 'Engagement'}</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
            <div className="impact-number">Community</div>
            <div className="impact-label">Service</div>
          </motion.div>
        </div>
      </section>

      {/* MAGIC IN ACTION / STORIES */}
      <section className="inner-section">
        <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '1000px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
              <Filter size={16} color="var(--primary-blue)" />
              <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
                <option value="All">All Campuses / Units</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
              <Calendar size={16} color="var(--primary-blue)" />
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
                <option value="All">All Academic Years</option>
                {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={48} className="animate-spin" color="var(--primary-blue)" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              No impact stories or activities found for these filters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {filteredEvents.map((evt, i) => (
                <motion.div key={evt._id} className="featured-event" style={{ flexDirection: 'row', backgroundColor: 'white', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  {evt.poster && (
                    <img src={evt.poster} alt={evt.title} style={{ width: '30%', objectFit: 'cover' }} />
                  )}
                  <div className="featured-event-content" style={{ width: evt.poster ? '70%' : '100%', padding: '2rem' }}>
                    <div className="section-eyebrow">{evt.category || 'MAGIC in Action'}</div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-primary)' }}>{evt.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{evt.description}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-blue)' }}>
                      {evt.date && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={16} />{evt.date}</div>}
                      {evt.location && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={16} />{evt.location}</div>}
                      {evt.unitId?.name && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Building2 size={16} />{evt.unitId.name}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta-section">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Make Your Impact.</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Transform yourself, your campus, and your community.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="btn-white">Join MAGIC</a>
          </div>
        </motion.div>
      </section>

    </main>
  );
}
