import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Loader2, Download, Search, Image as ImageIcon, BookOpen, ExternalLink, X } from 'lucide-react';
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

    // 3. Fetch Public Publications & Magazines
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

  // Filtered publications
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const unitMatch = selectedUnit === 'All' || doc.unitId?._id === selectedUnit || doc.unit_id === selectedUnit || doc.unitId?.id === selectedUnit;
      const yearMatch = selectedYear === 'All' || doc.academicYearId?._id === selectedYear || doc.academic_year_id === selectedYear || doc.academicYearId?.id === selectedYear;
      
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || (
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.documentType && doc.documentType.toLowerCase().includes(q))
      );

      return unitMatch && yearMatch && searchMatch;
    });
  }, [documents, selectedUnit, selectedYear, searchQuery]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const unitMatch = selectedUnit === 'All' || p.unitId?._id === selectedUnit || p.unit_id === selectedUnit || p.unitId?.id === selectedUnit;
      const yearMatch = selectedYear === 'All' || p.academicYearId?._id === selectedYear || p.academic_year_id === selectedYear || p.academicYearId?.id === selectedYear;
      
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.album && p.album.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );

      return unitMatch && yearMatch && searchMatch;
    });
  }, [photos, selectedUnit, selectedYear, searchQuery]);

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'PDF Document';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  };

  return (
    <main className="home-wrapper" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      
      {/* ─── 1. HERO / HEADER SECTION ────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '3rem 1.25rem 2rem', borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ color: '#0284C7', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#E11D48' }}>●</span> Official Media &amp; Publications
          </div>
          <h1 style={{ color: '#0F172A', fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.025em', margin: '0 0 0.625rem', lineHeight: 1.2 }}>
            Media &amp; Publications
          </h1>
          <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto' }}>
            Official publications, magazines, and photographic archives documenting student-led youth initiatives across institutional chapters.
          </p>
        </motion.div>
      </section>

      {/* ─── 2. COMMON FILTER TOOLBAR ───────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid #E2E8F0', position: 'sticky', top: '64px', zIndex: 90, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.96)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.875rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Chapter & Academic Year Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center', flex: '1 1 auto' }}>
            
            {/* Campus / Unit Filter */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#F8FAFC', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}>
              <Filter size={14} color="#0284C7" />
              <select
                aria-label="Filter by Campus / Chapter"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 600, color: '#0F172A', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="All">All Chapters / Campuses</option>
                {units.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>)}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#F8FAFC', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}>
              <Filter size={14} color="#0284C7" />
              <select
                aria-label="Filter by Academic Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 600, color: '#0F172A', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="All">All Academic Years</option>
                {Array.from(new Set(academicYears.map(y => y.year))).map(yr => {
                  const matching = academicYears.find(y => y.year === yr);
                  return <option key={matching._id || matching.id} value={matching._id || matching.id}>{yr}</option>;
                })}
              </select>
            </div>

          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', minWidth: '220px', flex: '1 1 240px', maxWidth: '360px' }}>
            <Search size={14} color="#64748B" />
            <input
              type="text"
              placeholder="Search publications &amp; gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%', color: '#0F172A' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ─── 3. MAIN CONTINUOUS SCROLL CONTENT ──────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.25rem 4.5rem', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        
        {/* ─── SECTION 1: PUBLICATIONS & MAGAZINES (FIRST) ──────────────────── */}
        <section id="publications-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="#0284C7" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Publications &amp; Magazines
                </h2>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>
                Official annual magazines, reports, and publications authorized by MAGIC Youth.
              </p>
            </div>

            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#F1F5F9', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid #E2E8F0' }}>
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'publication' : 'publications'}
            </span>
          </div>

          {loadingDocs ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3.5rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem' }}>
              <Loader2 size={32} className="animate-spin" color="#0284C7" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', border: '1px dashed #CBD5E1', color: '#64748B' }}>
              <BookOpen size={36} color="#0284C7" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                No Publications Available
              </h3>
              <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '0.875rem', color: '#64748B' }}>
                {selectedUnit !== 'All' || selectedYear !== 'All' || searchQuery
                  ? 'No publications found matching your active filter criteria.'
                  : 'Publications and official magazines will appear here once published.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filteredDocuments.map((doc, idx) => (
                <motion.article
                  key={doc._id || doc.id || idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <div>
                    {/* Header Tags */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#E0F2FE', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {doc.documentType || doc.document_type || 'Publication'}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {doc.academicYearId?.year || 'Academic Release'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                      {doc.title}
                    </h3>

                    {/* Description */}
                    <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {doc.description || 'Official publication authorized by MAGIC Youth leadership.'}
                    </p>
                  </div>

                  {/* Footer metadata & Action */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.875rem', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
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
                          gap: '0.35rem',
                          color: '#0284C7',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={14} /> Read / PDF
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>In Print</span>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* ─── SECTION 2: PHOTO GALLERY (BELOW PUBLICATIONS) ────────────────── */}
        <section id="gallery-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={20} color="#0284C7" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Photo Gallery
                </h2>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>
                Visual archives and documentary captures from chapter activities and social initiatives.
              </p>
            </div>

            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', backgroundColor: '#F1F5F9', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid #E2E8F0' }}>
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>

          {loadingPhotos ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3.5rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem' }}>
              <Loader2 size={32} className="animate-spin" color="#0284C7" />
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', border: '1px dashed #CBD5E1', color: '#64748B' }}>
              <ImageIcon size={36} color="#0284C7" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                No Photos Found
              </h3>
              <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '0.875rem', color: '#64748B' }}>
                {selectedUnit !== 'All' || selectedYear !== 'All' || searchQuery
                  ? 'No photographs found matching your active filter criteria.'
                  : 'Photographs will appear here once added to the chapter gallery.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {filteredPhotos.map((photo, i) => (
                <motion.div
                  key={photo._id || photo.id || i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 8) * 0.03 }}
                  onClick={() => setLightboxImage(photo)}
                  style={{
                    overflow: 'hidden',
                    borderRadius: '0.625rem',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ width: '100%', height: '185px', overflow: 'hidden', backgroundColor: '#0F172A', position: 'relative' }}>
                    <img
                      src={photo.file_path || photo.filePath || photo.url}
                      alt={photo.title || photo.caption || 'MAGIC Youth Activity'}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                    />
                  </div>
                  <div style={{ padding: '0.75rem 0.875rem', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {photo.title || photo.caption || 'Chapter Activity'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                        {photo.academicYearId?.year || '2025-26'} &bull; {photo.unitId?.name || 'MAGIC Youth'}
                      </span>
                    </div>
                    <ExternalLink size={14} color="#0284C7" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ─── 4. LIGHTBOX MODAL ──────────────────────────────────────────────── */}
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
              padding: '1.5rem',
              boxSizing: 'border-box'
            }}
            onClick={() => setLightboxImage(null)}
          >
            <div style={{ position: 'relative', maxWidth: '92vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
              <img
                src={lightboxImage.file_path || lightboxImage.filePath || lightboxImage.url}
                alt={lightboxImage.title || 'MAGIC Youth Lightbox'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '0.5rem',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
                }}
              />
              {lightboxImage.title && (
                <div style={{ color: 'white', marginTop: '1rem', fontSize: '1.05rem', fontWeight: 700, textAlign: 'center' }}>
                  {lightboxImage.title}
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500, marginTop: '0.2rem' }}>
                    {lightboxImage.academicYearId?.year || '2025-26'} &bull; {lightboxImage.unitId?.name || 'MAGIC Youth'}
                  </div>
                </div>
              )}
              <button
                aria-label="Close Lightbox"
                style={{
                  position: 'absolute',
                  top: '-2.5rem',
                  right: 0,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                onClick={() => setLightboxImage(null)}
              >
                <X size={14} /> Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
