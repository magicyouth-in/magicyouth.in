import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, MapPin, ArrowRight, Loader2, Building, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import FormattedText from '../components/common/FormattedText';
import '../styles/home.css';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [programsRes, unitsRes, yearsRes] = await Promise.all([
          fetch('/api/programs'),
          fetch('/api/units?includeInactive=false'),
          fetch('/api/academic-years')
        ]);
        const programsData = await programsRes.json();
        const unitsData = await unitsRes.json();
        const yearsData = await yearsRes.json();

        if (programsData.success && Array.isArray(programsData.data)) {
          setPrograms(programsData.data);
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
        console.error('Error fetching programs:', err);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const filteredPrograms = programs.filter(p => {
    const unitMatch = selectedUnit === 'All' ||
      p.unitId?._id === selectedUnit ||
      p.unitId?.id === selectedUnit ||
      p.unit_id === selectedUnit;

    const yearMatch = selectedYear === 'All' ||
      p.academicYearId?._id === selectedYear ||
      p.academicYearId?.id === selectedYear ||
      p.academic_year_id === selectedYear ||
      (p.academicYearId?.year && p.academicYearId.year === selectedYear);

    const statusMatch = statusFilter === 'All' ||
      (p.status && p.status.toLowerCase() === statusFilter.toLowerCase());

    return unitMatch && yearMatch && statusMatch;
  });

  return (
    <div className="programs-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <style>{`
        .program-editorial-card {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          background-color: #FFFFFF;
          border-radius: 1.25rem;
          border: 1px solid var(--border-color);
          overflow: hidden;
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.03);
          margin-bottom: 2.25rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .program-editorial-card:hover {
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }
        .program-editorial-card.reverse {
          flex-direction: row-reverse;
        }
        .program-editorial-image {
          flex: 0 0 42%;
          position: relative;
          min-height: 290px;
          background-color: #0F172A;
          overflow: hidden;
        }
        .program-editorial-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .program-editorial-placeholder {
          width: 100%;
          height: 100%;
          min-height: 260px;
          background: linear-gradient(135deg, #0369A1 0%, #0C4A6E 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: white;
          text-align: center;
        }
        .program-editorial-content {
          flex: 0 0 58%;
          padding: 2.25rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @media (max-width: 880px) {
          .program-editorial-card,
          .program-editorial-card.reverse {
            flex-direction: column !important;
          }
          .program-editorial-image {
            flex: none;
            width: 100%;
            height: 230px;
            min-height: 230px;
          }
          .program-editorial-content {
            flex: none;
            width: 100%;
            padding: 1.75rem;
          }
        }
      `}</style>

      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.25rem 1.5rem 2rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Regular Initiatives
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.625rem' }}>
            Flagship Programs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto', marginBottom: '1.75rem' }}>
            Structured institutional initiatives run regularly by MAGIC Youth to form student leaders in education, environment, and social solidarity.
          </p>

          {/* Unit & Academic Year Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
            {units.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.45rem 0.95rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.45rem 0.95rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
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
      <section style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', padding: '0.875rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1240px', width: 'calc(100% - 48px)', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Ongoing', 'Upcoming', 'Past'].map(st => (
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
              {st === 'All' ? 'All Programs' : st}
            </button>
          ))}
        </div>
      </section>

      {/* Program Details List */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '2.75rem 1.5rem 4.5rem' }}>
        <div style={{ maxWidth: '1240px', width: 'calc(100% - 48px)', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={36} color="var(--primary-blue)" className="animate-spin" />
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              border: '1px dashed var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              maxWidth: '650px',
              margin: '0 auto'
            }}>
              <BookOpen size={48} color="var(--primary-blue)" style={{ margin: '0 auto 1.25rem', opacity: 0.6 }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No programs found for this selection.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Our coordinators and directors are preparing upcoming flagship initiatives. Please check back soon or register to participate.
              </p>
              <Link to="/join" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800 }}>
                Join as a Change Agent <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div>
              {filteredPrograms.map((prog, idx) => {
                const yearLabel = prog.academicYearId?.year || (academicYears.find(y => y._id === (prog.academicYearId?._id || prog.academicYearId))?.year) || '';
                const unitLabel = prog.unitId?.name || (units.find(u => u._id === (prog.unitId?._id || prog.unitId))?.name) || 'MAGIC Youth';
                const formattedStartDate = formatDate(prog.startDate);
                const formattedEndDate = formatDate(prog.endDate);
                const isOngoing = (prog.status || 'Ongoing').toLowerCase() === 'ongoing';
                const isPast = (prog.status || '').toLowerCase() === 'past' || (prog.status || '').toLowerCase() === 'completed';

                return (
                  <motion.article 
                    key={prog._id || prog.id || idx}
                    className={`program-editorial-card ${idx % 2 === 1 ? 'reverse' : ''}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={fadeUp}
                    transition={{ delay: 0.05 }}
                  >
                    {/* Program Image Column (40–45%) */}
                    <div className="program-editorial-image">
                      {prog.poster ? (
                        <img
                          src={prog.poster}
                          alt={prog.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="program-editorial-placeholder">
                          <BookOpen size={44} color="rgba(255,255,255,0.4)" style={{ marginBottom: '0.85rem' }} />
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>
                            {prog.category || 'Flagship Program'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Program Information Column (55–60%) */}
                    <div className="program-editorial-content">
                      {/* Top Bar: Eyebrow on left + Status & Academic Year on right */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.625rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                          {prog.category || 'PROGRAM'}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {yearLabel && (
                            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                              {yearLabel}
                            </span>
                          )}
                          <span style={{
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '999px',
                            textTransform: 'uppercase',
                            backgroundColor: isOngoing ? '#DCFCE7' : isPast ? '#F1F5F9' : '#EFF6FF',
                            color: isOngoing ? '#15803D' : isPast ? '#64748B' : 'var(--primary-blue)',
                            border: `1px solid ${isOngoing ? '#BBF7D0' : isPast ? '#E2E8F0' : '#BFDBFE'}`
                          }}>
                            {prog.status || 'ONGOING'}
                          </span>
                        </div>
                      </div>

                      {/* Program Title */}
                      <h2 style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.625rem', lineHeight: 1.25 }}>
                        <FormattedText text={prog.title} />
                      </h2>

                      {/* Short Description / Highlight */}
                      {prog.shortDescription && (
                        <div style={{ color: 'var(--primary-blue)', fontSize: '0.975rem', fontWeight: 700, marginBottom: '0.625rem', lineHeight: 1.45 }}>
                          <FormattedText text={prog.shortDescription} />
                        </div>
                      )}

                      {/* Main Description */}
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                        <FormattedText text={prog.description} />
                      </div>

                      {/* Unit & Date Metadata Row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', rowGap: '0.35rem', alignItems: 'center', fontSize: '0.825rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '0.875rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#334155' }}>
                          <MapPin size={14} style={{ color: 'var(--primary-pink)' }} />
                          {unitLabel}
                        </div>
                        {formattedStartDate && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} style={{ color: 'var(--primary-blue)' }} />
                            <span>Active Since: <strong>{formattedStartDate}</strong></span>
                          </div>
                        )}
                        {formattedEndDate && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>&bull; End: <strong>{formattedEndDate}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Action CTA */}
                      <div style={{ marginTop: 'auto' }}>
                        <Link 
                          to="/join" 
                          className="btn-primary" 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.45rem', 
                            backgroundColor: 'var(--primary-blue)', 
                            color: 'white', 
                            padding: '0.55rem 1.25rem', 
                            borderRadius: '0.55rem', 
                            textDecoration: 'none', 
                            fontWeight: 800, 
                            fontSize: '0.85rem' 
                          }}
                        >
                          View Program &rarr;
                        </Link>
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
