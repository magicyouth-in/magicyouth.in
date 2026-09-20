import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, Download, ShieldCheck, Compass, Users } from 'lucide-react';

export default function Resources() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const resourceCategories = [
    {
      category: "Student Leadership & Formation",
      items: [
        {
          title: "MAGIC Youth Handbook: Core Principles & Ignatian Values",
          description: "A foundational guide outlining the ethos, organizational structure, and reflection methodologies of the movement.",
          type: "Institutional Guide",
          format: "PDF Document"
        },
        {
          title: "Campus Chapter Coordinator Toolkit",
          description: "Operational guidelines for planning, conducting, and documenting student-led campus and community initiatives.",
          type: "Operational Toolkit",
          format: "PDF Document"
        },
        {
          title: "Reflection Circles Facilitator Guide",
          description: "Structured methodologies for leading group discernment and social analysis after community immersion visits.",
          type: "Facilitation Guide",
          format: "PDF Document"
        }
      ]
    },
    {
      category: "Publications & Reports",
      items: [
        {
          title: "YES-J Youth Impact Annual Review",
          description: "Overview of student initiatives, rural camps, and leadership conventions conducted across units.",
          type: "Annual Publication",
          format: "Digital Edition"
        },
        {
          title: "Project Shiksha Curriculum & Mentorship Framework",
          description: "Pedagogical blueprints and interactive lesson plans for college volunteers conducting remedial school tutoring.",
          type: "Program Framework",
          format: "Curriculum Guide"
        },
        {
          title: "Green Footprints: Campus Eco-Audit Manual",
          description: "Standard operating procedures for student teams measuring waste generation, plastic reduction, and biodiversity.",
          type: "Action Manual",
          format: "PDF Guide"
        }
      ]
    }
  ];

  return (
    <div className="resources-page-wrapper">
      {/* Header */}
      <section style={{ backgroundColor: '#0F172A', color: 'white', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: 'var(--primary-pink)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Knowledge & Toolkits
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Resources & Publications
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Official formation guides, chapter toolkits, publications, and program manuals for MAGIC Youth leaders and mentors.
          </p>
        </motion.div>
      </section>

      {/* Resource Sections */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {resourceCategories.map((cat, idx) => (
            <div key={idx}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                {cat.category}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {cat.items.map((item, i) => (
                  <motion.div 
                    key={i}
                    style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-pink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {item.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                          {item.format}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                        {item.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        {item.description}
                      </p>
                    </div>

                    <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                      <FileText size={16} /> Request Official Access &rarr;
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#0F172A', color: 'white', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.25rem' }}>
            Need custom guidance for your chapter?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Our YES-J central coordinators provide personalized mentorship, workshop facilitators, and orientation sessions.
          </p>
          <Link to="/contact" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem 2.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800 }}>
            Connect with YES-J Central &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
