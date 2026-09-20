import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, BookOpen, Globe, MapPin, Heart } from 'lucide-react';
import '../styles/home.css';

export default function Home() {
  const [stats, setStats] = useState({ events: null, units: null, members: null, initialized: false });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let eCount = null; let uCount = null; let mCount = null;
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          eCount = eventsData.data.length;
          setRecentEvents(eventsData.data.slice(0, 4));
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
        console.error('Error fetching homepage data:', err);
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
      <section className="home-hero">
        <motion.div className="hero-content" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="hero-eyebrow">YES-J • MAGIC YOUTH</div>
          <h1 className="hero-headline">MAGIC Youth</h1>
          <p className="hero-subtitle" style={{ fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '1rem' }}>
            Men and Women Aiming at Greater Initiatives for Change
          </p>
          <p className="hero-subtitle">
            A campus-based movement that forms young people as agents of conscience, compassion, and commitment.
          </p>
          <div className="hero-actions">
            <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="btn-primary">Join MAGIC</a>
            <Link to="/about" className="btn-outline">Explore Our Story</Link>
          </div>
        </motion.div>

        <div className="hero-visual">
          <div className="hero-glow"></div>
          <div className="hero-glow-pink"></div>
          <motion.div className="floating-card floating-card-1">
            <Users size={24} style={{ color: 'var(--primary-blue)' }} />
            <span>Campus Engagement</span>
          </motion.div>
          <motion.div className="floating-card floating-card-2">
            <Heart size={24} style={{ color: 'var(--primary-pink)' }} />
            <span>Community Impact</span>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.8, type: 'spring' }}
            className="hero-logo-container"
          >
            <img src={recentPhotos[0]?.file_path || "/assets/magic-logo.png"} alt="MAGIC Youth" className="hero-logo" style={{ objectFit: 'cover', borderRadius: '50%' }} />
          </motion.div>
        </div>
      </section>

      {/* 2. YES-J + MAGIC RELATIONSHIP */}
      <section className="about-section" style={{ backgroundColor: '#0F172A', color: 'white' }}>
        <div className="about-grid">
          <motion.div className="about-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-pink)' }}>Organizational Identity</div>
            <h2 style={{ color: 'white' }}>MAGIC Youth<br/><span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#94A3B8' }}>A YES-J Student Youth Wing</span></h2>
            <p style={{ color: '#E2E8F0', fontSize: '1.25rem' }}>
              MAGIC is YES-J's student youth wing inside educational institutions. It helps students become agents of change for themselves, their campuses, and their communities.
            </p>
          </motion.div>
          <motion.div className="about-collage" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <img src={recentPhotos[1]?.file_path || '/assets/magic-logo.png'} className="collage-img-1" alt="MAGIC Youth Activity" />
            <img src={recentPhotos[2]?.file_path || '/assets/magic-logo.png'} className="collage-img-2" alt="MAGIC Youth Community" style={{ border: '8px solid #0F172A' }}/>
          </motion.div>
        </div>
      </section>

      {/* 3. WHAT MAGIC DOES (THE 4 STAGES) */}
      <section className="programs-section">
        <div className="section-header">
          <div className="section-eyebrow">The Process</div>
          <h2 className="section-title">What MAGIC Does</h2>
        </div>
        <div className="programs-grid">
          <motion.div className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--bg-secondary)', marginBottom: '1rem', lineHeight: 1 }}>01</div>
            <h3>EXPERIENCE</h3>
            <p>Exposure visits and social encounters that ground learning in reality.</p>
          </motion.div>
          <motion.div className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--bg-secondary)', marginBottom: '1rem', lineHeight: 1 }}>02</div>
            <h3>REFLECTION</h3>
            <p>Structured personal and group reflection on what was seen and what must change.</p>
          </motion.div>
          <motion.div className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--bg-secondary)', marginBottom: '1rem', lineHeight: 1 }}>03</div>
            <h3>INVOLVEMENT</h3>
            <p>Students design and run initiatives on campus and in local communities.</p>
          </motion.div>
          <motion.div className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.3 }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--bg-secondary)', marginBottom: '1rem', lineHeight: 1 }}>04</div>
            <h3>TRANSFORMATION</h3>
            <p>Long-term change in self, campus culture, and social commitment.</p>
          </motion.div>
        </div>
      </section>

      {/* 4. WHY MAGIC EXISTS */}
      <section className="mission-editorial">
        <div className="mission-container">
          <motion.div className="mission-block" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '2rem' }}>WHY MAGIC?</h3>
            <p>
              To form young people as agents of <span style={{ color: 'var(--primary-blue)' }}>conscience</span>, <span style={{ color: 'var(--primary-pink)' }}>compassion</span>, and <span style={{ color: 'var(--primary-blue)' }}>commitment</span> who drive long-term social change and personal transformation in their campuses and communities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. MAGIC IN ACTION (CHAPTERS) */}
      <section className="gallery-section" style={{ backgroundColor: 'white' }}>
        <div className="section-header">
          <div className="section-eyebrow">Our Focus Areas</div>
          <h2 className="section-title">MAGIC In Action</h2>
        </div>
        <div className="gallery-masonry" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gridAutoRows: 'auto' }}>
          {[
            { t: 'Awareness Campaigns', d: 'Campus campaigns on caste, gender, environment, and poverty.' },
            { t: 'Community Service', d: 'Direct social outreach and YES-J mobilisation drives.' },
            { t: 'Leadership Sessions', d: 'Youth forums and district-level participation for skill building.' }
          ].map((item, i) => (
            <motion.div key={i} className="small-event" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
              <div className="small-event-content">
                <h4 style={{ color: 'var(--primary-blue)', fontSize: '1.5rem' }}>{item.t}</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{item.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. IMPACT / CURRENT ACTIVITY */}
      {stats.initialized && (
        <section className="impact-strip">
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
              <div className="impact-label">Service</div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 7. FINAL CTA */}
      <section className="final-cta-section">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Be part of MAGIC.</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            A campus-based movement forming agents of conscience, compassion, and commitment.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="btn-white">Join MAGIC</a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
