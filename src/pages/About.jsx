import React from 'react';
import { Target, Compass, Users, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import '../styles/home.css';

export default function About() {
  const values = [
    { title: 'Integrity & Transparency', desc: 'Operating with honesty and accountability in every community initiative we lead.', icon: ShieldCheck },
    { title: 'Youth-Led Governance',     desc: 'Nurturing student autonomy, decision-making, and self-organizing capacity.',     icon: Users },
    { title: 'Compassionate Service',    desc: 'Dedicated to uplifting underserved communities through collective volunteering.', icon: Heart },
    { title: 'Continuous Innovation',    desc: 'Fostering creative approaches to student engagement and social awareness.',        icon: Sparkles },
  ];

  const objectives = [
    { title: 'Community Transformation', desc: 'Executing impactful local projects including blood donations, school tutoring, and environmental cleanups.' },
    { title: 'Student Skill Cultivation', desc: 'Providing avenues for tech development, creative workshops, and state-level competitive tournaments.' },
    { title: 'Leadership Incubation',     desc: 'Mentoring active youth through practical event planning, budget execution, and campus teamwork.' },
    { title: 'Social Justice Outreach',   desc: 'Increasing societal empathy by addressing inequalities and raising community awareness.' }
  ];

  return (
    <main className="home-wrapper">
      {/* ── ABOUT HERO ───────────────────────────────────────────── */}
      <section className="home-hero relative overflow-hidden">
        <div className="hero-bg-shape hero-shape-1"></div>
        <div className="hero-bg-shape hero-shape-2"></div>
        <div className="container-default hero-container relative z-10">
          <div className="hero-content">
            <span className="hero-badge">Our Identity</span>
            <h1 className="hero-title">About YES-J & MAGIC Youth</h1>
            <p className="hero-subtitle">
              A collaborative network dedicated to empowering young people through leadership, service, and social justice.
            </p>
          </div>
        </div>
      </section>

      {/* ── YES-J INTRODUCTION ────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-default who-we-are-container">
          <div className="who-we-are-text">
            <h2>Youth Empowering Service – Jesuits (YES-J)</h2>
            <p>
              YES-J operates as the central coordination body promoting social awareness, ethics, social justice outreach, and character-building in Jesuit institutions. 
              It provides a structural foundation and mentorship for student-led initiatives to thrive, granting members access to collaborative state-wide volunteering networks and specialized community resources.
            </p>
            <p style={{ marginTop: '1rem' }}>
              Rooted in the principles of holistic education and societal empathy, YES-J guides young people to become proactive, responsible leaders dedicated to serving others.
            </p>
          </div>
        </div>
      </section>

      {/* ── MAGIC YOUTH ──────────────────────────────────────── */}
      <section className="section-padding section-light">
        <div className="container-default">
          <div className="section-header-center">
            <h2>MAGIC Youth</h2>
            <p>Men and Women Aiming Greater Initiative for Change</p>
          </div>
          <div className="what-we-do-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Operating as a dynamic student/youth initiative under the guidance of YES-J, MAGIC Youth translates these core values into organized, impactful community action.
            </p>
            <p>
              MAGIC Youth empowers students to organize community outreach programs, cultural events, strategic competitions, and social impact campaigns. By taking charge of these initiatives, young people develop crucial leadership skills while making a tangible difference in their campuses and local communities.
            </p>
            <blockquote style={{ borderLeft: '4px solid var(--primary-blue)', paddingLeft: '1.5rem', marginTop: '2rem', fontStyle: 'italic', fontSize: '1.125rem', color: 'var(--text-primary)', textAlign: 'left' }}>
              "We empower students to become proactive change-makers, turning passion into organized, impactful community action."
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-default">
          <div className="section-header-center">
            <h2>Our Pillars</h2>
          </div>
          <div className="what-we-do-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
            <div className="what-we-do-card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <Compass size={48} color="var(--primary-blue)" />
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Vision</h3>
                <p style={{ fontSize: '1.125rem' }}>
                  To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who actively lead initiatives that transform their communities and inspire meaningful progress across campuses, cities, and beyond.
                </p>
              </div>
            </div>
            <div className="what-we-do-card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <Target size={48} color="var(--primary-blue)" />
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

      {/* ── CORE OBJECTIVES & VALUES ──────────────────────────────── */}
      <section className="section-padding section-light">
        <div className="container-default">
          <div className="section-header-center">
            <h2>Strategic Focus &amp; Values</h2>
          </div>
          <div className="what-we-do-grid" style={{ marginBottom: '4rem' }}>
            {objectives.map((obj) => (
              <div key={obj.title} className="what-we-do-card" style={{ borderLeft: '4px solid var(--primary-blue)' }}>
                <h3>{obj.title}</h3>
                <p>{obj.desc}</p>
              </div>
            ))}
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
