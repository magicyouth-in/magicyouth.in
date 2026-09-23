import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Sparkles, Loader2, BookOpen } from 'lucide-react';
import '../styles/home.css';

export default function Stories() {
  const [dbTestimonials, setDbTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setDbTestimonials(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedStory(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const storiesData = dbTestimonials.map(t => ({
    title: t.title || `Transformation Journey`,
    category: t.category || "Student Experience",
    author: t.author || t.name || "Student Changemaker",
    unit: t.unit || t.role || "MAGIC Youth Member",
    excerpt: t.excerpt || t.quote,
    fullStory: t.fullStory || t.full_story || t.quote,
    tag: t.tag || "Verified Testimony"
  }));

  return (
    <div className="stories-page-wrapper">
      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Voices &amp; Impact
          </div>
          <h1 className="page-header-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            MAGIC Stories
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto' }}>
            Authentic reflections of student leadership, grassroots solidarity, and personal transformation across campuses.
          </p>
        </motion.div>
      </section>

      {/* Stories Responsive 3-Column Grid */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={36} color="var(--primary-blue)" className="animate-spin" />
          </div>
        ) : storiesData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4.5rem 2rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '1rem',
            border: '1px dashed var(--border-color)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            maxWidth: '650px',
            margin: '0 auto'
          }}>
            <Sparkles size={48} color="var(--primary-blue)" style={{ margin: '0 auto 1.25rem', opacity: 0.6 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Transformation stories will appear here.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Student stories and impact testimonials are published as campus interventions progress. Have a story to share? Submit your reflection below.
            </p>
            <Link to="/contact" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800 }}>
              Submit Your Story <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="stories-grid">
            {storiesData.map((story, idx) => (
              <motion.article 
                key={idx}
                className="story-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: (idx % 3) * 0.1 }}
              >
                <div>
                  <div className="story-card-header">
                    <span className="story-card-category">
                      <span style={{ color: 'var(--primary-pink)' }}>●</span> {story.category}
                    </span>
                    {story.tag && <span className="story-card-tag">{story.tag}</span>}
                  </div>

                  <h2 className="story-card-title">
                    {story.title}
                  </h2>

                  <p className="story-card-excerpt">
                    "{story.excerpt}"
                  </p>
                </div>

                <div className="story-card-footer">
                  <div className="story-card-meta">
                    <div className="story-card-author">{story.author}</div>
                    <div className="story-card-unit">{story.unit}</div>
                  </div>
                  <button 
                    type="button"
                    className="story-card-btn"
                    onClick={() => setSelectedStory(story)}
                    aria-label={`Read story: ${story.title}`}
                  >
                    Read Story <ArrowRight size={14} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* Story Reader Modal */}
      <AnimatePresence>
        {selectedStory && (
          <div 
            className="story-modal-overlay"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div 
              className="story-modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div className="story-card-category">
                  <span style={{ color: 'var(--primary-pink)' }}>●</span> {selectedStory.category}
                </div>
                <button 
                  onClick={() => setSelectedStory(null)} 
                  aria-label="Close modal"
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={18} />
                </button>
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.3, marginBottom: '1rem' }}>
                {selectedStory.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                  {selectedStory.author ? selectedStory.author.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{selectedStory.author}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8125rem' }}>{selectedStory.unit}</div>
                </div>
              </div>

              <div style={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: '1rem', fontStyle: 'italic' }}>
                  "{selectedStory.excerpt}"
                </p>
                {selectedStory.fullStory && selectedStory.fullStory !== selectedStory.excerpt && (
                  <p style={{ marginTop: '1rem' }}>
                    {selectedStory.fullStory}
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  YES-J Chartered Student Formation
                </span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setSelectedStory(null)} 
                    className="btn-secondary" 
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
                  >
                    Close
                  </button>
                  <Link 
                    to="/join" 
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    Join Movement <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <section style={{ backgroundColor: '#0F172A', color: 'white', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.25rem' }}>
            Have a story of change to share?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Submit your student leadership or community engagement reflection to the editorial team.
          </p>
          <Link to="/contact" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem 2.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)' }}>
            Submit a Story &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
