import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, ArrowRight, CheckCircle2, FileText, Send } from 'lucide-react';

export default function Chapters() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch('/api/units?includeInactive=false');
        const data = await res.json();
        if (data.success) {
          setUnits(data.data);
        }
      } catch (err) {
        console.error('Error fetching units:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  return (
    <div className="chapters-page-wrapper">
      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Campus Network
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            MAGIC Youth Chapters
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Student-driven wings established inside educational institutions, forming collegiate youth into active agents of social change.
          </p>
        </motion.div>
      </section>

      {/* Chapters Directory */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Active Units */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Active Units
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '999px', border: '1px solid #A7F3D0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Operational
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Verified YES-J chartered campus chapters actively conducting youth formation and community outreach.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading chapters...
            </div>
          ) : (() => {
            const activeUnits = units.filter(u => u.status === 'Active' || (!u.status && u.status !== 'Upcoming'));
            const upcomingUnits = units.filter(u => u.status === 'Upcoming');

            return (
              <>
                {activeUnits.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: upcomingUnits.length > 0 ? '4rem' : '0' }}>
                    {activeUnits.map((unit, idx) => (
                      <motion.div 
                        key={unit.id || unit._id || idx}
                        style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.5rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Building2 size={24} style={{ color: 'var(--primary-blue)' }} />
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {unit.code || 'Campus Chapter'}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '6px' }}>
                              ACTIVE
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {unit.name}
                          </h3>

                          {unit.institution && (
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>
                              {unit.institution}
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                            <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                            <span>{unit.location || unit.city || 'Andhra Pradesh, India'}</span>
                          </div>

                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            {unit.description || 'Active student wing conducting grassroots community immersion, literacy mentoring, and environmental campaigns.'}
                          </p>
                        </div>

                        <Link to="/join" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
                          Join This Chapter &rarr;
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', border: '1px solid var(--border-color)', textAlign: 'center', marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      ALIET MAGIC YOUTH
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Andhra Loyola Institute of Engineering and Technology — Primary founding campus chapter in Vijayawada.
                    </p>
                    <Link to="/join" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>
                      Join ALIET Chapter &rarr;
                    </Link>
                  </div>
                )}

                {/* Upcoming Units */}
                {upcomingUnits.length > 0 && (
                  <div style={{ marginTop: '3.5rem', paddingTop: '3rem', borderTop: '1px dashed var(--border-color)' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                          Upcoming Units
                        </h2>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '999px', border: '1px solid #FDE68A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Chartering In Progress
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Collegiate wings currently undergoing formation, leadership alignment, and institutional onboarding.
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                      {upcomingUnits.map((unit, idx) => (
                        <motion.div 
                          key={unit.id || unit._id || idx}
                          style={{ backgroundColor: 'white', border: '1px dashed #CBD5E1', borderRadius: '1rem', padding: '2.5rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={fadeUp}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Building2 size={24} style={{ color: '#D97706' }} />
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                  {unit.code || 'Upcoming Chapter'}
                                </div>
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '6px' }}>
                                UPCOMING
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                              {unit.name}
                            </h3>

                            {unit.institution && (
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                {unit.institution}
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                              <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                              <span>{unit.location || unit.city || 'Andhra Pradesh, India'}</span>
                            </div>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                              {unit.description || 'Formation committee being onboarded for official chapter launch.'}
                            </p>
                          </div>

                          <Link to="/contact" className="btn-secondary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
                            Inquire About Launch &rarr;
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* START A CHAPTER SECTION */}
      <section id="start-chapter" style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Institutional Expansion
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Start a MAGIC Youth Chapter at Your Institution
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto' }}>
              Bring structured youth formation and community impact to your campus through the official 4-step YES-J chartering process.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              {
                step: '01',
                title: 'Faculty Sponsorship',
                desc: 'Identify a passionate faculty coordinator or institutional mentor who will serve as the liaison between YES-J and your college administration.'
              },
              {
                step: '02',
                title: 'Core Mobilization',
                desc: 'Gather a founding committee of 5-10 enthusiastic student leaders from diverse disciplines dedicated to organizing campus initiatives.'
              },
              {
                step: '03',
                title: 'Formal Request',
                desc: 'Submit the chapter establishment inquiry with details of your institution, faculty coordinator, and proposed student activities.'
              },
              {
                step: '04',
                title: 'Charter Verification',
                desc: 'Receive official YES-J charter recognition, orientation toolkits, chapter badges, and kickoff guidance for your first event.'
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', padding: '2rem 1.5rem', borderRadius: '1rem', position: 'relative' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.1 }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', padding: '3rem 2rem', border: '1px solid var(--border-color)', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Initiate Chapter Establishment
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Are you a student leader or faculty member ready to charter a MAGIC Youth unit on your campus? Contact our expansion coordinators today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.85rem 2rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9375rem' }}>
                Submit Chapter Inquiry &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
