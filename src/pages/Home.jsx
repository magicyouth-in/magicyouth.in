import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, BookOpen, Globe, Quote, Image as ImageIcon, Calendar } from 'lucide-react';
import '../styles/home.css';

const coreValues = [
  "Leadership", "Service", "Integrity", "Inclusiveness", 
  "Respect", "Teamwork", "Accountability", "Innovation", 
  "Social Responsibility", "Compassion", "Professionalism"
];

export default function Home() {
  const [stats, setStats] = useState({ events: 0, photos: 0, units: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [previewTeam, setPreviewTeam] = useState(null);
  const [previewMembers, setPreviewMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Events
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          setStats(s => ({ ...s, events: eventsData.data.length }));
          setRecentEvents(eventsData.data.slice(0, 3));
        }

        // Fetch Gallery
        const galleryRes = await fetch('/api/gallery');
        const galleryData = await galleryRes.json();
        if (galleryData.success) {
          setStats(s => ({ ...s, photos: galleryData.data.length }));
          setRecentPhotos(galleryData.data.slice(0, 4));
        }

        // Fetch Units
        const unitsRes = await fetch('/api/units?includeInactive=false');
        const unitsData = await unitsRes.json();
        if (unitsData.success) {
          setStats(s => ({ ...s, units: unitsData.data.length }));
        }

        // Fetch Teams & Members Preview
        const teamsRes = await fetch('/api/teams');
        const teamsData = await teamsRes.json();
        if (teamsData.success && teamsData.data.length > 0) {
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

  return (
    <main className="home-wrapper">
      {/* ── 1. HERO SECTION ───────────────────────────────────── */}
      <section className="home-hero">
        <div className="container-default hero-container">
          <div className="hero-content">
            <span className="hero-badge">A Movement for Change</span>
            <h1 className="hero-title">
              Men and Women Aiming Greater Initiative for Change
            </h1>
            <p className="hero-subtitle">
              Empowering young people to lead, serve, and create meaningful change in their communities.
            </p>
            <div className="hero-actions">
              <Link to="/about" className="btn-primary">
                Explore MAGIC Youth
              </Link>
              <Link to="/join" className="btn-secondary">
                Join the Movement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. IMPACT / STATISTICS ────────────────────────────── */}
      <section className="home-stats-section">
        <div className="container-default">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.units > 0 ? stats.units : '-'}</div>
              <div className="stat-label">Active Units</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.events > 0 ? stats.events : '-'}</div>
              <div className="stat-label">Events & Initiatives</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.photos > 0 ? stats.photos : '-'}</div>
              <div className="stat-label">Memories Captured</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHO WE ARE ─────────────────────────────────────── */}
      <section className="section-padding section-light">
        <div className="container-default who-we-are-container">
          <div className="who-we-are-text">
            <h2>Young people with a purpose.<br/>A movement for change.</h2>
            <p>
              MAGIC Youth — Men and Women Aiming Greater Initiative for Change — is a student-led youth organization under YES-J that encourages young people to grow as responsible leaders through service, education, teamwork, innovation and community engagement.
            </p>
            <Link to="/about" className="btn-secondary" style={{ marginTop: '1.5rem' }}>
              Learn More About MAGIC
            </Link>
          </div>
          <div className="who-we-are-image">
            {recentPhotos[0] ? (
              <img src={recentPhotos[0].file_path} alt="MAGIC Youth Students" loading="lazy" />
            ) : (
              <div className="image-placeholder"><ImageIcon size={48} /></div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. VISION SECTION ─────────────────────────────────── */}
      <section className="section-padding section-vision">
        <div className="container-default vision-container">
          <Quote className="vision-icon" />
          <h2 className="vision-heading">Building young leaders for a better tomorrow.</h2>
          <p className="vision-text">
            We envision compassionate, responsible, skilled and socially conscious young people contributing to a just, inclusive and sustainable society.
          </p>
        </div>
      </section>

      {/* ── 5. WHAT WE DO ─────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-default">
          <div className="section-header-center">
            <h2>What We Do</h2>
            <p>Our initiatives are centered around four core pillars of youth development.</p>
          </div>
          <div className="what-we-do-grid">
            <div className="what-we-do-card">
              <Target className="card-icon" />
              <h3>Leadership</h3>
              <p>Developing confident and responsible young leaders capable of guiding their peers and communities.</p>
            </div>
            <div className="what-we-do-card">
              <Globe className="card-icon" />
              <h3>Service</h3>
              <p>Turning concern for others into meaningful, hands-on action through community volunteering.</p>
            </div>
            <div className="what-we-do-card">
              <BookOpen className="card-icon" />
              <h3>Learning</h3>
              <p>Building knowledge, skills, and personality through workshops, training, and real-world experiences.</p>
            </div>
            <div className="what-we-do-card">
              <Users className="card-icon" />
              <h3>Community</h3>
              <p>Creating opportunities for young people to work together, network, and create positive change.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CORE VALUES ────────────────────────────────────── */}
      <section className="section-padding section-light">
        <div className="container-default">
          <div className="section-header-center">
            <h2>Our Core Values</h2>
            <p>The principles that guide our members and our movement.</p>
          </div>
          <div className="values-cloud">
            {coreValues.map(val => (
              <span key={val} className="value-pill">{val}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. EVENTS PREVIEW ─────────────────────────────────── */}
      {recentEvents.length > 0 && (
        <section className="section-padding">
          <div className="container-default">
            <div className="section-header-flex">
              <h2>Moments That Move Us</h2>
              <Link to="/events" className="link-arrow">View All Events <ArrowRight size={18} /></Link>
            </div>
            <div className="events-preview-grid">
              {recentEvents.map(evt => (
                <div key={evt._id} className="event-preview-card">
                  <div className="event-preview-img">
                    {evt.poster ? (
                      <img src={evt.poster} alt={evt.title} loading="lazy" />
                    ) : (
                      <div className="placeholder"><Calendar size={32} /></div>
                    )}
                  </div>
                  <div className="event-preview-content">
                    <span className="event-date">
                      {new Date(evt.start_date || evt.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3>{evt.title}</h3>
                    {evt.unitId && <p className="event-unit">{evt.unitId.name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. GALLERY PREVIEW ────────────────────────────────── */}
      {recentPhotos.length > 0 && (
        <section className="section-padding">
          <div className="container-default">
            <div className="section-header-flex">
              <h2>Life at MAGIC</h2>
              <Link to="/gallery" className="link-arrow">Explore Gallery <ArrowRight size={18} /></Link>
            </div>
            <div className="gallery-preview-grid">
              {recentPhotos.map(photo => (
                <div key={photo._id} className="gallery-preview-item">
                  <img src={photo.file_path} alt={photo.title || 'MAGIC Youth Photo'} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 10. TEAMS PREVIEW ─────────────────────────────────── */}
      {previewMembers.length > 0 && (
        <section className="section-padding section-light">
          <div className="container-default">
            <div className="section-header-flex">
              <div>
                <h2>The People Behind MAGIC</h2>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  {previewTeam?.name} {previewTeam?.unitId ? `— ${previewTeam.unitId.name}` : ''}
                </p>
              </div>
              <Link to="/teams" className="link-arrow">Meet Our Teams <ArrowRight size={18} /></Link>
            </div>
            <div className="teams-preview-grid">
              {previewMembers.map(member => (
                <div key={member._id} className="team-preview-card">
                  <div className="team-member-photo">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} loading="lazy" />
                    ) : (
                      <div className="avatar-placeholder">{member.name ? member.name[0].toUpperCase() : 'U'}</div>
                    )}
                  </div>
                  <h3 className="team-member-name">{member.name}</h3>
                  <p className="team-member-role">{member.position}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 11. FINAL CTA ─────────────────────────────────────── */}
      <section className="section-padding final-cta-section">
        <div className="container-default final-cta-container">
          <h2 className="final-cta-heading">Think. Lead. Serve. Change.</h2>
          <p className="final-cta-text">
            Whether you want to lead, volunteer, learn, serve or contribute, there is a place for you in MAGIC Youth.
          </p>
          <Link to="/join" className="btn-cta-large">
            Join the Movement
          </Link>
        </div>
      </section>
    </main>
  );
}
