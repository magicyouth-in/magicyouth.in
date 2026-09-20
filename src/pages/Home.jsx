import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Heart, Award, ArrowRight, ArrowDown } from 'lucide-react';
import '../styles/home.css';

export default function Home() {
  const [stats, setStats] = useState({ events: null, units: null, members: null, initialized: false });
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let eCount = null; let uCount = null; let mCount = null;
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          eCount = eventsData.data.length;
          setRecentEvents(eventsData.data.sort((a,b) => new Date(b.startDate || b.start_date) - new Date(a.startDate || a.start_date)).slice(0, 3));
        }

        const galleryRes = await fetch('/api/gallery');
        const galleryData = await galleryRes.json();
        if (galleryData.success) {
          setRecentPhotos(galleryData.data.slice(0, 4));
        }

        const unitsRes = await fetch('/api/units?includeInactive=false');
        const unitsData = await unitsRes.json();
        if (unitsData.success) {
          uCount = unitsData.data.length;
        }

        const teamsRes = await fetch('/api/teams');
        const teamsData = await teamsRes.json();
        if (teamsData.success && teamsData.data.length > 0) {
          mCount = teamsData.data.reduce((acc, t) => acc + (t.memberCount || 0), 0);
        }
        
        setStats({ events: eCount, units: uCount, members: mCount, initialized: true });
      } catch (err) {
        setStats({ events: null, units: null, members: null, initialized: true });
      }
    };
    fetchData();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      {/* 1. HERO SECTION */}
      <section className="home-hero" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${recentPhotos.length > 0 ? recentPhotos[0].file_path : '/assets/magic-logo.png'})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '4rem 1.5rem' }}>
        <motion.div className="hero-content" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="hero-eyebrow" style={{ color: 'var(--primary-pink)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 800, fontSize: '0.875rem' }}>YES-J &bull; MAGIC YOUTH</div>
          <h1 className="hero-headline" style={{ color: 'white', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            Men and Women Aiming at <span style={{ color: 'var(--primary-pink)' }}>Greater Initiatives</span> for Change
          </h1>
          <p className="hero-subtitle" style={{ color: '#E2E8F0', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 2.5rem' }}>
            A campus-based movement that forms young people as agents of conscience, compassion, and commitment.
          </p>
          <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem 2rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800 }}>JOIN MAGIC</Link>
            <Link to="/about" className="btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '1rem 2rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, border: '2px solid' }}>Discover Our Story</Link>
          </div>
        </motion.div>
      </section>

      {/* 2. SEE MAGIC IN ACTION — DEDICATED VIDEO SECTION */}
      <section className="video-feature-section" style={{ backgroundColor: '#0B1120', padding: '5rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-pink)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              SEE MAGIC IN ACTION
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, color: 'white', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
              Experience the Movement in Action
            </h2>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', backgroundColor: '#0F172A', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #1E293B' }}>
              <video
                controls
                playsInline
                preload="metadata"
                poster="/assets/magic-logo.png"
                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000000', display: 'block' }}
              >
                <source src="/videos/magic-youth.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. YES-J + MAGIC RELATIONSHIP */}
      <section className="about-section" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="about-grid" style={{ alignItems: 'center' }}>
          <motion.div className="about-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-pink)' }}>Organizational Identity</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              MAGIC Youth<br/>
              <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>A YES-J Student Youth Wing</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.8 }}>
              MAGIC is YES-J's student youth wing inside educational institutions.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="flow-diagram" style={{ background: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>YES-J</div>
              <ArrowDown size={24} style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }} />
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary-blue)' }}>MAGIC YOUTH</div>
              <ArrowDown size={24} style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }} />
              <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Educational Institutions</div>
              <ArrowDown size={24} style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }} />
              <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary-pink)' }}>Student Agents of Change</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. WHY MAGIC EXISTS */}
      <section className="mission-editorial" style={{ backgroundColor: 'white', padding: '6rem 1.5rem' }}>
        <div className="mission-container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <motion.article className="mission-block" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2rem', letterSpacing: '-0.02em' }}>Why MAGIC Youth Exists</h2>
            <p style={{ fontSize: '1.5rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              To form young people as agents of <strong style={{ color: 'var(--primary-blue)' }}>conscience</strong>, <strong style={{ color: 'var(--primary-pink)' }}>compassion</strong>, and <strong style={{ color: 'var(--primary-blue)' }}>commitment</strong> who drive long-term social change and personal transformation in their campuses and communities.
            </p>
          </motion.article>
        </div>
      </section>

      {/* 4. THE MAGIC JOURNEY */}
      <section className="programs-section" style={{ backgroundColor: '#0F172A', color: 'white' }}>
        <div className="section-header">
          <div className="section-eyebrow" style={{ color: 'var(--primary-pink)' }}>The Process</div>
          <h2 className="section-title" style={{ color: 'white' }}>The MAGIC Journey</h2>
        </div>
        <div className="magic-timeline">
          {[
            { t: 'Experience', d: 'Exposure visits and social encounters that ground learning in reality.' },
            { t: 'Reflection', d: 'Structured personal and group reflection on what was seen and what must change.' },
            { t: 'Involvement', d: 'Students design and run initiatives on campus and in local communities.' },
            { t: 'Transformation', d: 'Long-term change in self, campus culture, and social commitment.' }
          ].map((item, i) => (
            <motion.div key={i} className="timeline-item" style={{ background: '#1E293B', borderColor: '#334155' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-pink)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phase 0{i+1}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>{item.t}</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.6 }}>{item.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED STORY */}
      {stats.initialized && recentEvents.length > 0 && (
        <section className="featured-story-section" style={{ backgroundColor: 'white', padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Featured Impact</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ flex: '1 1 400px' }}>
                <img src={recentEvents[0].photoUrl || "/assets/magic-logo.png"} alt={recentEvents[0].title} loading="lazy" style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '1rem', border: '1px solid var(--border-color)' }} />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>{recentEvents[0].title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.8 }}>{recentEvents[0].description}</p>
                <div>
                  <Link to="/impact" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>View Story <ArrowRight size={16} /></Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* 6. REAL IMPACT / NUMBERS */}
      {stats.initialized && (
        <section className="impact-strip" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          <div className="impact-grid">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="impact-number">{stats.units !== null && stats.units > 0 ? stats.units : 'Campus'}</div>
              <div className="impact-label">{stats.units !== null && stats.units > 0 ? 'Active Units' : 'Engagement'}</div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
              <div className="impact-number">{stats.events !== null && stats.events > 0 ? stats.events : 'Youth'}</div>
              <div className="impact-label">{stats.events !== null && stats.events > 0 ? 'Events Conducted' : 'In Action'}</div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
              <div className="impact-number">{stats.members !== null && stats.members > 0 ? stats.members : 'Leadership'}</div>
              <div className="impact-label">{stats.members !== null && stats.members > 0 ? 'Student Leaders' : 'Formation'}</div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.3 }}>
              <div className="impact-number">Community</div>
              <div className="impact-label">Commitment</div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 7. FINAL CTA */}
      <section className="final-cta-section" style={{ backgroundColor: '#0F172A', padding: '8rem 1.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '1.5rem', color: 'white', lineHeight: 1.2, maxWidth: '800px', margin: '0 auto 1.5rem' }}>
            Young people can be more than participants.<br/><span style={{ color: 'var(--primary-pink)' }}>They can become agents of change.</span>
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem', color: '#94A3B8' }}>
            Join MAGIC Youth and be part of a transformative journey rooted in YES-J's mission.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary" style={{ backgroundColor: 'var(--primary-pink)', color: 'white', padding: '1rem 2rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800 }}>JOIN MAGIC &rarr;</Link>
            <a href="https://yesj.org" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '1rem 2rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, border: '2px solid' }}>EXPLORE YES-J &rarr;</a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
