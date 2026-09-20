import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, BookOpen, Globe, Calendar, MapPin, Heart, Image as ImageIcon } from 'lucide-react';
import '../styles/home.css';

export default function Home() {
  const [stats, setStats] = useState({ events: 0, photos: 0, units: 0, members: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [previewTeam, setPreviewTeam] = useState(null);
  const [previewMembers, setPreviewMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          setStats(s => ({ ...s, events: eventsData.data.length }));
          setRecentEvents(eventsData.data.filter(e => new Date(e.startDate || e.start_date) >= new Date()).slice(0, 3));
        }

        const galleryRes = await fetch('/api/gallery');
        const galleryData = await galleryRes.json();
        if (galleryData.success) {
          setStats(s => ({ ...s, photos: galleryData.data.length }));
          setRecentPhotos(galleryData.data.slice(0, 4));
        }

        const unitsRes = await fetch('/api/units?includeInactive=false');
        const unitsData = await unitsRes.json();
        if (unitsData.success) {
          setStats(s => ({ ...s, units: unitsData.data.length }));
        }

        const teamsRes = await fetch('/api/teams');
        const teamsData = await teamsRes.json();
        if (teamsData.success && teamsData.data.length > 0) {
          setStats(s => ({ ...s, members: teamsData.data.reduce((acc, t) => acc + (t.memberCount || 0), 0) }));
          const firstTeam = teamsData.data[0];
          setPreviewTeam(firstTeam);
          const membersRes = await fetch(`/api/teams/${firstTeam._id}/members`);
          const membersData = await membersRes.json();
          if (membersData.success) {
            setPreviewMembers(membersData.data.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
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
          <div className="hero-eyebrow">Men & Women Aiming Greater Initiatives for Change</div>
          <h1 className="hero-headline">MAGIC Youth</h1>
          <p className="hero-subtitle">Empowering young minds to lead, serve and create meaningful change in their communities.</p>
          <div className="hero-actions">
            <Link to="/join" className="btn-primary">Join MAGIC Youth</Link>
            <Link to="/mission" className="btn-outline">Explore Our Mission</Link>
          </div>
        </motion.div>

        <div className="hero-visual">
          <div className="hero-glow"></div>
          <div className="hero-glow-pink"></div>
          <motion.div className="floating-card floating-card-1">
            <Users size={24} style={{ color: 'var(--primary-blue)' }} />
            <span>Active Community</span>
          </motion.div>
          <motion.div className="floating-card floating-card-2">
            <Heart size={24} style={{ color: 'var(--primary-pink)' }} />
            <span>Social Impact</span>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.8, type: 'spring' }}
            className="hero-logo-container"
          >
            <img src="/assets/magic-logo.png" alt="MAGIC Youth Logo" className="hero-logo" />
          </motion.div>
        </div>
      </section>

      {/* 2. FLOATING IMPACT STRIP */}
      <section className="impact-strip">
        <div className="impact-grid">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="impact-number">{stats.units > 0 ? stats.units : 'Youth'}</div>
            <div className="impact-label">Community Units</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
            <div className="impact-number">{stats.events > 0 ? stats.events : 'Service'}</div>
            <div className="impact-label">Initiatives & Events</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
            <div className="impact-number">{stats.photos > 0 ? stats.photos : 'Impact'}</div>
            <div className="impact-label">Moments Captured</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.3 }}>
            <div className="impact-number">{stats.members > 0 ? stats.members : 'Action'}</div>
            <div className="impact-label">Active Volunteers</div>
          </motion.div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="about-section">
        <div className="about-grid">
          <motion.div className="about-collage" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <img src={recentPhotos[0]?.file_path || '/assets/magic-logo.png'} className="collage-img-1" alt="MAGIC Youth Activity" />
            <img src={recentPhotos[1]?.file_path || '/assets/magic-logo.png'} className="collage-img-2" alt="MAGIC Youth Community" />
            <div className="collage-badge">
              <span>EST.</span>
              <span>2020</span>
            </div>
          </motion.div>
          <motion.div className="about-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="section-eyebrow">About MAGIC Youth</div>
            <h2>Building young leaders. Creating meaningful change.</h2>
            <p>We are a dynamic youth organization dedicated to empowering the next generation. Through service, leadership development, and community engagement, MAGIC Youth provides a platform for students and young professionals to transform their compassion into real-world impact.</p>
            <Link to="/about" className="btn-primary">Discover More <ArrowRight size={18} /></Link>
          </motion.div>
        </div>
      </section>

      {/* 4. MISSION & VISION */}
      <section className="mission-editorial">
        <div className="mission-container">
          <motion.div className="mission-block" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3>Our Mission</h3>
            <p>To empower youth through <span style={{ color: 'var(--primary-blue)' }}>leadership</span>, inspire through <span style={{ color: 'var(--primary-pink)' }}>service</span>, and connect through <span style={{ color: 'var(--primary-blue)' }}>community</span>.</p>
          </motion.div>
          <motion.div className="mission-block" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3>Our Vision</h3>
            <p>A generation of socially conscious leaders building a more inclusive and compassionate world.</p>
          </motion.div>
        </div>
      </section>

      {/* 5. PROGRAMS / INITIATIVES */}
      <section className="programs-section">
        <div className="section-header">
          <div className="section-eyebrow">Our Work</div>
          <h2 className="section-title">Programs & Initiatives</h2>
        </div>
        <div className="programs-grid">
          <motion.div className="program-card featured" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Target className="program-icon" />
            <h3>Leadership Development</h3>
            <p>Comprehensive training programs designed to equip young minds with the essential skills to lead teams, manage projects, and communicate effectively in the real world.</p>
          </motion.div>
          <motion.div className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
            <Globe className="program-icon" />
            <h3>Community Service</h3>
            <p>Hands-on volunteering initiatives addressing local social challenges and environmental sustainability.</p>
          </motion.div>
          <motion.div className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
            <BookOpen className="program-icon" />
            <h3>Skill Workshops</h3>
            <p>Interactive sessions focused on career readiness, technical skills, and personal growth.</p>
          </motion.div>
        </div>
      </section>

      {/* 6. EVENTS */}
      {recentEvents.length > 0 && (
        <section className="events-section">
          <div className="section-header">
            <div className="section-eyebrow">Stay Involved</div>
            <h2 className="section-title">Upcoming Events</h2>
          </div>
          <div className="events-split">
            <motion.div className="featured-event" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <img src={recentEvents[0].poster || '/assets/magic-logo.png'} className="featured-event-img" alt={recentEvents[0].title} />
              <div className="featured-event-content">
                <div className="section-eyebrow">Featured Event</div>
                <h3>{recentEvents[0].title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{recentEvents[0].description || 'Join us for our upcoming featured initiative.'}</p>
                <Link to="/events" className="btn-primary">View Event Details</Link>
              </div>
            </motion.div>
            <div className="small-events-list">
              {recentEvents.slice(1).map((evt, idx) => (
                <motion.div key={evt._id} className="small-event" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.1 }}>
                  <div className="small-event-date">
                    <div style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>{new Date(evt.startDate || evt.start_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{new Date(evt.startDate || evt.start_date).getDate()}</div>
                  </div>
                  <div className="small-event-content">
                    <h4>{evt.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <MapPin size={14} />
                      <span>{evt.location || 'TBA'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link to="/events" className="btn-outline">View All Events</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. GALLERY */}
      {recentPhotos.length > 0 && (
        <section className="gallery-section">
          <div className="section-header">
            <div className="section-eyebrow">Our Impact in Action</div>
            <h2 className="section-title">Gallery Preview</h2>
          </div>
          <div className="gallery-masonry">
            {recentPhotos.slice(0, 4).map((photo, i) => (
              <motion.div key={photo._id} className="gallery-masonry-item" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <img src={photo.file_path} alt={photo.title || 'MAGIC Youth Event'} loading="lazy" />
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link to="/gallery" className="btn-primary">Explore Full Gallery</Link>
          </div>
        </section>
      )}

      {/* 8. TEAM */}
      {previewMembers.length > 0 && (
        <section className="programs-section" style={{ backgroundColor: 'white' }}>
          <div className="section-header">
            <div className="section-eyebrow">Leadership</div>
            <h2 className="section-title">Meet Our Team</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>{previewTeam?.name}</p>
          </div>
          <div className="programs-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {previewMembers.map((member, i) => (
              <motion.div key={member._id} className="program-card" style={{ textAlign: 'center', padding: '2rem' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 1.5rem', overflow: 'hidden', border: '3px solid var(--bg-secondary)' }}>
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', color: 'var(--primary-blue)', fontSize: '2rem', fontWeight: 800 }}>
                      {member.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{member.name}</h3>
                <p style={{ color: 'var(--primary-pink)', fontWeight: 600, fontSize: '0.875rem' }}>{member.position}</p>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/teams" className="btn-outline">View All Teams</Link>
          </div>
        </section>
      )}

      {/* 9. DARK BRAND SECTION */}
      <section className="dark-brand-section">
        <div className="dark-brand-container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Young people don't just participate in change. <br/><span className="dark-brand-accent">They create it.</span>
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Link to="/join" className="btn-primary">Become a MAGIC Youth Member</Link>
          </motion.div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="final-cta-section">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2>Ready to make an impact?</h2>
          <p>Join our growing community of youth leaders and start making a difference today.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/join" className="btn-white">Join MAGIC Youth</Link>
            <Link to="/contact" className="btn-outline" style={{ borderColor: 'white', color: 'white' }}>Contact Us</Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
