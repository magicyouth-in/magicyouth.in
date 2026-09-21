import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import '../styles/home.css';

export default function Impact() {
  const [events, setEvents] = useState([]);
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setEvents(eventsData.data.sort((a, b) => new Date(b.startDate || b.start_date) - new Date(a.startDate || a.start_date)));
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

  const filteredEvents = events.filter(e => {
    const unitMatch = selectedUnit === 'All' || (e.unitId && e.unitId._id === selectedUnit);
    const yearMatch = selectedYear === 'All' || (e.academicYearId && e.academicYearId._id === selectedYear);
    return unitMatch && yearMatch;
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section" style={{ backgroundColor: '#0F172A', padding: '6rem 1.5rem', color: 'white' }}>
        <div className="page-header-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)' }}>Our Impact</div>
          <h1 className="page-header-title" style={{ color: 'white', fontSize: '3.5rem', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            From student formation to community action.
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.25rem', lineHeight: 1.6 }}>
            Real outcomes driven by MAGIC Youth chapters across educational institutions and communities.
          </p>
        </div>
      </section>

      <section className="inner-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Filter size={18} color="var(--primary-blue)" />
            <select aria-label="Filter by Campus" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              <option value="All">All Campuses</option>
              {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Filter size={18} color="var(--primary-blue)" />
            <select aria-label="Filter by Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              <option value="All">All Years</option>
              {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="inner-section" style={{ backgroundColor: 'white', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={48} className="animate-spin" color="var(--primary-blue)" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
              No initiatives found for this selection.
            </div>
          ) : (
            filteredEvents.map((event, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.article 
                  key={event._id} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true, margin: "-100px" }} 
                  variants={fadeUp}
                  style={{ display: 'flex', flexDirection: isEven ? 'row' : 'row-reverse', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}
                >
                  
                  {event.photoUrl ? (
                    <div style={{ flex: '1 1 400px', borderRadius: '1rem', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <img src={event.photoUrl} alt={`Impact: ${event.title}`} loading="lazy" style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ flex: '1 1 400px', height: '400px', borderRadius: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Impact Record</span>
                    </div>
                  )}

                  <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {event.unitId && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={16} /> {event.unitId.name}</span>}
                      {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-blue)' }}><MapPin size={16} /> {event.location}</span>}
                    </div>
                    
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{event.title}</h3>
                    
                    {(event.startDate || event.start_date) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <Calendar size={18} /> {new Date(event.startDate || event.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.8 }}>
                      {event.description}
                    </p>
                    
                  </div>
                </motion.article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
