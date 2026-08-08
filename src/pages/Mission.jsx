import React from 'react';
import { Compass, Target, CheckCircle, ShieldCheck, Award, Heart, Sparkles, TrendingUp } from 'lucide-react';
import '../styles/about.css';
import '../styles/home.css';

export default function Mission() {
  const values = [
    { title: 'Integrity & Transparency', desc: 'Operating with honesty and accountability in every community initiative we lead.', icon: ShieldCheck },
    { title: 'Youth-Led Governance',     desc: 'Nurturing student autonomy, decision-making, and self-organizing capacity.',     icon: Award },
    { title: 'Compassionate Service',    desc: 'Dedicated to uplifting underserved communities through collective volunteering.', icon: Heart },
    { title: 'Continuous Innovation',    desc: 'Fostering creative approaches to student engagement and social awareness.',        icon: Sparkles },
  ];

  const objectives = [
    { title: 'Youth Governance', desc: 'Promote student-led committees, event organizing, budget management, and transparent leadership.' },
    { title: 'Social Outreach', desc: 'Execute multi-campus blood donation drives, educational volunteer classes, and sustainability drives.' },
    { title: 'Skill Development', desc: 'Conduct state-level chess championships, code-a-thons, and public speaking workshops.' },
    { title: 'Social Awareness Campaigns', desc: 'Run campus programs for mental health advocacy, traffic safety, and digital literacy.' }
  ];

  const futureGoals = [
    { title: 'Regional Expansion', desc: 'Establishing MAGIC Youth student chapters across multiple Jesuit and non-Jesuit engineering colleges in Andhra Pradesh.' },
    { title: 'Corporate Skill Partnerships', desc: 'Partnering with tech firms and skill portals to provide certified career training for our active volunteer force.' },
    { title: 'Structured Mentorship Schemes', desc: 'Connecting senior MAGIC Youth alumni with current members for career guidance and internship opportunities.' },
    { title: 'Digital Social Platform Scaling', desc: 'Upgrading our digital portal to track volunteer service hours and issue tamper-proof digital certificates.' }
  ];

  return (
    <div>
      {/* ── MISSION HERO ───────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">Our Purpose</span>
          <h1 className="about-title">Mission &amp; <span className="highlight">Vision</span></h1>
          <p className="about-lead">
            Men &amp; Women Aiming Greater Initiatives for Change. Discover the core values, objectives, and future roadmaps that define our movement.
          </p>
        </div>
      </section>

      {/* ── VISION & MISSION ────────────────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="vm-grid">
            <div className="vm-card">
              <div className="vm-icon-wrapper">
                <Compass style={{ width: 26, height: 26 }} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who actively lead initiatives that transform society and inspire meaningful progress across campuses, cities, and beyond.
              </p>
            </div>

            <div className="vm-card">
              <div className="vm-icon-wrapper">
                <Target style={{ width: 26, height: 26 }} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To empower students with a collaborative platform for leadership development, community volunteering, technical and cultural workshops, and impactful social awareness campaigns — building character and capability in equal measure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OBJECTIVES ──────────────────────────────────────────── */}
      <section className="home-section-alt">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Action Plan</span>
            <h2 className="section-title">Core Objectives</h2>
          </div>
          <div className="why-grid">
            {objectives.map((item) => (
              <div key={item.title} className="why-card">
                <div className="why-icon">
                  <CheckCircle style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUTURE GOALS ────────────────────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Strategic Roadmap</span>
            <h2 className="section-title">Future Goals</h2>
          </div>
          <div className="values-grid">
            {futureGoals.map((goal) => (
              <div key={goal.title} className="value-card" style={{ borderLeft: '4px solid #5B21B6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <TrendingUp style={{ width: 18, height: 18, color: '#5B21B6' }} />
                  <h3 style={{ margin: 0 }}>{goal.title}</h3>
                </div>
                <p>{goal.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ─────────────────────────────────────────── */}
      <section className="home-section-alt">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Guiding Principles</span>
            <h2 className="section-title">Core Values</h2>
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
    </div>
  );
}
