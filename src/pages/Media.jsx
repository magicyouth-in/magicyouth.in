import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Loader2, FileText, ExternalLink, Download, Search, Image as ImageIcon, BookOpen, Layers } from 'lucide-react';
import '../styles/home.css';

export default function Media() {
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'publications' | 'toolkits' | 'resources' | 'gallery'
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    // 1. Fetch Photo Gallery
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setPhotos(data.data.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPhotos(false));

    // 2. Fetch Chapters & Academic Years
    Promise.all([
      fetch('/api/units').then(res => res.json()),
      fetch('/api/academic-years').then(res => res.json())
    ])
    .then(([unitsData, yearsData]) => {
      if (unitsData.success) setUnits(unitsData.data || []);
      if (yearsData.success) setAcademicYears(yearsData.data || []);
    })
    .catch(console.error);

    // 3. Fetch Public Documents & Resources
    fetch('/api/documents/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setDocuments(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingDocs(false));
  }, []);

  // Keyboard shortcut to close lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const unitMatch = selectedUnit === 'All' || doc.unitId?._id === selectedUnit || doc.unit_id === selectedUnit;
      const yearMatch = selectedYear === 'All' || doc.academicYearId?._id === selectedYear || doc.academic_year_id === selectedYear;
      
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || (
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.documentType && doc.documentType.toLowerCase().includes(q))
      );

      let tabMatch = true;
      if (activeTab === 'publications') {
        tabMatch = /publication|magazine|report|review/i.test(doc.documentType || '');
      } else if (activeTab === 'toolkits') {
        tabMatch = /toolkit|guide|manual|framework/i.test(doc.documentType || '');
      } else if (activeTab === 'resources') {
        tabMatch = !(/publication|magazine/i.test(doc.documentType || ''));
      } else if (activeTab === 'gallery') {
        tabMatch = false;
      }

      return unitMatch && yearMatch && searchMatch && tabMatch;
    });
  }, [documents, selectedUnit, selectedYear, searchQuery, activeTab]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (activeTab === 'publications' || activeTab === 'toolkits' || activeTab === 'resources') {
      return [];
    }
    return photos.filter(p => {
      const unitMatch = selectedUnit === 'All' || p.unitId?._id === selectedUnit || p.unit_id === selectedUnit;
      const yearMatch = selectedYear === 'All' || p.academicYearId?._id === selectedYear || p.academic_year_id === selectedYear;
      
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.album && p.album.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );

      return unitMatch && yearMatch && searchMatch;
    });
  }, [photos, selectedUnit, selectedYear, searchQuery, activeTab]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'PDF Document';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  };

  return (
    <main className="home-wrapper">
      {/* ─── HEADER SECTION ─────────────────────────────────────────────────── */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Publications, Documents &amp; Media Hub
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Media, Publications &amp; Resources
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
            Access official formation handbooks, annual magazines, chapter toolkits, and photographic archives documenting youth leadership across all chapters.
          </p>
        </motion.div>
      </section>

      {/* ─── NAVIGATION TABS & FILTER TOOLBAR ───────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border-color)', position: 'sticky', top: '68px', zIndex: 100, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Main Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: 'All Media & Knowledge', icon: Layers },
              { id: 'publications', label: '📰 Magazines & Publications', icon: BookOpen },
              { id: 'toolkits', label: '📄 Toolkits & Manuals', icon: FileText },
              { id: 'resources', label: '📚 Chapter Resources', icon: FileText },
              { id: 'gallery', label: '📸 Photo Galleries', icon: ImageIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '999px',
                  border: activeTab === tab.id ? '2px solid var(--primary-blue)' : '1px solid var(--border-color)',
                  backgroundColor: activeTab === tab.id ? 'var(--primary-blue)' : '#F8FAFC',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters: Chapter, Academic Year & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              
              {/* Campus Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.45rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <Filter size={15} color="var(--primary-blue)" />
                <select
                  aria-label="Filter by Campus"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <option value="All">All Campuses</option>
                  {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>

              {/* Academic Year Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.45rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <Filter size={15} color="var(--primary-blue)" />
                <select
                  aria-label="Filter by Academic Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <option value="All">All Academic Years</option>
                  {Array.from(new Set(academicYears.map(y => y.year))).map(yr => {
                    const matching = academicYears.find(y => y.year === yr);
                    return <option key={matching._id} value={matching._id}>{yr}</option>;
                  })}
                </select>
              </div>

            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.45rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minWidth: '240px' }}>
              <Search size={15} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search publications &amp; photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', color: 'var(--text-primary)' }}
              />
            </div>

          </div>

        </div>
      </section>

      {/* ─── MAIN CONTENT CONTAINER ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* ─── 1. PUBLICATIONS & RESOURCES SECTION ───────────────────────────── */}
        {activeTab !== 'gallery' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  {activeTab === 'publications' ? 'Official Magazines & Publications' : activeTab === 'toolkits' ? 'Toolkits & Formation Manuals' : activeTab === 'resources' ? 'Chapter Knowledge & Resources' : 'Publications, Toolkits & Resources'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
                  Official guides and documents published for students, coordinators, and institutions.
                </p>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.35rem 0.75rem', borderRadius: '999px' }}>
                {filteredDocuments.length} document{filteredDocuments.length === 1 ? '' : 's'}
              </span>
            </div>

            {loadingDocs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 size={36} className="animate-spin" color="var(--primary-blue)" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                No publications or resources found matching the selected criteria.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredDocuments.map((doc, idx) => (
                  <motion.article
                    key={doc._id || doc.id || idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.875rem',
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    <div>
                      {/* Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'rgba(2, 132, 199, 0.08)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                          {doc.documentType || doc.document_type || 'Official Resource'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                          {doc.academicYearId?.year || '2025-26'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.625rem', lineHeight: 1.35 }}>
                        {doc.title}
                      </h3>

                      {/* Description */}
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                        {doc.description || 'Official resource and handbook authorized by chapter leadership.'}
                      </p>
                    </div>

                    {/* Footer Info & Download Action */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                        {doc.unitId?.name || 'All Chapters'} &bull; {formatFileSize(doc.fileSize || doc.file_size)}
                      </span>
                      {doc.filePath || doc.file_path ? (
                        <a
                          href={doc.filePath || doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: 'var(--primary-blue)',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            textDecoration: 'none'
                          }}
                        >
                          <Download size={15} /> Open &rarr;
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>In Print</span>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── 2. PHOTO GALLERY SECTION ───────────────────────────────────────── */}
        {activeTab !== 'publications' && activeTab !== 'toolkits' && activeTab !== 'resources' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Photo &amp; Media Archives
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
                  Documentary images and community action captures from student-led interventions.
                </p>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.35rem 0.75rem', borderRadius: '999px' }}>
                {filteredPhotos.length} photo{filteredPhotos.length === 1 ? '' : 's'}
              </span>
            </div>

            {loadingPhotos ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 size={36} className="animate-spin" color="var(--primary-blue)" />
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                No gallery photographs found matching the selected filters.
              </div>
            ) : (
              <div className="gallery-masonry" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {filteredPhotos.map((photo, i) => (
                  <motion.div
                    key={photo._id || photo.id || i}
                    className="gallery-masonry-item"
                    style={{
                      overflow: 'hidden',
                      borderRadius: '0.625rem',
                      border: '1px solid var(--border-color)',
                      position: 'relative',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setLightboxImage(photo)}
                  >
                    <img
                      src={photo.file_path || photo.filePath || photo.url}
                      alt={photo.title || photo.caption || 'MAGIC Youth Activity'}
                      loading="lazy"
                      style={{ width: '100%', display: 'block', transition: 'transform 0.3s ease' }}
                    />
                    <div style={{ padding: '0.875rem 1rem', background: '#FFFFFF', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                          {photo.title || photo.caption || 'Community Intervention'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                          {photo.academicYearId?.year || '2025-26'} &bull; {photo.unitId?.name || 'MAGIC Youth'}
                        </span>
                      </div>
                      <ExternalLink size={14} color="var(--primary-blue)" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {/* ─── LIGHTBOX MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setLightboxImage(null)}
          >
            <img
              src={lightboxImage.file_path || lightboxImage.filePath || lightboxImage.url}
              alt={lightboxImage.title || 'MAGIC Youth Lightbox'}
              style={{
                maxWidth: '90%',
                maxHeight: '82vh',
                objectFit: 'contain',
                borderRadius: '0.5rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
              }}
            />
            {lightboxImage.title && (
              <div style={{ color: 'white', marginTop: '1.25rem', fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}>
                {lightboxImage.title}
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500, marginTop: '0.25rem' }}>
                  {lightboxImage.academicYearId?.year || '2025-26'} &bull; {lightboxImage.unitId?.name || 'MAGIC Youth'}
                </div>
              </div>
            )}
            <button
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer',
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                fontWeight: 700
              }}
              onClick={() => setLightboxImage(null)}
            >
              ✕ Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
