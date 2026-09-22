import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import '../styles/home.css';

export default function Resources() {
  const [dbDocuments, setDbDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setDbDocuments(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const defaultCategories = [
    {
      category: "Student Leadership & Formation",
      items: [
        {
          title: "MAGIC Youth Handbook: Core Principles & Ignatian Values",
          description: "A foundational guide outlining the ethos, organizational structure, and reflection methodologies of the movement.",
          type: "Institutional Guide",
          format: "PDF Document",
          url: null
        },
        {
          title: "Campus Chapter Coordinator Toolkit",
          description: "Operational guidelines for planning, conducting, and documenting student-led campus and community initiatives.",
          type: "Operational Toolkit",
          format: "PDF Document",
          url: null
        },
        {
          title: "Reflection Circles Facilitator Guide",
          description: "Structured methodologies for leading group discernment and social analysis after community immersion visits.",
          type: "Facilitation Guide",
          format: "PDF Document",
          url: null
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
          format: "Digital Edition",
          url: null
        },
        {
          title: "Project Shiksha Curriculum & Mentorship Framework",
          description: "Pedagogical blueprints and interactive lesson plans for college volunteers conducting remedial school tutoring.",
          type: "Program Framework",
          format: "Curriculum Guide",
          url: null
        },
        {
          title: "Green Footprints: Campus Eco-Audit Manual",
          description: "Standard operating procedures for student teams measuring waste generation, plastic reduction, and biodiversity.",
          type: "Action Manual",
          format: "PDF Guide",
          url: null
        }
      ]
    }
  ];

  // Group dynamic DB documents by documentType if available
  let displayCategories = defaultCategories;
  if (dbDocuments.length > 0) {
    const grouped = {};
    dbDocuments.forEach(doc => {
      const cat = doc.documentType || 'Official Documents';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        title: doc.title,
        description: doc.description || 'Official resource uploaded by chapter administration.',
        type: doc.documentType || 'Resource',
        format: doc.mimeType ? doc.mimeType.split('/')[1]?.toUpperCase() : 'PDF',
        url: doc.filePath || `/api/documents/download/${doc._id}`
      });
    });

    displayCategories = Object.keys(grouped).map(cat => ({
      category: cat,
      items: grouped[cat]
    }));
  }

  return (
    <div className="resources-page-wrapper">
      {/* Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Knowledge & Toolkits
          </div>
          <h1 className="page-header-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Resources & Publications
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Official formation guides, chapter toolkits, publications, and program manuals for MAGIC Youth leaders and mentors.
          </p>
        </motion.div>
      </section>

      {/* Resource Sections */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {displayCategories.map((cat, idx) => (
            <div key={idx}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                {cat.category}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {cat.items.map((item, i) => (
                  <motion.div 
                    key={i}
                    style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2.25rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {item.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
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

                    {item.url ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
                      >
                        <Download size={16} /> Open / Download Resource &rarr;
                      </a>
                    ) : (
                      <Link 
                        to="/contact" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
                      >
                        <FileText size={16} /> Request Official Copy &rarr;
                      </Link>
                    )}
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
          <Link to="/contact" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem 2.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)' }}>
            Connect with YES-J Central &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
