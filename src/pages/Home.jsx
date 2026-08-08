import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Award, HeartHandshake, Sparkles, Globe, Target,
  Compass, Star, ArrowRight, ChevronRight
} from 'lucide-react';
import '../styles/hero.css';
import '../styles/home.css';

const values = [
  { title: 'Integrity & Transparency', desc: 'Honesty and accountability in every initiative we lead.', icon: ShieldCheck },
  { title: 'Youth Leadership',         desc: 'Nurturing student decision-making and self-organizing capacity.', icon: Award },
  { title: 'Compassionate Service',    desc: 'Dedicated to uplifting communities through collective volunteering.', icon: HeartHandshake },
  { title: 'Continuous Innovation',    desc: 'Fostering creative approaches to student engagement.', icon: Sparkles },
  { title: 'Community First',          desc: 'People-centred programs that create real, lasting impact.', icon: Globe },
  { title: 'Mission-Driven Action',    desc: 'Every effort connects directly to our purpose and vision.', icon: Target },
];

const reasons = [
  { title: 'Build Real Leadership',      desc: 'Step into organizing, managing, and leading programs that impact hundreds of students.' },
  { title: 'Expand Your Network',        desc: 'Connect with like-minded peers, alumni, faculty mentors, and community leaders.' },
  { title: 'Earn Verified Certificates', desc: 'Receive officially verified volunteering and participation certificates for every event.' },
  { title: 'Develop Diverse Skills',     desc: 'From public speaking to event logistics — grow skills that define your career.' },
];

export default function Home() {
  return (
    <div>
      {/* ── 1. HERO SECTION ───────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>Youth Empowerment Movement</span>
            </div>
            <h1 className="hero-heading">
              Empowering Youth for <span className="highlight">Greater Impact</span>
            </h1>
            <p className="hero-description">
              MAGIC Youth (Men &amp; Women Aiming Greater Initiatives for Change) is a student-led organization fostering leadership, community service, and personal development.
            </p>
            <div className="hero-buttons">
              <Link to="/join" className="btn-primary-purple">
                Join MAGIC Youth
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link to="/about" className="btn-secondary-outline">
                Explore MAGIC Youth
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-wrapper">
              <img
                src="/assets/magic.png"
                alt="MAGIC Youth Movement"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. ABOUT MAGIC YOUTH ───────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-label">About Us</span>
              <h3>Making A Greater Impact in Communities</h3>
              <p>
                Founded at Andhra Loyola Institute of Engineering and Technology (ALIET), Vijayawada, MAGIC Youth bridges academic growth with social responsibility.
              </p>
              <p>
                Our platform enables passionate students to develop real-world leadership skills while organizing blood drives, awareness campaigns, technical workshops, and community outreach.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/about" className="vm-link">
                  Learn More About Our Story <ChevronRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </div>

            <div className="about-stats-grid">
              <div className="stat-card">
                <div className="stat-value">2022</div>
                <div className="stat-label">Founded</div>
                <div className="stat-sub">ALIET Vijayawada</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">250+</div>
                <div className="stat-label">Active Members</div>
                <div className="stat-sub">Across Units</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">45+</div>
                <div className="stat-label">Events Hosted</div>
                <div className="stat-sub">Community & Academic</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">500+</div>
                <div className="stat-label">Volunteers</div>
                <div className="stat-sub">Engaged Annually</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. VISION & MISSION ─────────────────────────────── */}
      <section className="home-section-alt">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Purpose &amp; Direction</span>
            <h2 className="section-title">Vision &amp; Mission</h2>
            <p className="section-subtitle">
              Guiding our youth towards meaningful action, ethical leadership, and lasting social contribution.
            </p>
          </div>

          <div className="vm-grid">
            <div className="vm-card">
              <div className="vm-icon-wrapper">
                <Compass style={{ width: 24, height: 24 }} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To cultivate a vibrant generation of empathetic, skilled, and socially conscious youth who lead initiatives that transform their communities and inspire meaningful progress.
              </p>
              <Link to="/mission" className="vm-link">
                Explore Our Objectives <ChevronRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>

            <div className="vm-card">
              <div className="vm-icon-wrapper">
                <Target style={{ width: 24, height: 24 }} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To empower students through a collaborative platform for leadership development, community volunteering, technical and cultural workshops, and social campaigns.
              </p>
              <Link to="/mission" className="vm-link">
                Read Full Mission Statement <ChevronRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CORE VALUES ──────────────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Our Guiding Pillars</span>
            <h2 className="section-title">Core Values</h2>
            <p className="section-subtitle">
              The fundamental principles behind every project, campaign, and decision we make.
            </p>
          </div>

          <div className="values-grid">
            {values.map((v) => {
              const IconComp = v.icon;
              return (
                <div key={v.title} className="value-card">
                  <div className="value-icon">
                    <IconComp style={{ width: 22, height: 22 }} />
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. WHY JOIN MAGIC YOUTH ─────────────────────────── */}
      <section className="home-section-alt">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Student Growth</span>
            <h2 className="section-title">Why Join MAGIC Youth?</h2>
            <p className="section-subtitle">
              Discover how participating in MAGIC Youth enriches your college experience and prepares you for real-world success.
            </p>
          </div>

          <div className="why-grid">
            {reasons.map((r) => (
              <div key={r.title} className="why-card">
                <div className="why-icon">
                  <Star style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FINAL JOIN CTA ───────────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="cta-box">
            <h2>Ready to Make an Impact?</h2>
            <p>
              Join MAGIC Youth today and become part of a student-led movement creating positive change in leadership and community service.
            </p>
            <div className="cta-buttons">
              <Link to="/join" className="btn-cta-white">
                Join MAGIC Youth
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link to="/contact" className="btn-cta-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
