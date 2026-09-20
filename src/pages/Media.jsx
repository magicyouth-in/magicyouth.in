import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import '../styles/home.css';

export default function Media() {
  const [photos, setPhotos] = useState([]);
  const [magazines, setMagazines] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingMags, setLoadingMags] = useState(true);

  // Filters for Images
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    // Fetch Photos/Gallery
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
      console.error(err);
      setLoadingPhotos(false);
    });

    // Fetch Magazines (Documents filtered by type or visibility)
    fetch('/api/documents?visibility=Public')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Fallback logic: assuming "Annual Reports", "Activity Reports", or "Magazines"
          const mags = data.data.filter(d => d.documentType?.includes('Report') || d.documentType?.includes('Magazine'));
          setMagazines(mags);
        }
        setLoadingMags(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingMags(false);
      });
  }, []);

  const filteredPhotos = photos.filter(p => {
    const unitMatch = selectedUnit === 'All' || (p.unitId && p.unitId._id === selectedUnit);
    const yearMatch = selectedYear === 'All' || (p.academicYearId && p.academicYearId._id === selectedYear);
    return unitMatch && yearMatch;
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section">
        <div className="page-bg-glow"></div>
        <div className="page-header-content">
          <div className="section-eyebrow">Visuals & Publications</div>
          <h1 className="page-header-title">Media Center</h1>
          <p className="page-header-subtitle">
            Explore authentic photography and official publications from MAGIC Youth chapters.
          </p>
        </div>
      </section>

      {/* MAGAZINES / PUBLICATIONS */}
      <section className="inner-section bg-light">
        <div className="section-header">
          <div className="section-eyebrow">Publications</div>
          <h2 className="section-title">Magazines & Reports</h2>
        </div>
        <div className="content-grid" style={{ marginTop: '3rem' }}>
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
                <motion.div className="featured-event" style={{ backgroundColor: 'white', height: '100%' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                  <div style={{ height: '200px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                    <FileText size={64} opacity={0.5} />
                  </div>
                  <div className="featured-event-content" style={{ padding: '2rem' }}>
                    <div className="section-eyebrow">{mag.academicYearId?.year || 'Publication'}</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-primary)' }}>{mag.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{mag.description || 'Download and read the full report.'}</p>
                  </div>
                </motion.div>
              </a>
            ))
          )}
        </div>
      </section>

      {/* IMAGES / EDITORIAL GALLERY */}
      <section className="inner-section">
        <div className="section-header">
          <div className="section-eyebrow">Photography</div>
          <h2 className="section-title">Visual Storytelling</h2>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
            <Filter size={16} color="var(--primary-blue)" />
            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
              <option value="All">All Campuses</option>
              {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
            <Filter size={16} color="var(--primary-blue)" />
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
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
              <motion.div key={photo._id} className="gallery-masonry-item" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <img src={photo.file_path} alt={photo.title || 'MAGIC Youth Photography'} loading="lazy" />
                {photo.title && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
                    {photo.title}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
