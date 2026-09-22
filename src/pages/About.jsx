import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Library } from 'lucide-react';
import '../styles/home.css';

export default function About() {
  const [documents, setDocuments] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch('/api/documents?visibility=Public')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDocuments(data.data || []);
      })
      .catch(console.error);

    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const past = data.data.filter(e => new Date(e.startDate || e.start_date) < new Date());
          setStories(past.slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div className="page-header-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Institutional Identity
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: '3rem' }}>About MAGIC Youth</h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)' }}>
            A campus-based movement forming young people as agents of conscience, compassion, and commitment.
          </p>
        </div>
      </section>

      {/* 01 OUR CORE STORY */}
      <section className="inner-section" style={{ backgroundColor: 'white' }}>
        <div className="content-grid" style={{ alignItems: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>01</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Our Core Story</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
              <strong>Men and Women Aiming at Greater Initiatives for Change (MAGIC)</strong> is YES-J's student youth wing inside educational institutions.
            </p>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              It helps students become agents of change for themselves, their campuses, and their communities. We operate as a campus-based movement that forms young people as agents of conscience, compassion, and commitment.
            </p>
          </motion.div>
          <motion.div className="about-collage" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '400px', backgroundColor: 'var(--bg-secondary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/assets/magic-logo.png" alt="MAGIC Youth Core Identity" loading="lazy" style={{ width: '200px', objectFit: 'contain' }} />
          </motion.div>
        </div>
      </section>

      {/* 02 THE POWER OF MAGIC YOUTH */}
      <section className="inner-section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>02</div>
          <h2 className="section-title">The Power of MAGIC Youth</h2>
        </div>
        <div className="programs-grid">
          {[
            { t: 'Experience', d: 'Exposure visits and social encounters that ground learning in reality.' },
            { t: 'Reflection', d: 'Structured personal and group reflection on what was seen and what must change.' },
            { t: 'Involvement', d: 'Students design and run initiatives on campus and in local communities.' },
            { t: 'Transformation', d: 'Long-term change in self, campus culture, and social commitment.' }
          ].map((item, i) => (
            <motion.div key={i} className="program-card" style={{ background: 'white', border: '1px solid var(--border-color)', boxShadow: 'none' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>{item.t}</div>
              <p style={{ color: 'var(--text-secondary)' }}>{item.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 03 OUR FOUNDATION & 04 OUR HEADQUARTERS */}
      <section className="inner-section" style={{ backgroundColor: '#FFFFFF', color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="content-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>03</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: '1.5rem' }}>Our Foundation</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Library size={22} color="var(--primary-blue)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>Ignatian Pillars</h4>
                <p style={{ color: '#475569', lineHeight: 1.6 }}>MAGIC Youth is guided by the core institutional principles of YES-J, emphasizing conscience, compassion, and active social commitment in all our student formation initiatives.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>04</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: '1.5rem' }}>Our Headquarters</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={22} color="var(--primary-blue)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>YES-J Institutional Base</h4>
                <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>MAGIC Youth coordinates its collegiate campus chapters centrally through the YES-J headquarters in Vijayawada, Andhra Pradesh, India.</p>
                <a href="https://yesj.org/contact" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}>View Official Location &rarr;</a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 05 IMPACT STORIES */}
      {stories.length > 0 && (
        <section className="inner-section" style={{ backgroundColor: 'white' }}>
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>05</div>
            <h2 className="section-title">Impact Stories</h2>
          </div>
          <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
            {stories.map((story, i) => (
              <motion.article key={story._id} style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '1rem' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>{story.title}</h3>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Outcome:</strong> {story.description}</div>
                {story.unitId && <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Campus:</strong> {story.unitId.name || 'MAGIC Youth Unit'}</div>}
                {story.location && <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Location:</strong> {story.location}</div>}
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* 06 TRANSPARENCY & ACCOUNTABILITY */}
      {documents.length > 0 && (
        <section className="inner-section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>06</div>
            <h2 className="section-title">Transparency & Accountability</h2>
          </div>
          <div className="content-grid">
            {documents.slice(0, 4).map((doc, i) => (
              <a key={doc._id} href={doc.filePath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <motion.div className="small-event" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                  <div className="small-event-content">
                    <h4 style={{ color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>{doc.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{doc.documentType || 'Report'}</p>
                  </div>
                </motion.div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
             <Link to="/media" className="btn-outline">View All Publications</Link>
          </div>
        </section>
      )}
    </main>
  );
}
