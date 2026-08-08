import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Heart, Sparkles, Award, Target, Landmark, Compass } from 'lucide-react';
import '../styles/about.css';
import '../styles/home.css';

export default function About() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setTeam(d.data); })
      .catch(() => {});
  }, []);

  const values = [
    { title: 'Integrity & Transparency', desc: 'Operating with honesty and accountability in every community initiative we lead.', icon: ShieldCheck },
    { title: 'Youth-Led Governance',     desc: 'Nurturing student autonomy, decision-making, and self-organizing capacity.',     icon: Users },
    { title: 'Compassionate Service',    desc: 'Dedicated to uplifting underserved communities through collective volunteering.', icon: Heart },
    { title: 'Continuous Innovation',    desc: 'Fostering creative approaches to student engagement and social awareness.',        icon: Sparkles },
    { title: 'Strategic Leadership',     desc: 'Building the next generation of campus leaders through mentorship & guidance.',   icon: Award },
    { title: 'Mission-Driven Impact',    desc: 'Every action connects directly to our purpose of building thriving communities.', icon: Target },
  ];

  const objectives = [
    { title: 'Community Transformation', desc: 'Executing impactful local projects including blood donations, school tutoring, and environmental cleanups.' },
    { title: 'Student Skill Cultivation', desc: 'Providing avenues for tech development, creative workshops, and state-level competitive tournaments.' },
    { title: 'Leadership Incubation',     desc: 'Mentoring active youth through practical event planning, budget execution, and campus teamwork.' },
    { title: 'Social Justice Outreach',   desc: 'Increasing societal empathy by addressing inequalities and raising community awareness.' }
  ];

  return (
    <div>
      {/* ── ABOUT HERO ───────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">Our Identity</span>
          <h1 className="about-title">About <span className="highlight">MAGIC Youth</span></h1>
          <p className="about-lead">
            Men &amp; Women Aiming Greater Initiatives for Change — a student-led organization empowering youth through leadership, service, and innovation since 2022.
          </p>
        </div>
      </section>

      {/* ── ORGANIZATIONAL STORY ─────────────────────────────────── */}
      <section className="about-story-section">
        <div className="about-story-container">
          <div className="story-content">
            <span className="section-label">History &amp; Foundation</span>
            <h2>Born from Student Initiative</h2>
            <p>
              MAGIC Youth was founded by a passionate group of students at Andhra Loyola Institute of Engineering and Technology (ALIET), Vijayawada. They believed that young people hold the key to creating sustainable change — both within their university campus and in the broader community.
            </p>
            <p>
              Starting with small community outreach programs, the organization quickly grew into a recognized platform for leadership development, cultural events, strategic competitions, and social impact campaigns.
            </p>
            <div className="story-highlight-box">
              "We empower students to become proactive change-makers, turning passion into organized, impactful community action."
            </div>
          </div>

          <div className="story-card-grid">
            <div className="editorial-stat-card">
              <div className="editorial-stat-val">2022</div>
              <div className="editorial-stat-lbl">Founded</div>
              <div className="editorial-stat-sub">ALIET, Vijayawada</div>
            </div>
            <div className="editorial-stat-card">
              <div className="editorial-stat-val">250+</div>
              <div className="editorial-stat-lbl">Members</div>
              <div className="editorial-stat-sub">Active volunteers</div>
            </div>
            <div className="editorial-stat-card">
              <div className="editorial-stat-val">45+</div>
              <div className="editorial-stat-lbl">Events</div>
              <div className="editorial-stat-sub">Programs organized</div>
            </div>
            <div className="editorial-stat-card">
              <div className="editorial-stat-val">500+</div>
              <div className="editorial-stat-lbl">Impact</div>
              <div className="editorial-stat-sub">Lives touched</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── YES-J ALIGNMENT ──────────────────────────────────────── */}
      <section style={{ padding: '0 1.5rem' }}>
        <div className="yes-j-box">
          <div className="yes-j-grid">
            <div className="yes-j-content">
              <span className="section-label">Academic &amp; Jesuit Alliance</span>
              <h3>Collaborative Integration with YES-J</h3>
              <p>
                As a student-led organization based at Andhra Loyola Institute of Engineering and Technology, Vijayawada, MAGIC Youth is closely aligned and collaborates with <strong>YES-J (Youth Empowerment Services - Jesuits)</strong>.
              </p>
              <p>
                YES-J operates as the central coordination body promoting social awareness, ethics, social justice outreach, and character-building in Jesuit institutions. This partnership grants our members access to mentors, collaborative state-wide volunteering networks, and specialized community resources.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="yes-j-badge">
                <Landmark style={{ width: 40, height: 40, color: '#5B21B6', marginBottom: '0.75rem' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#1F2937', letterSpacing: '0.05em' }}>YES-J ALIGNMENT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ────────────────────────────────────── */}
      <section className="home-section-alt">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Our Pillars</span>
            <h2 className="section-title">Vision &amp; Mission</h2>
          </div>
          <div className="vm-grid">
            <div className="vm-card">
              <div className="vm-icon-wrapper">
                <Compass style={{ width: 24, height: 24 }} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who actively lead initiatives that transform their communities and inspire meaningful progress across campuses, cities, and beyond.
              </p>
            </div>
            <div className="vm-card">
              <div className="vm-icon-wrapper">
                <Target style={{ width: 24, height: 24 }} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To empower students with a collaborative platform for leadership development, community volunteering, technical and cultural workshops, and impactful social awareness campaigns — building character and capability in equal measure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE OBJECTIVES ──────────────────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Strategic Focus</span>
            <h2 className="section-title">Key Objectives</h2>
          </div>
          <div className="values-grid">
            {objectives.map((obj) => (
              <div key={obj.title} className="value-card" style={{ borderLeft: '4px solid #5B21B6' }}>
                <h3>{obj.title}</h3>
                <p>{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ─────────────────────────────────────────── */}
      <section className="home-section-alt">
        <div className="home-container">
          <div className="home-section-header">
            <span className="section-label">Our Principles</span>
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
