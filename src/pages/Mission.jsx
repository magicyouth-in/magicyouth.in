import React from 'react';
import { motion } from 'framer-motion';
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
        <div className="hero-bg-shapes">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 1.5 }} className="hero-shape-1" style={{ backgroundColor: 'white' }} />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 1.5, delay: 0.2 }} className="hero-shape-2" style={{ backgroundColor: 'white' }} />
        </div>
        <div className="container-default mission-hero-container relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="mission-statement"
          >
            Empowering young people to become responsible, compassionate and socially conscious leaders.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }} 
            className="mission-hero-sub"
          >
            We believe that real change begins when youth are given the tools, the mentorship, and the platform to take action.
          </motion.p>
        </div>
      </section>

      {/* ── VISION & MISSION ────────────────────────────────────── */}
      <section className="mission-vision-section">
        <div className="container-default">
          <div className="vision-mission-grid">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }} 
              className="vm-block"
            >
              <Compass size={40} className="vm-icon" />
              <h2>Our Vision</h2>
              <p>
                To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who actively lead initiatives that transform society and inspire meaningful progress across campuses, cities, and beyond.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: 0.2 }} 
              className="vm-block"
            >
              <Target size={40} className="vm-icon" />
              <h2>Our Mission</h2>
              <p>
                To empower students with a collaborative platform for leadership development, community volunteering, technical and cultural workshops, and impactful social awareness campaigns — building character and capability in equal measure.
              </p>
            </motion.div>

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
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.5, delay: idx * 0.1 }} 
                  key={v.title} 
                  className="editorial-value-block"
                >
                  <div className="value-number">0{idx + 1}</div>
                  <div className="value-content">
                    <IconComp className="value-icon" />
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
