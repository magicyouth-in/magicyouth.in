import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Quote, ArrowRight, Sparkles, Heart, Compass } from 'lucide-react';

export default function Stories() {
  const [dbTestimonials, setDbTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
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
          <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            MAGIC Stories
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto' }}>
            Real narratives of student leadership, community solidarity, and personal transformation across campuses.
          </p>
        </motion.div>
      </section>

      {/* Stories Editorial Grid */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
          {storiesData.map((story, idx) => (
            <motion.article 
              key={idx}
              style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '3.5rem 2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: idx * 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: '#F0F9FF', padding: '0.35rem 0.85rem', borderRadius: '999px' }}>
                  {story.category}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                  {story.tag}
                </span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '1.5rem' }}>
                {story.title}
              </h2>

              <p style={{ fontSize: '1.15rem', fontWeight: 600, color: '#334155', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                "{story.excerpt}"
              </p>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                {story.fullStory}
              </p>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {story.author}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {story.unit}
                  </div>
                </div>
                <Link to="/join" style={{ color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Start Your Journey &rarr;
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

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
