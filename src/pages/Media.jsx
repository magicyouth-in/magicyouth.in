import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2, FileText, ExternalLink } from 'lucide-react';
import '../styles/home.css';

export default function Media() {
  const [photos, setPhotos] = useState([]);
  const [magazines, setMagazines] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingMags, setLoadingMags] = useState(true);

  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    Promise.all([
      fetch('/api/gallery').then(res => res.json()),
      fetch('/api/units').then(res => res.json()),
      fetch('/api/academic-years').then(res => res.json())
    ])
    .then(([galleryData, unitsData, yearsData]) => {
      if (galleryData.success) {
        setPhotos(galleryData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      if (unitsData.success) setUnits(unitsData.data);
      if (yearsData.success) setAcademicYears(yearsData.data);
      setLoadingPhotos(false);
    })
    .catch(err => {
      setLoadingPhotos(false);
    });

    fetch('/api/documents?visibility=Public')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mags = data.data.filter(d => d.documentType?.includes('Report') || d.documentType?.includes('Magazine'));
          setMagazines(mags);
        }
        setLoadingMags(false);
      })
      .catch(err => {
        setLoadingMags(false);
      });
  }, []);

  const filteredPhotos = photos.filter(p => {
    const unitMatch = selectedUnit === 'All' || (p.unitId && p.unitId._id === selectedUnit);
    const yearMatch = selectedYear === 'All' || (p.academicYearId && p.academicYearId._id === selectedYear);
    return unitMatch && yearMatch;
  });

    const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <main className="home-wrapper">
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Media Center
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            MAGIC in Stories & Media
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Authentic photography and official publications from our chapters.
          </p>
        </motion.div>
      </section>

      {/* PUBLICATIONS */}
      <section className="inner-section" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>PUBLICATIONS</h2>
        </div>
        <div className="content-grid" style={{ marginTop: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {loadingMags ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
              <Loader2 size={48} className="animate-spin" color="var(--primary-blue)" />
            </div>
          ) : magazines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
              No public magazines or reports currently available.
            </div>
          ) : (
            magazines.map((mag, i) => (
              <a key={mag._id} href={mag.filePath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <motion.article style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', height: '100%', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                  <div style={{ height: '240px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)' }}>
                    <FileText size={48} opacity={0.5} />
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      {mag.academicYearId?.year || 'Publication'}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{mag.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 1rem 0' }}>{mag.description || 'Read the full publication report detailing our student interventions.'}</p>
                    <div style={{ marginTop: 'auto', color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' }}>
                      View / Read &rarr;
                    </div>
                  </div>
                </motion.article>
              </a>
            ))
          )}
        </div>
      </section>

      {/* IMAGES */}
      <section className="inner-section" style={{ backgroundColor: 'white' }}>
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem' }}>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>STORIES IN IMAGES</h2>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Filter size={16} color="var(--primary-blue)" />
            <select aria-label="Filter by Campus" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
              <option value="All">All Campuses</option>
              {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Filter size={16} color="var(--primary-blue)" />
            <select aria-label="Filter by Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
              <option value="All">All Years</option>
              {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
            </select>
          </div>
        </div>

        {loadingPhotos ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={48} className="animate-spin" color="var(--primary-blue)" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            No photography found for the selected filters.
          </div>
        ) : (
          <div className="gallery-masonry" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {filteredPhotos.map((photo, i) => (
              <motion.div key={photo._id} className="gallery-masonry-item" style={{ overflow: 'hidden', borderRadius: '0.5rem', border: '1px solid var(--border-color)', position: 'relative', cursor: 'pointer' }} initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} onClick={() => setLightboxImage(photo)}>
                  <img src={photo.file_path} alt={photo.title || 'MAGIC Youth Photography'} loading="lazy" style={{ width: '100%', display: 'block', transition: 'transform 0.3s ease' }} />
                  {photo.title && (
                    <div style={{ padding: '1rem', background: 'white', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{photo.title}</span>
                      <ExternalLink size={14} color="var(--text-secondary)" />
                    </div>
                  )}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage.file_path} alt={lightboxImage.title || 'MAGIC Youth Lightbox'} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '0.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
          {lightboxImage.title && (
            <div style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 600, textAlign: 'center' }}>
              {lightboxImage.title}
            </div>
          )}
          <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '1rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '999px' }} onClick={() => setLightboxImage(null)}>
            Close
          </button>
        </div>
      )}
    </main>
  );
}
