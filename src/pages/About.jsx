import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Award, Target, Compass, Users, Sparkles, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import '../styles/home.css';

export default function About() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      {/* ─── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Institutional Identity
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            About MAGIC Youth
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Men and Women Aiming at Greater Initiatives for Change — a campus-based movement forming young collegiate leaders under the YES-J umbrella.
          </p>
        </motion.div>
      </section>

      {/* ─── 01 WHO WE ARE & CORE STORY ──────────────────────────────────── */}
      <section className="inner-section" style={{ backgroundColor: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              01 &bull; Identity &amp; Heritage
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.25, marginBottom: '1.5rem' }}>
              Forming Agents of Conscience, Compassion &amp; Commitment
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              <strong>MAGIC (Men and Women Aiming at Greater Initiatives for Change)</strong> is the collegiate youth formation wing of <strong>Youth Empowerment Services - Jesuits (YES-J)</strong>.
            </p>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Established inside higher education institutions, MAGIC Youth bridges academic learning with grassroots societal realities. We enable collegiate students to discover their civic responsibility, engage in peer mentorship, and execute high-impact community interventions.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F0F9FF', color: 'var(--primary-blue)', padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 700 }}>
                <ShieldCheck size={15} /> YES-J Chartered Wing
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFF1F2', color: 'var(--primary-pink)', padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 700 }}>
                <Sparkles size={15} /> Student-Led Action
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/assets/magic-logo.png" alt="MAGIC Youth Core Emblem" style={{ width: '180px', height: 'auto', objectFit: 'contain', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              M.A.G.I.C. Youth
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, maxWidth: '300px' }}>
              Men &amp; Women Aiming at Greater Initiatives for Change &bull; Andhra Loyola Campus
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── 02 VISION & MISSION ─────────────────────────────────────────── */}
      <section className="inner-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              02 &bull; Purpose &amp; Horizon
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Vision &amp; Strategic Mission
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Vision */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '0.75rem', backgroundColor: '#F0F9FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Target size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>Our Vision</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.75, margin: 0 }}>
                To nurture a generation of critically conscious, empathetic, and courageous collegiate youth who lead transformative initiatives for a more just, inclusive, and ecologically sustainable society.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.15 }} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '0.75rem', backgroundColor: '#FFF1F2', color: 'var(--primary-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Compass size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>Our Mission</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.75, margin: 0 }}>
                To empower student changemakers through experiential immersion, structured discernment, social justice literacy, peer mentoring, and community collaboration across collegiate chapters.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 03 THE FOUR FORMATION PILLARS ───────────────────────────────── */}
      <section className="inner-section" style={{ backgroundColor: '#FFFFFF', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              03 &bull; Pedagogical Framework
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              The 4 Pillars of MAGIC Formation
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '01', title: 'Experience', desc: 'Direct exposure visits, rural immersions, and community encounters that ground learning in real socio-economic contexts.' },
              { num: '02', title: 'Reflection', desc: 'Structured personal and collective discernment on observed realities, identifying root causes and ethical imperatives.' },
              { num: '03', title: 'Involvement', desc: 'Student-led design and execution of practical, high-impact community projects in education, ecology, and youth empowerment.' },
              { num: '04', title: 'Transformation', desc: 'Long-term cultivation of character, ethical leadership, and enduring commitment to social equity and public good.' },
            ].map((pillar, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '0.75rem', opacity: 0.9 }}>{pillar.num}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{pillar.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 04 INSTITUTIONAL BASE & HEADQUARTERS ─────────────────────────── */}
      <section className="inner-section" style={{ backgroundColor: '#0F172A', color: 'white', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              04 &bull; Central Secretariat
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '1.25rem', lineHeight: 1.25 }}>
              YES-J Headquarters
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              MAGIC Youth is centrally coordinated through the YES-J Centre for Excellence at Andhra Loyola College, coordinating collegiate chapters across Andhra Pradesh.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Address</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    YES-J Centre for Excellence, Andhra Loyola College Campus, Vijayawada, AP - 522 008, India
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-pink)', flexShrink: 0 }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Phone</div>
                  <a href="tel:+918686727202" style={{ color: '#38BDF8', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 700 }}>
                    +91-868-672-7202
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Email</div>
                  <a href="mailto:admin@magicyouth.in" style={{ color: '#38BDF8', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 700 }}>
                    admin@magicyouth.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '1rem', border: '1px solid #334155', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
              Want to Establish a Chapter?
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              Colleges and universities seeking to form a chartered MAGIC Youth campus unit can connect with our institutional expansion team.
            </p>
            <Link to="/contact" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem' }}>
              Inquire for Campus Unit <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
