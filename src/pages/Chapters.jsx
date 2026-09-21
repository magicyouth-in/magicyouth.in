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
      <section style={{ backgroundColor: '#0F172A', color: 'white', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Campus Network
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            MAGIC Youth Chapters
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Student-driven wings established inside educational institutions, forming collegiate youth into active agents of social change.
          </p>
        </motion.div>
      </section>

      {/* Chapters Directory */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '5rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Active Collegiate Units
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Verified YES-J chartered campus chapters actively conducting youth formation and community outreach.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading chapters...
            </div>
          ) : units.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {units.map((unit, idx) => (
                <motion.div 
                  key={unit.id || idx}
                  style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.5rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <Building2 size={24} style={{ color: 'var(--primary-blue)' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {unit.code || 'Campus Chapter'}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      {unit.name || unit.institution_name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                      <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span>{unit.city || unit.location || 'Andhra Pradesh, India'}</span>
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
            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Andhra Loyola Institute of Engineering and Technology (ALIET)
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Primary founding campus chapter active in Vijayawada, Andhra Pradesh.
              </p>
              <Link to="/join" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>
                Join ALIET Chapter &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* START A CHAPTER SECTION */}
      <section id="start-chapter" style={{ backgroundColor: '#0B1120', color: 'white', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Institutional Expansion
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Start a MAGIC Youth Chapter at Your Institution
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto' }}>
              Bring structured youth formation and community impact to your campus through the official 4-step YES-J chartering process.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
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
                style={{ backgroundColor: '#1E293B', border: '1px solid #334155', padding: '2.5rem 1.75rem', borderRadius: '1rem', position: 'relative' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.1 }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '1rem' }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '1rem', padding: '3.5rem 2.5rem', border: '1px solid #334155', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
              Initiate Chapter Establishment
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Are you a student leader or faculty member ready to charter a MAGIC Youth unit on your campus? Contact our expansion coordinators today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem 2.25rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, fontSize: '1rem', boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)' }}>
                Submit Chapter Inquiry &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
