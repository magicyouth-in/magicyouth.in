import React from 'react';
import { Compass, Target, CheckCircle, ShieldCheck, Award, Heart, Sparkles, TrendingUp } from 'lucide-react';
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
    <main className="home-wrapper">
      {/* ── MISSION HERO ───────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="container-default hero-container">
          <div className="hero-content">
            <span className="hero-badge">Our Purpose</span>
            <h1 className="hero-title">Mission &amp; Vision</h1>
            <p className="hero-subtitle">
              Men &amp; Women Aiming Greater Initiatives for Change. Discover the core values, objectives, and future roadmaps that define our movement.
            </p>
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ────────────────────────────────────── */}
      <section className="section-padding section-light">
        <div className="container-default">
          <div className="what-we-do-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
            <div className="what-we-do-card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <Compass size={48} color="var(--primary-purple)" />
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Vision</h3>
                <p style={{ fontSize: '1.125rem' }}>
                  To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who actively lead initiatives that transform society and inspire meaningful progress across campuses, cities, and beyond.
                </p>
              </div>
            </div>

            <div className="what-we-do-card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <Target size={48} color="var(--primary-purple)" />
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Mission</h3>
                <p style={{ fontSize: '1.125rem' }}>
                  To empower students with a collaborative platform for leadership development, community volunteering, technical and cultural workshops, and impactful social awareness campaigns — building character and capability in equal measure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OBJECTIVES ──────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-default">
          <div className="section-header-center">
            <h2>Core Objectives</h2>
            <p>Our action plan for sustainable youth empowerment.</p>
          </div>
          <div className="what-we-do-grid">
            {objectives.map((item) => (
              <div key={item.title} className="what-we-do-card">
                <CheckCircle className="card-icon" />
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUTURE GOALS ────────────────────────────────────────── */}
      <section className="section-padding section-light">
        <div className="container-default">
          <div className="section-header-center">
            <h2>Future Goals</h2>
            <p>Our strategic roadmap for scaling impact.</p>
          </div>
          <div className="what-we-do-grid">
            {futureGoals.map((goal) => (
              <div key={goal.title} className="what-we-do-card" style={{ borderLeft: '4px solid var(--primary-purple)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <TrendingUp style={{ width: 24, height: 24, color: 'var(--primary-purple)' }} />
                  <h3 style={{ margin: 0 }}>{goal.title}</h3>
                </div>
                <p>{goal.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ─────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-default">
          <div className="section-header-center">
            <h2>Guiding Principles</h2>
          </div>
          <div className="what-we-do-grid">
            {values.map((v) => {
              const IconComp = v.icon;
              return (
                <div key={v.title} className="what-we-do-card">
                  <IconComp className="card-icon" />
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
