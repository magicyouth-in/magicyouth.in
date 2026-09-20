import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../styles/home.css';

export default function About() {
  const [documents, setDocuments] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // Fetch real documents for Transparency section
    fetch('/api/documents?visibility=Public')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDocuments(data.data || []);
      })
      .catch(console.error);

    // Fetch real events for Impact Stories
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Filter to past events that might serve as stories
          const past = data.data.filter(e => new Date(e.startDate || e.start_date) < new Date());
          setStories(past.slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section">
        <div className="page-bg-glow"></div>
        <div className="page-header-content">
          <div className="section-eyebrow">Our Identity</div>
          <h1 className="page-header-title">About MAGIC Youth</h1>
          <p className="page-header-subtitle">
            A campus-based movement that forms young people as agents of conscience, compassion, and commitment.
          </p>
        </div>
      </section>

      {/* 1. CORE STORY */}
      <section className="inner-section">
        <div className="content-grid" style={{ alignItems: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Our Core Story</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
              <strong>Men and Women Aiming at Greater Initiatives for Change (MAGIC)</strong> is YES-J's student youth wing inside educational institutions.
            </p>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              It helps students become agents of change for themselves, their campuses, and their communities. We operate as a campus-based movement that forms young people as agents of conscience, compassion, and commitment.
            </p>
          </motion.div>
          <motion.div className="about-collage" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '400px' }}>
            <img src="/assets/magic-logo.png" className="collage-img-1" alt="MAGIC Youth" style={{ objectFit: 'contain', backgroundColor: '#f8fafc', padding: '2rem' }} />
          </motion.div>
        </div>
      </section>

      {/* 2. THE POWER OF MAGIC YOUTH */}
      <section className="inner-section bg-light">
        <div className="section-header">
          <div className="section-eyebrow">The Four-Part Process</div>
          <h2 className="section-title">The Power of MAGIC Youth</h2>
        </div>
        <div className="programs-grid" style={{ marginTop: '3rem' }}>
          {[
            { t: 'Experience', d: 'Exposure visits and social encounters that ground learning in reality.' },
            { t: 'Reflection', d: 'Structured personal and group reflection on what was seen and what must change.' },
            { t: 'Involvement', d: 'Students design and run initiatives on campus and in local communities.' },
            { t: 'Transformation', d: 'Long-term change in self, campus culture, and social commitment.' }
          ].map((item, i) => (
            <motion.div key={i} className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>{item.t}</div>
              <p style={{ color: 'var(--text-secondary)' }}>{item.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. & 4. FOUNDATION & HEADQUARTERS (Data-driven placeholders) */}
      {/* If data exists in the backend for HQ or Pillars, it would render here. Left intentionally data-driven. */}

      {/* 5. IMPACT STORIES */}
      {stories.length > 0 && (
        <section className="inner-section">
          <div className="section-header">
            <div className="section-eyebrow">Real Action</div>
            <h2 className="section-title">Impact Stories</h2>
          </div>
          <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', marginTop: '3rem' }}>
            {stories.map((story, i) => (
              <motion.div key={story._id} style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>{story.title}</h3>
                <div style={{ marginBottom: '0.5rem' }}><strong>What Happened:</strong> {story.description}</div>
                {story.unitId && <div style={{ marginBottom: '0.5rem' }}><strong>Who Was Involved:</strong> {story.unitId.name || 'MAGIC Youth Unit'}</div>}
                {story.location && <div style={{ marginBottom: '0.5rem' }}><strong>Location:</strong> {story.location}</div>}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 6. TRANSPARENCY & ACCOUNTABILITY */}
      {documents.length > 0 && (
        <section className="inner-section bg-light">
          <div className="section-header">
            <div className="section-eyebrow">Documentation</div>
            <h2 className="section-title">Transparency & Accountability</h2>
          </div>
          <div className="content-grid" style={{ marginTop: '3rem' }}>
            {documents.slice(0, 4).map((doc, i) => (
              <a key={doc._id} href={doc.filePath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <motion.div className="small-event" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                  <div className="small-event-content">
                    <h4 style={{ color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>{doc.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{doc.documentType || 'Report'}</p>
                  </div>
                </motion.div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
             <Link to="/media" className="btn-outline">View All Records</Link>
          </div>
        </section>
      )}

    </main>
  );
}
