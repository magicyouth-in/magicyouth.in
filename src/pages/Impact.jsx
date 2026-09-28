import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2, Building, Sparkles, Award, TrendingUp, Calendar, Heart } from 'lucide-react';
import FormattedText from '../components/common/FormattedText';
import '../styles/home.css';

export default function Impact() {
  const [impactRecords, setImpactRecords] = useState([]);
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    Promise.all([
      fetch('/api/impact').then(res => res.json()),
      fetch('/api/units?includeInactive=false').then(res => res.json()),
      fetch('/api/academic-years').then(res => res.json())
    ])
    .then(([impactData, unitsData, yearsData]) => {
      if (impactData.success && Array.isArray(impactData.data)) {
        setImpactRecords(impactData.data);
      }
      if (unitsData.success && Array.isArray(unitsData.data)) {
        setUnits(unitsData.data);
      }
      if (yearsData.success && Array.isArray(yearsData.data)) {
        setAcademicYears(yearsData.data);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Error loading impact records:', err);
      setLoading(false);
    });
  }, []);

  const filteredImpact = impactRecords.filter(i => {
    const unitMatch = selectedUnit === 'All' ||
      i.unitId?._id === selectedUnit ||
      i.unitId?.id === selectedUnit ||
      i.unit_id === selectedUnit;

    const yearMatch = selectedYear === 'All' ||
      i.academicYearId?._id === selectedYear ||
      i.academicYearId?.id === selectedYear ||
      i.academic_year_id === selectedYear ||
      (i.academicYearId?.year && i.academicYearId.year === selectedYear);

    return unitMatch && yearMatch;
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Measurable Outcomes &amp; Results
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Our Real Impact
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto', marginBottom: '2rem' }}>
            The verifiable differences and concrete outcomes created across campus chapters, student formation cohorts, and surrounding communities.
          </p>

          {/* Unit & Year Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
            {units.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <Building size={15} style={{ color: 'var(--primary-blue)' }} />
                <select aria-label="Filter by Campus" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <option value="All">All Chapters</option>
                  {units.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>)}
                </select>
              </div>
            )}

            {academicYears.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <Filter size={14} style={{ color: 'var(--primary-blue)' }} />
                <select aria-label="Filter by Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <option value="All">All Academic Years</option>
                  {Array.from(new Set(academicYears.map(y => y.year))).map(yr => {
                    const matching = academicYears.find(y => y.year === yr);
                    return <option key={matching._id || matching.id} value={matching._id || matching.id}>{yr}</option>;
                  })}
                </select>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Main Impact Grid Section */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={40} className="animate-spin" color="var(--primary-blue)" />
            </div>
          ) : filteredImpact.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4.5rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px dashed var(--border-color)', maxWidth: '600px', margin: '0 auto' }}>
              <TrendingUp size={44} color="var(--primary-blue)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No impact records found for this selection.
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Verified outcome statistics will be published here as chapters complete their initiatives.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {filteredImpact.map((imp, idx) => (
                <motion.article 
                  key={imp._id || imp.id || idx} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                  }}
                >
                  {imp.poster && (
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden', backgroundColor: '#0F172A' }}>
                      <img src={imp.poster} alt={imp.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Big Numeric Highlight */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-blue)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                        {imp.metricValue}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-pink)', backgroundColor: '#FFF1F2', padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'uppercase' }}>
                        Verified Outcome
                      </span>
                    </div>

                    {/* Metric Label / Title */}
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      <FormattedText text={imp.title} />
                    </h3>

                    {/* Result Description */}
                    {imp.description && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem', flex: 1 }}>
                        <FormattedText text={imp.description} paragraphs={true} />
                      </div>
                    )}

                    {/* Meta Bar */}
                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                      <span style={{ fontWeight: 600 }}>
                        {imp.unitId?.name || 'MAGIC Youth'}
                      </span>
                      {imp.academicYearId?.year && (
                        <span style={{ backgroundColor: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                          {imp.academicYearId.year}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
