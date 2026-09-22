import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import '../styles/home.css';

export default function Stories() {
  const [dbTestimonials, setDbTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
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

  const defaultStories = [
    {
      title: "From Passive Student to Community Advocate",
      category: "Leadership Journey",
      author: "Student Coordinator",
      unit: "ALIET Chapter",
      excerpt: "When I first joined MAGIC Youth, I thought community work was just about weekend volunteering. Through our structured exposure visits and Ignatian reflection circles, I realized it was about developing a critical lens on social inequity.",
      fullStory: "Leading Project Shiksha tutoring sessions taught me humility. Teaching mathematics to 5th graders in rural Vijayawada showed me the stark contrast between private education and rural government schools. That experience transformed how I view my engineering degree—not just as a pathway to a corporate job, but as a problem-solving tool for society.",
      tag: "Conscience & Action"
    },
    {
      title: "Green Footprints: Transforming Campus Waste Culture",
      category: "Environmental Action",
      author: "Campus Eco-Lead",
      unit: "Vijayawada Unit",
      excerpt: "Our chapter conducted a 48-hour waste audit across our college campus. The data shocked everyone, and we turned that awareness into a student-led single-use plastic ban.",
      fullStory: "We didn't just advocate; we provided solutions. We partnered with local clay artisans for eco-friendly alternatives during college fests, established vermicomposting pits for hostel food waste, and planted over 300 native saplings. When students take ownership, entire institutions follow.",
      tag: "Ecological Stewardship"
    },
    {
      title: "The Power of Reflection Circles in Rural Immersion",
      category: "Personal Transformation",
      author: "Volunteer Lead",
      unit: "Collegiate Wing",
      excerpt: "The 3-day rural immersion camp organized under YES-J fundamentally shifted how our team collaborates. Living alongside farming families dismantled our urban preconceptions.",
      fullStory: "Every evening, we sat in structured reflection circles—sharing not just what we did, but what we felt and what systemic issues we observed. That daily practice of discernment is what makes MAGIC Youth unique: action is never disconnected from deep ethical reflection.",
      tag: "Ignatian Reflection"
    },
    {
      title: "Bridge to High School: Student-Led Math Mentoring",
      category: "Peer Mentorship",
      author: "Academic Outreach Lead",
      unit: "ALC MAGIC Youth Chapter",
      excerpt: "Every Saturday, twenty of our student volunteers travel to local municipal schools to conduct interactive stem workshops and bridge foundational learning gaps.",
      fullStory: "Rather than rote learning, we created visual math puzzles and hands-on science experiments using locally available materials. Over six months, school attendance on Saturdays jumped by 40%, and our college volunteers developed deep empathy and pedagogical patience.",
      tag: "Community Formation"
    },
    {
      title: "Health, Hygiene & Dignity in Slum Communities",
      category: "Community Outreach",
      author: "Social Action Volunteer",
      unit: "Loyola Campus Unit",
      excerpt: "Collaborating with local medical volunteers, our student chapter organized adolescent health literacy and water sanitation workshops in peri-urban settlements.",
      fullStory: "We distributed sanitary kits and conducted open, stigma-free awareness sessions for over 150 young women. The grassroots connection taught our collegiate volunteers the importance of community dignity, active listening, and long-term sustained partnership.",
      tag: "Grassroots Solidarity"
    },
    {
      title: "Ignatian Discernment in Daily Student Decisions",
      category: "Ethical Formation",
      author: "Formation Secretary",
      unit: "Student Leadership Wing",
      excerpt: "MAGIC Youth provided me with a framework of conscience, competence, compassion, and commitment that guides how I lead student committees and plan projects.",
      fullStory: "Before making decisions for student fests or budget allocations, we pause for regular reflection. Asking 'who benefits and who might be left behind?' has transformed how our entire student executive council prioritizes inclusivity.",
      tag: "Ethical Leadership"
    }
  ];

  const storiesData = dbTestimonials.length > 0 ? dbTestimonials.map(t => ({
    title: t.title || `Transformation Story by ${t.name}`,
    category: t.category || "Student Experience",
    author: t.name,
    unit: t.role || "MAGIC Youth Member",
    excerpt: t.quote,
    fullStory: t.quote,
    tag: "Verified Testimony"
  })) : defaultStories;

  return (
    <div className="stories-page-wrapper">
      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Voices & Impact
          </div>
          <h1 className="page-header-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            MAGIC Stories
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto' }}>
            Real narratives of student leadership, community solidarity, and personal transformation across campuses.
          </p>
        </motion.div>
      </section>

      {/* Stories Responsive 3-Column Grid */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem 5rem' }}>
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
