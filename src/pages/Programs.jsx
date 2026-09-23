import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, MapPin, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import '../styles/home.css';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setPrograms(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="programs-page-wrapper">
      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Action Pathways
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Programs &amp; Initiatives
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Structured institutional initiatives empowering collegiate youth to drive measurable change in education, environment, leadership, and community development.
          </p>
        </motion.div>
      </section>

      {/* Program Details List */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={36} color="var(--primary-blue)" className="animate-spin" />
            </div>
          ) : programs.length === 0 ? (
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
              <BookOpen size={48} color="var(--primary-blue)" style={{ margin: '0 auto 1.25rem', opacity: 0.6 }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Programs will be announced soon.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Our chapter coordinators and formation directors are finalizing upcoming youth initiatives. Please check back soon or register to stay informed.
              </p>
              <Link to="/join" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800 }}>
                Join as a Change Agent <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {programs.map((prog, idx) => (
                <motion.article 
                  key={prog._id || prog.id || idx}
                  style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                        {prog.category || 'Youth Initiative'}
                      </div>
                      <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                        {prog.title}
                      </h2>
                    </div>
                    {prog.academicYearId?.year && (
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.35rem 0.75rem', borderRadius: '999px' }}>
                        {prog.academicYearId.year}
                      </span>
                    )}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '2rem' }}>
                    {prog.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    {prog.unitId?.name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.875rem', fontWeight: 600 }}>
                        <MapPin size={15} color="var(--primary-blue)" /> {prog.unitId.name}
                      </div>
                    )}
                    {prog.date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Calendar size={15} color="var(--primary-blue)" /> {new Date(prog.date).toLocaleDateString()}
                      </div>
                    )}
                    <Link to="/join" className="btn-primary" style={{ marginLeft: 'auto', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                      Participate &rarr;
                    </Link>
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
