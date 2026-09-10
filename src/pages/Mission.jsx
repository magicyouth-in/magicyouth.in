import React from 'react';
import { Compass, Target, ShieldCheck, Award, Heart, Sparkles } from 'lucide-react';
import '../styles/mission.css';

export default function Mission() {
  const values = [
    { title: 'Integrity & Transparency', desc: 'Operating with absolute honesty and accountability in every community initiative we lead.', icon: ShieldCheck },
    { title: 'Youth-Led Governance',     desc: 'Nurturing student autonomy, decision-making, and self-organizing capacity.',     icon: Award },
    { title: 'Compassionate Service',    desc: 'Dedicated to uplifting underserved communities through collective volunteering and outreach.', icon: Heart },
    { title: 'Continuous Innovation',    desc: 'Fostering creative, technology-driven approaches to student engagement and social awareness.',        icon: Sparkles },
  ];

  return (
    <main className="mission-wrapper">
      {/* ── PURPOSE HERO ───────────────────────────────────────────── */}
      <section className="mission-hero">
        <div className="container-default mission-hero-container">
          <h1 className="mission-statement">
            Empowering young people to become responsible, compassionate and socially conscious leaders.
          </h1>
          <p className="mission-hero-sub">
            We believe that real change begins when youth are given the tools, the mentorship, and the platform to take action.
          </p>
        </div>
      </section>

      {/* ── VISION & MISSION ────────────────────────────────────── */}
      <section className="mission-vision-section">
        <div className="container-default">
          <div className="vision-mission-grid">
            
            <div className="vm-block">
              <Compass size={40} className="vm-icon" />
              <h2>Our Vision</h2>
              <p>
                To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who actively lead initiatives that transform society and inspire meaningful progress across campuses, cities, and beyond.
              </p>
            </div>

            <div className="vm-block">
              <Target size={40} className="vm-icon" />
              <h2>Our Mission</h2>
              <p>
                To empower students with a collaborative platform for leadership development, community volunteering, technical and cultural workshops, and impactful social awareness campaigns — building character and capability in equal measure.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── CORE VALUES (EDITORIAL) ──────────────────────────────── */}
      <section className="core-values-section">
        <div className="container-default">
          <div className="editorial-header">
            <h2>Core Values</h2>
            <p>The principles that guide our every decision, project, and interaction.</p>
          </div>
          
          <div className="editorial-grid">
            {values.map((v, idx) => {
              const IconComp = v.icon;
              return (
                <div key={v.title} className="editorial-value-block">
                  <div className="value-number">0{idx + 1}</div>
                  <div className="value-content">
                    <IconComp className="value-icon" />
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
